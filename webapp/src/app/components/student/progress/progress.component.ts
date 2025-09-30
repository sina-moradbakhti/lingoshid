import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProgressService, DetailedProgress, SkillProgress, ActivityTimelineEntry, WeeklyTrend } from '../../../services/progress.service';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      <div class="header">
        <button (click)="goBack()" class="back-btn">← Back to Dashboard</button>
        <h1>📊 Advanced Progress Analytics</h1>
        <p>Comprehensive insights into your learning journey</p>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner">🎮</div>
        <p>Loading your progress analytics...</p>
      </div>

      <!-- Progress Content -->
      <div class="progress-content" *ngIf="!isLoading && detailedProgress">
        <!-- Student Overview Cards -->
        <div class="overview-grid">
          <div class="overview-card primary">
            <div class="card-icon">🎯</div>
            <div class="card-content">
              <h3>{{ detailedProgress.student.totalPoints }}</h3>
              <p>Total Points</p>
              <small>Level {{ detailedProgress.student.currentLevel }}</small>
            </div>
          </div>

          <div class="overview-card success">
            <div class="card-icon">✅</div>
            <div class="card-content">
              <h3>{{ detailedProgress.completedActivities }}/{{ detailedProgress.totalActivities }}</h3>
              <p>Activities Completed</p>
              <small>{{ getCompletionPercentage() }}% completion rate</small>
            </div>
          </div>

          <div class="overview-card warning">
            <div class="card-icon">⚡</div>
            <div class="card-content">
              <h3>{{ detailedProgress.student.streakDays }}</h3>
              <p>Day Streak</p>
              <small>{{ detailedProgress.learningAnalytics.consistencyScore }}% consistency</small>
            </div>
          </div>

          <div class="overview-card info">
            <div class="card-icon">⏱️</div>
            <div class="card-content">
              <h3>{{ formatTimeFromSeconds(detailedProgress.totalTimeSpent) }}</h3>
              <p>Total Practice Time</p>
              <small>Avg: {{ detailedProgress.learningAnalytics.averageSessionTime }}min/session</small>
            </div>
          </div>
        </div>

        <!-- Skills Progress Section -->
        <div class="section-card">
          <h2>🎭 Skill Mastery Analysis</h2>
          <div class="skills-grid">
            <div class="skill-card" *ngFor="let skill of detailedProgress.skillProgress">
              <div class="skill-header">
                <h3>{{ getSkillIcon(skill.skillArea) }} {{ skill.skillArea | titlecase }}</h3>
                <span class="skill-level">Level {{ skill.currentLevel }}</span>
              </div>

              <div class="progress-ring-container">
                <div class="progress-ring">
                  <svg viewBox="0 0 36 36" class="circular-chart">
                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="circle" [attr.stroke-dasharray]="skill.progressPercentage + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <text x="18" y="20.35" class="percentage">{{ skill.progressPercentage }}%</text>
                  </svg>
                </div>
              </div>

              <div class="skill-metrics">
                <div class="metric">
                  <span class="metric-value">{{ skill.activitiesCompleted }}/{{ skill.totalActivitiesAvailable }}</span>
                  <span class="metric-label">Activities</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{ skill.averageScore }}%</span>
                  <span class="metric-label">Avg Score</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{ skill.totalPracticeTime }}m</span>
                  <span class="metric-label">Practice Time</span>
                </div>
              </div>

              <div class="skill-improvement" *ngIf="skill.recentImprovement !== 0">
                <span class="improvement-badge" [class.positive]="skill.recentImprovement > 0" [class.negative]="skill.recentImprovement < 0">
                  {{ skill.recentImprovement > 0 ? '+' : '' }}{{ skill.recentImprovement }}% recent change
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Learning Analytics -->
        <div class="analytics-grid">
          <div class="section-card">
            <h2>🧠 Learning Intelligence</h2>
            <div class="analytics-content">
              <div class="insight-item">
                <span class="insight-icon">💪</span>
                <div class="insight-text">
                  <h4>Strongest Skill</h4>
                  <p>{{ detailedProgress.learningAnalytics.strongestSkill | titlecase }}</p>
                </div>
              </div>

              <div class="insight-item">
                <span class="insight-icon">🎯</span>
                <div class="insight-text">
                  <h4>Focus Area</h4>
                  <p>{{ detailedProgress.learningAnalytics.improvementArea | titlecase }}</p>
                </div>
              </div>

              <div class="insight-item">
                <span class="insight-icon">🚀</span>
                <div class="insight-text">
                  <h4>Learning Velocity</h4>
                  <p>{{ detailedProgress.learningAnalytics.learningVelocity }} activities/week</p>
                </div>
              </div>

              <div class="insight-item">
                <span class="insight-icon">⏭️</span>
                <div class="insight-text">
                  <h4>Next Level Progress</h4>
                  <p>{{ detailedProgress.learningAnalytics.activitiesNeededForNextLevel }} activities needed</p>
                </div>
              </div>
            </div>
          </div>

          <div class="section-card">
            <h2>📈 Performance Trends</h2>
            <div class="trends-content">
              <div class="trend-indicator">
                <span class="trend-icon" [class]="getTrendClass(detailedProgress.performanceTrends.improvementTrend)">
                  {{ getTrendIcon(detailedProgress.performanceTrends.improvementTrend) }}
                </span>
                <div class="trend-text">
                  <h4>Performance Trend</h4>
                  <p>{{ detailedProgress.performanceTrends.improvementTrend | titlecase }}</p>
                </div>
              </div>

              <div class="consistency-meter">
                <h4>Performance Consistency</h4>
                <div class="meter-container">
                  <div class="meter-bar">
                    <div class="meter-fill" [style.width.%]="detailedProgress.performanceTrends.performanceConsistency"></div>
                  </div>
                  <span class="meter-value">{{ detailedProgress.performanceTrends.performanceConsistency }}%</span>
                </div>
              </div>

              <div class="weekly-summary">
                <h4>Weekly Activity Trends</h4>
                <div class="weeks-chart">
                  <div class="week-bar" *ngFor="let week of getRecentWeeks()">
                    <div class="bar" [style.height.%]="getWeekBarHeight(week.activitiesCompleted)"></div>
                    <span class="week-label">{{ week.week }}</span>
                    <span class="week-value">{{ week.activitiesCompleted }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Achievement Progress -->
        <div class="section-card" *ngIf="detailedProgress.achievementProgress">
          <h2>🏆 Achievement Progress</h2>
          <div class="achievement-content">
            <div class="achievement-overview">
              <div class="badge-progress">
                <div class="badge-circle">
                  <span class="badge-count">{{ detailedProgress.achievementProgress.badgesEarned }}/{{ detailedProgress.achievementProgress.totalBadges }}</span>
                  <span class="badge-label">Badges Earned</span>
                </div>
                <div class="progress-arc">
                  <div class="arc-fill" [style.transform]="'rotate(' + (detailedProgress.achievementProgress.badgeProgress * 1.8) + 'deg)'"></div>
                </div>
              </div>

              <div class="next-badge" *ngIf="detailedProgress.achievementProgress.nextBadgeTarget">
                <h4>🎯 Next Target</h4>
                <div class="target-badge">
                  <h5>{{ detailedProgress.achievementProgress.nextBadgeTarget.name }}</h5>
                  <p>{{ detailedProgress.achievementProgress.nextBadgeTarget.description }}</p>
                  <div class="target-progress">
                    <div class="target-bar">
                      <div class="target-fill" [style.width.%]="detailedProgress.achievementProgress.nextBadgeTarget.progress"></div>
                    </div>
                    <span>{{ detailedProgress.achievementProgress.nextBadgeTarget.progress }}% complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Timeline -->
        <div class="section-card">
          <h2>📅 Activity Timeline (Last 30 Days)</h2>
          <div class="timeline-container">
            <div class="timeline-chart">
              <div class="timeline-day" *ngFor="let day of getRecentTimeline()"
                   [class.active]="day.activitiesCompleted > 0"
                   [title]="getTimelineTooltip(day)">
                <div class="day-bar" [style.height.%]="getTimelineBarHeight(day.activitiesCompleted)"></div>
                <span class="day-label">{{ getDayLabel(day.date) }}</span>
              </div>
            </div>
            <div class="timeline-legend">
              <span>Less active</span>
              <div class="legend-squares">
                <div class="legend-square low"></div>
                <div class="legend-square medium"></div>
                <div class="legend-square high"></div>
                <div class="legend-square highest"></div>
              </div>
              <span>More active</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && !detailedProgress">
        <div class="empty-icon">📊</div>
        <h3>No Progress Data Available</h3>
        <p>Start completing activities to see your detailed progress analytics!</p>
        <button (click)="loadProgress()" class="retry-btn">Retry Loading</button>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .header {
      background: white;
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      text-align: center;
      position: relative;
    }

    .back-btn {
      position: absolute;
      left: 25px;
      top: 25px;
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 18px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .back-btn:hover {
      background: #5a67d8;
      transform: translateY(-2px);
    }

    .header h1 {
      margin: 0 0 10px 0;
      color: #667eea;
      font-size: 2.8rem;
      font-weight: 700;
    }

    .header p {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    /* Overview Cards */
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .overview-card {
      background: white;
      padding: 25px;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: transform 0.3s;
    }

    .overview-card:hover {
      transform: translateY(-5px);
    }

    .overview-card.primary { border-left: 5px solid #667eea; }
    .overview-card.success { border-left: 5px solid #48bb78; }
    .overview-card.warning { border-left: 5px solid #ed8936; }
    .overview-card.info { border-left: 5px solid #4299e1; }

    .card-icon {
      font-size: 3rem;
      opacity: 0.8;
    }

    .card-content h3 {
      margin: 0 0 5px 0;
      font-size: 2.2rem;
      font-weight: 700;
      color: #2d3748;
    }

    .card-content p {
      margin: 0 0 5px 0;
      color: #4a5568;
      font-weight: 600;
    }

    .card-content small {
      color: #718096;
      font-size: 0.85rem;
    }

    /* Section Cards */
    .section-card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .section-card h2 {
      margin: 0 0 25px 0;
      color: #2d3748;
      font-size: 1.8rem;
      font-weight: 700;
    }

    /* Skills Grid */
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
    }

    .skill-card {
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 15px;
      padding: 25px;
      text-align: center;
      transition: all 0.3s;
    }

    .skill-card:hover {
      border-color: #667eea;
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.15);
    }

    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .skill-header h3 {
      margin: 0;
      color: #2d3748;
      font-size: 1.2rem;
    }

    .skill-level {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    /* Progress Ring */
    .progress-ring-container {
      margin: 20px 0;
    }

    .progress-ring {
      width: 120px;
      height: 120px;
      margin: 0 auto;
    }

    .circular-chart {
      width: 100%;
      height: 100%;
    }

    .circle-bg {
      fill: none;
      stroke: #e2e8f0;
      stroke-width: 3.8;
    }

    .circle {
      fill: none;
      stroke: #667eea;
      stroke-width: 3.8;
      stroke-linecap: round;
      animation: progress 1s ease-in-out forwards;
    }

    @keyframes progress {
      0% { stroke-dasharray: 0 100; }
    }

    .percentage {
      fill: #2d3748;
      font-family: sans-serif;
      font-size: 0.5em;
      text-anchor: middle;
      font-weight: bold;
    }

    /* Skill Metrics */
    .skill-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 20px;
    }

    .metric {
      text-align: center;
    }

    .metric-value {
      display: block;
      font-weight: 700;
      color: #2d3748;
      font-size: 1.1rem;
    }

    .metric-label {
      display: block;
      color: #718096;
      font-size: 0.8rem;
      margin-top: 2px;
    }

    .skill-improvement {
      margin-top: 15px;
    }

    .improvement-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .improvement-badge.positive {
      background: #c6f6d5;
      color: #22543d;
    }

    .improvement-badge.negative {
      background: #fed7d7;
      color: #c53030;
    }

    /* Analytics Grid */
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 30px;
      margin-bottom: 30px;
    }

    .analytics-content {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .insight-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: #f7fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .insight-icon {
      font-size: 2rem;
    }

    .insight-text h4 {
      margin: 0 0 5px 0;
      color: #2d3748;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .insight-text p {
      margin: 0;
      color: #4a5568;
      font-weight: 600;
    }

    /* Trends */
    .trends-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .trend-indicator {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: #f7fafc;
      border-radius: 12px;
    }

    .trend-icon {
      font-size: 2rem;
    }

    .trend-icon.trend-up { color: #38a169; }
    .trend-icon.trend-down { color: #e53e3e; }
    .trend-icon.trend-stable { color: #4299e1; }

    .consistency-meter h4, .weekly-summary h4 {
      margin: 0 0 10px 0;
      color: #2d3748;
      font-size: 1rem;
    }

    .meter-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .meter-bar {
      flex: 1;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .meter-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.5s;
    }

    .meter-value {
      font-weight: 600;
      color: #2d3748;
    }

    /* Weekly Chart */
    .weeks-chart {
      display: flex;
      justify-content: space-between;
      align-items: end;
      height: 80px;
      gap: 5px;
    }

    .week-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      height: 100%;
    }

    .bar {
      width: 20px;
      background: linear-gradient(to top, #667eea, #764ba2);
      border-radius: 3px 3px 0 0;
      margin-top: auto;
      min-height: 2px;
    }

    .week-label {
      font-size: 0.7rem;
      color: #718096;
      margin-top: 5px;
    }

    .week-value {
      font-size: 0.7rem;
      color: #2d3748;
      font-weight: 600;
    }

    /* Achievement Progress */
    .achievement-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      align-items: center;
    }

    .badge-progress {
      position: relative;
      width: 150px;
      height: 150px;
      margin: 0 auto;
    }

    .badge-circle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 2;
    }

    .badge-count {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
    }

    .badge-label {
      font-size: 0.8rem;
      color: #718096;
    }

    .progress-arc {
      width: 150px;
      height: 150px;
      border: 8px solid #e2e8f0;
      border-radius: 50%;
      position: relative;
      overflow: hidden;
    }

    .arc-fill {
      position: absolute;
      top: -8px;
      left: -8px;
      width: 150px;
      height: 150px;
      border: 8px solid #667eea;
      border-radius: 50%;
      border-right-color: transparent;
      border-bottom-color: transparent;
      transform-origin: center;
      transition: transform 1s ease-in-out;
    }

    .next-badge h4 {
      margin: 0 0 15px 0;
      color: #2d3748;
      font-size: 1.1rem;
    }

    .target-badge {
      background: #f7fafc;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .target-badge h5 {
      margin: 0 0 8px 0;
      color: #2d3748;
      font-size: 1rem;
    }

    .target-badge p {
      margin: 0 0 15px 0;
      color: #4a5568;
      font-size: 0.9rem;
    }

    .target-progress {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .target-bar {
      flex: 1;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .target-fill {
      height: 100%;
      background: #667eea;
      transition: width 0.5s;
    }

    /* Timeline */
    .timeline-container {
      padding: 20px 0;
    }

    .timeline-chart {
      display: grid;
      grid-template-columns: repeat(14, 1fr);
      gap: 4px;
      margin-bottom: 20px;
    }

    .timeline-day {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    }

    .day-bar {
      width: 100%;
      height: 60px;
      background: #e2e8f0;
      border-radius: 4px;
      transition: all 0.3s;
      margin-bottom: 5px;
    }

    .timeline-day.active .day-bar {
      background: linear-gradient(to top, #667eea, #764ba2);
    }

    .timeline-day:hover .day-bar {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .day-label {
      font-size: 0.7rem;
      color: #718096;
      text-align: center;
    }

    .timeline-legend {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      color: #718096;
      font-size: 0.8rem;
    }

    .legend-squares {
      display: flex;
      gap: 4px;
    }

    .legend-square {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-square.low { background: #e2e8f0; }
    .legend-square.medium { background: #a0aec0; }
    .legend-square.high { background: #667eea; }
    .legend-square.highest { background: #5a67d8; }

    /* Loading & Empty States */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
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
      color: #718096;
      font-size: 1.2rem;
    }

    .empty-state {
      text-align: center;
      padding: 80px 40px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    .empty-icon {
      font-size: 5rem;
      margin-bottom: 25px;
      opacity: 0.7;
    }

    .empty-state h3 {
      margin: 0 0 15px 0;
      color: #2d3748;
      font-size: 1.5rem;
    }

    .empty-state p {
      margin: 0 0 25px 0;
      color: #718096;
      font-size: 1.1rem;
    }

    .retry-btn {
      padding: 15px 30px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s;
    }

    .retry-btn:hover {
      background: #5a67d8;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .progress-container {
        padding: 15px;
      }

      .overview-grid {
        grid-template-columns: 1fr;
      }

      .analytics-grid {
        grid-template-columns: 1fr;
      }

      .analytics-content {
        grid-template-columns: 1fr;
      }

      .achievement-content {
        grid-template-columns: 1fr;
      }

      .header h1 {
        font-size: 2rem;
      }

      .timeline-chart {
        grid-template-columns: repeat(7, 1fr);
      }
    }
  `]
})
export class ProgressComponent implements OnInit {
  detailedProgress: DetailedProgress | null = null;
  isLoading = true;
  selectedTimeRange = '30days';

  constructor(
    private router: Router,
    private progressService: ProgressService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.loadProgress();
  }

  loadProgress() {
    this.isLoading = true;

    this.studentService.getDashboard().subscribe({
      next: (dashboard) => {
        if (dashboard?.student?.id) {
          this.progressService.getDetailedProgress(dashboard.student.id).subscribe({
            next: (progress) => {
              this.detailedProgress = progress;
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading detailed progress:', error);
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

  getSkillIcon(skillArea: string): string {
    switch (skillArea.toLowerCase()) {
      case 'fluency': return '🗣️';
      case 'pronunciation': return '🎯';
      case 'confidence': return '💪';
      case 'vocabulary': return '📚';
      default: return '📊';
    }
  }

  getCompletionPercentage(): number {
    if (!this.detailedProgress) return 0;
    return Math.round((this.detailedProgress.completedActivities / this.detailedProgress.totalActivities) * 100);
  }

  formatTimeFromSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'improving': return 'trend-up';
      case 'declining': return 'trend-down';
      case 'stable': return 'trend-stable';
      default: return 'trend-stable';
    }
  }

  getRecentWeeks(): WeeklyTrend[] {
    if (!this.detailedProgress) return [];
    return this.detailedProgress.performanceTrends.weeklyTrends.slice(-4);
  }

  getWeekBarHeight(activitiesCount: number): number {
    if (!this.detailedProgress) return 0;
    const maxActivities = Math.max(...this.detailedProgress.performanceTrends.weeklyTrends.map(w => w.activitiesCompleted), 1);
    return (activitiesCount / maxActivities) * 100;
  }

  getRecentTimeline(): ActivityTimelineEntry[] {
    if (!this.detailedProgress) return [];
    return this.detailedProgress.activityTimeline.slice(-14); // Show last 14 days
  }

  getTimelineBarHeight(activitiesCount: number): number {
    if (!this.detailedProgress) return 0;
    const maxActivities = Math.max(...this.detailedProgress.activityTimeline.map(d => d.activitiesCompleted), 1);
    return activitiesCount === 0 ? 0 : Math.max((activitiesCount / maxActivities) * 100, 10);
  }

  getDayLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getTimelineTooltip(day: ActivityTimelineEntry): string {
    return `${this.getDayLabel(day.date)}: ${day.activitiesCompleted} activities, ${day.pointsEarned} points, ${Math.round(day.totalTimeSpent / 60)}min`;
  }


  goBack() {
    this.router.navigate(['/student/dashboard']);
  }
}