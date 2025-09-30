import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: any;
  pointsRequired?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentBadge {
  id: string;
  badge: Badge;
  student: any;
  earnedAt: Date;
  progress?: number;
  isEarned: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BadgesService {
  private apiUrl = `${environment.apiUrl}/badges`;

  constructor(private http: HttpClient) {}

  getAllBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.apiUrl);
  }

  getBadge(id: string): Observable<Badge> {
    return this.http.get<Badge>(`${this.apiUrl}/${id}`);
  }

  seedBadges(): Observable<any> {
    return this.http.get(`${this.apiUrl}/seed`);
  }

  // This would typically be in a separate student-badges service
  // but for simplicity, including it here
  getStudentBadges(studentId: string): Observable<StudentBadge[]> {
    // This endpoint might not exist yet, but we can mock it
    return this.http.get<StudentBadge[]>(`${environment.apiUrl}/students/${studentId}/badges`);
  }
}