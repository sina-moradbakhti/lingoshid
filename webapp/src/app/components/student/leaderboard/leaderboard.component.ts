import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LeaderboardService, LeaderboardEntry, LeaderboardResponse } from '../../../services/leaderboard.service';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  leaderboardData: LeaderboardResponse | null = null;
  allEntries: LeaderboardEntry[] = [];
  topEntries: LeaderboardEntry[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private leaderboardService: LeaderboardService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.isLoading = true;

    // Get current student info from dashboard
    this.studentService.getDashboard().subscribe({
      next: (dashboard) => {
        // Load leaderboard without grade filter (filtered by teacher on backend)
        this.leaderboardService.getLeaderboard(undefined, 20).subscribe({
          next: (data) => {
            this.leaderboardData = data;
            this.allEntries = data.entries;
            this.topEntries = data.entries.slice(0, 3);
            this.markCurrentUser(dashboard?.student?.id);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading leaderboard:', error);
            this.createMockLeaderboard();
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.createMockLeaderboard();
        this.isLoading = false;
      }
    });
  }

  private markCurrentUser(currentStudentId?: string) {
    if (!currentStudentId) return;

    this.allEntries.forEach(entry => {
      if (entry.student.id === currentStudentId) {
        entry.isCurrentUser = true;
      }
    });

    this.topEntries.forEach(entry => {
      if (entry.student.id === currentStudentId) {
        entry.isCurrentUser = true;
      }
    });
  }

  getRankEmoji(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  }

  private createMockLeaderboard() {
    // Fallback mock data when server is unavailable
    const studentPoints = parseInt(localStorage.getItem('studentPoints') || '1250');

    this.allEntries = [
      {
        rank: 1,
        student: {
          id: '1',
          user: { firstName: 'Sara', lastName: 'Ahmad' },
          totalPoints: 2450,
          currentLevel: 12,
          grade: 5
        },
        points: 2450,
        isCurrentUser: false
      },
      {
        rank: 2,
        student: {
          id: '2',
          user: { firstName: 'Mohammad', lastName: 'Ali' },
          totalPoints: 1890,
          currentLevel: 9,
          grade: 5
        },
        points: 1890,
        isCurrentUser: false
      },
      {
        rank: 3,
        student: {
          id: '3',
          user: { firstName: 'Alex', lastName: 'Johnson' },
          totalPoints: studentPoints,
          currentLevel: 8,
          grade: 5
        },
        points: studentPoints,
        isCurrentUser: true
      },
      {
        rank: 4,
        student: {
          id: '4',
          user: { firstName: 'Emma', lastName: 'Wilson' },
          totalPoints: 980,
          currentLevel: 6,
          grade: 5
        },
        points: 980,
        isCurrentUser: false
      },
      {
        rank: 5,
        student: {
          id: '5',
          user: { firstName: 'Oliver', lastName: 'Brown' },
          totalPoints: 756,
          currentLevel: 5,
          grade: 5
        },
        points: 756,
        isCurrentUser: false
      }
    ];

    this.topEntries = this.allEntries.slice(0, 3);
    this.leaderboardData = {
      entries: this.allEntries,
      currentUserRank: 3,
      totalStudents: 25
    };
  }

  goBack() {
    this.router.navigate(['/student/dashboard']);
  }
}