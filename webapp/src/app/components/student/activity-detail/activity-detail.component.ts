import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ActivityService } from '../../../services/activity.service';
import { Activity } from '../../../models/user.model';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.scss']
})
export class ActivityDetailComponent implements OnInit {
  activity: Activity | null = null;
  isLoading = true;
  activityId: string = '';

  constructor(
    private activityService: ActivityService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.activityId = params['id'];
      this.loadActivity();
    });
  }

  loadActivity() {
    this.isLoading = true;
    this.activityService.getActivity(this.activityId).subscribe({
      next: (activity) => {
        this.activity = activity;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading activity:', error);
        this.isLoading = false;
        // For demo purposes, create a mock activity if API fails
        this.createMockActivity();
      }
    });
  }

  getInstructions(): string[] {
    if (!this.activity) return [];
    
    // Return different instructions based on activity type
    switch (this.activity.type) {
      case 'pronunciation_challenge':
        return [
          'Listen to the audio pronunciation',
          'Practice saying the words out loud',
          'Record your pronunciation',
          'Compare with the original and get feedback'
        ];
      case 'picture_description':
        return [
          'Look carefully at the picture',
          'Think about what you see',
          'Describe the picture in English',
          'Use complete sentences'
        ];
      case 'virtual_conversation':
        return [
          'Read the conversation scenario',
          'Think about your responses',
          'Practice speaking naturally',
          'Respond to the virtual character'
        ];
      case 'role_play':
        return [
          'Read your role and scenario',
          'Understand the situation',
          'Practice your lines',
          'Act out the role play'
        ];
      case 'story_creation':
        return [
          'Choose a topic or use the prompt',
          'Plan your story structure',
          'Tell your story out loud',
          'Record your creative story'
        ];
      case 'singing_chanting':
        return [
          'Listen to the song or chant',
          'Learn the words and rhythm',
          'Practice singing along',
          'Record your performance'
        ];
      default:
        return [
          'Read the activity instructions',
          'Prepare your response',
          'Complete the speaking task',
          'Submit your work'
        ];
    }
  }

  startActivity() {
    if (this.activity) {
      // Navigate to the interactive activity runner
      this.router.navigate(['/student/activities', this.activity.id, 'start']);
    }
  }

  goBack() {
    this.router.navigate(['/student/activities']);
  }

  private createMockActivity() {
    // Create a mock activity based on the ID for demo purposes
    this.activity = {
      id: this.activityId,
      title: 'First Steps - Say Hello',
      description: 'Practice basic greetings in English with interactive pronunciation exercises',
      type: 'pronunciation_challenge',
      difficulty: 'beginner',
      skillArea: 'pronunciation',
      pointsReward: 10,
      minLevel: 1,
      isActive: true,
      order: 1
    };
  }
}