import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LeaderboardEntry {
  rank: number;
  student: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
    totalPoints: number;
    currentLevel: number;
    grade: number;
  };
  points: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  totalStudents: number;
}

interface ApiStudent {
  id: string;
  grade: number;
  age: number;
  totalPoints: number;
  currentLevel: number;
  experiencePoints: number;
  proficiencyLevel: string;
  schoolName: string;
  className: string;
  streakDays: number;
  lastActivityDate: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
    isActive: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getLeaderboard(grade?: number, limit: number = 10): Observable<LeaderboardResponse> {
    let url = `${this.apiUrl}/leaderboard?limit=${limit}`;
    if (grade) {
      url += `&grade=${grade}`;
    }
    return this.http.get<ApiStudent[]>(url).pipe(
      map((students: ApiStudent[]) => {
        // Sort students by total points in descending order
        const sortedStudents = students.sort((a, b) => b.totalPoints - a.totalPoints);

        // Transform API response to LeaderboardEntry format with ranks
        const entries: LeaderboardEntry[] = sortedStudents.map((student, index) => ({
          rank: index + 1,
          student: {
            id: student.id,
            user: {
              firstName: student.user.firstName,
              lastName: student.user.lastName
            },
            totalPoints: student.totalPoints,
            currentLevel: student.currentLevel,
            grade: student.grade
          },
          points: student.totalPoints,
          isCurrentUser: false // Will be set by component
        }));

        return {
          entries,
          totalStudents: students.length
        };
      })
    );
  }

  getMyRank(studentId: string): Observable<{ rank: number; totalStudents: number }> {
    return this.http.get<{ rank: number; totalStudents: number }>(`${this.apiUrl}/${studentId}/rank`);
  }
}