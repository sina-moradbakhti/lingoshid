import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ParentService } from '../../../services/parent.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Parent Dashboard</h1>
        <button (click)="logout()" class="logout-btn">Logout</button>
      </header>

      <div class="content">
        <div class="welcome-section">
          <h2>Welcome, {{ userName }}!</h2>
          <p>Monitor your child's learning progress</p>
        </div>

        <div class="children-section">
          <h3>Your Children</h3>
          <div class="children-grid">
            <div *ngFor="let child of children" class="child-card">
              <h4>{{ child.user?.firstName }} {{ child.user?.lastName }}</h4>
              <p>Grade: {{ child.grade }}</p>
              <p>Points: {{ child.totalPoints }}</p>
              <p>Level: {{ child.currentLevel }}</p>
              <button (click)="viewProgress(child.id)" class="view-progress-btn">
                View Progress
              </button>
            </div>
          </div>

          <div *ngIf="children.length === 0" class="empty-state">
            <p>No children assigned yet. Contact your teacher.</p>
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

    .children-section h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
    }

    .children-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .child-card {
      padding: 20px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      transition: all 0.3s;
    }

    .child-card:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .child-card h4 {
      margin: 0 0 15px 0;
      color: #2d3748;
    }

    .child-card p {
      margin: 5px 0;
      color: #4a5568;
    }

    .view-progress-btn {
      margin-top: 15px;
      width: 100%;
      padding: 10px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    }

    .view-progress-btn:hover {
      background: #5a67d8;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #718096;
    }
  `]
})
export class ParentDashboardComponent implements OnInit {
  children: any[] = [];
  userName = '';
  isLoading = true;

  constructor(
    private router: Router,
    private parentService: ParentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.userName = user?.firstName || 'Parent';
    this.loadChildren();
  }

  loadChildren() {
    this.parentService.getChildren().subscribe({
      next: (children) => {
        this.children = children;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading children:', error);
        this.isLoading = false;
      }
    });
  }

  viewProgress(studentId: string) {
    this.router.navigate(['/parent/progress', studentId]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}