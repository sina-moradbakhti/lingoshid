import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TeacherDashboard {
  teacher: any;
  students: any[];
  totalStudents: number;
  totalClasses: number;
}

export interface StudentWithCredentials {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    qrCode: string;
    grade: number;
    age: number;
  };
  parent: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    qrCode: string;
    phoneNumber?: string;
  };
  message: string;
}

export interface CreateStudentDto {
  studentFirstName: string;
  studentLastName: string;
  grade: number;
  age: number;
  schoolName?: string;
  className?: string;
  parentFirstName: string;
  parentLastName: string;
  parentPhoneNumber?: string;
  parentOccupation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private apiUrl = `${environment.apiUrl}/teachers`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<TeacherDashboard> {
    return this.http.get<TeacherDashboard>(`${this.apiUrl}/dashboard`);
  }

  getStudentsList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/students`);
  }

  createStudent(data: CreateStudentDto): Observable<StudentWithCredentials> {
    return this.http.post<StudentWithCredentials>(`${this.apiUrl}/students`, data);
  }

  updateStudentCredentials(studentId: string, type: 'student' | 'parent'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/students/${studentId}/credentials?type=${type}`, {});
  }

  updateStudent(studentId: string, updateData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/students/${studentId}`, updateData);
  }

  getAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics`);
  }

  getClassAnalytics(classId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/class/${classId}/analytics`);
  }

  createCustomPractice(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/custom-practices`, data);
  }

  getCustomPractices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/custom-practices`);
  }

  deleteCustomPractice(activityId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/custom-practices/${activityId}`);
  }
}