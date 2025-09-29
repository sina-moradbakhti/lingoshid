import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from '../../entities/parent.entity';
import { Student } from '../../entities/student.entity';

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async findAll(): Promise<Parent[]> {
    return this.parentRepository.find({
      relations: ['user', 'children'],
    });
  }

  async findOne(id: string): Promise<Parent> {
    return this.parentRepository.findOne({
      where: { id },
      relations: ['user', 'children', 'children.user', 'children.progress', 'children.badges'],
    });
  }

  async findByUserId(userId: string): Promise<Parent> {
    return this.parentRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'children', 'children.user', 'children.progress'],
    });
  }

  async getChildrenProgress(parentId: string) {
    const parent = await this.findOne(parentId);
    if (!parent) {
      throw new Error('Parent not found');
    }

    const childrenWithProgress = await Promise.all(
      parent.children.map(async (child) => {
        const detailedChild = await this.studentRepository.findOne({
          where: { id: child.id },
          relations: ['user', 'progress', 'badges', 'activityCompletions', 'activityCompletions.activity'],
        });

        return {
          ...detailedChild,
          weeklyProgress: await this.getWeeklyProgress(child.id),
          recentActivities: detailedChild.activityCompletions
            .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
            .slice(0, 5),
        };
      })
    );

    return childrenWithProgress;
  }

  private async getWeeklyProgress(studentId: string) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyCompletions = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.activityCompletions', 'completion')
      .where('student.id = :studentId', { studentId })
      .andWhere('completion.completedAt >= :oneWeekAgo', { oneWeekAgo })
      .getOne();

    return {
      activitiesCompleted: weeklyCompletions?.activityCompletions?.length || 0,
      totalTimeSpent: weeklyCompletions?.activityCompletions?.reduce((sum, c) => sum + c.timeSpent, 0) || 0,
      averageScore: weeklyCompletions?.activityCompletions?.length 
        ? weeklyCompletions.activityCompletions.reduce((sum, c) => sum + c.score, 0) / weeklyCompletions.activityCompletions.length
        : 0,
    };
  }

  async linkChild(parentId: string, studentId: string): Promise<void> {
    const parent = await this.parentRepository.findOne({ where: { id: parentId } });
    const student = await this.studentRepository.findOne({ where: { id: studentId } });

    if (!parent || !student) {
      throw new Error('Parent or Student not found');
    }

    student.parent = parent;
    await this.studentRepository.save(student);
  }
}