import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity, ActivityCompletion } from '../models/user.model';
import { environment } from '../../environments/environment';

export interface CompleteActivityRequest {
  timeSpent: number;
  submissionData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/activities`;

  constructor(private http: HttpClient) {}

  getActivities(filters?: {
    type?: string;
    difficulty?: string;
    skillArea?: string;
  }): Observable<Activity[]> {
    let params = '';
    if (filters) {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.skillArea) queryParams.append('skillArea', filters.skillArea);
      params = queryParams.toString() ? `?${queryParams.toString()}` : '';
    }
    return this.http.get<Activity[]>(`${this.apiUrl}${params}`);
  }

  getActivity(id: string): Observable<Activity> {
    return this.http.get<Activity>(`${this.apiUrl}/${id}`);
  }

  completeActivity(activityId: string, completionData: CompleteActivityRequest): Observable<ActivityCompletion> {
    return this.http.post<ActivityCompletion>(`${this.apiUrl}/${activityId}/complete`, completionData);
  }

  getStudentProgress(studentId: string, activityId?: string): Observable<ActivityCompletion[]> {
    let params = activityId ? `?activityId=${activityId}` : '';
    return this.http.get<ActivityCompletion[]>(`${this.apiUrl}/progress/${studentId}${params}`);
  }

  getActivityAnalytics(activityId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${activityId}/analytics`);
  }

  seedActivities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/seed`);
  }
}