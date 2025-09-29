import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

      <div class="badges-grid">
        <div class="badge-card earned">
          <div class="badge-icon">🏆</div>
          <h3>First Steps</h3>
          <p>Complete your first speaking activity</p>
          <div class="badge-status earned">Earned!</div>
        </div>

        <div class="badge-card earned">
          <div class="badge-icon">🗣️</div>
          <h3>Brave Speaker</h3>
          <p>Speak for 5 minutes total</p>
          <div class="badge-status earned">Earned!</div>
        </div>

        <div class="badge-card earned">
          <div class="badge-icon">🔥</div>
          <h3>Daily Learner</h3>
          <p>Login for 7 consecutive days</p>
          <div class="badge-status earned">Earned!</div>
        </div>

        <div class="badge-card locked">
          <div class="badge-icon">🎯</div>
          <h3>Pronunciation Pro</h3>
          <p>Achieve 80% pronunciation accuracy</p>
          <div class="badge-status locked">Locked</div>
        </div>

        <div class="badge-card locked">
          <div class="badge-icon">💬</div>
          <h3>Conversation Master</h3>
          <p>Complete 10 dialogue activities</p>
          <div class="badge-status locked">Locked</div>
        </div>

        <div class="badge-card locked">
          <div class="badge-icon">📖</div>
          <h3>Story Teller</h3>
          <p>Record and share one story</p>
          <div class="badge-status locked">Locked</div>
        </div>
      </div>

      <div class="demo-message">
        <h3>🚧 Demo Version</h3>
        <p>In the full version, badges will be automatically awarded based on your real progress and achievements!</p>
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
  `]
})
export class BadgesComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/student/dashboard']);
  }
}