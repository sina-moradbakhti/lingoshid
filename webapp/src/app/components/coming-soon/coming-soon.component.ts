import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="coming-soon-container">
      <div class="coming-soon-card">
        <div class="icon">🚧</div>
        <h1>Coming Soon!</h1>
        <p>This section is under development and will be available soon.</p>
        <p class="role-info">You are logged in as: <strong>{{ getCurrentUserRole() }}</strong></p>
        
        <div class="features-preview">
          <h3>What's Coming:</h3>
          <ul>
            <li *ngIf="isParent()">👨‍👩‍👧‍👦 Monitor your children's progress</li>
            <li *ngIf="isParent()">📊 Weekly progress reports</li>
            <li *ngIf="isParent()">🏆 View achievements and badges</li>
            
            <li *ngIf="isTeacher()">👩‍🏫 Manage your classes</li>
            <li *ngIf="isTeacher()">📈 Student analytics and reports</li>
            <li *ngIf="isTeacher()">🎯 Assign activities to students</li>
            
            <li *ngIf="isAdmin()">🔧 User management system</li>
            <li *ngIf="isAdmin()">📚 Content management</li>
            <li *ngIf="isAdmin()">📊 Platform analytics</li>
          </ul>
        </div>

        <div class="actions">
          <button (click)="logout()" class="logout-btn">Logout</button>
          <button (click)="goToStudentDemo()" class="demo-btn" *ngIf="!isStudent()">
            Try Student Demo
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .coming-soon-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .coming-soon-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    .icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    h1 {
      color: #667eea;
      margin: 0 0 15px 0;
      font-size: 2.5rem;
    }

    p {
      color: #666;
      margin: 10px 0;
      line-height: 1.6;
    }

    .role-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 10px;
      margin: 20px 0;
    }

    .features-preview {
      text-align: left;
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .features-preview h3 {
      color: #333;
      margin: 0 0 15px 0;
      text-align: center;
    }

    .features-preview ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .features-preview li {
      padding: 8px 0;
      color: #555;
      border-bottom: 1px solid #eee;
    }

    .features-preview li:last-child {
      border-bottom: none;
    }

    .actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .logout-btn {
      padding: 12px 24px;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .logout-btn:hover {
      background: #c0392b;
    }

    .demo-btn {
      padding: 12px 24px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .demo-btn:hover {
      background: #2980b9;
    }
  `]
})
export class ComingSoonComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  getCurrentUserRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.role || 'Unknown';
  }

  isStudent(): boolean {
    return this.authService.isStudent();
  }

  isParent(): boolean {
    return this.authService.isParent();
  }

  isTeacher(): boolean {
    return this.authService.isTeacher();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToStudentDemo(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}