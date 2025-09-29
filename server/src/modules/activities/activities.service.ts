import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../../entities/activity.entity';
import { ActivityCompletion } from '../../entities/activity-completion.entity';
import { Student } from '../../entities/student.entity';
import { StudentsService } from '../students/students.service';
import { ActivityType, DifficultyLevel, SkillArea } from '../../enums/activity-type.enum';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CompleteActivityDto } from './dto/complete-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(ActivityCompletion)
    private activityCompletionRepository: Repository<ActivityCompletion>,
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
}