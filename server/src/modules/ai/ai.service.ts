import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClaudeProvider } from './providers/claude.provider';
import { ConversationSession, ChatMessage } from '../../entities/conversation-session.entity';
import { Student } from '../../entities/student.entity';
import { Activity } from '../../entities/activity.entity';
import { StartConversationDto } from './dto/start-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import {
  getConversationSystemPrompt,
  getConversationStarterMessage,
} from './prompts/conversation.prompts';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(ConversationSession)
    private conversationRepository: Repository<ConversationSession>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    private claudeProvider: ClaudeProvider,
  ) {}

  /**
   * Start a new AI conversation session
   */
  async startConversation(
    studentId: string,
    dto: StartConversationDto
  ): Promise<{
    sessionId: string;
    firstMessage: string;
  }> {
    // Get student info
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['user'],
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get activity
    const activity = await this.activityRepository.findOne({
      where: { id: dto.activityId },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    // Generate AI's first message
    const starterMessage = getConversationStarterMessage(
      dto.scenario,
      student.user.firstName,
      dto.difficultyLevel
    );

    // Create conversation session
    const session = this.conversationRepository.create({
      student,
      activity,
      scenario: dto.scenario,
      difficultyLevel: dto.difficultyLevel,
      status: 'active',
      turnCount: 1,
      messages: [
        {
          role: 'ai',
          content: starterMessage,
          timestamp: new Date(),
        },
      ],
      aiEvaluation: null,
    });

    const savedSession = await this.conversationRepository.save(session);

    return {
      sessionId: savedSession.id,
      firstMessage: starterMessage,
    };
  }

  /**
   * Send a message in an ongoing conversation
   */
  async sendMessage(
    studentId: string,
    dto: SendMessageDto
  ): Promise<{
    aiResponse: string;
    turnCount: number;
    shouldEnd: boolean;
  }> {
    // Get session
    const session = await this.conversationRepository.findOne({
      where: { id: dto.sessionId },
      relations: ['student', 'student.user', 'activity'],
    });

    if (!session) {
      throw new NotFoundException('Conversation session not found');
    }

    if (session.student.id !== studentId) {
      throw new Error('Unauthorized access to conversation');
    }

    if (session.status !== 'active') {
      throw new Error('Conversation session is not active');
    }

    // Add student's message
    session.messages.push({
      role: 'student',
      content: dto.message,
      timestamp: new Date(),
    });

    session.turnCount += 1;

    // Build conversation history for Claude
    const claudeMessages = session.messages
      .slice(1) // Skip AI's first message (it's in system prompt context)
      .map((msg) => ({
        role: msg.role === 'student' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }));

    // Adjust difficulty based on student's actual proficiency level
    // If student is beginner proficiency but activity is advanced, use intermediate
    const adjustedDifficulty = this.adjustDifficultyForStudent(
      session.difficultyLevel,
      session.student.proficiencyLevel
    );

    // Get system prompt with adjusted difficulty
    const systemPrompt = getConversationSystemPrompt(
      adjustedDifficulty,
      session.student.grade,
      session.scenario,
      session.student.user.firstName,
      session.student.proficiencyLevel // Pass student's actual level for additional context
    );

    // Get custom API key from activity content if provided (for custom modules)
    const customApiKey = session.activity.content?.aiConfig?.apiKey;

    // Get AI response
    const aiResponse = await this.claudeProvider.chat({
      systemPrompt,
      messages: claudeMessages,
      temperature: 0.8, // More creative for conversation
      maxTokens: 150, // Keep responses short
      apiKey: customApiKey, // Use custom key if provided, otherwise default
    });

    // Add AI's response
    session.messages.push({
      role: 'ai',
      content: aiResponse.content,
      timestamp: new Date(),
    });

    // Determine if conversation should end
    const maxTurns = this.getMaxTurns(session.difficultyLevel);
    const shouldEnd = session.turnCount >= maxTurns;

    if (shouldEnd) {
      session.status = 'completed';
    }

    await this.conversationRepository.save(session);

    return {
      aiResponse: aiResponse.content,
      turnCount: session.turnCount,
      shouldEnd,
    };
  }

  /**
   * End a conversation and get evaluation
   */
  async endConversation(
    studentId: string,
    sessionId: string
  ): Promise<{
    evaluation: any;
    pointsEarned: number;
  }> {
    const session = await this.conversationRepository.findOne({
      where: { id: sessionId },
      relations: ['student', 'activity'],
    });

    if (!session) {
      throw new NotFoundException('Conversation session not found');
    }

    if (session.student.id !== studentId) {
      throw new Error('Unauthorized access to conversation');
    }

    // Extract student messages and AI responses
    const studentMessages = session.messages
      .filter((m) => m.role === 'student')
      .map((m) => m.content);

    const aiResponses = session.messages
      .filter((m) => m.role === 'ai')
      .map((m) => m.content);

    // Get AI evaluation
    const evaluation = await this.claudeProvider.evaluateConversation(
      studentMessages,
      aiResponses,
      session.difficultyLevel,
      session.student.grade
    );

    // Calculate points based on score
    const basePoints = session.activity.pointsReward || 50;
    const pointsEarned = Math.round((evaluation.overallScore / 100) * basePoints);

    // Save evaluation
    session.aiEvaluation = evaluation;
    session.status = 'completed';
    await this.conversationRepository.save(session);

    return {
      evaluation,
      pointsEarned,
    };
  }

  /**
   * Get conversation session details
   */
  async getSession(sessionId: string, studentId: string): Promise<ConversationSession> {
    const session = await this.conversationRepository.findOne({
      where: { id: sessionId },
      relations: ['student', 'activity'],
    });

    if (!session) {
      throw new NotFoundException('Conversation session not found');
    }

    if (session.student.id !== studentId) {
      throw new Error('Unauthorized access to conversation');
    }

    return session;
  }

  /**
   * Get student's conversation history
   */
  async getStudentConversations(studentId: string): Promise<ConversationSession[]> {
    return this.conversationRepository.find({
      where: { student: { id: studentId } },
      relations: ['activity'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  /**
   * Get max turns based on difficulty
   */
  private getMaxTurns(level: 'beginner' | 'intermediate' | 'advanced'): number {
    switch (level) {
      case 'beginner':
        return 8; // 8 back-and-forth exchanges
      case 'intermediate':
        return 12;
      case 'advanced':
        return 16;
      default:
        return 10;
    }
  }

  /**
   * Adjust activity difficulty based on student's actual proficiency level
   * Ensures AI uses appropriate language for the student's real English level
   */
  private adjustDifficultyForStudent(
    activityDifficulty: 'beginner' | 'intermediate' | 'advanced',
    studentProficiency: string
  ): 'beginner' | 'intermediate' | 'advanced' {
    // Map student proficiency levels to difficulty
    const proficiencyMap: { [key: string]: 'beginner' | 'intermediate' | 'advanced' } = {
      'beginner': 'beginner',
      'elementary': 'beginner',
      'pre-intermediate': 'intermediate',
      'intermediate': 'intermediate',
      'upper-intermediate': 'advanced',
      'advanced': 'advanced',
    };

    const studentLevel = proficiencyMap[studentProficiency?.toLowerCase()] || 'beginner';

    // If activity is harder than student's level, use student's level
    // (Don't give advanced activities to beginners with complex vocabulary)
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };

    if (difficultyOrder[activityDifficulty] > difficultyOrder[studentLevel] + 1) {
      // Activity is too hard - reduce by one level
      return studentLevel === 'beginner' ? 'beginner' : 'intermediate';
    }

    // Otherwise use activity difficulty (allows students to challenge themselves)
    return activityDifficulty;
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<{ status: string; claude: boolean }> {
    const claudeStatus = await this.claudeProvider.healthCheck();

    return {
      status: claudeStatus ? 'healthy' : 'degraded',
      claude: claudeStatus,
    };
  }
}
