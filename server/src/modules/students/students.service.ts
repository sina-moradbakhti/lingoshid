import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../entities/student.entity';
import { User } from '../../entities/user.entity';
import { Progress } from '../../entities/progress.entity';
import { ActivityCompletion } from '../../entities/activity-completion.entity';
import { Badge } from '../../entities/badge.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    @InjectRepository(ActivityCompletion)
    private activityCompletionRepository: Repository<ActivityCompletion>,
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find({
      relations: ['user', 'parent', 'teacher', 'progress', 'badges'],
    });
  }

  async findOne(id: string): Promise<Student> {
    return this.studentRepository.findOne({
      where: { id },
      relations: ['user', 'parent', 'teacher', 'progress', 'badges', 'activityCompletions'],
    });
  }

  async findByUserId(userId: string): Promise<Student> {
    return this.studentRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'parent', 'teacher', 'progress', 'badges'],
    });
  }

  async getStudentDashboard(studentId: string) {
    const student = await this.findOne(studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }

    // Get recent activity completions
    const recentActivities = await this.activityCompletionRepository.find({
      where: { student: { id: studentId } },
      relations: ['activity'],
      order: { completedAt: 'DESC' },
      take: 10,
    });

    // Calculate level progress
    const pointsForNextLevel = this.calculatePointsForNextLevel(student.currentLevel);
    const progressToNextLevel = (student.experiencePoints % pointsForNextLevel) / pointsForNextLevel * 100;

    // Get leaderboard position (simplified)
    const leaderboardPosition = await this.getLeaderboardPosition(studentId);

    return {
      student,
      recentActivities,
      levelProgress: {
        currentLevel: student.currentLevel,
        experiencePoints: student.experiencePoints,
        pointsForNextLevel,
        progressPercentage: progressToNextLevel,
      },
      leaderboardPosition,
      totalBadges: student.badges?.length || 0,
      streakDays: student.streakDays,
    };
  }

  async updateStudentProgress(studentId: string, pointsEarned: number, activityType: string) {
    const student = await this.findOne(studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }

    // Update points and experience
    student.totalPoints += pointsEarned;
    student.experiencePoints += pointsEarned;

    // Check for level up
    const newLevel = this.calculateLevel(student.experiencePoints);
    if (newLevel > student.currentLevel) {
      student.currentLevel = newLevel;
      // TODO: Award level-up badge or achievement
    }

    // Update streak if activity was completed today
    const today = new Date();
    const lastActivity = student.lastActivityDate;
    
    if (!lastActivity || !this.isSameDay(lastActivity, today)) {
      if (lastActivity && this.isConsecutiveDay(lastActivity, today)) {
        student.streakDays += 1;
      } else {
        student.streakDays = 1;
      }
      student.lastActivityDate = today;
    }

    await this.studentRepository.save(student);

    // Check for badge eligibility
    await this.checkAndAwardBadges(student);

    return student;
  }

  async getLeaderboard(teacherId?: string, limit: number = 10) {
    const queryBuilder = this.studentRepository.createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .orderBy('student.totalPoints', 'DESC')
      .limit(limit);

    if (teacherId) {
      queryBuilder.where('student.teacherId = :teacherId', { teacherId });
    }

    return queryBuilder.getMany();
  }

  private calculateLevel(experiencePoints: number): number {
    // Simple level calculation: every 100 points = 1 level
    return Math.floor(experiencePoints / 100) + 1;
  }

  private calculatePointsForNextLevel(currentLevel: number): number {
    // Points needed for next level
    return 100; // Simplified: always 100 points per level
  }

  private async getLeaderboardPosition(studentId: string): Promise<number> {
    const student = await this.findOne(studentId);
    if (!student) return 0;

    const higherRankedCount = await this.studentRepository
      .createQueryBuilder('student')
      .where('student.totalPoints > :points', { points: student.totalPoints })
      .andWhere('student.grade = :grade', { grade: student.grade })
      .getCount();

    return higherRankedCount + 1;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private isConsecutiveDay(lastDate: Date, currentDate: Date): boolean {
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  private async checkAndAwardBadges(student: Student) {
    // Get all available badges
    const availableBadges = await this.badgeRepository.find({ where: { isActive: true } });
    
    // Check each badge criteria (simplified implementation)
    for (const badge of availableBadges) {
      const hasEarned = await this.checkBadgeCriteria(student, badge);
      if (hasEarned && !student.badges.some(b => b.id === badge.id)) {
        student.badges.push(badge);
      }
    }

    await this.studentRepository.save(student);
  }

  private async checkBadgeCriteria(student: Student, badge: Badge): Promise<boolean> {
    // Simplified badge criteria checking
    const criteria = badge.criteria;

    switch (criteria.type) {
      case 'total_points':
        return student.totalPoints >= criteria.value;
      case 'streak_days':
        return student.streakDays >= criteria.value;
      case 'activities_completed':
        const completedCount = await this.activityCompletionRepository.count({
          where: { student: { id: student.id }, isCompleted: true },
        });
        return completedCount >= criteria.value;
      case 'total_speaking_time':
        // For now, assume they've met speaking time if they have enough points
        return student.totalPoints >= badge.pointsRequired;
      case 'pronunciation_accuracy':
        // For now, assume they've met accuracy if they have enough points and activities
        const accuracyCompletions = await this.activityCompletionRepository.count({
          where: { student: { id: student.id }, isCompleted: true },
        });
        return accuracyCompletions >= 3 && student.totalPoints >= badge.pointsRequired;
      case 'dialogue_activities':
        // Count dialogue-type activities (simplified)
        const dialogueCount = await this.activityCompletionRepository.count({
          where: { student: { id: student.id }, isCompleted: true },
        });
        return dialogueCount >= criteria.value;
      case 'stories_created':
        // For now, assume they've created stories if they have enough points
        return student.totalPoints >= badge.pointsRequired;
      case 'peer_help':
        // For now, assume they've helped peers if they have enough points
        return student.totalPoints >= badge.pointsRequired;
      default:
        return false;
    }
  }

  async getStudentsByTeacher(teacherId: string): Promise<Student[]> {
    return this.studentRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['user', 'progress', 'badges'],
    });
  }

  async getStudentsByParent(parentId: string): Promise<Student[]> {
    return this.studentRepository.find({
      where: { parent: { id: parentId } },
      relations: ['user', 'progress', 'badges', 'activityCompletions'],
    });
  }

  async getDetailedProgress(studentId: string) {
    const student = await this.findOne(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Get all activity completions with detailed analysis
    const activityCompletions = await this.activityCompletionRepository.find({
      where: { student: { id: studentId } },
      relations: ['activity'],
      order: { completedAt: 'DESC' },
    });

    // Calculate skill-based progress
    const skillProgress = await this.calculateSkillProgress(studentId, activityCompletions);

    // Get activity timeline and patterns
    const activityTimeline = this.generateActivityTimeline(activityCompletions);

    // Calculate learning analytics
    const learningAnalytics = this.calculateLearningAnalytics(activityCompletions, student);

    // Generate performance trends
    const performanceTrends = this.generatePerformanceTrends(activityCompletions);

    // Get achievement progress
    const achievementProgress = await this.getAchievementProgress(student);

    return {
      student: {
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        grade: student.grade,
        currentLevel: student.currentLevel,
        totalPoints: student.totalPoints,
        experiencePoints: student.experiencePoints,
        streakDays: student.streakDays,
        lastActivityDate: student.lastActivityDate,
      },
      skillProgress,
      activityTimeline,
      learningAnalytics,
      performanceTrends,
      achievementProgress,
      totalActivities: activityCompletions.length,
      completedActivities: activityCompletions.filter(ac => ac.isCompleted).length,
      totalTimeSpent: activityCompletions.reduce((sum, ac) => sum + ac.timeSpent, 0),
      averageScore: activityCompletions.length > 0
        ? Math.round(activityCompletions.reduce((sum, ac) => sum + ac.score, 0) / activityCompletions.length)
        : 0,
    };
  }

  private async calculateSkillProgress(studentId: string, activityCompletions: any[]) {
    const skillAreas = ['fluency', 'pronunciation', 'confidence', 'vocabulary'];
    const skillProgress = [];

    for (const skillArea of skillAreas) {
      const skillActivities = activityCompletions.filter(ac =>
        ac.activity && ac.activity.skillArea === skillArea
      );

      const completedSkillActivities = skillActivities.filter(ac => ac.isCompleted);
      const totalScore = completedSkillActivities.reduce((sum, ac) => sum + ac.score, 0);
      const averageScore = completedSkillActivities.length > 0
        ? Math.round(totalScore / completedSkillActivities.length)
        : 0;

      const totalTime = skillActivities.reduce((sum, ac) => sum + ac.timeSpent, 0);
      const progressPercentage = Math.min((completedSkillActivities.length / Math.max(skillActivities.length, 5)) * 100, 100);

      // Calculate skill level based on activities completed and average score
      const skillLevel = Math.max(1, Math.floor((completedSkillActivities.length * averageScore) / 500) + 1);

      skillProgress.push({
        skillArea,
        currentLevel: skillLevel,
        progressPercentage: Math.round(progressPercentage),
        totalPracticeTime: Math.round(totalTime / 60), // Convert to minutes
        activitiesCompleted: completedSkillActivities.length,
        totalActivitiesAvailable: skillActivities.length || 5,
        averageScore,
        recentImprovement: this.calculateRecentImprovement(skillActivities),
        lastActivity: skillActivities.length > 0 ? skillActivities[0].completedAt : null,
      });
    }

    return skillProgress;
  }

  private generateActivityTimeline(activityCompletions: any[]) {
    // Group activities by date for the last 30 days
    const timeline = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayActivities = activityCompletions.filter(ac => {
        const activityDate = new Date(ac.completedAt).toISOString().split('T')[0];
        return activityDate === dateStr;
      });

      timeline.push({
        date: dateStr,
        activitiesCompleted: dayActivities.filter(ac => ac.isCompleted).length,
        totalTimeSpent: dayActivities.reduce((sum, ac) => sum + ac.timeSpent, 0),
        pointsEarned: dayActivities.reduce((sum, ac) => sum + ac.pointsEarned, 0),
        averageScore: dayActivities.length > 0
          ? Math.round(dayActivities.reduce((sum, ac) => sum + ac.score, 0) / dayActivities.length)
          : 0,
      });
    }

    return timeline;
  }

  private calculateLearningAnalytics(activityCompletions: any[], student: any) {
    const completed = activityCompletions.filter(ac => ac.isCompleted);
    const totalTimeSpent = activityCompletions.reduce((sum, ac) => sum + ac.timeSpent, 0);

    // Calculate weekly progress
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekActivities = completed.filter(ac => new Date(ac.completedAt) >= oneWeekAgo);

    // Calculate learning velocity (activities per week)
    const learningVelocity = thisWeekActivities.length;

    // Calculate consistency score (based on activity distribution)
    const consistencyScore = this.calculateConsistencyScore(activityCompletions);

    // Estimate time to next level
    const pointsToNextLevel = this.calculatePointsForNextLevel(student.currentLevel);
    const averagePointsPerActivity = completed.length > 0
      ? activityCompletions.reduce((sum, ac) => sum + ac.pointsEarned, 0) / completed.length
      : 10;

    const activitiesNeededForNextLevel = Math.ceil(
      (pointsToNextLevel - (student.experiencePoints % pointsToNextLevel)) / averagePointsPerActivity
    );

    return {
      totalTimeSpent: Math.round(totalTimeSpent / 60), // in minutes
      averageSessionTime: completed.length > 0
        ? Math.round(totalTimeSpent / completed.length / 60)
        : 0,
      learningVelocity,
      consistencyScore,
      activitiesNeededForNextLevel,
      estimatedTimeToNextLevel: Math.round(activitiesNeededForNextLevel * (totalTimeSpent / completed.length) / 60), // in minutes
      strongestSkill: this.findStrongestSkill(activityCompletions),
      improvementArea: this.findImprovementArea(activityCompletions),
    };
  }

  private generatePerformanceTrends(activityCompletions: any[]) {
    const completed = activityCompletions.filter(ac => ac.isCompleted);

    // Group by weeks for the last 8 weeks
    const weeks = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekActivities = completed.filter(ac => {
        const activityDate = new Date(ac.completedAt);
        return activityDate >= weekStart && activityDate <= weekEnd;
      });

      weeks.push({
        week: `Week ${8 - i}`,
        startDate: weekStart.toISOString().split('T')[0],
        activitiesCompleted: weekActivities.length,
        averageScore: weekActivities.length > 0
          ? Math.round(weekActivities.reduce((sum, ac) => sum + ac.score, 0) / weekActivities.length)
          : 0,
        totalPoints: weekActivities.reduce((sum, ac) => sum + ac.pointsEarned, 0),
        timeSpent: Math.round(weekActivities.reduce((sum, ac) => sum + ac.timeSpent, 0) / 60),
      });
    }

    return {
      weeklyTrends: weeks,
      improvementTrend: this.calculateImprovementTrend(weeks),
      performanceConsistency: this.calculatePerformanceConsistency(weeks),
    };
  }

  private async getAchievementProgress(student: any) {
    const totalBadges = await this.badgeRepository.count({ where: { isActive: true } });
    const earnedBadges = student.badges?.length || 0;

    return {
      badgesEarned: earnedBadges,
      totalBadges,
      badgeProgress: Math.round((earnedBadges / totalBadges) * 100),
      nextBadgeTarget: await this.getNextBadgeTarget(student),
    };
  }

  private calculateRecentImprovement(skillActivities: any[]) {
    if (skillActivities.length < 2) return 0;

    const recent5 = skillActivities.slice(0, 5);
    const previous5 = skillActivities.slice(5, 10);

    if (previous5.length === 0) return 0;

    const recentAvg = recent5.reduce((sum, ac) => sum + ac.score, 0) / recent5.length;
    const previousAvg = previous5.reduce((sum, ac) => sum + ac.score, 0) / previous5.length;

    return Math.round(recentAvg - previousAvg);
  }

  private calculateConsistencyScore(activityCompletions: any[]) {
    // Calculate based on daily activity distribution over last 30 days
    const dailyActivities = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    activityCompletions
      .filter(ac => new Date(ac.completedAt) >= thirtyDaysAgo)
      .forEach(ac => {
        const day = new Date(ac.completedAt).toISOString().split('T')[0];
        dailyActivities[day] = (dailyActivities[day] || 0) + 1;
      });

    const activeDays = Object.keys(dailyActivities).length;
    return Math.round((activeDays / 30) * 100);
  }

  private findStrongestSkill(activityCompletions: any[]) {
    const skillScores = {};

    activityCompletions.forEach(ac => {
      if (ac.activity && ac.activity.skillArea && ac.isCompleted) {
        const skill = ac.activity.skillArea;
        if (!skillScores[skill]) {
          skillScores[skill] = { total: 0, count: 0 };
        }
        skillScores[skill].total += ac.score;
        skillScores[skill].count += 1;
      }
    });

    let strongest = null;
    let highestAvg = 0;

    Object.keys(skillScores).forEach(skill => {
      const avg = skillScores[skill].total / skillScores[skill].count;
      if (avg > highestAvg) {
        highestAvg = avg;
        strongest = skill;
      }
    });

    return strongest || 'fluency';
  }

  private findImprovementArea(activityCompletions: any[]) {
    const skillScores = {};

    activityCompletions.forEach(ac => {
      if (ac.activity && ac.activity.skillArea && ac.isCompleted) {
        const skill = ac.activity.skillArea;
        if (!skillScores[skill]) {
          skillScores[skill] = { total: 0, count: 0 };
        }
        skillScores[skill].total += ac.score;
        skillScores[skill].count += 1;
      }
    });

    let weakest = null;
    let lowestAvg = 100;

    Object.keys(skillScores).forEach(skill => {
      const avg = skillScores[skill].total / skillScores[skill].count;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        weakest = skill;
      }
    });

    return weakest || 'pronunciation';
  }

  private calculateImprovementTrend(weeks: any[]) {
    if (weeks.length < 2) return 'stable';

    const recentWeeks = weeks.slice(-3);
    const olderWeeks = weeks.slice(0, -3);

    if (olderWeeks.length === 0) return 'stable';

    const recentAvg = recentWeeks.reduce((sum, w) => sum + w.averageScore, 0) / recentWeeks.length;
    const olderAvg = olderWeeks.reduce((sum, w) => sum + w.averageScore, 0) / olderWeeks.length;

    const improvement = recentAvg - olderAvg;

    if (improvement > 5) return 'improving';
    if (improvement < -5) return 'declining';
    return 'stable';
  }

  private calculatePerformanceConsistency(weeks: any[]) {
    if (weeks.length < 2) return 100;

    const scores = weeks.map(w => w.averageScore).filter(s => s > 0);
    if (scores.length < 2) return 100;

    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to consistency score (lower deviation = higher consistency)
    const consistencyScore = Math.max(0, 100 - (standardDeviation * 2));
    return Math.round(consistencyScore);
  }

  private async getNextBadgeTarget(student: any) {
    const allBadges = await this.badgeRepository.find({ where: { isActive: true } });
    const earnedBadgeIds = (student.badges || []).map(b => b.id);

    const unearnedBadges = allBadges.filter(badge => !earnedBadgeIds.includes(badge.id));

    // Find the badge closest to being earned
    let closestBadge = null;
    let highestProgress = 0;

    for (const badge of unearnedBadges) {
      const progress = await this.calculateBadgeProgress(student, badge);
      if (progress > highestProgress) {
        highestProgress = progress;
        closestBadge = badge;
      }
    }

    return closestBadge ? {
      name: closestBadge.name,
      description: closestBadge.description,
      progress: Math.round(highestProgress),
      criteria: closestBadge.criteria,
    } : null;
  }

  private async calculateBadgeProgress(student: any, badge: any): Promise<number> {
    const criteria = badge.criteria;

    switch (criteria.type) {
      case 'total_points':
        return Math.min((student.totalPoints / criteria.value) * 100, 100);
      case 'streak_days':
        return Math.min((student.streakDays / criteria.value) * 100, 100);
      case 'activities_completed':
        const completedCount = await this.activityCompletionRepository.count({
          where: { student: { id: student.id }, isCompleted: true },
        });
        return Math.min((completedCount / criteria.value) * 100, 100);
      default:
        return 0;
    }
  }

  async getStudentBadges(studentId: string) {
    // Get all available badges
    const allBadges = await this.badgeRepository.find({ where: { isActive: true } });

    // Get student with their earned badges
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['badges'],
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Map badges to include earned status and earned date
    const studentBadges = allBadges.map(badge => {
      const earnedBadge = student.badges.find(b => b.id === badge.id);
      return {
        id: badge.id,
        badge: {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.iconUrl,
          category: this.getBadgeCategory(badge.criteria),
          criteria: badge.criteria,
          pointsRequired: badge.pointsRequired,
          isActive: badge.isActive,
          createdAt: badge.createdAt,
          updatedAt: badge.updatedAt
        },
        student: null, // Don't include full student object to avoid circular reference
        earnedAt: earnedBadge ? new Date() : null, // Simplified - we don't track actual earned date yet
        isEarned: !!earnedBadge
      };
    });

    return studentBadges;
  }

  private getBadgeCategory(criteria: any): string {
    if (!criteria || !criteria.type) return 'general';

    switch (criteria.type) {
      case 'total_points': return 'achievement';
      case 'streak_days': return 'streak';
      case 'activities_completed': return 'activity';
      case 'dialogue_activities': return 'activity';
      case 'total_speaking_time': return 'practice';
      case 'pronunciation_accuracy': return 'skill';
      case 'stories_created': return 'creativity';
      case 'peer_help': return 'social';
      default: return 'general';
    }
  }
}