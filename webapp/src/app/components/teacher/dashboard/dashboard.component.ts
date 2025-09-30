import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TeacherService } from '../../../services/teacher.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <button (click)="logout()" class="logout-btn">Logout</button>
      </header>

      <div class="content">
        <div class="welcome-section">
          <h2>Welcome, {{ userName }}!</h2>
          <p>Manage your students and classes</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <h3>{{ totalStudents }}</h3>
            <p>Total Students</p>
          </div>
          <div class="stat-card">
            <h3>{{ totalClasses }}</h3>
            <p>Classes</p>
          </div>
        </div>

        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="actions-grid">
            <button (click)="navigate('/teacher/students')" class="action-btn">
              📚 View Students
            </button>
            <button (click)="navigate('/teacher/register-student')" class="action-btn">
              ➕ Register Student
            </button>
            <button (click)="navigate('/teacher/analytics')" class="action-btn">
              📊 Analytics
            </button>
            <button (click)="navigate('/teacher/custom-practice')" class="action-btn">
              ✏️ Custom Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .dashboard-header h1 {
      margin: 0;
      color: #667eea;
    }

    .logout-btn {
      padding: 10px 20px;
      background: #e53e3e;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    .logout-btn:hover {
      background: #c53030;
    }

    .content {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .welcome-section {
      margin-bottom: 30px;
    }

    .welcome-section h2 {
      margin: 0 0 10px 0;
      color: #2d3748;
    }

    .welcome-section p {
      margin: 0;
      color: #718096;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      padding: 25px;
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      text-align: center;
    }

    .stat-card h3 {
      margin: 0 0 10px 0;
      font-size: 2.5rem;
      color: #667eea;
    }

    .stat-card p {
      margin: 0;
      color: #4a5568;
      font-weight: 600;
    }

    .quick-actions h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .action-btn {
      padding: 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s;
    }

    .action-btn:hover {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  `]
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