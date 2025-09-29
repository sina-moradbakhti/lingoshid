import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../../entities/teacher.entity';
import { Student } from '../../entities/student.entity';
import { Class } from '../../entities/class.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
  ) {}

  async findAll(): Promise<Teacher[]> {
    return this.teacherRepository.find({
      relations: ['user', 'students', 'classes'],
    });
  }

  async findOne(id: string): Promise<Teacher> {
    return this.teacherRepository.findOne({
      where: { id },
      relations: ['user', 'students', 'students.user', 'classes'],
    });
  }

  async findByUserId(userId: string): Promise<Teacher> {
    return this.teacherRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'students', 'classes'],
    });
  }

  async getTeacherDashboard(teacherId: string) {
    const teacher = await this.findOne(teacherId);
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // Get detailed student information
    const studentsWithProgress = await Promise.all(
      teacher.students.map(async (student) => {
        const detailedStudent = await this.studentRepository.findOne({
          where: { id: student.id },
          relations: ['user', 'progress', 'badges', 'activityCompletions'],
        });

        return {
          ...detailedStudent,
          recentActivity: await this.getStudentRecentActivity(student.id),
          weeklyProgress: await this.getStudentWeeklyProgress(student.id),
        };
      })
    );

    // Get class statistics
    const classStats = await Promise.all(
      teacher.classes.map(async (classEntity) => {
        const classWithStudents = await this.classRepository.findOne({
          where: { id: classEntity.id },
          relations: ['students', 'students.activityCompletions'],
        });

        const totalStudents = classWithStudents.students.length;
        const activeStudents = classWithStudents.students.filter(s => 
          s.activityCompletions.some(ac => 
            new Date(ac.completedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
          )
        ).length;

        return {
          ...classEntity,
          totalStudents,
          activeStudents,
          activityRate: totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0,
        };
      })
    );

    return {
      teacher,
      students: studentsWithProgress,
      classes: classStats,
      totalStudents: teacher.students.length,
      totalClasses: teacher.classes.length,
    };
  }

  private async getStudentRecentActivity(studentId: string) {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['activityCompletions', 'activityCompletions.activity'],
    });

    const recentCompletions = student.activityCompletions
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, 3);

    return recentCompletions;
  }

  private async getStudentWeeklyProgress(studentId: string) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const student = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.activityCompletions', 'completion')
      .where('student.id = :studentId', { studentId })
      .andWhere('completion.completedAt >= :oneWeekAgo', { oneWeekAgo })
      .getOne();

    const completions = student?.activityCompletions || [];

    return {
      activitiesCompleted: completions.length,
      totalTimeSpent: completions.reduce((sum, c) => sum + c.timeSpent, 0),
      averageScore: completions.length > 0 
        ? completions.reduce((sum, c) => sum + c.score, 0) / completions.length 
        : 0,
      pointsEarned: completions.reduce((sum, c) => sum + c.pointsEarned, 0),
    };
  }

  async assignStudentToTeacher(teacherId: string, studentId: string): Promise<void> {
    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
    const student = await this.studentRepository.findOne({ where: { id: studentId } });

    if (!teacher || !student) {
      throw new Error('Teacher or Student not found');
    }

    student.teacher = teacher;
    await this.studentRepository.save(student);
  }

  async createClass(teacherId: string, classData: Partial<Class>): Promise<Class> {
    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    const newClass = this.classRepository.create({
      ...classData,
      teacher,
    });

    return this.classRepository.save(newClass);
  }

  async getClassAnalytics(classId: string) {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['students', 'students.activityCompletions', 'students.progress'],
    });

    if (!classEntity) {
      throw new Error('Class not found');
    }

    const students = classEntity.students;
    const totalStudents = students.length;
    
    // Calculate class-wide statistics
    const totalActivitiesCompleted = students.reduce((sum, student) => 
      sum + student.activityCompletions.length, 0
    );

    const averageScore = students.reduce((sum, student) => {
      const studentAvg = student.activityCompletions.length > 0
        ? student.activityCompletions.reduce((s, c) => s + c.score, 0) / student.activityCompletions.length
        : 0;
      return sum + studentAvg;
    }, 0) / totalStudents || 0;

    const totalPoints = students.reduce((sum, student) => sum + student.totalPoints, 0);

    return {
      classInfo: {
        id: classEntity.id,
        name: classEntity.name,
        grade: classEntity.grade,
        totalStudents,
      },
      statistics: {
        totalActivitiesCompleted,
        averageScore,
        totalPoints,
        averagePointsPerStudent: totalPoints / totalStudents || 0,
      },
      studentPerformance: students.map(student => ({
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        totalPoints: student.totalPoints,
        currentLevel: student.currentLevel,
        activitiesCompleted: student.activityCompletions.length,
        averageScore: student.activityCompletions.length > 0
          ? student.activityCompletions.reduce((sum, c) => sum + c.score, 0) / student.activityCompletions.length
          : 0,
      })),
    };
  }
}