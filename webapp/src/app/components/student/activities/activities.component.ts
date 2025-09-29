import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivityService } from '../../../services/activity.service';
import { AuthService } from '../../../services/auth.service';
import { Activity } from '../../../models/user.model';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="activities-container">
      <!-- Header -->
      <div class="activities-header">
        <button (click)="goBack()" class="back-btn">← Back to Dashboard</button>
        <h1>🎯 Speaking Activities</h1>
        <p>Choose an activity to practice your English speaking skills!</p>
      </div>

      <!-- Activities Grid -->
      <div class="activities-grid" *ngIf="activities.length > 0">
        <div class="activity-card" *ngFor="let activity of activities" (click)="startActivity(activity)">
          <div class="activity-icon">
            <span *ngIf="activity.type === 'pronunciation_challenge'">🗣️</span>
            <span *ngIf="activity.type === 'picture_description'">🖼️</span>
            <span *ngIf="activity.type === 'virtual_conversation'">💬</span>
            <span *ngIf="activity.type === 'role_play'">🎭</span>
            <span *ngIf="activity.type === 'story_creation'">📖</span>
            <span *ngIf="activity.type === 'singing_chanting'">🎵</span>
          </div>
          
          <div class="activity-content">
            <h3>{{ activity.title }}</h3>
            <p>{{ activity.description }}</p>
            
            <div class="activity-meta">
              <span class="difficulty" [class]="activity.difficulty">
                {{ activity.difficulty | titlecase }}
              </span>
              <span class="points">{{ getPointsRange(activity) }}</span>
            </div>
            
            <div class="skill-area">
              <span class="skill-tag">{{ activity.skillArea | titlecase }}</span>
            </div>
          </div>
          
          <div class="activity-action">
            <button class="start-btn">Start Activity</button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner">🎮</div>
        <p>Loading activities...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && activities.length === 0">
        <div class="empty-icon">📚</div>
        <h3>No Activities Available</h3>
        <p>Activities will be loaded soon. Check back later!</p>
        <button (click)="loadActivities()" class="retry-btn">Retry Loading</button>
      </div>

      <!-- Demo Message -->
      <div class="demo-message">
        <h3>🚧 Demo Version</h3>
        <p>In the full version, these activities will include:</p>
        <ul>
          <li>🎤 Voice recording and speech recognition</li>
          <li>🤖 AI-powered feedback and scoring</li>
          <li>🏆 Real-time progress tracking</li>
          <li>🎮 Interactive games and challenges</li>
          <li>👥 Multiplayer speaking activities</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .activities-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .activities-header {
      background: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      text-align: center;
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
      transition: background 0.3s;
    }

    .back-btn:hover {
      background: #5a6fd8;
    }

    .activities-header h1 {
      margin: 0 0 10px 0;
      color: #667eea;
      font-size: 2.5rem;
    }

    .activities-header p {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
    }

    .activities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .activity-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .activity-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .activity-icon {
      font-size: 3rem;
      text-align: center;
      margin-bottom: 15px;
    }

    .activity-content {
      flex: 1;
      text-align: center;
    }

    .activity-content h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.3rem;
    }

    .activity-content p {
      margin: 0 0 15px 0;
      color: #666;
      line-height: 1.5;
    }

    .activity-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .difficulty {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .difficulty.beginner {
      background: #d4edda;
      color: #155724;
    }

    .difficulty.intermediate {
      background: #fff3cd;
      color: #856404;
    }

    .difficulty.advanced {
      background: #f8d7da;
      color: #721c24;
    }

    .points {
      background: #667eea;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .skill-area {
      margin-bottom: 15px;
    }

    .skill-tag {
      background: #e9ecef;
      color: #495057;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .activity-action {
      margin-top: auto;
    }

    .start-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .start-btn:hover {
      transform: translateY(-2px);
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

    .demo-message {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      margin-top: 30px;
    }

    .demo-message h3 {
      margin: 0 0 15px 0;
      font-size: 1.5rem;
    }

    .demo-message p {
      margin: 0 0 15px 0;
      opacity: 0.9;
    }

    .demo-message ul {
      margin: 0;
      padding-left: 20px;
    }

    .demo-message li {
      margin-bottom: 8px;
      opacity: 0.9;
    }
  `]
})
export class ActivitiesComponent implements OnInit {
  activities: Activity[] = [];
  isLoading = true;

  constructor(
    private activityService: ActivityService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadActivities();
  }

  loadActivities() {
    this.isLoading = true;
    this.activityService.getActivities().subscribe({
      next: (activities) => {
        this.activities = activities;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.isLoading = false;
        // Create mock activities for demo
        this.createMockActivities();
      }
    });
  }

  startActivity(activity: Activity) {
    // Navigate to activity detail page
    this.router.navigate(['/student/activities', activity.id]);
  }

  goBack() {
    this.router.navigate(['/student/dashboard']);
  }

  getPointsRange(activity: Activity): string {
    const basePoints = activity.pointsReward;

    // Calculate potential bonus points based on difficulty and type
    let maxBonus = 0;

    // Difficulty bonus (matches start-activity component logic)
    switch (activity.difficulty) {
      case 'beginner':
        maxBonus += Math.floor(basePoints * 0.1);
        break;
      case 'intermediate':
        maxBonus += Math.floor(basePoints * 0.2);
        break;
      case 'advanced':
        maxBonus += Math.floor(basePoints * 0.3);
        break;
    }

    // Perfect performance bonus (up to 50% of base)
    maxBonus += Math.floor(basePoints * 0.5);

    // Speed bonus (up to 20% of base)
    maxBonus += Math.floor(basePoints * 0.2);

    const maxPoints = basePoints + maxBonus;

    if (maxPoints > basePoints) {
      return `${basePoints}-${maxPoints} pts`;
    } else {
      return `${basePoints} pts`;
    }
  }

  private createMockActivities() {
    this.activities = [
      {
        id: '1',
        title: 'First Steps - Say Hello',
        description: 'Practice basic greetings in English',
        type: 'pronunciation_challenge',
        difficulty: 'beginner',
        skillArea: 'pronunciation',
        pointsReward: 10,
        minLevel: 1,
        isActive: true,
        order: 1
      },
      {
        id: '2',
        title: 'Describe the Playground',
        description: 'Look at the picture and describe what you see',
        type: 'picture_description',
        difficulty: 'beginner',
        skillArea: 'vocabulary',
        pointsReward: 15,
        minLevel: 1,
        isActive: true,
        order: 2
      },
      {
        id: '3',
        title: 'Meet a New Friend',
        description: 'Have a conversation with Alex about your hobbies',
        type: 'virtual_conversation',
        difficulty: 'intermediate',
        skillArea: 'fluency',
        pointsReward: 20,
        minLevel: 2,
        isActive: true,
        order: 3
      },
      {
        id: '4',
        title: 'At the Restaurant',
        description: 'Practice ordering food at a restaurant',
        type: 'role_play',
        difficulty: 'intermediate',
        skillArea: 'confidence',
        pointsReward: 25,
        minLevel: 3,
        isActive: true,
        order: 4
      },
      {
        id: '5',
        title: 'My Family Story',
        description: 'Create and tell a story about your family',
        type: 'story_creation',
        difficulty: 'advanced',
        skillArea: 'fluency',
        pointsReward: 30,
        minLevel: 4,
        isActive: true,
        order: 5
      },
      {
        id: '6',
        title: 'English Songs - Twinkle Star',
        description: 'Sing along to improve pronunciation and rhythm',
        type: 'singing_chanting',
        difficulty: 'beginner',
        skillArea: 'pronunciation',
        pointsReward: 15,
        minLevel: 1,
        isActive: true,
        order: 6
      }
    ];
  }
}