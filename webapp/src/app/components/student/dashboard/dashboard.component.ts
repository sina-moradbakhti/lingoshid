import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentService, StudentDashboard } from '../../../services/student.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container" *ngIf="dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="welcome-section">
          <h1>🎮 Welcome back, {{ dashboard.student.user.firstName }}!</h1>
          <p>Ready for another exciting English adventure?</p>
        </div>
        <div class="logout-section">
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card level">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <h3>Level {{ dashboard.levelProgress.currentLevel }}</h3>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="dashboard.levelProgress.progressPercentage"></div>
            </div>
            <p>{{ dashboard.levelProgress.experiencePoints }} / {{ dashboard.levelProgress.pointsForNextLevel }} XP</p>
          </div>
        </div>

        <div class="stat-card points">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <h3>{{ dashboard.student.totalPoints }}</h3>
            <p>Total Points</p>
          </div>
        </div>

        <div class="stat-card streak">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <h3>{{ dashboard.streakDays }}</h3>
            <p>Day Streak</p>
          </div>
        </div>

        <div class="stat-card badges">
          <div class="stat-icon">🏅</div>
          <div class="stat-content">
            <h3>{{ dashboard.totalBadges }}</h3>
            <p>Badges Earned</p>
          </div>
        </div>

        <div class="stat-card rank">
          <div class="stat-icon">🥇</div>
          <div class="stat-content">
            <h3>#{{ dashboard.leaderboardPosition }}</h3>
            <p>Class Rank</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>🚀 Quick Actions</h2>
        <div class="action-grid">
          <button (click)="navigateTo('/student/activities')" class="action-btn activities">
            <div class="action-icon">🎯</div>
            <h3>Practice Activities</h3>
            <p>Start speaking challenges</p>
          </button>

          <button (click)="navigateTo('/student/leaderboard')" class="action-btn leaderboard">
            <div class="action-icon">🏆</div>
            <h3>Leaderboard</h3>
            <p>See your ranking</p>
          </button>

          <button (click)="navigateTo('/student/badges')" class="action-btn badges">
            <div class="action-icon">🏅</div>
            <h3>My Badges</h3>
            <p>View achievements</p>
          </button>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="recent-activities" *ngIf="dashboard.recentActivities.length > 0">
        <h2>📚 Recent Activities</h2>
        <div class="activity-list">
          <div class="activity-item" *ngFor="let activity of dashboard.recentActivities">
            <div class="activity-icon">
              <span *ngIf="activity.activity.type === 'pronunciation_challenge'">🗣️</span>
              <span *ngIf="activity.activity.type === 'picture_description'">🖼️</span>
              <span *ngIf="activity.activity.type === 'virtual_conversation'">💬</span>
              <span *ngIf="activity.activity.type === 'role_play'">🎭</span>
              <span *ngIf="activity.activity.type === 'story_creation'">📖</span>
            </div>
            <div class="activity-content">
              <h4>{{ activity.activity.title }}</h4>
              <p>Score: {{ activity.score }}% • {{ activity.pointsEarned }} points earned</p>
              <small>{{ activity.completedAt | date:'short' }}</small>
            </div>
            <div class="activity-score" [class]="getScoreClass(activity.score)">
              {{ activity.score }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Motivational Message -->
      <div class="motivation-card">
        <div class="motivation-content">
          <h3>{{ getMotivationalMessage() }}</h3>
          <p>Keep practicing to unlock new levels and badges!</p>
        </div>
        <div class="motivation-character">🌟</div>
      </div>
    </div>

    <div class="loading" *ngIf="!dashboard">
      <div class="spinner">🎮</div>
      <p>Loading your adventure...</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .welcome-section h1 {
      margin: 0;
      color: #667eea;
      font-size: 2rem;
    }

    .welcome-section p {
      margin: 5px 0 0 0;
      color: #666;
    }

    .logout-btn {
      padding: 10px 20px;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 15px;
      transition: transform 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .stat-content p {
      margin: 5px 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e1e5e9;
      border-radius: 4px;
      margin: 8px 0;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 4px;
      transition: width 0.3s;
    }

    .quick-actions {
      margin-bottom: 30px;
    }

    .quick-actions h2 {
      color: #333;
      margin-bottom: 20px;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .action-btn {
      background: white;
      border: none;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      cursor: pointer;
      text-align: center;
      transition: all 0.3s;
    }

    .action-btn:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .action-icon {
      font-size: 3rem;
      margin-bottom: 10px;
    }

    .action-btn h3 {
      margin: 0 0 5px 0;
      color: #333;
    }

    .action-btn p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .recent-activities {
      margin-bottom: 30px;
    }

    .recent-activities h2 {
      color: #333;
      margin-bottom: 20px;
    }

    .activity-list {
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .activity-item {
      display: flex;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #f0f0f0;
      gap: 15px;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      font-size: 2rem;
    }

    .activity-content {
      flex: 1;
    }

    .activity-content h4 {
      margin: 0 0 5px 0;
      color: #333;
    }

    .activity-content p {
      margin: 0 0 5px 0;
      color: #666;
      font-size: 0.9rem;
    }

    .activity-content small {
      color: #999;
      font-size: 0.8rem;
    }

    .activity-score {
      font-size: 1.2rem;
      font-weight: bold;
      padding: 8px 12px;
      border-radius: 8px;
    }

    .activity-score.excellent {
      background: #d4edda;
      color: #155724;
    }

    .activity-score.good {
      background: #d1ecf1;
      color: #0c5460;
    }

    .activity-score.fair {
      background: #fff3cd;
      color: #856404;
    }

    .activity-score.needs-improvement {
      background: #f8d7da;
      color: #721c24;
    }

    .motivation-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .motivation-content h3 {
      margin: 0 0 10px 0;
      font-size: 1.5rem;
    }

    .motivation-content p {
      margin: 0;
      opacity: 0.9;
    }

    .motivation-character {
      font-size: 4rem;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
  `]
})
export class DashboardComponent implements OnInit {
  dashboard: StudentDashboard | null = null;

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.studentService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        // For demo purposes, create mock data
        this.createMockDashboard();
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'needs-improvement';
  }

  getMotivationalMessage(): string {
    const messages = [
      "You're doing amazing! Keep it up! 🌟",
      "Every word you learn is a step forward! 🚀",
      "Practice makes perfect! You've got this! 💪",
      "Your English skills are growing every day! 🌱",
      "Keep exploring the world of English! 🌍"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private createMockDashboard() {
    // Mock data for demonstration
    this.dashboard = {
      student: {
        id: '1',
        grade: 5,
        age: 10,
        totalPoints: parseInt(localStorage.getItem('studentPoints') || '1250'),
        currentLevel: 8,
        experiencePoints: 350,
        proficiencyLevel: 'intermediate',
        streakDays: 7,
        user: {
          id: '1',
          email: 'student@demo.com',
          firstName: 'Alex',
          lastName: 'Johnson',
          role: 'student' as any,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      recentActivities: [
        {
          id: '1',
          score: 85,
          pointsEarned: 25,
          timeSpent: 180,
          isCompleted: true,
          completedAt: new Date(),
          activity: {
            id: '1',
            title: 'Pronunciation Challenge: Greetings',
            description: 'Practice basic greetings',
            type: 'pronunciation_challenge',
            difficulty: 'beginner',
            skillArea: 'pronunciation',
            pointsReward: 25,
            minLevel: 1,
            isActive: true,
            order: 1
          }
        },
        {
          id: '2',
          score: 92,
          pointsEarned: 30,
          timeSpent: 240,
          isCompleted: true,
          completedAt: new Date(Date.now() - 86400000),
          activity: {
            id: '2',
            title: 'Picture Description: My Family',
            description: 'Describe family members',
            type: 'picture_description',
            difficulty: 'beginner',
            skillArea: 'vocabulary',
            pointsReward: 30,
            minLevel: 1,
            isActive: true,
            order: 2
          }
        }
      ],
      levelProgress: {
        currentLevel: 8,
        experiencePoints: 350,
        pointsForNextLevel: 500,
        progressPercentage: 70
      },
      leaderboardPosition: 3,
      totalBadges: 12,
      streakDays: 7
    };
  }
}