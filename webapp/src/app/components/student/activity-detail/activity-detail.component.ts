import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ActivityService } from '../../../services/activity.service';
import { Activity } from '../../../models/user.model';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="activity-detail-container">
      <!-- Header -->
      <div class="activity-header">
        <button (click)="goBack()" class="back-btn">← Back to Activities</button>
        <div class="activity-title-section" *ngIf="activity">
          <div class="activity-icon">
            <span *ngIf="activity.type === 'pronunciation_challenge'">🗣️</span>
            <span *ngIf="activity.type === 'picture_description'">🖼️</span>
            <span *ngIf="activity.type === 'virtual_conversation'">💬</span>
            <span *ngIf="activity.type === 'role_play'">🎭</span>
            <span *ngIf="activity.type === 'story_creation'">📖</span>
            <span *ngIf="activity.type === 'singing_chanting'">🎵</span>
          </div>
          <h1>{{ activity.title }}</h1>
          <p class="activity-description">{{ activity.description }}</p>
        </div>
      </div>

      <!-- Activity Info Card -->
      <div class="activity-info-card" *ngIf="activity">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Difficulty</span>
            <span class="difficulty-badge" [class]="activity.difficulty">
              {{ activity.difficulty | titlecase }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Skill Area</span>
            <span class="skill-badge">{{ activity.skillArea | titlecase }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Points Reward</span>
            <span class="points-badge">{{ activity.pointsReward }} points</span>
          </div>
          <div class="info-item">
            <span class="info-label">Required Level</span>
            <span class="level-badge">Level {{ activity.minLevel }}+</span>
          </div>
        </div>
      </div>

      <!-- Activity Content -->
      <div class="activity-content" *ngIf="activity">
        <h2>Activity Instructions</h2>
        <div class="instructions-card">
          <div class="instruction-step" *ngFor="let instruction of getInstructions(); let i = index">
            <div class="step-number">{{ i + 1 }}</div>
            <div class="step-content">{{ instruction }}</div>
          </div>
        </div>
      </div>

      <!-- Start Activity Section -->
      <div class="start-section" *ngIf="activity">
        <div class="start-card">
          <h3>Ready to Start?</h3>
          <p>This activity will help you improve your {{ activity.skillArea }} skills!</p>
          <button class="start-activity-btn" (click)="startActivity()">
            🚀 Start Activity
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner">🎮</div>
        <p>Loading activity...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="!isLoading && !activity">
        <div class="error-icon">❌</div>
        <h3>Activity Not Found</h3>
        <p>The activity you're looking for doesn't exist or has been removed.</p>
        <button (click)="goBack()" class="retry-btn">Go Back to Activities</button>
      </div>
    </div>
  `,
  styles: [`
    .activity-detail-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .activity-header {
      background: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      position: relative;
    }

    .back-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
      margin-bottom: 20px;
    }

    .back-btn:hover {
      background: #5a6fd8;
    }

    .activity-title-section {
      text-align: center;
    }

    .activity-icon {
      font-size: 4rem;
      margin-bottom: 15px;
    }

    .activity-header h1 {
      margin: 0 0 10px 0;
      color: #667eea;
      font-size: 2.2rem;
    }

    .activity-description {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
      line-height: 1.5;
    }

    .activity-info-card {
      background: white;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
    }

    .info-item {
      text-align: center;
    }

    .info-label {
      display: block;
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .difficulty-badge, .skill-badge, .points-badge, .level-badge {
      display: inline-block;
      padding: 8px 12px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .difficulty-badge.beginner {
      background: #d4edda;
      color: #155724;
    }

    .difficulty-badge.intermediate {
      background: #fff3cd;
      color: #856404;
    }

    .difficulty-badge.advanced {
      background: #f8d7da;
      color: #721c24;
    }

    .skill-badge {
      background: #e9ecef;
      color: #495057;
    }

    .points-badge {
      background: #667eea;
      color: white;
    }

    .level-badge {
      background: #28a745;
      color: white;
    }

    .activity-content {
      background: white;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .activity-content h2 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.5rem;
    }

    .instructions-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }

    .instruction-step {
      display: flex;
      align-items: flex-start;
      margin-bottom: 15px;
    }

    .instruction-step:last-child {
      margin-bottom: 0;
    }

    .step-number {
      background: #667eea;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
      margin-right: 15px;
      flex-shrink: 0;
    }

    .step-content {
      color: #333;
      line-height: 1.5;
      padding-top: 4px;
    }

    .start-section {
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      text-align: center;
    }

    .start-card h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.4rem;
    }

    .start-card p {
      margin: 0 0 25px 0;
      color: #666;
      font-size: 1.1rem;
    }

    .start-activity-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .start-activity-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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

    .error-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .error-state h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .error-state p {
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
export class ActivityDetailComponent implements OnInit {
  activity: Activity | null = null;
  isLoading = true;
  activityId: string = '';

  constructor(
    private activityService: ActivityService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.activityId = params['id'];
      this.loadActivity();
    });
  }

  loadActivity() {
    this.isLoading = true;
    this.activityService.getActivity(this.activityId).subscribe({
      next: (activity) => {
        this.activity = activity;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading activity:', error);
        this.isLoading = false;
        // For demo purposes, create a mock activity if API fails
        this.createMockActivity();
      }
    });
  }

  getInstructions(): string[] {
    if (!this.activity) return [];
    
    // Return different instructions based on activity type
    switch (this.activity.type) {
      case 'pronunciation_challenge':
        return [
          'Listen to the audio pronunciation',
          'Practice saying the words out loud',
          'Record your pronunciation',
          'Compare with the original and get feedback'
        ];
      case 'picture_description':
        return [
          'Look carefully at the picture',
          'Think about what you see',
          'Describe the picture in English',
          'Use complete sentences'
        ];
      case 'virtual_conversation':
        return [
          'Read the conversation scenario',
          'Think about your responses',
          'Practice speaking naturally',
          'Respond to the virtual character'
        ];
      case 'role_play':
        return [
          'Read your role and scenario',
          'Understand the situation',
          'Practice your lines',
          'Act out the role play'
        ];
      case 'story_creation':
        return [
          'Choose a topic or use the prompt',
          'Plan your story structure',
          'Tell your story out loud',
          'Record your creative story'
        ];
      case 'singing_chanting':
        return [
          'Listen to the song or chant',
          'Learn the words and rhythm',
          'Practice singing along',
          'Record your performance'
        ];
      default:
        return [
          'Read the activity instructions',
          'Prepare your response',
          'Complete the speaking task',
          'Submit your work'
        ];
    }
  }

  startActivity() {
    if (this.activity) {
      // Navigate to the interactive activity runner
      this.router.navigate(['/student/activities', this.activity.id, 'start']);
    }
  }

  goBack() {
    this.router.navigate(['/student/activities']);
  }

  private createMockActivity() {
    // Create a mock activity based on the ID for demo purposes
    this.activity = {
      id: this.activityId,
      title: 'First Steps - Say Hello',
      description: 'Practice basic greetings in English with interactive pronunciation exercises',
      type: 'pronunciation_challenge',
      difficulty: 'beginner',
      skillArea: 'pronunciation',
      pointsReward: 10,
      minLevel: 1,
      isActive: true,
      order: 1
    };
  }
}