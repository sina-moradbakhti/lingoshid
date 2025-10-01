import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-teacher-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
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