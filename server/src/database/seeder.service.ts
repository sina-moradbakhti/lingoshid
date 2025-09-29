import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Student } from '../entities/student.entity';
import { Parent } from '../entities/parent.entity';
import { Teacher } from '../entities/teacher.entity';
import { Badge } from '../entities/badge.entity';
import { Activity } from '../entities/activity.entity';
import { UserRole } from '../enums/user-role.enum';
import { ActivityType, DifficultyLevel, SkillArea } from '../enums/activity-type.enum';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async seedAll() {
    console.log('🌱 Starting database seeding...');
    
    await this.seedUsers();
    await this.seedBadges();
    await this.seedActivities();
    
    console.log('✅ Database seeding completed!');
  }

  async seedUsers() {
    console.log('👥 Seeding demo users...');

    // Check if users already exist
    const existingUsers = await this.userRepository.count();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping user seeding');
      return;
    }

    // Create Student Demo User
    const studentUser = this.userRepository.create({
      email: 'student@demo.com',
      password: await bcrypt.hash('demo123', 10),
      firstName: 'Alex',
      lastName: 'Johnson',
      role: UserRole.STUDENT,
    });
    const savedStudentUser = await this.userRepository.save(studentUser);

    const student = this.studentRepository.create({
      user: savedStudentUser,
      grade: 5,
      age: 10,
      totalPoints: 1250,
      currentLevel: 8,
      experiencePoints: 350,
      proficiencyLevel: 'intermediate',
      schoolName: 'Tehran Elementary School',
      className: '5A',
      streakDays: 7,
      lastActivityDate: new Date(),
    });
    await this.studentRepository.save(student);

    // Create Parent Demo User
    const parentUser = this.userRepository.create({
      email: 'parent@demo.com',
      password: await bcrypt.hash('demo123', 10),
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.PARENT,
    });
    const savedParentUser = await this.userRepository.save(parentUser);

    const parent = this.parentRepository.create({
      user: savedParentUser,
      phoneNumber: '+98-912-345-6789',
      occupation: 'Engineer',
      receiveNotifications: true,
      receiveProgressReports: true,
    });
    await this.parentRepository.save(parent);

    // Link student to parent
    student.parent = parent;
    await this.studentRepository.save(student);

    // Create Teacher Demo User
    const teacherUser = this.userRepository.create({
      email: 'teacher@demo.com',
      password: await bcrypt.hash('demo123', 10),
      firstName: 'Ms. Maryam',
      lastName: 'Hosseini',
      role: UserRole.TEACHER,
    });
    const savedTeacherUser = await this.userRepository.save(teacherUser);

    const teacher = this.teacherRepository.create({
      user: savedTeacherUser,
      employeeId: 'T001',
      schoolName: 'Tehran Elementary School',
      department: 'English Language',
      qualification: 'Master of TEFL',
      yearsOfExperience: 8,
      phoneNumber: '+98-912-987-6543',
    });
    await this.teacherRepository.save(teacher);

    // Link student to teacher
    student.teacher = teacher;
    await this.studentRepository.save(student);

    // Create Admin Demo User
    const adminUser = this.userRepository.create({
      email: 'admin@demo.com',
      password: await bcrypt.hash('demo123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });
    await this.userRepository.save(adminUser);

    console.log('✅ Demo users created successfully!');
  }

  async seedBadges() {
    console.log('🏅 Seeding badges...');

    const existingBadges = await this.badgeRepository.count();
    if (existingBadges > 0) {
      console.log('Badges already exist, skipping badge seeding');
      return;
    }

    const badges = [
      {
        name: 'First Steps',
        description: 'Complete your first speaking activity',
        iconUrl: '/badges/first-steps.png',
        criteria: { type: 'activities_completed', value: 1 },
        pointsRequired: 0,
        isRare: false,
      },
      {
        name: 'Brave Speaker',
        description: 'Speak for 5 minutes total',
        iconUrl: '/badges/brave-speaker.png',
        criteria: { type: 'total_speaking_time', value: 300 },
        pointsRequired: 50,
        isRare: false,
      },
      {
        name: 'Pronunciation Pro',
        description: 'Achieve 80% pronunciation accuracy',
        iconUrl: '/badges/pronunciation-pro.png',
        criteria: { type: 'pronunciation_accuracy', value: 80 },
        pointsRequired: 100,
        isRare: false,
      },
      {
        name: 'Conversation Master',
        description: 'Complete 10 dialogue activities',
        iconUrl: '/badges/conversation-master.png',
        criteria: { type: 'dialogue_activities', value: 10 },
        pointsRequired: 200,
        isRare: true,
      },
      {
        name: 'Story Teller',
        description: 'Record and share one story',
        iconUrl: '/badges/story-teller.png',
        criteria: { type: 'stories_created', value: 1 },
        pointsRequired: 75,
        isRare: false,
      },
      {
        name: 'Daily Learner',
        description: 'Login for 7 consecutive days',
        iconUrl: '/badges/daily-learner.png',
        criteria: { type: 'streak_days', value: 7 },
        pointsRequired: 150,
        isRare: false,
      },
      {
        name: 'Helper Friend',
        description: 'Complete 5 peer assistance activities',
        iconUrl: '/badges/helper-friend.png',
        criteria: { type: 'peer_help', value: 5 },
        pointsRequired: 100,
        isRare: false,
      },
    ];

    for (const badgeData of badges) {
      const badge = this.badgeRepository.create(badgeData);
      await this.badgeRepository.save(badge);
    }

    console.log('✅ Badges created successfully!');
  }

  async seedActivities() {
    console.log('🎯 Seeding activities...');

    const existingActivities = await this.activityRepository.count();
    if (existingActivities > 0) {
      console.log('Activities already exist, skipping activity seeding');
      return;
    }

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
      {
        title: 'At the Restaurant',
        description: 'Practice ordering food at a restaurant',
        type: ActivityType.ROLE_PLAY,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skillArea: SkillArea.CONFIDENCE,
        pointsReward: 25,
        minLevel: 3,
        content: {
          scenario: 'restaurant',
          role: 'customer',
          vocabulary: ['menu', 'order', 'please', 'thank you', 'delicious'],
          instructions: 'Act as a customer ordering food',
        },
        order: 4,
      },
      {
        title: 'My Family Story',
        description: 'Create and tell a story about your family',
        type: ActivityType.STORY_CREATION,
        difficulty: DifficultyLevel.ADVANCED,
        skillArea: SkillArea.FLUENCY,
        pointsReward: 30,
        minLevel: 4,
        content: {
          theme: 'family',
          vocabulary: ['mother', 'father', 'sister', 'brother', 'love', 'happy'],
          instructions: 'Create a short story about your family using the given words',
        },
        order: 5,
      },
      {
        title: 'English Songs - Twinkle Star',
        description: 'Sing along to improve pronunciation and rhythm',
        type: ActivityType.SINGING_CHANTING,
        difficulty: DifficultyLevel.BEGINNER,
        skillArea: SkillArea.PRONUNCIATION,
        pointsReward: 15,
        minLevel: 1,
        content: {
          song: 'Twinkle, Twinkle, Little Star',
          lyrics: 'Twinkle, twinkle, little star, How I wonder what you are...',
          instructions: 'Sing along and focus on clear pronunciation',
        },
        order: 6,
      },
    ];

    for (const activityData of activities) {
      const activity = this.activityRepository.create(activityData);
      await this.activityRepository.save(activity);
    }

    console.log('✅ Activities created successfully!');
  }
}