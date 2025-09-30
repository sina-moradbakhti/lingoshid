import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProgressService, DetailedProgress } from '../../../services/progress.service';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-parent-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      <div class="header">
        <button (click)="goBack()" class="back-btn">← Back</button>
        <h1>Student Progress</h1>
      </div>

      <div *ngIf="isLoading" class="loading">Loading progress...</div>

      <div *ngIf="!isLoading && detailedProgress" class="content">
        <div class="overview-cards">
          <div class="card">
            <h3>{{ detailedProgress.student.totalPoints }}</h3>
            <p>Total Points</p>
            <small>Level {{ detailedProgress.student.currentLevel }}</small>
          </div>

          <div class="card">
            <h3>{{ detailedProgress.completedActivities }}/{{ detailedProgress.totalActivities }}</h3>
            <p>Activities Completed</p>
            <small>{{ getCompletionPercentage() }}% completion</small>
          </div>

          <div class="card">
            <h3>{{ detailedProgress.student.streakDays }}</h3>
            <p>Day Streak</p>
            <small>{{ detailedProgress.learningAnalytics.consistencyScore }}% consistency</small>
          </div>

          <div class="card">
            <h3>{{ formatTime(detailedProgress.totalTimeSpent) }}</h3>
            <p>Practice Time</p>
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
              <small>{{ skill.activitiesCompleted }}/{{ skill.totalActivitiesAvailable }} activities</small>
            </div>
          </div>
        </div>

        <!-- Recent Activities Timeline -->
        <div class="recent-activities-section">
          <h2>📅 Recent Activities</h2>
          <div class="activities-timeline">
            <div *ngFor="let entry of getRecentActivities(); let i = index" 
                 class="timeline-entry" 
                 [class.today]="isToday(entry.date)">
              <div class="timeline-date">
                <span class="day">{{ formatDay(entry.date) }}</span>
                <span class="date">{{ formatDate(entry.date) }}</span>
              </div>
              <div class="timeline-content">
                <div class="activity-stats">
                  <div class="stat">
                    <span class="icon">🎯</span>
                    <span class="value">{{ entry.activitiesCompleted }}</span>
                    <span class="label">activities</span>
                  </div>
                  <div class="stat">
                    <span class="icon">⏱️</span>
                    <span class="value">{{ formatTime(entry.totalTimeSpent) }}</span>
                    <span class="label">practice</span>
                  </div>
                  <div class="stat">
                    <span class="icon">⭐</span>
                    <span class="value">{{ entry.pointsEarned }}</span>
                    <span class="label">points</span>
                  </div>
                  <div class="stat">
                    <span class="icon">📊</span>
                    <span class="value">{{ entry.averageScore }}%</span>
                    <span class="label">avg score</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Charts -->
        <div class="charts-section">
          <h2>📈 Performance Analytics</h2>
          <div class="charts-grid">
            <div class="chart-container">
              <h3>Weekly Progress</h3>
              <canvas #weeklyChart></canvas>
            </div>
            <div class="chart-container">
              <h3>Skills Distribution</h3>
              <canvas #skillsChart></canvas>
            </div>
          </div>
        </div>

        <div class="analytics-section">
          <h2>🧠 Learning Analytics</h2>
          <div class="analytics-grid">
            <div class="insight">
              <strong>Strongest Skill:</strong>
              <p>{{ detailedProgress.learningAnalytics.strongestSkill | titlecase }}</p>
            </div>
            <div class="insight">
              <strong>Focus Area:</strong>
              <p>{{ detailedProgress.learningAnalytics.improvementArea | titlecase }}</p>
            </div>
            <div class="insight">
              <strong>Learning Velocity:</strong>
              <p>{{ detailedProgress.learningAnalytics.learningVelocity }} activities/week</p>
            </div>
            <div class="insight">
              <strong>Performance Trend:</strong>
              <p>{{ detailedProgress.performanceTrends.improvementTrend | titlecase }}</p>
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
      color: #2d3748;
      font-size: 2rem;
    }

    .card p {
      margin: 5px 0;
      color: #4a5568;
      font-weight: 600;
    }

    .card small {
      color: #718096;
    }

    .skills-section, .analytics-section {
      margin-top: 30px;
    }

    .skills-section h2, .analytics-section h2 {
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
      margin: 10px 0 5px 0;
      color: #4a5568;
      font-weight: 600;
    }

    .skill-card small {
      color: #718096;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .insight {
      padding: 15px;
      background: #f7fafc;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }

    .insight strong {
      display: block;
      margin-bottom: 5px;
      color: #2d3748;
    }

    .insight p {
      margin: 0;
      color: #4a5568;
    }

    /* Recent Activities Timeline */
    .recent-activities-section {
      margin-top: 30px;
    }

    .recent-activities-section h2 {
      margin: 0 0 20px 0;
      color: #2d3748;
    }

    .activities-timeline {
      display: flex;
      flex-direction: column;
      gap: 15px;
      max-height: 400px;
      overflow-y: auto;
    }

    .timeline-entry {
      display: flex;
      gap: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      border-left: 4px solid #e2e8f0;
      transition: all 0.3s;
    }

    .timeline-entry.today {
      background: linear-gradient(135deg, #667eea20, #764ba220);
      border-left-color: #667eea;
    }

    .timeline-entry:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .timeline-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
    }

    .timeline-date .day {
      font-size: 0.9rem;
      font-weight: 600;
      color: #667eea;
      text-transform: uppercase;
    }

    .timeline-date .date {
      font-size: 0.8rem;
      color: #718096;
    }

    .timeline-content {
      flex: 1;
    }

    .activity-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 15px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stat .icon {
      font-size: 1.2rem;
      margin-bottom: 5px;
    }

    .stat .value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 2px;
    }

    .stat .label {
      font-size: 0.8rem;
      color: #718096;
      text-transform: uppercase;
    }

    /* Charts Section */
    .charts-section {
      margin-top: 30px;
    }

    .charts-section h2 {
      margin: 0 0 20px 0;
      color: #2d3748;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 30px;
    }

    .chart-container {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }

    .chart-container h3 {
      margin: 0 0 15px 0;
      color: #2d3748;
      text-align: center;
    }

    .chart-container canvas {
      max-height: 300px;
    }

    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
      
      .activity-stats {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .timeline-entry {
        flex-direction: column;
        gap: 10px;
      }
      
      .timeline-date {
        flex-direction: row;
        justify-content: center;
        gap: 10px;
      }
    }
  `]
})
export class ParentProgressComponent implements OnInit, AfterViewInit {
  @ViewChild('weeklyChart') weeklyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('skillsChart') skillsChartRef!: ElementRef<HTMLCanvasElement>;

  detailedProgress: DetailedProgress | null = null;
  isLoading = true;
  studentId: string = '';
  weeklyChart: Chart | null = null;
  skillsChart: Chart | null = null;

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

  ngAfterViewInit() {
    // Charts will be created after data is loaded
  }

  loadProgress() {
    this.progressService.getDetailedProgress(this.studentId).subscribe({
      next: (progress) => {
        this.detailedProgress = progress;
        this.isLoading = false;
        // Create charts after data is loaded
        setTimeout(() => this.createCharts(), 100);
      },
      error: (error) => {
        console.error('Error loading progress:', error);
        this.isLoading = false;
        // Create mock data for demo
        this.createMockData();
        setTimeout(() => this.createCharts(), 100);
      }
    });
  }

  createMockData() {
    // Create mock data for demonstration
    this.detailedProgress = {
      student: {
        id: this.studentId,
        name: 'Alex Johnson',
        grade: 5,
        currentLevel: 3,
        totalPoints: 1250,
        experiencePoints: 850,
        streakDays: 7,
        lastActivityDate: new Date().toISOString()
      },
      skillProgress: [
        {
          skillArea: 'fluency',
          currentLevel: 3,
          progressPercentage: 75,
          totalPracticeTime: 3600,
          activitiesCompleted: 15,
          totalActivitiesAvailable: 20,
          averageScore: 85,
          recentImprovement: 12,
          lastActivity: new Date()
        },
        {
          skillArea: 'pronunciation',
          currentLevel: 2,
          progressPercentage: 60,
          totalPracticeTime: 2400,
          activitiesCompleted: 12,
          totalActivitiesAvailable: 20,
          averageScore: 78,
          recentImprovement: 8,
          lastActivity: new Date()
        },
        {
          skillArea: 'vocabulary',
          currentLevel: 4,
          progressPercentage: 90,
          totalPracticeTime: 4200,
          activitiesCompleted: 18,
          totalActivitiesAvailable: 20,
          averageScore: 92,
          recentImprovement: 15,
          lastActivity: new Date()
        },
        {
          skillArea: 'confidence',
          currentLevel: 2,
          progressPercentage: 45,
          totalPracticeTime: 1800,
          activitiesCompleted: 9,
          totalActivitiesAvailable: 20,
          averageScore: 72,
          recentImprovement: 5,
          lastActivity: new Date()
        }
      ],
      activityTimeline: this.generateMockTimeline(),
      learningAnalytics: {
        totalTimeSpent: 12000,
        averageSessionTime: 1200,
        learningVelocity: 8,
        consistencyScore: 85,
        activitiesNeededForNextLevel: 5,
        estimatedTimeToNextLevel: 3600,
        strongestSkill: 'vocabulary',
        improvementArea: 'confidence'
      },
      performanceTrends: {
        weeklyTrends: [],
        improvementTrend: 'improving',
        performanceConsistency: 78
      },
      achievementProgress: {
        badgesEarned: 8,
        totalBadges: 15,
        badgeProgress: 53,
        nextBadgeTarget: null
      },
      totalActivities: 80,
      completedActivities: 54,
      totalTimeSpent: 12000,
      averageScore: 82
    };
  }

  generateMockTimeline() {
    const timeline = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      timeline.push({
        date: date.toISOString().split('T')[0],
        activitiesCompleted: Math.floor(Math.random() * 5) + 1,
        totalTimeSpent: Math.floor(Math.random() * 3600) + 600,
        pointsEarned: Math.floor(Math.random() * 100) + 50,
        averageScore: Math.floor(Math.random() * 30) + 70
      });
    }
    return timeline;
  }

  getCompletionPercentage(): number {
    if (!this.detailedProgress) return 0;
    return Math.round((this.detailedProgress.completedActivities / this.detailedProgress.totalActivities) * 100);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  getRecentActivities() {
    return this.detailedProgress?.activityTimeline || [];
  }

  isToday(dateString: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  }

  formatDay(dateString: string): string {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  createCharts() {
    if (!this.detailedProgress) return;

    this.createWeeklyChart();
    this.createSkillsChart();
  }

  createWeeklyChart() {
    if (!this.weeklyChartRef || !this.detailedProgress) return;

    const ctx = this.weeklyChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (this.weeklyChart) {
      this.weeklyChart.destroy();
    }

    const timeline = this.detailedProgress.activityTimeline;
    const labels = timeline.map(entry => this.formatDate(entry.date));
    const activitiesData = timeline.map(entry => entry.activitiesCompleted);
    const scoresData = timeline.map(entry => entry.averageScore);

    this.weeklyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Activities Completed',
            data: activitiesData,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Average Score (%)',
            data: scoresData,
            borderColor: '#48bb78',
            backgroundColor: 'rgba(72, 187, 120, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Activities'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Score (%)'
            },
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });
  }

  createSkillsChart() {
    if (!this.skillsChartRef || !this.detailedProgress) return;

    const ctx = this.skillsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (this.skillsChart) {
      this.skillsChart.destroy();
    }

    const skills = this.detailedProgress.skillProgress;
    const labels = skills.map(skill => skill.skillArea.charAt(0).toUpperCase() + skill.skillArea.slice(1));
    const progressData = skills.map(skill => skill.progressPercentage);
    const colors = ['#667eea', '#48bb78', '#ed8936', '#e53e3e'];

    this.skillsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: progressData,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed + '%';
              }
            }
          }
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/parent']);
  }
}