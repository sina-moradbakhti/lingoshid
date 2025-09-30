import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BadgesService, Badge, StudentBadge } from '../../../services/badges.service';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="badges-container">
      <div class="header">
        <button (click)="goBack()" class="back-btn">← Back to Dashboard</button>
        <h1>🏅 My Badges</h1>
        <p>Collect badges by completing activities and reaching milestones!</p>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner">🎮</div>
        <p>Loading your badges...</p>
      </div>

      <!-- Badges Grid -->
      <div class="badges-grid" *ngIf="!isLoading && badges.length > 0">
        <div class="badge-card"
             *ngFor="let badge of badges"
             [class.earned]="isBadgeEarned(badge)"
             [class.locked]="!isBadgeEarned(badge)">
          <div class="badge-icon">{{ badge.icon || '🏅' }}</div>
          <h3>{{ badge.name }}</h3>
          <p>{{ badge.description }}</p>
          <div class="badge-status"
               [class.earned]="isBadgeEarned(badge)"
               [class.locked]="!isBadgeEarned(badge)">
            {{ isBadgeEarned(badge) ? 'Earned!' : 'Locked' }}
          </div>
          <div class="earned-date" *ngIf="isBadgeEarned(badge) && getBadgeEarnedDate(badge)">
            Earned: {{ getBadgeEarnedDate(badge) | date:'short' }}
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && badges.length === 0">
        <div class="empty-icon">🏅</div>
        <h3>No Badges Available</h3>
        <p>Badges will be loaded soon. Check back later!</p>
        <button (click)="loadBadges()" class="retry-btn">Retry Loading</button>
      </div>
    </div>
  `,
  styles: [`
    .badges-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .header {
      background: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      text-align: center;
      position: relative;
    }

    .back-btn {
      position: absolute;
      left: 20px;
      top: 20px;
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .header h1 {
      margin: 0 0 10px 0;
      color: #667eea;
      font-size: 2.5rem;
    }

    .badges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .badge-card {
      background: white;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s;
    }

    .badge-card.earned {
      border: 2px solid #28a745;
    }

    .badge-card.locked {
      opacity: 0.6;
      border: 2px solid #dee2e6;
    }

    .badge-card:hover {
      transform: translateY(-5px);
    }

    .badge-icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }

    .badge-card.locked .badge-icon {
      filter: grayscale(100%);
    }

    .badge-card h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.2rem;
    }

    .badge-card p {
      margin: 0 0 15px 0;
      color: #666;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .badge-status {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-status.earned {
      background: #d4edda;
      color: #155724;
    }

    .badge-status.locked {
      background: #f8f9fa;
      color: #6c757d;
    }

    .demo-message {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
    }

    .demo-message h3 {
      margin: 0 0 15px 0;
      font-size: 1.5rem;
    }

    .demo-message p {
      margin: 0;
      opacity: 0.9;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
    }

    .spinner {
      font-size: 4rem;
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading p {
      margin-top: 20px;
      color: #666;
      font-size: 1.2rem;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 20px 0;
      color: #666;
    }

    .retry-btn {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .earned-date {
      margin-top: 10px;
      font-size: 0.7rem;
      color: #28a745;
      font-weight: 600;
    }
  `]
})
export class BadgesComponent implements OnInit {
  badges: Badge[] = [];
  studentBadges: StudentBadge[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private badgesService: BadgesService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.loadBadges();
  }

  loadBadges() {
    this.isLoading = true;

    // Load all available badges
    this.badgesService.getAllBadges().subscribe({
      next: (badges) => {
        this.badges = badges;
        this.loadStudentBadges();
      },
      error: (error) => {
        console.error('Error loading badges:', error);
        this.createMockBadges();
        this.isLoading = false;
      }
    });
  }

  private loadStudentBadges() {
    // Get student information from dashboard
    this.studentService.getDashboard().subscribe({
      next: (dashboard) => {
        if (dashboard?.student?.id) {
          this.badgesService.getStudentBadges(dashboard.student.id).subscribe({
            next: (studentBadges) => {
              this.studentBadges = studentBadges;
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading student badges:', error);
              // Continue without student badges data
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  isBadgeEarned(badge: Badge): boolean {
    return this.studentBadges.some(sb => sb.badge.id === badge.id && sb.isEarned);
  }

  getBadgeEarnedDate(badge: Badge): Date | null {
    const studentBadge = this.studentBadges.find(sb => sb.badge.id === badge.id && sb.isEarned);
    return studentBadge ? studentBadge.earnedAt : null;
  }

  private createMockBadges() {
    // Fallback mock data when server is unavailable
    this.badges = [
      {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first speaking activity',
        icon: '🏆',
        category: 'achievement',
        criteria: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Brave Speaker',
        description: 'Speak for 5 minutes total',
        icon: '🗣️',
        category: 'practice',
        criteria: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Daily Learner',
        description: 'Login for 7 consecutive days',
        icon: '🔥',
        category: 'streak',
        criteria: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Pronunciation Pro',
        description: 'Achieve 80% pronunciation accuracy',
        icon: '🎯',
        category: 'skill',
        criteria: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'Conversation Master',
        description: 'Complete 10 dialogue activities',
        icon: '💬',
        category: 'activity',
        criteria: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '6',
        name: 'Story Teller',
        description: 'Record and share one story',
        icon: '📖',
        category: 'creativity',
        criteria: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Mock some earned badges based on localStorage data
    const studentPoints = parseInt(localStorage.getItem('studentPoints') || '0');
    this.studentBadges = [];

    if (studentPoints > 0) {
      this.studentBadges.push({
        id: '1',
        badge: this.badges[0],
        student: null,
        earnedAt: new Date(Date.now() - 86400000),
        isEarned: true
      });
    }

    if (studentPoints > 100) {
      this.studentBadges.push({
        id: '2',
        badge: this.badges[1],
        student: null,
        earnedAt: new Date(Date.now() - 43200000),
        isEarned: true
      });
    }
  }

  goBack() {
    this.router.navigate(['/student/dashboard']);
  }
}