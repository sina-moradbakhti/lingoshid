import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentService, StudentDashboard } from '../../../services/student.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboard: StudentDashboard | null = null;
  motivationalMessage: string = '';

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.motivationalMessage = this.getMotivationalMessage();
    this.loadDashboard();
  }

  loadDashboard() {
    this.studentService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        // For demo purposes, create mock data
        this.createMockDashboard();
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'needs-improvement';
  }

  getMotivationalMessage(): string {
    const messages = [
      "You're doing amazing! Keep it up! 🌟",
      "Every word you learn is a step forward! 🚀",
      "Practice makes perfect! You've got this! 💪",
      "Your English skills are growing every day! 🌱",
      "Keep exploring the world of English! 🌍"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private createMockDashboard() {
    // Mock data for demonstration
    this.dashboard = {
      student: {
        id: '1',
        grade: 5,
        age: 10,
        totalPoints: parseInt(localStorage.getItem('studentPoints') || '1250'),
        currentLevel: 8,
        experiencePoints: 350,
        proficiencyLevel: 'intermediate',
        streakDays: 7,
        user: {
          id: '1',
          email: 'student@demo.com',
          firstName: 'Alex',
          lastName: 'Johnson',
          role: 'student' as any,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      recentActivities: [
        {
          id: '1',
          score: 85,
          pointsEarned: 25,
          timeSpent: 180,
          isCompleted: true,
          completedAt: new Date(),
          activity: {
            id: '1',
            title: 'Pronunciation Challenge: Greetings',
            description: 'Practice basic greetings',
            type: 'pronunciation_challenge',
            difficulty: 'beginner',
            skillArea: 'pronunciation',
            pointsReward: 25,
            minLevel: 1,
            isActive: true,
            order: 1
          }
        },
        {
          id: '2',
          score: 92,
          pointsEarned: 30,
          timeSpent: 240,
          isCompleted: true,
          completedAt: new Date(Date.now() - 86400000),
          activity: {
            id: '2',
            title: 'Picture Description: My Family',
            description: 'Describe family members',
            type: 'picture_description',
            difficulty: 'beginner',
            skillArea: 'vocabulary',
            pointsReward: 30,
            minLevel: 1,
            isActive: true,
            order: 2
          }
        }
      ],
      levelProgress: {
        currentLevel: 8,
        experiencePoints: 350,
        pointsForNextLevel: 500,
        progressPercentage: 70
      },
      leaderboardPosition: 3,
      totalBadges: 12,
      streakDays: 7
    };
  }
}