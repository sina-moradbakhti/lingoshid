import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SkillProgress {
  skillArea: 'fluency' | 'pronunciation' | 'confidence' | 'vocabulary';
  currentLevel: number;
  progressPercentage: number;
  totalPracticeTime: number;
  activitiesCompleted: number;
  totalActivitiesAvailable: number;
  averageScore: number;
  recentImprovement: number;
  lastActivity: Date | null;
}

export interface ActivityTimelineEntry {
  date: string;
  activitiesCompleted: number;
  totalTimeSpent: number;
  pointsEarned: number;
  averageScore: number;
}

export interface WeeklyTrend {
  week: string;
  startDate: string;
  activitiesCompleted: number;
  averageScore: number;
  totalPoints: number;
  timeSpent: number;
}

export interface LearningAnalytics {
  totalTimeSpent: number;
  averageSessionTime: number;
  learningVelocity: number;
  consistencyScore: number;
  activitiesNeededForNextLevel: number;
  estimatedTimeToNextLevel: number;
  strongestSkill: string;
  improvementArea: string;
}

export interface PerformanceTrends {
  weeklyTrends: WeeklyTrend[];
  improvementTrend: 'improving' | 'declining' | 'stable';
  performanceConsistency: number;
}

export interface AchievementProgress {
  badgesEarned: number;
  totalBadges: number;
  badgeProgress: number;
  nextBadgeTarget: any;
}

export interface DetailedProgress {
  student: {
    id: string;
    name: string;
    grade: number;
    currentLevel: number;
    totalPoints: number;
    experiencePoints: number;
    streakDays: number;
    lastActivityDate: string;
  };
  skillProgress: SkillProgress[];
  activityTimeline: ActivityTimelineEntry[];
  learningAnalytics: LearningAnalytics;
  performanceTrends: PerformanceTrends;
  achievementProgress: AchievementProgress;
  totalActivities: number;
  completedActivities: number;
  totalTimeSpent: number;
  averageScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getDetailedProgress(studentId: string): Observable<DetailedProgress> {
    return this.http.get<DetailedProgress>(`${this.apiUrl}/${studentId}/detailed-progress`);
  }
}