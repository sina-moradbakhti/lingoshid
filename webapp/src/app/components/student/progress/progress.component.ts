import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      <div class="header">
        <button (click)="goBack()" class="back-btn">← Back to Dashboard</button>
        <h1>📊 My Progress</h1>
        <p>Track your English speaking improvement!</p>
      </div>

      <div class="progress-grid">
        <div class="skill-card">
          <h3>🗣️ Fluency</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 75%"></div>
          </div>
          <p>75% - Good Progress!</p>
        </div>

        <div class="skill-card">
          <h3>🎯 Pronunciation</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 60%"></div>
          </div>
          <p>60% - Keep Practicing!</p>
        </div>

        <div class="skill-card">
          <h3>💪 Confidence</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 85%"></div>
          </div>
          <p>85% - Excellent!</p>
        </div>

        <div class="skill-card">
          <h3>📚 Vocabulary</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 70%"></div>
          </div>
          <p>70% - Well Done!</p>
        </div>
      </div>

      <div class="demo-message">
        <h3>🚧 Demo Version</h3>
        <p>In the full version, you'll see detailed analytics, weekly reports, and personalized recommendations!</p>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      padding: 20px;
      max-width: 1000px;
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

    .progress-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .skill-card {
      background: white;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      text-align: center;
    }

    .skill-card h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.3rem;
    }

    .progress-bar {
      width: 100%;
      height: 12px;
      background: #e1e5e9;
      border-radius: 6px;
      margin: 15px 0;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 6px;
      transition: width 0.3s;
    }

    .skill-card p {
      margin: 0;
      color: #666;
      font-weight: 600;
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
export class ProgressComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/student/dashboard']);
  }
}