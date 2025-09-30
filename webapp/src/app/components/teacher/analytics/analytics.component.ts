import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-teacher-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <button (click)="goBack()" class="back-btn">← Back</button>
        <h1>📊 Student Analytics Dashboard</h1>
      </div>

      <div *ngIf="isLoading" class="loading">Loading analytics...</div>

      <div *ngIf="!isLoading && analytics" class="content">
        <!-- Overview Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-value">{{ analytics.totalStudents }}</div>
            <div class="stat-label">Total Students</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-value">{{ analytics.averagePoints }}</div>
            <div class="stat-label">Average Points</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-value">Level {{ analytics.averageLevel }}</div>
            <div class="stat-label">Average Level</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value">{{ analytics.totalActivitiesCompleted }}</div>
            <div class="stat-label">Activities Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-value">{{ analytics.averageCompletionRate }}%</div>
            <div class="stat-label">Avg Completion Rate</div>
          </div>
        </div>

        <!-- Activity Trend Chart -->
        <div class="chart-section">
          <h2>📅 Activity Trend (Last 7 Days)</h2>
          <div class="bar-chart">
            <div *ngFor="let day of analytics.recentActivityTrend" class="bar-item">
              <div class="bar-column">
                <div class="bar-fill" [style.height.%]="getBarHeight(day.activitiesCompleted, analytics.recentActivityTrend)"></div>
              </div>
              <div class="bar-label">{{ formatDate(day.date) }}</div>
              <div class="bar-value">{{ day.activitiesCompleted }}</div>
            </div>
          </div>
        </div>

        <!-- Performance Distribution -->
        <div class="chart-section">
          <h2>📊 Performance Distribution by Level</h2>
          <div class="horizontal-bars">
            <div *ngFor="let level of getPerformanceDistribution()" class="h-bar-item">
              <div class="h-bar-label">Level {{ level.level }}</div>
              <div class="h-bar-track">
                <div class="h-bar-fill" [style.width.%]="level.percentage"></div>
              </div>
              <div class="h-bar-value">{{ level.count }} students</div>
            </div>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="two-column">
          <!-- Top Performers -->
          <div class="list-section">
            <h2>🏆 Top Performers</h2>
            <div class="student-list">
              <div *ngFor="let student of analytics.topPerformers; let i = index" class="student-item">
                <div class="rank">{{ '#' + (i + 1) }}</div>
                <div class="student-info">
                  <div class="student-name">{{ student.name }}</div>
                  <div class="student-stats">
                    {{ student.totalPoints }} pts • Level {{ student.currentLevel }} • {{ student.activitiesCompleted }} activities
                  </div>
                </div>
              </div>
              <div *ngIf="analytics.topPerformers.length === 0" class="empty-list">
                No data available yet
              </div>
            </div>
          </div>

          <!-- Students Needing Attention -->
          <div class="list-section alert">
            <h2>⚠️ Students Needing Attention</h2>
            <div class="student-list">
              <div *ngFor="let student of analytics.studentsNeedingAttention" class="student-item">
                <div class="alert-icon">⚠️</div>
                <div class="student-info">
                  <div class="student-name">{{ student.name }}</div>
                  <div class="student-stats">
                    {{ student.recentActivitiesCount }} activities (last 7 days) • {{ student.streakDays }} day streak
                  </div>
                </div>
              </div>
              <div *ngIf="analytics.studentsNeedingAttention.length === 0" class="empty-list">
                All students are active!
              </div>
            </div>
          </div>
        </div>

        <!-- Skill Area Analytics -->
        <div class="chart-section" *ngIf="analytics.skillAreaAnalytics.length > 0">
          <h2>🎭 Skill Area Progress</h2>
          <div class="skill-grid">
            <div *ngFor="let skill of analytics.skillAreaAnalytics" class="skill-item">
              <div class="skill-name">{{ skill.skillArea | titlecase }}</div>
              <div class="skill-level">Average Level: {{ skill.averageLevel }}</div>
              <div class="skill-students">{{ skill.studentsCount }} students</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1400px;
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

    .loading {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #718096;
      font-size: 0.9rem;
    }

    /* Chart Sections */
    .chart-section {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .chart-section h2 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 1.3rem;
    }

    /* Bar Chart */
    .bar-chart {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 200px;
      padding: 20px 0;
      border-bottom: 2px solid #e2e8f0;
    }

    .bar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      max-width: 80px;
    }

    .bar-column {
      width: 100%;
      height: 150px;
      display: flex;
      align-items: flex-end;
    }

    .bar-fill {
      width: 100%;
      background: linear-gradient(to top, #667eea, #764ba2);
      border-radius: 5px 5px 0 0;
      min-height: 5px;
      transition: height 0.5s ease;
    }

    .bar-label {
      margin-top: 10px;
      font-size: 0.8rem;
      color: #718096;
    }

    .bar-value {
      font-weight: 600;
      color: #2d3748;
      font-size: 0.9rem;
    }

    /* Horizontal Bars */
    .horizontal-bars {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .h-bar-item {
      display: grid;
      grid-template-columns: 80px 1fr 120px;
      align-items: center;
      gap: 15px;
    }

    .h-bar-label {
      font-weight: 600;
      color: #2d3748;
    }

    .h-bar-track {
      height: 30px;
      background: #e2e8f0;
      border-radius: 15px;
      overflow: hidden;
    }

    .h-bar-fill {
      height: 100%;
      background: linear-gradient(to right, #667eea, #764ba2);
      transition: width 0.5s ease;
      border-radius: 15px;
    }

    .h-bar-value {
      color: #4a5568;
      font-size: 0.9rem;
    }

    /* Two Column Layout */
    .two-column {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    /* List Sections */
    .list-section {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .list-section.alert {
      border-left: 4px solid #ed8936;
    }

    .list-section h2 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 1.2rem;
    }

    .student-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .student-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px;
      background: #f7fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .rank {
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
      min-width: 40px;
    }

    .alert-icon {
      font-size: 1.5rem;
      min-width: 40px;
      text-align: center;
    }

    .student-info {
      flex: 1;
    }

    .student-name {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 4px;
    }

    .student-stats {
      font-size: 0.85rem;
      color: #718096;
    }

    .empty-list {
      text-align: center;
      padding: 20px;
      color: #a0aec0;
      font-style: italic;
    }

    /* Skill Grid */
    .skill-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .skill-item {
      padding: 15px;
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      text-align: center;
    }

    .skill-name {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 8px;
    }

    .skill-level {
      color: #667eea;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .skill-students {
      font-size: 0.85rem;
      color: #718096;
    }

    @media (max-width: 768px) {
      .two-column {
        grid-template-columns: 1fr;
      }

      .h-bar-item {
        grid-template-columns: 60px 1fr 100px;
        gap: 10px;
      }
    }
  `]
})
export class AnalyticsComponent implements OnInit {
  analytics: any = null;
  isLoading = true;

  constructor(
    private router: Router,
    private teacherService: TeacherService
  ) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.teacherService.getAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.isLoading = false;
      }
    });
  }

  getBarHeight(value: number, dataset: any[]): number {
    const maxValue = Math.max(...dataset.map(d => d.activitiesCompleted), 1);
    return (value / maxValue) * 100;
  }

  getPerformanceDistribution() {
    if (!this.analytics?.performanceDistribution) return [];

    const total = this.analytics.totalStudents;
    return Object.entries(this.analytics.performanceDistribution)
      .map(([level, count]: [string, any]) => ({
        level: parseInt(level),
        count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => a.level - b.level);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  goBack() {
    this.router.navigate(['/teacher']);
  }
}