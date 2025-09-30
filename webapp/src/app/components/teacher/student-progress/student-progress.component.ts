import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProgressService, DetailedProgress } from '../../../services/progress.service';

@Component({
  selector: 'app-teacher-student-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      <div class="header">
        <button (click)="goBack()" class="back-btn">← Back to Students</button>
        <h1>Student Progress</h1>
      </div>

      <div *ngIf="isLoading" class="loading">Loading progress...</div>

      <div *ngIf="!isLoading && detailedProgress" class="content">
        <div class="student-info">
          <h2>{{ detailedProgress.student.name }}</h2>
          <p>Grade {{ detailedProgress.student.grade }} | Level {{ detailedProgress.student.currentLevel }}</p>
        </div>

        <div class="overview-cards">
          <div class="card">
            <h3>{{ detailedProgress.student.totalPoints }}</h3>
            <p>Total Points</p>
          </div>
          <div class="card">
            <h3>{{ detailedProgress.completedActivities }}/{{ detailedProgress.totalActivities }}</h3>
            <p>Activities</p>
          </div>
          <div class="card">
            <h3>{{ detailedProgress.student.streakDays }}</h3>
            <p>Day Streak</p>
          </div>
        </div>

        <div class="skills-section">
          <h2>Skills Progress</h2>
          <div class="skills-grid">
            <div *ngFor="let skill of detailedProgress.skillProgress" class="skill-card">
              <h4>{{ skill.skillArea | titlecase }}</h4>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="skill.progressPercentage"></div>
              </div>
              <p>{{ skill.progressPercentage }}% - Level {{ skill.currentLevel }}</p>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!isLoading && !detailedProgress" class="empty-state">
        <p>No progress data available</p>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header h1 {
      margin: 0;
      color: #667eea;
    }

    .back-btn {
      padding: 10px 15px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    .back-btn:hover {
      background: #5a67d8;
    }

    .loading, .empty-state {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .content {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .student-info {
      margin-bottom: 30px;
      text-align: center;
    }

    .student-info h2 {
      margin: 0 0 10px 0;
      color: #2d3748;
    }

    .student-info p {
      margin: 0;
      color: #718096;
    }

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .card {
      padding: 20px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      text-align: center;
    }

    .card h3 {
      margin: 0 0 10px 0;
      color: #667eea;
      font-size: 2rem;
    }

    .card p {
      margin: 0;
      color: #4a5568;
      font-weight: 600;
    }

    .skills-section h2 {
      margin: 0 0 20px 0;
      color: #2d3748;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .skill-card {
      padding: 20px;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
    }

    .skill-card h4 {
      margin: 0 0 15px 0;
      color: #2d3748;
    }

    .progress-bar {
      height: 10px;
      background: #e2e8f0;
      border-radius: 5px;
      overflow: hidden;
      margin: 10px 0;
    }

    .progress-fill {
      height: 100%;
      background: #667eea;
      transition: width 0.5s;
    }

    .skill-card p {
      margin: 10px 0 0 0;
      color: #4a5568;
      font-weight: 600;
    }
  `]
})
export class TeacherStudentProgressComponent implements OnInit {
  detailedProgress: DetailedProgress | null = null;
  isLoading = true;
  studentId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private progressService: ProgressService
  ) {}

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.studentId) {
      this.loadProgress();
    }
  }

  loadProgress() {
    this.progressService.getDetailedProgress(this.studentId).subscribe({
      next: (progress) => {
        this.detailedProgress = progress;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading progress:', error);
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/teacher/students']);
  }
}