import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BadgesService, Badge, StudentBadge } from '../../../services/badges.service';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.scss']
})
export class BadgesComponent implements OnInit {
  badges: Badge[] = [];
  studentBadges: StudentBadge[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private badgesService: BadgesService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.loadBadges();
  }

  loadBadges() {
    this.isLoading = true;

    // Load all available badges
    this.badgesService.getAllBadges().subscribe({
      next: (badges) => {
        this.badges = badges;
        this.loadStudentBadges();
      },
      error: (error) => {
        console.error('Error loading badges:', error);
        this.createMockBadges();
        this.isLoading = false;
      }
    });
  }

  private loadStudentBadges() {
    // Get student information from dashboard
    this.studentService.getDashboard().subscribe({
      next: (dashboard) => {
        if (dashboard?.student?.id) {
          this.badgesService.getStudentBadges(dashboard.student.id).subscribe({
            next: (studentBadges) => {
              this.studentBadges = studentBadges;
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading student badges:', error);
              // Continue without student badges data
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

  isBadgeEarned(badge: Badge): boolean {
    return this.studentBadges.some(sb => sb.badge.id === badge.id && sb.isEarned);
  }

  getBadgeEarnedDate(badge: Badge): Date | null {
    const studentBadge = this.studentBadges.find(sb => sb.badge.id === badge.id && sb.isEarned);
    return studentBadge ? studentBadge.earnedAt : null;
  }

  private createMockBadges() {
    // Fallback mock data when server is unavailable
    this.badges = [
      {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first speaking activity',
        icon: '🏆',
        category: 'achievement',
        criteria: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Brave Speaker',
        description: 'Speak for 5 minutes total',
        icon: '🗣️',
        category: 'practice',
        criteria: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Daily Learner',
        description: 'Login for 7 consecutive days',
        icon: '🔥',
        category: 'streak',
        criteria: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Pronunciation Pro',
        description: 'Achieve 80% pronunciation accuracy',
        icon: '🎯',
        category: 'skill',
        criteria: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: 'Conversation Master',
        description: 'Complete 10 dialogue activities',
        icon: '💬',
        category: 'activity',
        criteria: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '6',
        name: 'Story Teller',
        description: 'Record and share one story',
        icon: '📖',
        category: 'creativity',
        criteria: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Mock some earned badges based on localStorage data
    const studentPoints = parseInt(localStorage.getItem('studentPoints') || '0');
    this.studentBadges = [];

    if (studentPoints > 0) {
      this.studentBadges.push({
        id: '1',
        badge: this.badges[0],
        student: null,
        earnedAt: new Date(Date.now() - 86400000),
        isEarned: true
      });
    }

    if (studentPoints > 100) {
      this.studentBadges.push({
        id: '2',
        badge: this.badges[1],
        student: null,
        earnedAt: new Date(Date.now() - 43200000),
        isEarned: true
      });
    }
  }

  goBack() {
    this.router.navigate(['/student/dashboard']);
  }
}