import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PersonalizedPracticeService, PersonalizedRecommendations, SkillAnalysis, GeneratedPractice } from '../../services/personalized-practice.service';

@Component({
  selector: 'app-personalized-recommendations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personalized-recommendations.component.html',
  styleUrls: ['./personalized-recommendations.component.scss']
})
export class PersonalizedRecommendationsComponent implements OnInit {
  // State
  isLoading = true;
  error: string | null = null;
  recommendations: PersonalizedRecommendations | null = null;

  // UI helpers
  Math = Math;

  constructor(
    private personalizedPracticeService: PersonalizedPracticeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecommendations();
  }

  /**
   * Load personalized recommendations from API
   */
  loadRecommendations(): void {
    this.isLoading = true;
    this.error = null;

    this.personalizedPracticeService.getRecommendations().subscribe({
      next: (response) => {
        if (response.success) {
          this.recommendations = response.data;
          console.log('📊 Personalized Recommendations Loaded:', this.recommendations);
        } else {
          this.error = 'Failed to load recommendations';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading recommendations:', err);
        this.error = 'Failed to load personalized recommendations. Please try again.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Refresh recommendations (regenerate with AI)
   */
  refreshRecommendations(): void {
    if (confirm('Generate new personalized recommendations? This will use AI to analyze your current progress.')) {
      this.loadRecommendations();
    }
  }

  /**
   * Start a suggested practice activity
   */
  startPractice(practice: GeneratedPractice): void {
    // TODO: Navigate to activity or create temporary activity
    console.log('Starting practice:', practice);
    alert(`Starting "${practice.title}"...\n\nThis feature will be implemented to start the AI-generated practice!`);
  }

  /**
   * Get color class for skill weakness level
   */
  getWeaknessLevelClass(level: string): string {
    switch (level) {
      case 'critical': return 'critical';
      case 'moderate': return 'moderate';
      case 'minor': return 'minor';
      case 'none': return 'excellent';
      default: return '';
    }
  }

  /**
   * Get color class for skill weakness level (badge variant)
   */
  getWeaknessLevelBadge(level: string): string {
    switch (level) {
      case 'critical': return 'badge-critical';
      case 'moderate': return 'badge-moderate';
      case 'minor': return 'badge-minor';
      case 'none': return 'badge-excellent';
      default: return '';
    }
  }

  /**
   * Get label for weakness level
   */
  getWeaknessLevelLabel(level: string): string {
    switch (level) {
      case 'critical': return 'Needs Focus';
      case 'moderate': return 'Improving';
      case 'minor': return 'Good';
      case 'none': return 'Excellent';
      default: return level;
    }
  }

  /**
   * Get icon for trend
   */
  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '';
    }
  }

  /**
   * Get color class for trend
   */
  getTrendClass(trend: string): string {
    switch (trend) {
      case 'improving': return 'trend-improving';
      case 'declining': return 'trend-declining';
      case 'stable': return 'trend-stable';
      default: return '';
    }
  }

  /**
   * Get icon for practice type
   */
  getPracticeTypeIcon(type: string): string {
    switch (type) {
      case 'conversation_prompt': return '💬';
      case 'pronunciation': return '🗣️';
      case 'vocabulary': return '📚';
      case 'quiz': return '✏️';
      default: return '📝';
    }
  }

  /**
   * Get label for practice type
   */
  getPracticeTypeLabel(type: string): string {
    switch (type) {
      case 'conversation_prompt': return 'AI Conversation';
      case 'pronunciation': return 'Pronunciation';
      case 'vocabulary': return 'Vocabulary';
      case 'quiz': return 'Quiz';
      default: return type;
    }
  }

  /**
   * Get color for skill area
   */
  getSkillAreaColor(skillArea: string): string {
    switch (skillArea.toLowerCase()) {
      case 'fluency': return '#667eea';
      case 'pronunciation': return '#f56565';
      case 'vocabulary': return '#48bb78';
      case 'confidence': return '#ed8936';
      default: return '#718096';
    }
  }

  /**
   * Navigate back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/student']);
  }
}
