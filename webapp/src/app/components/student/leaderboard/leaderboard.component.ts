import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LeaderboardService, LeaderboardEntry, LeaderboardResponse } from '../../../services/leaderboard.service';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="leaderboard-container">
      <div class="header">
        <button (click)="goBack()" class="back-btn">← Back to Dashboard</button>
        <h1>🏆 Leaderboard</h1>
        <p>See how you rank among your classmates!</p>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner">🎮</div>
        <p>Loading leaderboard...</p>
      </div>

      <!-- Leaderboard Content -->
      <div class="leaderboard-card" *ngIf="!isLoading">
        <!-- Podium for top 3 -->
        <div class="podium" *ngIf="topEntries.length > 0">
          <div class="rank-item"
               *ngFor="let entry of topEntries; let i = index"
               [class.gold]="i === 0"
               [class.silver]="i === 1"
               [class.bronze]="i === 2"
               [class.current-user]="entry.isCurrentUser">
            <div class="rank-number">{{ getRankEmoji(i + 1) }}</div>
            <div class="student-info">
              <h3>{{ entry.student.user.firstName }} {{ entry.student.user.lastName }}{{ entry.isCurrentUser ? ' (You)' : '' }}</h3>
              <p>{{ entry.points }} points</p>
              <small>Level {{ entry.student.currentLevel }}</small>
            </div>
          </div>
        </div>

        <!-- Full Leaderboard List -->
        <div class="leaderboard-list" *ngIf="allEntries.length > 3">
          <h3>Full Rankings</h3>
          <div class="rank-list">
            <div class="rank-entry"
                 *ngFor="let entry of allEntries; let i = index"
                 [class.current-user]="entry.isCurrentUser">
              <span class="rank">#{{ entry.rank }}</span>
              <span class="name">{{ entry.student.user.firstName }} {{ entry.student.user.lastName }}{{ entry.isCurrentUser ? ' (You)' : '' }}</span>
              <span class="points">{{ entry.points }} pts</span>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="leaderboard-stats" *ngIf="leaderboardData">
          <p>Total Students: {{ leaderboardData.totalStudents }}</p>
          <p *ngIf="leaderboardData.currentUserRank">Your Rank: #{{ leaderboardData.currentUserRank }}</p>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="allEntries.length === 0">
          <div class="empty-icon">🏆</div>
          <h3>No Leaderboard Data</h3>
          <p>Start completing activities to see rankings!</p>
          <button (click)="loadLeaderboard()" class="retry-btn">Retry Loading</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-container {
      padding: 20px;
      max-width: 800px;
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

    .leaderboard-card {
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .podium {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 30px;
    }

    .rank-item {
      text-align: center;
      padding: 20px;
      border-radius: 15px;
      flex: 1;
      max-width: 200px;
    }

    .rank-item.gold {
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    }

    .rank-item.silver {
      background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
    }

    .rank-item.bronze {
      background: linear-gradient(135deg, #cd7f32 0%, #daa520 100%);
    }

    .rank-item.current-user {
      border: 3px solid #667eea;
      box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
    }

    .rank-number {
      font-size: 3rem;
      margin-bottom: 10px;
    }

    .student-info h3 {
      margin: 0 0 5px 0;
      color: #333;
    }

    .student-info p {
      margin: 0 0 5px 0;
      color: #666;
      font-weight: 600;
    }

    .student-info small {
      color: #999;
      font-size: 0.8rem;
    }

    .leaderboard-list {
      margin-top: 30px;
    }

    .leaderboard-list h3 {
      margin: 0 0 20px 0;
      color: #333;
      text-align: center;
    }

    .rank-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .rank-entry {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
      transition: background 0.3s;
    }

    .rank-entry.current-user {
      background: #e3f2fd;
      border: 2px solid #667eea;
    }

    .rank-entry:hover {
      background: #e9ecef;
    }

    .rank-entry.current-user:hover {
      background: #bbdefb;
    }

    .rank {
      font-weight: bold;
      color: #667eea;
      min-width: 40px;
    }

    .name {
      flex: 1;
      text-align: left;
      padding-left: 20px;
    }

    .points {
      font-weight: 600;
      color: #28a745;
    }

    .leaderboard-stats {
      margin-top: 30px;
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .leaderboard-stats p {
      margin: 5px 0;
      color: #666;
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
  `]
})
export class LeaderboardComponent implements OnInit {
  leaderboardData: LeaderboardResponse | null = null;
  allEntries: LeaderboardEntry[] = [];
  topEntries: LeaderboardEntry[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private leaderboardService: LeaderboardService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.isLoading = true;

    // Get current student's grade from dashboard
    this.studentService.getDashboard().subscribe({
      next: (dashboard) => {
        const grade = dashboard?.student?.grade;

        this.leaderboardService.getLeaderboard(grade, 20).subscribe({
          next: (data) => {
            this.leaderboardData = data;
            this.allEntries = data.entries;
            this.topEntries = data.entries.slice(0, 3);
            this.markCurrentUser(dashboard?.student?.user?.firstName);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading leaderboard:', error);
            this.createMockLeaderboard();
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.createMockLeaderboard();
        this.isLoading = false;
      }
    });
  }

  private markCurrentUser(currentUserFirstName?: string) {
    if (!currentUserFirstName) return;

    this.allEntries.forEach(entry => {
      if (entry.student.user.firstName === currentUserFirstName) {
        entry.isCurrentUser = true;
      }
    });

    this.topEntries.forEach(entry => {
      if (entry.student.user.firstName === currentUserFirstName) {
        entry.isCurrentUser = true;
      }
    });
  }

  getRankEmoji(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  }

  private createMockLeaderboard() {
    // Fallback mock data when server is unavailable
    const studentPoints = parseInt(localStorage.getItem('studentPoints') || '1250');

    this.allEntries = [
      {
        rank: 1,
        student: {
          id: '1',
          user: { firstName: 'Sara', lastName: 'Ahmad' },
          totalPoints: 2450,
          currentLevel: 12,
          grade: 5
        },
        points: 2450,
        isCurrentUser: false
      },
      {
        rank: 2,
        student: {
          id: '2',
          user: { firstName: 'Mohammad', lastName: 'Ali' },
          totalPoints: 1890,
          currentLevel: 9,
          grade: 5
        },
        points: 1890,
        isCurrentUser: false
      },
      {
        rank: 3,
        student: {
          id: '3',
          user: { firstName: 'Alex', lastName: 'Johnson' },
          totalPoints: studentPoints,
          currentLevel: 8,
          grade: 5
        },
        points: studentPoints,
        isCurrentUser: true
      },
      {
        rank: 4,
        student: {
          id: '4',
          user: { firstName: 'Emma', lastName: 'Wilson' },
          totalPoints: 980,
          currentLevel: 6,
          grade: 5
        },
        points: 980,
        isCurrentUser: false
      },
      {
        rank: 5,
        student: {
          id: '5',
          user: { firstName: 'Oliver', lastName: 'Brown' },
          totalPoints: 756,
          currentLevel: 5,
          grade: 5
        },
        points: 756,
        isCurrentUser: false
      }
    ];

    this.topEntries = this.allEntries.slice(0, 3);
    this.leaderboardData = {
      entries: this.allEntries,
      currentUserRank: 3,
      totalStudents: 25
    };
  }

  goBack() {
    this.router.navigate(['/student/dashboard']);
  }
}