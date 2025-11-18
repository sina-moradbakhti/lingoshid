import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivityService } from '../../../services/activity.service';
import { Activity } from '../../../models/user.model';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {
  activities: Activity[] = [];
  isLoading = true;

  constructor(
    private activityService: ActivityService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadActivities();
  }

  loadActivities() {
    this.isLoading = true;
    this.activityService.getActivities().subscribe({
      next: (activities) => {
        this.activities = activities;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.isLoading = false;
        // Create mock activities for demo
        this.createMockActivities();
      }
    });
  }

  startActivity(activity: Activity) {
    // Navigate directly to modular system (bypasses old hardcoded UI)
    this.router.navigate(['/student/module-activities', activity.id, 'start']);
  }

  goBack() {
    this.router.navigate(['/student/dashboard']);
  }

  getPointsRange(activity: Activity): string {
    const basePoints = activity.pointsReward;

    // Calculate potential bonus points based on difficulty and type
    let maxBonus = 0;

    // Difficulty bonus (matches start-activity component logic)
    switch (activity.difficulty) {
      case 'beginner':
        maxBonus += Math.floor(basePoints * 0.1);
        break;
      case 'intermediate':
        maxBonus += Math.floor(basePoints * 0.2);
        break;
      case 'advanced':
        maxBonus += Math.floor(basePoints * 0.3);
        break;
    }

    // Perfect performance bonus (up to 50% of base)
    maxBonus += Math.floor(basePoints * 0.5);

    // Speed bonus (up to 20% of base)
    maxBonus += Math.floor(basePoints * 0.2);

    const maxPoints = basePoints + maxBonus;

    if (maxPoints > basePoints) {
      return `${basePoints}-${maxPoints} pts`;
    } else {
      return `${basePoints} pts`;
    }
  }

  private createMockActivities() {
    this.activities = [
      {
        id: '1',
        title: 'First Steps - Say Hello',
        description: 'Practice basic greetings in English',
        type: 'pronunciation_challenge',
        difficulty: 'beginner',
        skillArea: 'pronunciation',
        pointsReward: 10,
        minLevel: 1,
        isActive: true,
        order: 1
      },
      {
        id: '2',
        title: 'Describe the Playground',
        description: 'Look at the picture and describe what you see',
        type: 'picture_description',
        difficulty: 'beginner',
        skillArea: 'vocabulary',
        pointsReward: 15,
        minLevel: 1,
        isActive: true,
        order: 2
      },
      {
        id: '3',
        title: 'Meet a New Friend',
        description: 'Have a conversation with Alex about your hobbies',
        type: 'virtual_conversation',
        difficulty: 'intermediate',
        skillArea: 'fluency',
        pointsReward: 20,
        minLevel: 2,
        isActive: true,
        order: 3
      },
      {
        id: '4',
        title: 'At the Restaurant',
        description: 'Practice ordering food at a restaurant',
        type: 'role_play',
        difficulty: 'intermediate',
        skillArea: 'confidence',
        pointsReward: 25,
        minLevel: 3,
        isActive: true,
        order: 4
      },
      {
        id: '5',
        title: 'My Family Story',
        description: 'Create and tell a story about your family',
        type: 'story_creation',
        difficulty: 'advanced',
        skillArea: 'fluency',
        pointsReward: 30,
        minLevel: 4,
        isActive: true,
        order: 5
      },
      {
        id: '6',
        title: 'English Songs - Twinkle Star',
        description: 'Sing along to improve pronunciation and rhythm',
        type: 'singing_chanting',
        difficulty: 'beginner',
        skillArea: 'pronunciation',
        pointsReward: 15,
        minLevel: 1,
        isActive: true,
        order: 6
      }
    ];
  }
}