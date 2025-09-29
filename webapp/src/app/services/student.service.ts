import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, Activity, ActivityCompletion } from '../models/user.model';
import { environment } from '../../environments/environment';

export interface StudentDashboard {
  student: Student;
  recentActivities: ActivityCompletion[];
  levelProgress: {
    currentLevel: number;
    experiencePoints: number;
    pointsForNextLevel: number;
    progressPercentage: number;
  };
  leaderboardPosition: number;
  totalBadges: number;
  streakDays: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<StudentDashboard> {
    return this.http.get<StudentDashboard>(`${this.apiUrl}/dashboard`);
  }

  getLeaderboard(grade?: number, limit: number = 10): Observable<Student[]> {
    let params = `?limit=${limit}`;
    if (grade) {
      params += `&grade=${grade}`;
    }
    return this.http.get<Student[]>(`${this.apiUrl}/leaderboard${params}`);
  }

  updateProgress(studentId: string, pointsEarned: number, activityType: string): Observable<Student> {
    return this.http.post<Student>(`${this.apiUrl}/${studentId}/update-progress`, {
      pointsEarned,
      activityType
    });
  }

  getStudent(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }
}