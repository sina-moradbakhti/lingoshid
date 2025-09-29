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

  async getLeaderboard(grade?: number, limit: number = 10) {
    const queryBuilder = this.studentRepository.createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .orderBy('student.totalPoints', 'DESC')
      .limit(limit);

    if (grade) {
      queryBuilder.where('student.grade = :grade', { grade });
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
}