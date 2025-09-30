import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Teacher } from '../../entities/teacher.entity';
import { Student } from '../../entities/student.entity';
import { Class } from '../../entities/class.entity';
import { User } from '../../entities/user.entity';
import { Parent } from '../../entities/parent.entity';
import { Activity } from '../../entities/activity.entity';
import { ActivityAssignment } from '../../entities/activity-assignment.entity';
import { UserRole } from '../../enums/user-role.enum';
import { CredentialGenerator } from '../../utils/credential-generator.util';
import { QRCodeGenerator } from '../../utils/qrcode-generator.util';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateCustomPracticeDto } from './dto/create-custom-practice.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(ActivityAssignment)
    private activityAssignmentRepository: Repository<ActivityAssignment>,
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

  async createStudent(teacherId: string, createStudentDto: CreateStudentDto) {
    // Find the teacher
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ['user'],
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Generate credentials for student and parent
    const credentials = CredentialGenerator.generateStudentAndParentCredentials(
      createStudentDto.studentFirstName,
      createStudentDto.parentFirstName
    );

    // Check if username already exists
    const existingStudentUsername = await this.userRepository.findOne({
      where: { username: credentials.student.username }
    });
    const existingParentUsername = await this.userRepository.findOne({
      where: { username: credentials.parent.username }
    });

    if (existingStudentUsername || existingParentUsername) {
      throw new ConflictException('Generated username already exists. Please try again.');
    }

    // Hash passwords
    const studentHashedPassword = await bcrypt.hash(credentials.student.password, 10);
    const parentHashedPassword = await bcrypt.hash(credentials.parent.password, 10);

    // Create parent user
    const parentUser = this.userRepository.create({
      username: credentials.parent.username,
      password: parentHashedPassword,
      firstName: createStudentDto.parentFirstName,
      lastName: createStudentDto.parentLastName,
      role: UserRole.PARENT,
    });
    const savedParentUser = await this.userRepository.save(parentUser);

    // Create parent profile
    const parent = this.parentRepository.create({
      user: savedParentUser,
      phoneNumber: createStudentDto.parentPhoneNumber,
      occupation: createStudentDto.parentOccupation,
    });
    const savedParent = await this.parentRepository.save(parent);

    // Create student user
    const studentUser = this.userRepository.create({
      username: credentials.student.username,
      password: studentHashedPassword,
      firstName: createStudentDto.studentFirstName,
      lastName: createStudentDto.studentLastName,
      role: UserRole.STUDENT,
    });
    const savedStudentUser = await this.userRepository.save(studentUser);

    // Create student profile
    const student = this.studentRepository.create({
      user: savedStudentUser,
      grade: createStudentDto.grade,
      age: createStudentDto.age,
      schoolName: createStudentDto.schoolName || teacher.schoolName,
      className: createStudentDto.className,
      teacher: teacher,
      parent: savedParent,
    });
    const savedStudent = await this.studentRepository.save(student);

    // Generate QR codes for credentials
    const qrCodes = await QRCodeGenerator.generateStudentAndParentQRCodes(
      credentials.student.username,
      credentials.student.password,
      credentials.parent.username,
      credentials.parent.password
    );

    // Return the created student with credentials and QR codes
    return {
      student: {
        id: savedStudent.id,
        firstName: savedStudentUser.firstName,
        lastName: savedStudentUser.lastName,
        username: credentials.student.username,
        password: credentials.student.password, // Plain password to show to teacher
        qrCode: qrCodes.studentQRCode, // QR code as data URL
        grade: savedStudent.grade,
        age: savedStudent.age,
      },
      parent: {
        id: savedParent.id,
        firstName: savedParentUser.firstName,
        lastName: savedParentUser.lastName,
        username: credentials.parent.username,
        password: credentials.parent.password, // Plain password to show to teacher
        qrCode: qrCodes.parentQRCode, // QR code as data URL
        phoneNumber: savedParent.phoneNumber,
      },
      message: 'Student and parent created successfully. Use the QR codes to securely share credentials.',
    };
  }

  async getStudentsList(teacherId: string) {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: [
        'students',
        'students.user',
        'students.parent',
        'students.parent.user',
        'students.progress',
        'students.activityCompletions'
      ],
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return teacher.students.map(student => ({
      id: student.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      username: student.user.username,
      grade: student.grade,
      age: student.age,
      totalPoints: student.totalPoints,
      currentLevel: student.currentLevel,
      streakDays: student.streakDays,
      activitiesCompleted: student.activityCompletions?.length || 0,
      parent: {
        id: student.parent?.id,
        firstName: student.parent?.user?.firstName,
        lastName: student.parent?.user?.lastName,
        username: student.parent?.user?.username,
        phoneNumber: student.parent?.phoneNumber,
      },
      lastActivityDate: student.lastActivityDate,
      createdAt: student.createdAt,
    }));
  }

  async updateStudentCredentials(
    teacherId: string,
    studentId: string,
    type: 'student' | 'parent'
  ) {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const student = await this.studentRepository.findOne({
      where: { id: studentId, teacher: { id: teacherId } },
      relations: ['user', 'parent', 'parent.user'],
    });

    if (!student) {
      throw new NotFoundException('Student not found or does not belong to this teacher');
    }

    if (type === 'student') {
      const newUsername = CredentialGenerator.regenerateUsername('student', student.user.firstName);
      const newPassword = CredentialGenerator.regeneratePassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      student.user.username = newUsername;
      student.user.password = hashedPassword;
      await this.userRepository.save(student.user);

      // Generate QR code for new credentials
      const qrCode = await QRCodeGenerator.generateCredentialsQRCode(
        newUsername,
        newPassword,
        'student'
      );

      return {
        username: newUsername,
        password: newPassword,
        qrCode,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        message: 'Student credentials updated successfully',
      };
    } else {
      if (!student.parent) {
        throw new NotFoundException('Parent not found for this student');
      }

      const newUsername = CredentialGenerator.regenerateUsername('parent', student.parent.user.firstName);
      const newPassword = CredentialGenerator.regeneratePassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      student.parent.user.username = newUsername;
      student.parent.user.password = hashedPassword;
      await this.userRepository.save(student.parent.user);

      // Generate QR code for new credentials
      const qrCode = await QRCodeGenerator.generateCredentialsQRCode(
        newUsername,
        newPassword,
        'parent'
      );

      return {
        username: newUsername,
        password: newPassword,
        qrCode,
        firstName: student.parent.user.firstName,
        lastName: student.parent.user.lastName,
        message: 'Parent credentials updated successfully',
      };
    }
  }

  async updateStudent(
    teacherId: string,
    studentId: string,
    updateStudentDto: UpdateStudentDto
  ) {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const student = await this.studentRepository.findOne({
      where: { id: studentId, teacher: { id: teacherId } },
      relations: ['user'],
    });

    if (!student) {
      throw new NotFoundException('Student not found or does not belong to this teacher');
    }

    // Update user information if provided
    if (updateStudentDto.firstName || updateStudentDto.lastName) {
      if (updateStudentDto.firstName) {
        student.user.firstName = updateStudentDto.firstName;
      }
      if (updateStudentDto.lastName) {
        student.user.lastName = updateStudentDto.lastName;
      }
      await this.userRepository.save(student.user);
    }

    // Update student profile information
    if (updateStudentDto.grade !== undefined) {
      student.grade = updateStudentDto.grade;
    }
    if (updateStudentDto.age !== undefined) {
      student.age = updateStudentDto.age;
    }
    if (updateStudentDto.schoolName !== undefined) {
      student.schoolName = updateStudentDto.schoolName;
    }
    if (updateStudentDto.className !== undefined) {
      student.className = updateStudentDto.className;
    }

    const updatedStudent = await this.studentRepository.save(student);

    return {
      id: updatedStudent.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      grade: updatedStudent.grade,
      age: updatedStudent.age,
      schoolName: updatedStudent.schoolName,
      className: updatedStudent.className,
      message: 'Student information updated successfully',
    };
  }

  async getTeacherAnalytics(teacherId: string) {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: [
        'students',
        'students.user',
        'students.activityCompletions',
        'students.activityCompletions.activity',
        'students.badges',
        'students.progress'
      ],
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const students = teacher.students;
    const totalStudents = students.length;

    if (totalStudents === 0) {
      return {
        totalStudents: 0,
        averagePoints: 0,
        averageLevel: 0,
        totalActivitiesCompleted: 0,
        averageCompletionRate: 0,
        performanceDistribution: {},
        skillAreaAnalytics: [],
        recentActivityTrend: [],
        topPerformers: [],
        studentsNeedingAttention: [],
      };
    }

    // Calculate overall statistics
    const totalPoints = students.reduce((sum, s) => sum + s.totalPoints, 0);
    const averagePoints = Math.round(totalPoints / totalStudents);

    const totalLevel = students.reduce((sum, s) => sum + s.currentLevel, 0);
    const averageLevel = Math.round(totalLevel / totalStudents);

    const totalActivitiesCompleted = students.reduce((sum, s) =>
      sum + (s.activityCompletions?.length || 0), 0
    );

    // Performance distribution (by level)
    const performanceDistribution = students.reduce((dist: any, student) => {
      const level = student.currentLevel;
      dist[level] = (dist[level] || 0) + 1;
      return dist;
    }, {});

    // Skill area analytics (aggregate from all students)
    const skillAreaMap: any = {};
    students.forEach(student => {
      student.progress?.forEach((prog: any) => {
        if (!skillAreaMap[prog.skillArea]) {
          skillAreaMap[prog.skillArea] = {
            skillArea: prog.skillArea,
            totalStudents: 0,
            averageProgress: 0,
            totalProgress: 0
          };
        }
        skillAreaMap[prog.skillArea].totalStudents++;
        skillAreaMap[prog.skillArea].totalProgress += prog.currentLevel || 0;
      });
    });

    const skillAreaAnalytics = Object.values(skillAreaMap).map((skill: any) => ({
      skillArea: skill.skillArea,
      averageLevel: Math.round(skill.totalProgress / skill.totalStudents),
      studentsCount: skill.totalStudents
    }));

    // Recent activity trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const recentActivityTrend = last7Days.map(date => {
      const activitiesOnDate = students.reduce((count, student) => {
        const completions = student.activityCompletions?.filter((ac: any) =>
          ac.completedAt.toISOString().split('T')[0] === date
        ) || [];
        return count + completions.length;
      }, 0);

      return {
        date,
        activitiesCompleted: activitiesOnDate
      };
    });

    // Top performers (top 5 by points)
    const topPerformers = students
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 5)
      .map(student => ({
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        totalPoints: student.totalPoints,
        currentLevel: student.currentLevel,
        activitiesCompleted: student.activityCompletions?.length || 0
      }));

    // Students needing attention (bottom 5 by activity in last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const studentsWithRecentActivity = students.map(student => {
      const recentActivities = student.activityCompletions?.filter((ac: any) =>
        new Date(ac.completedAt) >= oneWeekAgo
      ) || [];

      return {
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        recentActivitiesCount: recentActivities.length,
        lastActivityDate: student.lastActivityDate,
        streakDays: student.streakDays
      };
    });

    const studentsNeedingAttention = studentsWithRecentActivity
      .sort((a, b) => a.recentActivitiesCount - b.recentActivitiesCount)
      .slice(0, 5);

    // Average completion rate
    const studentsWithActivities = students.filter(s => s.activityCompletions && s.activityCompletions.length > 0);
    const averageScore = studentsWithActivities.length > 0
      ? studentsWithActivities.reduce((sum, student) => {
          const avgScore = student.activityCompletions.reduce((s: number, ac: any) => s + ac.score, 0) / student.activityCompletions.length;
          return sum + avgScore;
        }, 0) / studentsWithActivities.length
      : 0;

    return {
      totalStudents,
      averagePoints,
      averageLevel,
      totalActivitiesCompleted,
      averageCompletionRate: Math.round(averageScore),
      performanceDistribution,
      skillAreaAnalytics,
      recentActivityTrend,
      topPerformers,
      studentsNeedingAttention,
    };
  }

  // Custom Practice Creation
  async createCustomPractice(teacherId: string, createDto: CreateCustomPracticeDto) {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ['students'],
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Create the custom activity
    const activity = this.activityRepository.create({
      title: createDto.title,
      description: createDto.description,
      type: createDto.type,
      difficulty: createDto.difficulty,
      skillArea: createDto.skillArea,
      pointsReward: createDto.pointsReward,
      minLevel: createDto.minLevel,
      maxLevel: createDto.maxLevel,
      content: createDto.content,
      imageUrl: createDto.imageUrl,
      audioUrl: createDto.audioUrl,
      isActive: true,
      order: 999, // Custom activities go at the end
    });

    const savedActivity = await this.activityRepository.save(activity);

    // Determine which students to assign
    // Only create assignments if specific students are selected
    // If assignedStudents is empty/undefined, no assignments = global activity visible to all
    let studentsToAssign: Student[] = [];
    if (createDto.assignedStudents && createDto.assignedStudents.length > 0) {
      // Assign to specific students only
      studentsToAssign = teacher.students.filter(s =>
        createDto.assignedStudents.includes(s.id)
      );
    }
    // If no students specified, don't create any assignments (global activity)

    // Create assignments only for specific students
    const assignments = [];
    for (const student of studentsToAssign) {
      const assignment = this.activityAssignmentRepository.create({
        activity: savedActivity,
        student,
        assignedBy: teacher,
      });
      assignments.push(await this.activityAssignmentRepository.save(assignment));
    }

    const isGlobal = assignments.length === 0;
    return {
      activity: savedActivity,
      assignedTo: isGlobal ? 'all students (global)' : assignments.length,
      assignments,
      message: isGlobal
        ? 'Custom practice created as a global activity (visible to all students)'
        : `Custom practice created and assigned to ${assignments.length} student(s)`,
    };
  }

  async getCustomPractices(teacherId: string) {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Get all assignments created by this teacher
    const assignments = await this.activityAssignmentRepository.find({
      where: { assignedBy: { id: teacherId } },
      relations: ['activity', 'student', 'student.user'],
    });

    // Group by activity
    const practicesMap = new Map();
    for (const assignment of assignments) {
      const activityId = assignment.activity.id;
      if (!practicesMap.has(activityId)) {
        practicesMap.set(activityId, {
          activity: assignment.activity,
          assignedStudents: [],
          totalAssigned: 0,
        });
      }
      const practice = practicesMap.get(activityId);
      practice.assignedStudents.push({
        id: assignment.student.id,
        name: `${assignment.student.user.firstName} ${assignment.student.user.lastName}`,
        assignedAt: assignment.assignedAt,
      });
      practice.totalAssigned++;
    }

    return Array.from(practicesMap.values());
  }

  async deleteCustomPractice(teacherId: string, activityId: string) {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Verify this teacher created this activity
    const assignments = await this.activityAssignmentRepository.find({
      where: {
        activity: { id: activityId },
        assignedBy: { id: teacherId },
      },
    });

    if (assignments.length === 0) {
      throw new NotFoundException('Custom practice not found or not created by this teacher');
    }

    // Delete assignments
    await this.activityAssignmentRepository.delete({
      activity: { id: activityId },
      assignedBy: { id: teacherId },
    });

    // Deactivate the activity
    await this.activityRepository.update(activityId, { isActive: false });

    return {
      message: 'Custom practice deleted successfully',
    };
  }
}