import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TeacherService } from '../../../services/teacher.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class TeacherDashboardComponent implements OnInit {
  userName = '';
  totalStudents = 0;
  totalClasses = 0;

  constructor(
    private router: Router,
    private teacherService: TeacherService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.userName = user?.firstName || 'Teacher';
    this.loadDashboard();
  }

  loadDashboard() {
    this.teacherService.getDashboard().subscribe({
      next: (dashboard) => {
        this.totalStudents = dashboard.totalStudents;
        this.totalClasses = dashboard.totalClasses;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
      }
    });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}