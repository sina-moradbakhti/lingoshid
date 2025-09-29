import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../../entities/activity.entity';
import { ActivityCompletion } from '../../entities/activity-completion.entity';
import { ActivitySession, SessionStatus } from '../../entities/activity-session.entity';
import { Student } from '../../entities/student.entity';
import { StudentsService } from '../students/students.service';
import { ActivityType, DifficultyLevel, SkillArea } from '../../enums/activity-type.enum';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CompleteActivityDto } from './dto/complete-activity.dto';
import { StartActivitySessionDto } from './dto/start-activity-session.dto';
import { SubmitStageDto } from './dto/submit-stage.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(ActivityCompletion)
    private activityCompletionRepository: Repository<ActivityCompletion>,
    @InjectRepository(ActivitySession)
    private activitySessionRepository: Repository<ActivitySession>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private studentsService: StudentsService,
  ) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = this.activityRepository.create(createActivityDto);
    return this.activityRepository.save(activity);
  }

  async findAll(): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
  }

  async findByType(type: ActivityType): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { type, isActive: true },
      order: { order: 'ASC' },
    });
  }

  async findBySkillArea(skillArea: SkillArea): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { skillArea, isActive: true },
      order: { order: 'ASC' },
    });
  }

  async findByDifficulty(difficulty: DifficultyLevel): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { difficulty, isActive: true },
      order: { order: 'ASC' },
    });
  }

  async findForStudent(studentId: string): Promise<Activity[]> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Get activities appropriate for student's level
    return this.activityRepository.find({
      where: {
        isActive: true,
        minLevel: { $lte: student.currentLevel } as any,
      },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Activity> {
    return this.activityRepository.findOne({
      where: { id },
      relations: ['completions'],
    });
  }

  async completeActivity(studentId: string, activityId: string, completionData: CompleteActivityDto): Promise<ActivityCompletion> {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    const activity = await this.activityRepository.findOne({ where: { id: activityId } });

    if (!student || !activity) {
      throw new Error('Student or Activity not found');
    }

    // Calculate score based on activity type and submission
    const score = this.calculateScore(activity, completionData);
    const pointsEarned = Math.floor(score * activity.pointsReward / 100);

    // Create activity completion record
    const completion = this.activityCompletionRepository.create({
      student,
      activity,
      score,
      pointsEarned,
      timeSpent: completionData.timeSpent,
      isCompleted: score >= 60, // 60% threshold for completion
      submissionData: completionData.submissionData,
      feedback: this.generateFeedback(activity, score),
    });

    const savedCompletion = await this.activityCompletionRepository.save(completion);

    // Update student progress
    if (completion.isCompleted) {
      await this.studentsService.updateStudentProgress(studentId, pointsEarned, activity.type);
    }

    return savedCompletion;
  }

  async getStudentProgress(studentId: string, activityId?: string) {
    const whereClause: any = { student: { id: studentId } };
    if (activityId) {
      whereClause.activity = { id: activityId };
    }

    return this.activityCompletionRepository.find({
      where: whereClause,
      relations: ['activity'],
      order: { completedAt: 'DESC' },
    });
  }

  async getActivityAnalytics(activityId: string) {
    const completions = await this.activityCompletionRepository.find({
      where: { activity: { id: activityId } },
      relations: ['student'],
    });

    const totalAttempts = completions.length;
    const completedAttempts = completions.filter(c => c.isCompleted).length;
    const averageScore = completions.reduce((sum, c) => sum + c.score, 0) / totalAttempts || 0;
    const averageTime = completions.reduce((sum, c) => sum + c.timeSpent, 0) / totalAttempts || 0;

    return {
      totalAttempts,
      completedAttempts,
      completionRate: (completedAttempts / totalAttempts) * 100 || 0,
      averageScore,
      averageTime,
      scoreDistribution: this.calculateScoreDistribution(completions),
    };
  }

  private calculateScore(activity: Activity, completionData: CompleteActivityDto): number {
    // Simplified scoring logic - can be enhanced based on activity type
    switch (activity.type) {
      case ActivityType.PRONUNCIATION_CHALLENGE:
        return this.scorePronunciation(completionData.submissionData);
      case ActivityType.PICTURE_DESCRIPTION:
        return this.scorePictureDescription(completionData.submissionData);
      case ActivityType.VIRTUAL_CONVERSATION:
        return this.scoreConversation(completionData.submissionData);
      default:
        return Math.min(100, Math.max(0, completionData.submissionData?.score || 70));
    }
  }

  private scorePronunciation(submissionData: any): number {
    // Mock pronunciation scoring - in real implementation, this would use speech recognition API
    const accuracy = submissionData?.pronunciationAccuracy || Math.random() * 40 + 60;
    return Math.min(100, Math.max(0, accuracy));
  }

  private scorePictureDescription(submissionData: any): number {
    // Mock scoring based on vocabulary usage and sentence structure
    const vocabularyScore = submissionData?.vocabularyUsed?.length * 10 || 50;
    const grammarScore = submissionData?.grammarAccuracy || 70;
    return Math.min(100, (vocabularyScore + grammarScore) / 2);
  }

  private scoreConversation(submissionData: any): number {
    // Mock conversation scoring
    const fluency = submissionData?.fluencyScore || 70;
    const appropriateness = submissionData?.appropriatenessScore || 75;
    const engagement = submissionData?.engagementScore || 80;
    return Math.min(100, (fluency + appropriateness + engagement) / 3);
  }

  private generateFeedback(activity: Activity, score: number): any {
    const feedback = {
      score,
      message: '',
      suggestions: [],
      encouragement: '',
    };

    if (score >= 90) {
      feedback.message = 'Excellent work! You\'ve mastered this activity.';
      feedback.encouragement = 'Keep up the fantastic effort!';
    } else if (score >= 70) {
      feedback.message = 'Good job! You\'re making great progress.';
      feedback.suggestions = ['Try to speak more clearly', 'Use more varied vocabulary'];
      feedback.encouragement = 'You\'re doing well, keep practicing!';
    } else if (score >= 50) {
      feedback.message = 'Nice try! There\'s room for improvement.';
      feedback.suggestions = ['Practice pronunciation', 'Review vocabulary', 'Speak more slowly'];
      feedback.encouragement = 'Don\'t give up, practice makes perfect!';
    } else {
      feedback.message = 'Keep practicing! Every attempt helps you learn.';
      feedback.suggestions = ['Review the lesson material', 'Ask your teacher for help', 'Practice with easier activities first'];
      feedback.encouragement = 'Learning takes time, you\'re on the right path!';
    }

    return feedback;
  }

  private calculateScoreDistribution(completions: ActivityCompletion[]) {
    const ranges = [
      { min: 0, max: 20, count: 0 },
      { min: 21, max: 40, count: 0 },
      { min: 41, max: 60, count: 0 },
      { min: 61, max: 80, count: 0 },
      { min: 81, max: 100, count: 0 },
    ];

    completions.forEach(completion => {
      const range = ranges.find(r => completion.score >= r.min && completion.score <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }

  async update(id: string, updateData: Partial<Activity>): Promise<Activity> {
    await this.activityRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.activityRepository.update(id, { isActive: false });
  }

  // Seed initial activities
  async seedActivities() {
    const activities = [
      {
        title: 'First Steps - Say Hello',
        description: 'Practice basic greetings in English',
        type: ActivityType.PRONUNCIATION_CHALLENGE,
        difficulty: DifficultyLevel.BEGINNER,
        skillArea: SkillArea.PRONUNCIATION,
        pointsReward: 10,
        minLevel: 1,
        content: {
          words: ['hello', 'hi', 'good morning', 'good afternoon'],
          instructions: 'Listen and repeat each greeting clearly',
        },
        order: 1,
      },
      {
        title: 'Describe the Playground',
        description: 'Look at the picture and describe what you see',
        type: ActivityType.PICTURE_DESCRIPTION,
        difficulty: DifficultyLevel.BEGINNER,
        skillArea: SkillArea.VOCABULARY,
        pointsReward: 15,
        minLevel: 1,
        content: {
          imageUrl: '/images/playground.jpg',
          vocabulary: ['swing', 'slide', 'children', 'playing', 'happy'],
          instructions: 'Describe the playground using the vocabulary words',
        },
        order: 2,
      },
      {
        title: 'Meet a New Friend',
        description: 'Have a conversation with Alex about your hobbies',
        type: ActivityType.VIRTUAL_CONVERSATION,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skillArea: SkillArea.FLUENCY,
        pointsReward: 20,
        minLevel: 2,
        content: {
          character: 'Alex',
          scenario: 'meeting_new_friend',
          prompts: [
            'Hi! What\'s your name?',
            'What do you like to do for fun?',
            'That sounds interesting! Tell me more.',
          ],
        },
        order: 3,
      },
    ];

    for (const activityData of activities) {
      const existingActivity = await this.activityRepository.findOne({
        where: { title: activityData.title },
      });

      if (!existingActivity) {
        const activity = this.activityRepository.create(activityData);
        await this.activityRepository.save(activity);
      }
    }
  }

  // Activity Session Management Methods
  async startActivitySession(studentId: string, sessionData: StartActivitySessionDto): Promise<ActivitySession> {
    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    const activity = await this.activityRepository.findOne({ where: { id: sessionData.activityId } });

    if (!student || !activity) {
      throw new Error('Student or Activity not found');
    }

    // Check if there's an active session for this student and activity
    const existingSession = await this.activitySessionRepository.findOne({
      where: {
        student: { id: studentId },
        activity: { id: sessionData.activityId },
        status: SessionStatus.ACTIVE
      }
    });

    if (existingSession) {
      // Resume existing session
      existingSession.lastActivityAt = new Date();
      return this.activitySessionRepository.save(existingSession);
    }

    // Create new session
    const totalStages = this.calculateTotalStages(activity);
    const session = this.activitySessionRepository.create({
      student,
      activity,
      status: SessionStatus.ACTIVE,
      currentStage: sessionData.sessionConfig?.startFromStage || 1,
      totalStages,
      sessionConfig: sessionData.sessionConfig || {},
      stageData: {}
    });

    return this.activitySessionRepository.save(session);
  }

  async getActivitySession(sessionId: string, studentId: string): Promise<ActivitySession> {
    return this.activitySessionRepository.findOne({
      where: {
        id: sessionId,
        student: { id: studentId }
      },
      relations: ['activity', 'student']
    });
  }

  async submitStage(sessionId: string, stageData: SubmitStageDto, audioFile: any, studentId: string) {
    const session = await this.activitySessionRepository.findOne({
      where: { id: sessionId, student: { id: studentId } },
      relations: ['activity', 'student']
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Process audio if provided
    let audioProcessingResult = null;
    if (audioFile) {
      audioProcessingResult = await this.processAudioSubmission(audioFile, {
        activityType: session.activity.type,
        stageNumber: stageData.stageNumber,
        expectedContent: this.getExpectedContentForStage(session.activity, stageData.stageNumber)
      });
    }

    // Calculate stage score
    const stageScore = this.calculateStageScore(session.activity, stageData, audioProcessingResult);

    // Update session data
    const currentStageData = session.stageData || {};
    currentStageData[`stage_${stageData.stageNumber}`] = {
      score: stageScore,
      timeSpent: stageData.timeSpent,
      audioData: stageData.audioData,
      textData: stageData.textData,
      processingResult: audioProcessingResult,
      submittedAt: new Date(),
      isCompleted: stageData.isCompleted
    };

    // Update session
    session.stageData = currentStageData;
    session.currentScore = this.calculateOverallScore(currentStageData);
    session.pointsEarned = Math.floor(session.currentScore * session.activity.pointsReward / 100);
    session.timeSpent += stageData.timeSpent;
    session.lastActivityAt = new Date();

    if (stageData.isCompleted && stageData.stageNumber < session.totalStages) {
      session.currentStage = stageData.stageNumber + 1;
    }

    const updatedSession = await this.activitySessionRepository.save(session);

    // Generate feedback for this stage
    const feedback = this.generateStageFeedback(session.activity, stageScore, audioProcessingResult);

    return {
      session: updatedSession,
      stageScore,
      feedback,
      audioProcessingResult
    };
  }

  async completeActivitySession(sessionId: string, studentId: string): Promise<ActivityCompletion> {
    const session = await this.activitySessionRepository.findOne({
      where: { id: sessionId, student: { id: studentId } },
      relations: ['activity', 'student']
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Mark session as completed
    session.status = SessionStatus.COMPLETED;
    session.completedAt = new Date();
    await this.activitySessionRepository.save(session);

    // Create activity completion record
    const completion = this.activityCompletionRepository.create({
      student: session.student,
      activity: session.activity,
      score: session.currentScore,
      pointsEarned: session.pointsEarned,
      timeSpent: session.timeSpent,
      isCompleted: session.currentScore >= 60,
      submissionData: session.stageData,
      feedback: this.generateFinalFeedback(session.activity, session.currentScore, session.stageData)
    });

    const savedCompletion = await this.activityCompletionRepository.save(completion);

    // Update student progress
    if (completion.isCompleted) {
      await this.studentsService.updateStudentProgress(studentId, session.pointsEarned, session.activity.type);
    }

    return savedCompletion;
  }

  async getStageFeedback(sessionId: string, stageNumber: number) {
    const session = await this.activitySessionRepository.findOne({
      where: { id: sessionId },
      relations: ['activity']
    });

    if (!session || !session.stageData || !session.stageData[`stage_${stageNumber}`]) {
      throw new Error('Stage data not found');
    }

    const stageData = session.stageData[`stage_${stageNumber}`];
    return this.generateStageFeedback(session.activity, stageData.score, stageData.processingResult);
  }

  async pauseActivitySession(sessionId: string, studentId: string): Promise<ActivitySession> {
    const session = await this.activitySessionRepository.findOne({
      where: { id: sessionId, student: { id: studentId } }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    session.status = SessionStatus.PAUSED;
    session.lastActivityAt = new Date();
    return this.activitySessionRepository.save(session);
  }

  async resumeActivitySession(sessionId: string, studentId: string): Promise<ActivitySession> {
    const session = await this.activitySessionRepository.findOne({
      where: { id: sessionId, student: { id: studentId } }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    session.status = SessionStatus.ACTIVE;
    session.lastActivityAt = new Date();
    return this.activitySessionRepository.save(session);
  }

  async processAudioSubmission(audioFile: any, metadata: any) {
    // Mock audio processing - In production, integrate with speech recognition service
    const mockResults = {
      transcription: this.generateMockTranscription(metadata.activityType),
      pronunciationScore: Math.floor(Math.random() * 40) + 60, // 60-100
      fluencyScore: Math.floor(Math.random() * 30) + 70, // 70-100
      clarityScore: Math.floor(Math.random() * 35) + 65, // 65-100
      matchAccuracy: Math.floor(Math.random() * 45) + 55, // 55-100
      detectedWords: [],
      feedback: [],
      processingTime: Math.random() * 2000 + 500 // 500-2500ms
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, mockResults.processingTime));

    // Save audio file (optional for real implementation)
    if (audioFile) {
      const audioDir = path.join(process.cwd(), 'uploads', 'audio');
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      const filename = `${Date.now()}-${audioFile.originalname}`;
      const filepath = path.join(audioDir, filename);
      fs.writeFileSync(filepath, audioFile.buffer);
      mockResults['audioPath'] = filepath;
    }

    return mockResults;
  }

  // Helper methods
  private calculateTotalStages(activity: Activity): number {
    switch (activity.type) {
      case ActivityType.PRONUNCIATION_CHALLENGE:
        return activity.content?.words?.length || 5;
      case ActivityType.PICTURE_DESCRIPTION:
        return activity.content?.images?.length || 3;
      case ActivityType.VIRTUAL_CONVERSATION:
        return activity.content?.prompts?.length || 5;
      default:
        return 5;
    }
  }

  private calculateStageScore(activity: Activity, stageData: SubmitStageDto, audioResult: any): number {
    if (audioResult) {
      // Use audio processing results for scoring
      switch (activity.type) {
        case ActivityType.PRONUNCIATION_CHALLENGE:
          return audioResult.pronunciationScore;
        case ActivityType.PICTURE_DESCRIPTION:
          return (audioResult.fluencyScore + audioResult.clarityScore) / 2;
        case ActivityType.VIRTUAL_CONVERSATION:
          return (audioResult.fluencyScore + audioResult.matchAccuracy) / 2;
        default:
          return audioResult.pronunciationScore || 75;
      }
    }

    // Fallback scoring without audio
    return Math.floor(Math.random() * 40) + 60;
  }

  private calculateOverallScore(stageData: any): number {
    const scores = Object.values(stageData).map((stage: any) => stage.score);
    return scores.length > 0 ? Math.floor(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }

  private getExpectedContentForStage(activity: Activity, stageNumber: number): any {
    switch (activity.type) {
      case ActivityType.PRONUNCIATION_CHALLENGE:
        return activity.content?.words?.[stageNumber - 1] || '';
      case ActivityType.PICTURE_DESCRIPTION:
        return activity.content?.vocabulary || [];
      case ActivityType.VIRTUAL_CONVERSATION:
        return activity.content?.prompts?.[stageNumber - 1] || '';
      default:
        return null;
    }
  }

  private generateMockTranscription(activityType: ActivityType): string {
    const samples = {
      [ActivityType.PRONUNCIATION_CHALLENGE]: ['hello', 'thank you', 'goodbye', 'please', 'excuse me'],
      [ActivityType.PICTURE_DESCRIPTION]: ['I can see children playing on the playground', 'There is a swing and a slide'],
      [ActivityType.VIRTUAL_CONVERSATION]: ['My name is Sarah', 'I like to play soccer', 'Reading is fun']
    };

    const sampleArray = samples[activityType] || samples[ActivityType.PRONUNCIATION_CHALLENGE];
    return sampleArray[Math.floor(Math.random() * sampleArray.length)];
  }

  private generateStageFeedback(activity: Activity, score: number, audioResult: any): any {
    const feedback = {
      score,
      level: score >= 85 ? 'excellent' : score >= 70 ? 'good' : 'needs-practice',
      message: '',
      suggestions: [],
      encouragement: '',
      audioFeedback: audioResult ? {
        transcription: audioResult.transcription,
        pronunciationTips: this.generatePronunciationTips(audioResult)
      } : null
    };

    if (score >= 85) {
      feedback.message = 'Excellent! Your pronunciation is clear and accurate.';
      feedback.encouragement = 'Keep up the fantastic work!';
    } else if (score >= 70) {
      feedback.message = 'Good job! You\'re making great progress.';
      feedback.suggestions = ['Try to speak more clearly', 'Focus on word stress'];
      feedback.encouragement = 'You\'re doing well!';
    } else {
      feedback.message = 'Keep practicing! Every attempt helps you improve.';
      feedback.suggestions = ['Practice pronunciation slowly', 'Listen to native speakers', 'Record yourself speaking'];
      feedback.encouragement = 'Don\'t give up, you\'re learning!';
    }

    return feedback;
  }

  private generateFinalFeedback(activity: Activity, finalScore: number, stageData: any): any {
    const completedStages = Object.keys(stageData).length;
    const averageStageScore = this.calculateOverallScore(stageData);

    return {
      finalScore,
      averageStageScore,
      completedStages,
      totalTime: Object.values(stageData).reduce((sum: number, stage: any) => sum + (stage.timeSpent || 0), 0),
      message: finalScore >= 85 ? 'Outstanding performance!' : finalScore >= 70 ? 'Great work!' : 'Good effort!',
      improvement: this.generateImprovementSuggestions(activity.type, averageStageScore),
      achievements: this.checkNewAchievements(activity, finalScore, stageData)
    };
  }

  private generatePronunciationTips(audioResult: any): string[] {
    const tips = [];
    if (audioResult.pronunciationScore < 80) tips.push('Focus on clear consonant sounds');
    if (audioResult.fluencyScore < 75) tips.push('Try to speak more smoothly');
    if (audioResult.clarityScore < 70) tips.push('Speak louder and more clearly');
    return tips;
  }

  private generateImprovementSuggestions(activityType: ActivityType, score: number): string[] {
    const suggestions = [];

    switch (activityType) {
      case ActivityType.PRONUNCIATION_CHALLENGE:
        if (score < 80) suggestions.push('Practice individual sounds', 'Use pronunciation apps');
        break;
      case ActivityType.PICTURE_DESCRIPTION:
        if (score < 80) suggestions.push('Learn more descriptive vocabulary', 'Practice forming complete sentences');
        break;
      case ActivityType.VIRTUAL_CONVERSATION:
        if (score < 80) suggestions.push('Practice conversation starters', 'Work on natural responses');
        break;
    }

    return suggestions;
  }

  private checkNewAchievements(activity: Activity, score: number, stageData: any): any[] {
    const achievements = [];

    if (score >= 95) achievements.push({ name: 'Perfect Score', icon: '🌟' });
    if (score >= 85) achievements.push({ name: 'Excellent Speaker', icon: '🎤' });
    if (Object.keys(stageData).length >= 5) achievements.push({ name: 'Dedicated Learner', icon: '📚' });

    return achievements;
  }
}