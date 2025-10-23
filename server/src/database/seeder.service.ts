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
import { ActivityCompletion } from '../entities/activity-completion.entity';
import { Progress } from '../entities/progress.entity';
import { UserRole } from '../enums/user-role.enum';
import { ActivityType, DifficultyLevel, SkillArea } from '../enums/activity-type.enum';

@Injectable()
export class SeederService {
  // Configurable number of students to create
  private readonly STUDENT_COUNT = 100;

  // Iranian first names
  private readonly firstNames = {
    male: ['Ali', 'Reza', 'Mohammad', 'Hossein', 'Amir', 'Mehdi', 'Javad', 'Hamid', 'Ahmad', 'Saeed', 'Majid', 'Hassan', 'Ehsan', 'Arash', 'Omid'],
    female: ['Zahra', 'Fatemeh', 'Maryam', 'Arezoo', 'Sara', 'Niloofar', 'Mina', 'Elham', 'Shirin', 'Nazanin', 'Yasmin', 'Parisa', 'Setareh', 'Leila', 'Negar']
  };

  // Iranian last names
  private readonly lastNames = ['Ahmadi', 'Mohammadi', 'Hosseini', 'Rezaei', 'Karimi', 'Rahimi', 'Moradi', 'Mousavi', 'Alipour', 'Jafari', 'Naderi', 'Ebrahimi', 'Bahrami', 'Salehi', 'Alizadeh'];

  // Parent occupations
  private readonly occupations = ['Engineer', 'Doctor', 'Teacher', 'Accountant', 'Business Owner', 'Lawyer', 'Architect', 'Pharmacist', 'IT Specialist', 'Manager'];

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
    @InjectRepository(ActivityCompletion)
    private activityCompletionRepository: Repository<ActivityCompletion>,
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
  ) {}

  async seedAll() {
    console.log('🌱 Starting database seeding...');
    console.log(`📊 Creating ${this.STUDENT_COUNT} students with realistic data...\n`);

    await this.seedBadges();
    await this.seedActivities();
    await this.seedTeachers();
    await this.seedStudentsAndParents();

    console.log('\n✅ Database seeding completed!');
    console.log(`\n📈 Summary:`);
    console.log(`   - ${this.STUDENT_COUNT} students created`);
    console.log(`   - ${this.STUDENT_COUNT} parents created`);
    console.log(`   - 3 teachers created`);
    console.log(`   - All with realistic activity data, badges, and progress`);
  }

  private randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomDate(daysAgo: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - this.randomInt(0, daysAgo));
    date.setHours(this.randomInt(8, 20), this.randomInt(0, 59), 0, 0);
    return date;
  }

  async seedBadges() {
    console.log('🏅 Seeding badges...');

    const existingBadges = await this.badgeRepository.count();
    if (existingBadges > 0) {
      console.log('   ✓ Badges already exist, skipping');
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
      {
        name: 'Rising Star',
        description: 'Reach level 10',
        iconUrl: '/badges/rising-star.png',
        criteria: { type: 'level_reached', value: 10 },
        pointsRequired: 500,
        isRare: true,
      },
      {
        name: 'Point Champion',
        description: 'Earn 1000 total points',
        iconUrl: '/badges/point-champion.png',
        criteria: { type: 'total_points', value: 1000 },
        pointsRequired: 1000,
        isRare: false,
      },
    ];

    for (const badgeData of badges) {
      const badge = this.badgeRepository.create(badgeData);
      await this.badgeRepository.save(badge);
    }

    console.log('   ✓ Badges created successfully');
  }

  async seedActivities() {
    console.log('🎯 Seeding activities...');

    const existingActivities = await this.activityRepository.count();
    if (existingActivities > 0) {
      console.log('   ✓ Activities already exist, skipping');
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

    console.log('   ✓ Activities created successfully');
  }

  async seedTeachers() {
    console.log('👨‍🏫 Seeding teachers...');

    const existingTeachers = await this.teacherRepository.count();
    if (existingTeachers > 0) {
      console.log('   ✓ Teachers already exist, skipping');
      return;
    }

    const teachers = [
      {
        firstName: 'Maryam',
        lastName: 'Hosseini',
        email: 'teacher@demo.com',
        employeeId: 'T001',
        schoolName: 'Tehran Elementary School',
        department: 'English Language',
        qualification: 'Master of TEFL',
        yearsOfExperience: 8,
        phoneNumber: '+98-912-987-6543',
      },
      {
        firstName: 'Ahmad',
        lastName: 'Karimi',
        email: 'teacher2@demo.com',
        employeeId: 'T002',
        schoolName: 'Tehran Elementary School',
        department: 'English Language',
        qualification: 'Bachelor of English Literature',
        yearsOfExperience: 5,
        phoneNumber: '+98-912-876-5432',
      },
      {
        firstName: 'Zahra',
        lastName: 'Rahimi',
        email: 'teacher3@demo.com',
        employeeId: 'T003',
        schoolName: 'Tehran Elementary School',
        department: 'English Language',
        qualification: 'Master of Applied Linguistics',
        yearsOfExperience: 12,
        phoneNumber: '+98-912-765-4321',
      },
    ];

    for (const teacherData of teachers) {
      const teacherUser = this.userRepository.create({
        email: teacherData.email,
        password: await bcrypt.hash('demo123', 10),
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        role: UserRole.TEACHER,
      });
      const savedTeacherUser = await this.userRepository.save(teacherUser);

      const teacher = this.teacherRepository.create({
        user: savedTeacherUser,
        employeeId: teacherData.employeeId,
        schoolName: teacherData.schoolName,
        department: teacherData.department,
        qualification: teacherData.qualification,
        yearsOfExperience: teacherData.yearsOfExperience,
        phoneNumber: teacherData.phoneNumber,
      });
      await this.teacherRepository.save(teacher);
    }

    // Create Admin User
    const adminUser = this.userRepository.create({
      email: 'admin@demo.com',
      password: await bcrypt.hash('demo123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });
    await this.userRepository.save(adminUser);

    console.log('   ✓ Teachers and admin created successfully');
  }

  async seedStudentsAndParents() {
    console.log('👨‍🎓 Seeding students and parents...');

    const existingStudents = await this.studentRepository.count();
    if (existingStudents > 0) {
      console.log('   ✓ Students already exist, skipping');
      return;
    }

    // Get all teachers and activities
    const teachers = await this.teacherRepository.find({ relations: ['user'] });
    const activities = await this.activityRepository.find();
    const badges = await this.badgeRepository.find();

    for (let i = 0; i < this.STUDENT_COUNT; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const studentFirstName = this.randomElement(this.firstNames[gender]);
      const studentLastName = this.randomElement(this.lastNames);
      const parentFirstName = this.randomElement(gender === 'male' ? this.firstNames.male : this.firstNames.female);
      const parentLastName = studentLastName; // Same family name

      // Create Parent User
      const parentUser = this.userRepository.create({
        email: `parent${i + 1}@demo.com`,
        password: await bcrypt.hash('demo123', 10),
        firstName: parentFirstName,
        lastName: parentLastName,
        role: UserRole.PARENT,
      });
      const savedParentUser = await this.userRepository.save(parentUser);

      const parent = this.parentRepository.create({
        user: savedParentUser,
        phoneNumber: `+98-912-${this.randomInt(100, 999)}-${this.randomInt(1000, 9999)}`,
        occupation: this.randomElement(this.occupations),
        receiveNotifications: Math.random() > 0.3,
        receiveProgressReports: Math.random() > 0.2,
      });
      const savedParent = await this.parentRepository.save(parent);

      // Determine performance tier (varied distribution)
      const rand = Math.random();
      let performanceTier: 'high' | 'medium' | 'low';
      if (rand < 0.20) performanceTier = 'high';       // 20% high performers
      else if (rand < 0.70) performanceTier = 'medium'; // 50% average
      else performanceTier = 'low';                     // 30% low performers

      // Generate stats based on performance tier
      let totalPoints: number, currentLevel: number, streakDays: number, activityCount: number;
      let proficiencyLevel: string;

      if (performanceTier === 'high') {
        totalPoints = this.randomInt(1500, 3000);
        currentLevel = this.randomInt(12, 20);
        streakDays = this.randomInt(15, 45);
        activityCount = this.randomInt(30, 60);
        proficiencyLevel = 'advanced';
      } else if (performanceTier === 'medium') {
        totalPoints = this.randomInt(500, 1500);
        currentLevel = this.randomInt(5, 12);
        streakDays = this.randomInt(5, 15);
        activityCount = this.randomInt(15, 30);
        proficiencyLevel = 'intermediate';
      } else {
        totalPoints = this.randomInt(50, 500);
        currentLevel = this.randomInt(1, 5);
        streakDays = this.randomInt(0, 5);
        activityCount = this.randomInt(3, 15);
        proficiencyLevel = 'beginner';
      }

      // Create Student User
      const studentUser = this.userRepository.create({
        email: `student${i + 1}@demo.com`,
        password: await bcrypt.hash('demo123', 10),
        firstName: studentFirstName,
        lastName: studentLastName,
        role: UserRole.STUDENT,
      });
      const savedStudentUser = await this.userRepository.save(studentUser);

      const student = this.studentRepository.create({
        user: savedStudentUser,
        grade: this.randomInt(4, 6),
        age: this.randomInt(9, 12),
        totalPoints,
        currentLevel,
        experiencePoints: this.randomInt(0, 500),
        proficiencyLevel,
        schoolName: 'Tehran Elementary School',
        className: this.randomElement(['4A', '4B', '5A', '5B', '6A', '6B']),
        streakDays,
        lastActivityDate: this.randomDate(3),
        teacher: this.randomElement(teachers),
        parent: savedParent,
      });
      const savedStudent = await this.studentRepository.save(student);

      // Create Activity Completions
      const completedActivities = this.randomElement(activities.slice(0, Math.min(activityCount, activities.length)));
      await this.createActivityCompletions(savedStudent, activities, activityCount, performanceTier);

      // Assign Badges based on performance
      const badgeCount = performanceTier === 'high' ? this.randomInt(5, 9) :
                         performanceTier === 'medium' ? this.randomInt(2, 5) :
                         this.randomInt(0, 2);

      if (badgeCount > 0) {
        const studentBadges = badges
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(badgeCount, badges.length));
        savedStudent.badges = studentBadges;
        await this.studentRepository.save(savedStudent);
      }

      // Create Progress Records for skill areas
      await this.createProgressRecords(savedStudent, performanceTier);

      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`   ✓ Created ${i + 1}/${this.STUDENT_COUNT} students...`);
      }
    }

    console.log(`   ✓ All ${this.STUDENT_COUNT} students and parents created successfully`);
  }

  private async createActivityCompletions(
    student: Student,
    activities: Activity[],
    count: number,
    performanceTier: 'high' | 'medium' | 'low'
  ) {
    const completionsToCreate = Math.min(count, activities.length * 3); // Can repeat activities

    for (let i = 0; i < completionsToCreate; i++) {
      const activity = this.randomElement(activities);

      // Score based on performance tier
      let score: number;
      if (performanceTier === 'high') {
        score = this.randomInt(80, 100);
      } else if (performanceTier === 'medium') {
        score = this.randomInt(60, 85);
      } else {
        score = this.randomInt(40, 70);
      }

      const completion = this.activityCompletionRepository.create({
        student,
        activity,
        score,
        pointsEarned: Math.round((score / 100) * activity.pointsReward),
        timeSpent: this.randomInt(120, 900), // 2-15 minutes
        isCompleted: true,
        completedAt: this.randomDate(60), // Within last 60 days
        submissionData: {
          attemptCount: this.randomInt(1, 3),
          recordingUrl: '/recordings/sample.mp3',
        },
        feedback: {
          overallComment: score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good effort!' : 'Keep practicing!',
          pronunciationScore: this.randomInt(score - 10, score + 10),
          fluencyScore: this.randomInt(score - 10, score + 10),
        },
      });

      await this.activityCompletionRepository.save(completion);
    }
  }

  private async createProgressRecords(
    student: Student,
    performanceTier: 'high' | 'medium' | 'low'
  ) {
    const skillAreas = Object.values(SkillArea);

    for (const skillArea of skillAreas) {
      let assessmentLevel: number;

      if (performanceTier === 'high') {
        assessmentLevel = this.randomInt(4, 5);
      } else if (performanceTier === 'medium') {
        assessmentLevel = this.randomInt(2, 4);
      } else {
        assessmentLevel = this.randomInt(1, 2);
      }

      const progress = this.progressRepository.create({
        student,
        user: student.user,
        skillArea,
        currentScore: this.randomInt(50, 100),
        previousScore: this.randomInt(30, 80),
        totalActivitiesCompleted: this.randomInt(5, 30),
        totalTimeSpent: this.randomInt(60, 600),
        assessmentLevel,
        detailedMetrics: {
          strengths: ['pronunciation', 'vocabulary'],
          weaknesses: ['fluency'],
          recommendations: ['Practice daily conversations'],
        },
      });

      await this.progressRepository.save(progress);
    }
  }
}
