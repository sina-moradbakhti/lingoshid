import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ParentDashboard {
  children: any[];
  upcomingActivities?: any[];
  recentProgress?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ParentService {
  private apiUrl = `${environment.apiUrl}/parents`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ParentDashboard> {
    return this.http.get<ParentDashboard>(`${this.apiUrl}/dashboard`);
  }

  getChildren(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/children`);
  }
}