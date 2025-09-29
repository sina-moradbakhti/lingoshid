export enum UserRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  grade: number;
  age: number;
  totalPoints: number;
  currentLevel: number;
  experiencePoints: number;
  proficiencyLevel: string;
  schoolName?: string;
  className?: string;
  streakDays: number;
  lastActivityDate?: Date;
  user: User;
  badges?: Badge[];
  progress?: Progress[];
}

export interface Parent {
  id: string;
  phoneNumber?: string;
  occupation?: string;
  receiveNotifications: boolean;
  receiveProgressReports: boolean;
  user: User;
  children?: Student[];
}

export interface Teacher {
  id: string;
  employeeId?: string;
  schoolName?: string;
  department?: string;
  qualification?: string;
  yearsOfExperience: number;
  phoneNumber?: string;
  user: User;
  students?: Student[];
  classes?: Class[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  criteria: any;
  pointsRequired: number;
  isRare: boolean;
  isActive: boolean;
}

export interface Progress {
  id: string;
  skillArea: string;
  currentScore: number;
  previousScore: number;
  totalActivitiesCompleted: number;
  totalTimeSpent: number;
  assessmentLevel: number;
  detailedMetrics?: any;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  skillArea: string;
  pointsReward: number;
  minLevel: number;
  maxLevel?: number;
  content?: any;
  imageUrl?: string;
  audioUrl?: string;
  isActive: boolean;
  order: number;
}

export interface ActivityCompletion {
  id: string;
  score: number;
  pointsEarned: number;
  timeSpent: number;
  isCompleted: boolean;
  submissionData?: any;
  feedback?: any;
  completedAt: Date;
  activity: Activity;
}

export interface Class {
  id: string;
  name: string;
  grade: number;
  description?: string;
  isActive: boolean;
  schoolYear?: string;
  teacher: Teacher;
  students?: Student[];
}