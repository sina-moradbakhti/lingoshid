import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProgressService, DetailedProgress } from '../../../services/progress.service';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-teacher-student-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-progress.component.html',
  styleUrls: ['./student-progress.component.scss']
})
export class TeacherStudentProgressComponent implements OnInit, AfterViewInit {
  @ViewChild('weeklyChart') weeklyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('skillsChart') skillsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('comparisonChart') comparisonChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('rankingChart') rankingChartRef!: ElementRef<HTMLCanvasElement>;

  detailedProgress: DetailedProgress | null = null;
  isLoading = true;
  studentId: string = '';

  weeklyChart: Chart | null = null;
  skillsChart: Chart | null = null;
  comparisonChart: Chart | null = null;
  rankingChart: Chart | null = null;

  // Mock class comparison data (would come from API)
  classRank = 5;
  totalStudents = 25;
  classAveragePoints = 980;
  classAverageScore = 78;
  topStudents = [
    { name: 'Sarah M.', points: 1450 },
    { name: 'Michael T.', points: 1320 },
    { name: 'Emma L.', points: 1280 },
    { name: 'Current Student', points: 1250 },
    { name: 'James K.', points: 1180 }
  ];

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

  // Class comparison methods
  getPercentile(): number {
    return Math.round((1 - (this.classRank - 1) / this.totalStudents) * 100);
  }

  getPointsPercentage(): number {
    if (!this.detailedProgress) return 0;
    const maxPoints = Math.max(this.detailedProgress.student.totalPoints, this.classAveragePoints);
    return (this.detailedProgress.student.totalPoints / maxPoints) * 100;
  }

  getClassAveragePercentage(): number {
    if (!this.detailedProgress) return 0;
    const maxPoints = Math.max(this.detailedProgress.student.totalPoints, this.classAveragePoints);
    return (this.classAveragePoints / maxPoints) * 100;
  }

  getPointsDifference(): number {
    if (!this.detailedProgress) return 0;
    return Math.abs(this.detailedProgress.student.totalPoints - this.classAveragePoints);
  }

  getScoreDifference(): number {
    if (!this.detailedProgress) return 0;
    return Math.abs(Math.round(this.detailedProgress.averageScore - this.classAverageScore));
  }

  createCharts() {
    if (!this.detailedProgress) return;

    this.createWeeklyChart();
    this.createSkillsChart();
    this.createComparisonChart();
    this.createRankingChart();
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

  createComparisonChart() {
    if (!this.comparisonChartRef || !this.detailedProgress) return;

    const ctx = this.comparisonChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (this.comparisonChart) {
      this.comparisonChart.destroy();
    }

    const skills = this.detailedProgress.skillProgress;
    const labels = skills.map(skill => skill.skillArea.charAt(0).toUpperCase() + skill.skillArea.slice(1));
    const studentScores = skills.map(skill => skill.averageScore);
    // Mock class averages for each skill
    const classAverages = [75, 72, 80, 68];

    this.comparisonChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Student',
            data: studentScores,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#667eea'
          },
          {
            label: 'Class Average',
            data: classAverages,
            borderColor: '#48bb78',
            backgroundColor: 'rgba(72, 187, 120, 0.2)',
            pointBackgroundColor: '#48bb78',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#48bb78'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });
  }

  createRankingChart() {
    if (!this.rankingChartRef) return;

    const ctx = this.rankingChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (this.rankingChart) {
      this.rankingChart.destroy();
    }

    const labels = this.topStudents.map(s => s.name);
    const points = this.topStudents.map(s => s.points);
    const colors = labels.map(name =>
      name === 'Current Student' ? '#667eea' : '#cbd5e0'
    );

    this.rankingChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Points',
          data: points,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Points'
            }
          }
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/teacher/students']);
  }
}