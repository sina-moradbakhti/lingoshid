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
import { ActivitySession } from '../entities/activity-session.entity';
import { Progress } from '../entities/progress.entity';
import { UserRole } from '../enums/user-role.enum';
import { ActivityType, DifficultyLevel, SkillArea } from '../enums/activity-type.enum';

@Injectable()
export class SeederService {
  // Configurable number of students to create
  private readonly STUDENT_COUNT = 100;

  // Generate unique suffix for this seeding run (timestamp-based)
  private readonly UNIQUE_SUFFIX = Date.now().toString().slice(-6);

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
    @InjectRepository(ActivitySession)
    private activitySessionRepository: Repository<ActivitySession>,
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
  ) {}

  async seedAll() {
    console.log('🌱 Starting database seeding...');
    console.log(`📊 Creating ${this.STUDENT_COUNT} students with realistic data...`);
    console.log(`🔑 Unique batch ID: ${this.UNIQUE_SUFFIX}\n`);

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
    console.log(`   - Batch ID: ${this.UNIQUE_SUFFIX} (for reference)`);
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

    // Clear old non-modular activities
    const existingActivities = await this.activityRepository.find();
    if (existingActivities.length > 0) {
      console.log(`   🗑️  Clearing ${existingActivities.length} old activities...`);

      // First, clear activity sessions (foreign key dependency)
      const sessionCount = await this.activitySessionRepository.count();
      if (sessionCount > 0) {
        console.log(`   🗑️  Clearing ${sessionCount} activity sessions...`);
        const sessions = await this.activitySessionRepository.find();
        await this.activitySessionRepository.remove(sessions);
      }

      // Then clear activity completions (foreign key dependency)
      const completionCount = await this.activityCompletionRepository.count();
      if (completionCount > 0) {
        console.log(`   🗑️  Clearing ${completionCount} activity completions...`);
        const completions = await this.activityCompletionRepository.find();
        await this.activityCompletionRepository.remove(completions);
      }

      // Finally, delete activities
      await this.activityRepository.remove(existingActivities);
      console.log('   ✓ Old activities and related data removed');
    }

    // Create new modular activities
    const activities = [
      // 1. Pronunciation Challenge Module
      {
        title: 'Basic Greetings - Pronunciation',
        description: 'Practice pronouncing common English greetings',
        type: ActivityType.PRONUNCIATION_CHALLENGE,
        difficulty: DifficultyLevel.BEGINNER,
        skillArea: SkillArea.PRONUNCIATION,
        pointsReward: 20,
        minLevel: 1,
        content: {
          words: ['Hello', 'Goodbye', 'Thank you', 'Please', 'Excuse me']
        },
        isActive: true,
        order: 1,
      },
      {
        title: 'Common Phrases - Pronunciation',
        description: 'Master everyday English phrases',
        type: ActivityType.PRONUNCIATION_CHALLENGE,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skillArea: SkillArea.PRONUNCIATION,
        pointsReward: 25,
        minLevel: 2,
        content: {
          words: ['How are you', 'Nice to meet you', 'See you later', 'Have a good day', 'You are welcome']
        },
        isActive: true,
        order: 2,
      },

      // 2. Quiz Challenge Module
      {
        title: 'English Grammar Quiz - Beginner',
        description: 'Test your knowledge of basic English grammar',
        type: ActivityType.QUIZ_CHALLENGE,
        difficulty: DifficultyLevel.BEGINNER,
        skillArea: SkillArea.VOCABULARY,
        pointsReward: 25,
        minLevel: 1,
        content: {
          questions: [
            {
              question: 'What is the past tense of "go"?',
              options: ['goed', 'went', 'gone', 'going'],
              correctAnswer: 1,
              explanation: 'The past tense of "go" is "went".',
              category: 'Grammar'
            },
            {
              question: 'Which word is a noun?',
              options: ['run', 'happy', 'cat', 'quickly'],
              correctAnswer: 2,
              explanation: 'A noun is a person, place, or thing. "Cat" is a thing.',
              category: 'Parts of Speech'
            },
            {
              question: 'Choose the correct sentence:',
              options: [
                'She go to school',
                'She goes to school',
                'She going to school',
                'She gone to school'
              ],
              correctAnswer: 1,
              explanation: 'We use "goes" with "she/he/it" in present simple.',
              category: 'Grammar'
            }
          ],
          passingScore: 70,
          showExplanations: true
        },
        isActive: true,
        order: 3,
      },
      {
        title: 'English Vocabulary Quiz',
        description: 'Test your English vocabulary knowledge',
        type: ActivityType.QUIZ_CHALLENGE,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skillArea: SkillArea.VOCABULARY,
        pointsReward: 30,
        minLevel: 3,
        content: {
          questions: [
            {
              question: 'What does "brave" mean?',
              options: ['scared', 'courageous', 'tired', 'happy'],
              correctAnswer: 1,
              explanation: '"Brave" means showing courage or fearlessness.',
              category: 'Vocabulary'
            },
            {
              question: 'Which word means "very big"?',
              options: ['tiny', 'small', 'huge', 'medium'],
              correctAnswer: 2,
              explanation: '"Huge" means extremely large or big.',
              category: 'Vocabulary'
            },
            {
              question: 'What is the opposite of "hot"?',
              options: ['warm', 'cold', 'cool', 'freezing'],
              correctAnswer: 1,
              explanation: '"Cold" is the direct opposite of "hot".',
              category: 'Vocabulary'
            }
          ],
          passingScore: 70,
          showExplanations: true
        },
        isActive: true,
        order: 4,
      },

      // 3. Vocabulary Match Module
      {
        title: 'Animals Vocabulary Match',
        description: 'Match animal words with their pictures',
        type: ActivityType.VOCABULARY_MATCH,
        difficulty: DifficultyLevel.BEGINNER,
        skillArea: SkillArea.VOCABULARY,
        pointsReward: 30,
        minLevel: 1,
        content: {
          vocabulary: [
            {
              word: 'Cat',
              imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
              translation: 'گربه',
              category: 'Animals'
            },
            {
              word: 'Dog',
              imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop',
              translation: 'سگ',
              category: 'Animals'
            },
            {
              word: 'Bird',
              imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop',
              translation: 'پرنده',
              category: 'Animals'
            },
            {
              word: 'Fish',
              imageUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&h=300&fit=crop',
              translation: 'ماهی',
              category: 'Animals'
            }
          ],
          itemsPerRound: 4,
          showTranslations: false
        },
        isActive: true,
        order: 5,
      },
      {
        title: 'Colors Vocabulary Match',
        description: 'Learn color words by matching them with images',
        type: ActivityType.VOCABULARY_MATCH,
        difficulty: DifficultyLevel.BEGINNER,
        skillArea: SkillArea.VOCABULARY,
        pointsReward: 30,
        minLevel: 1,
        content: {
          vocabulary: [
            {
              word: 'Red',
              imageUrl: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=400&h=300&fit=crop',
              translation: 'قرمز',
              category: 'Colors'
            },
            {
              word: 'Blue',
              imageUrl: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=400&h=300&fit=crop',
              translation: 'آبی',
              category: 'Colors'
            },
            {
              word: 'Yellow',
              imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
              translation: 'زرد',
              category: 'Colors'
            },
            {
              word: 'Green',
              imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop',
              translation: 'سبز',
              category: 'Colors'
            }
          ],
          itemsPerRound: 4,
          showTranslations: false
        },
        isActive: true,
        order: 6,
      },

      // 4. AI Conversation Activities
      {
        title: 'Chat with a Friend - Beginner',
        description: 'Have a simple conversation with Alex about making new friends',
        type: ActivityType.AI_CONVERSATION,
        difficulty: DifficultyLevel.BEGINNER,
        skillArea: SkillArea.FLUENCY,
        pointsReward: 50,
        minLevel: 1,
        content: {
          scenario: 'making_friends',
          difficultyLevel: 'beginner',
          customInstructions: 'Keep responses very simple with basic vocabulary',
        },
        isActive: true,
        order: 7,
      },
      {
        title: 'Chat with a Friend - Intermediate',
        description: 'Talk with Alex about your favorite hobbies and interests',
        type: ActivityType.AI_CONVERSATION,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skillArea: SkillArea.FLUENCY,
        pointsReward: 60,
        minLevel: 3,
        content: {
          scenario: 'my_hobbies',
          difficultyLevel: 'intermediate',
          customInstructions: 'Use varied vocabulary and encourage longer responses',
        },
        isActive: true,
        order: 8,
      },
      {
        title: 'Chat with a Friend - Advanced',
        description: 'Have an engaging conversation with Alex about weekend plans and family',
        type: ActivityType.AI_CONVERSATION,
        difficulty: DifficultyLevel.ADVANCED,
        skillArea: SkillArea.FLUENCY,
        pointsReward: 75,
        minLevel: 5,
        content: {
          scenario: 'weekend_fun',
          difficultyLevel: 'advanced',
          customInstructions: 'Challenge the student with complex sentence structures',
        },
        isActive: true,
        order: 9,
      },
      {
        title: 'School Conversations',
        description: 'Practice talking about school life with a classmate',
        type: ActivityType.AI_CONVERSATION,
        difficulty: DifficultyLevel.BEGINNER,
        skillArea: SkillArea.FLUENCY,
        pointsReward: 50,
        minLevel: 2,
        content: {
          scenario: 'at_school',
          difficultyLevel: 'beginner',
          customInstructions: 'Focus on school-related vocabulary',
        },
        isActive: true,
        order: 10,
      },
      {
        title: 'Talk About Your Family',
        description: 'Share stories about your family members with Alex',
        type: ActivityType.AI_CONVERSATION,
        difficulty: DifficultyLevel.INTERMEDIATE,
        skillArea: SkillArea.FLUENCY,
        pointsReward: 60,
        minLevel: 4,
        content: {
          scenario: 'my_family',
          difficultyLevel: 'intermediate',
          customInstructions: 'Encourage descriptive language about family',
        },
        isActive: true,
        order: 11,
      },
      {
        title: 'Favorite Things Discussion',
        description: 'Chat about your favorite foods, games, and activities',
        type: ActivityType.AI_CONVERSATION,
        difficulty: DifficultyLevel.BEGINNER,
        skillArea: SkillArea.FLUENCY,
        pointsReward: 50,
        minLevel: 1,
        content: {
          scenario: 'favorite_things',
          difficultyLevel: 'beginner',
          customInstructions: 'Use simple questions about preferences',
        },
        isActive: true,
        order: 12,
      },
    ];

    for (const activityData of activities) {
      const activity = this.activityRepository.create(activityData);
      await this.activityRepository.save(activity);
    }

    console.log('   ✓ Modular activities created successfully (12 activities: 6 practice + 6 AI conversation)');
  }

  async seedTeachers() {
    console.log('👨‍🏫 Seeding teachers...');

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
      // Check if teacher already exists
      const existingUser = await this.userRepository.findOne({ where: { email: teacherData.email } });
      if (existingUser) {
        console.log(`   ⚠️  Teacher ${teacherData.email} already exists, skipping`);
        continue;
      }

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

    // Create Admin User if not exists
    const existingAdmin = await this.userRepository.findOne({ where: { email: 'admin@demo.com' } });
    if (!existingAdmin) {
      const adminUser = this.userRepository.create({
        email: 'admin@demo.com',
        password: await bcrypt.hash('demo123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
      });
      await this.userRepository.save(adminUser);
      console.log('   ✓ Admin user created');
    }

    console.log('   ✓ Teachers seeding completed');
  }

  async seedStudentsAndParents() {
    console.log('👨‍🎓 Seeding students and parents...');

    // Get all teachers and activities
    const teachers = await this.teacherRepository.find({ relations: ['user'] });
    const activities = await this.activityRepository.find();
    const badges = await this.badgeRepository.find();

    if (teachers.length === 0) {
      console.log('   ⚠️  No teachers found. Please seed teachers first.');
      return;
    }

    // Create demo student account if it doesn't exist
    const existingDemoStudent = await this.userRepository.findOne({ where: { email: 'student@demo.com' } });
    if (!existingDemoStudent) {
      console.log('   📝 Creating demo student account...');

      // Create demo parent first
      const demoParentUser = this.userRepository.create({
        email: 'parent@demo.com',
        password: await bcrypt.hash('demo123', 10),
        firstName: 'Demo',
        lastName: 'Parent',
        role: UserRole.PARENT,
      });
      const savedDemoParentUser = await this.userRepository.save(demoParentUser);

      const demoParent = this.parentRepository.create({
        user: savedDemoParentUser,
        phoneNumber: '+98-912-000-0000',
        occupation: 'Engineer',
        receiveNotifications: true,
        receiveProgressReports: true,
      });
      const savedDemoParent = await this.parentRepository.save(demoParent);

      // Create demo student
      const demoStudentUser = this.userRepository.create({
        email: 'student@demo.com',
        password: await bcrypt.hash('demo123', 10),
        firstName: 'Alex',
        lastName: 'Johnson',
        role: UserRole.STUDENT,
      });
      const savedDemoStudentUser = await this.userRepository.save(demoStudentUser);

      const demoStudent = this.studentRepository.create({
        user: savedDemoStudentUser,
        grade: 5,
        age: 10,
        totalPoints: 500,
        currentLevel: 5,
        experiencePoints: 200,
        proficiencyLevel: 'intermediate',
        schoolName: 'Tehran Elementary School',
        className: '5A',
        streakDays: 7,
        lastActivityDate: new Date(),
        teacher: this.randomElement(teachers),
        parent: savedDemoParent,
      });
      await this.studentRepository.save(demoStudent);

      console.log('   ✓ Demo student account created: student@demo.com / demo123');
    } else {
      console.log('   ⚠️  Demo student already exists, skipping');
    }

    for (let i = 0; i < this.STUDENT_COUNT; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const studentFirstName = this.randomElement(this.firstNames[gender]);
      const studentLastName = this.randomElement(this.lastNames);
      const parentFirstName = this.randomElement(gender === 'male' ? this.firstNames.male : this.firstNames.female);
      const parentLastName = studentLastName; // Same family name

      // Generate unique email addresses using batch ID
      const parentEmail = `parent.${this.UNIQUE_SUFFIX}.${i + 1}@demo.com`;
      const studentEmail = `student.${this.UNIQUE_SUFFIX}.${i + 1}@demo.com`;

      // Create Parent User
      const parentUser = this.userRepository.create({
        email: parentEmail,
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
        email: studentEmail,
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
