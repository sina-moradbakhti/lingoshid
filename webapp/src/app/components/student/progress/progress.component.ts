import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProgressService, DetailedProgress, SkillProgress, ActivityTimelineEntry, WeeklyTrend } from '../../../services/progress.service';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
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