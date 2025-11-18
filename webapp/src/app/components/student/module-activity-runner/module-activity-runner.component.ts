/**
 * Module Activity Runner Component
 *
 * This component dynamically loads and runs activity modules based on the activity type.
 * It's the NEW modular way of running activities (alternative to start-activity.component.ts)
 *
 * Usage:
 * - Navigate to: /student/module-activities/:id/start
 * - Component loads activity data
 * - Checks registry for module type
 * - Dynamically loads and displays the appropriate module
 * - Handles module events (completion, exit)
 */

import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  Type
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ActivityService } from '../../../services/activity.service';
import { ActivitySessionService, ActivitySession } from '../../../services/activity-session.service';
import { ActivityModuleRegistryService } from '../../../services/activity-module-registry.service';
import { Activity } from '../../../models/user.model';
import {
  ActivityModuleConfig,
  ActivityModuleResult,
  ActivityModuleComponent,
  StageSubmissionData
} from '../../../models/activity-module.interface';

@Component({
  selector: 'app-module-activity-runner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './module-activity-runner.component.html',
  styleUrls: ['./module-activity-runner.component.scss']
})
export class ModuleActivityRunnerComponent implements OnInit, OnDestroy {
  @ViewChild('moduleContainer', { read: ViewContainerRef }) moduleContainer!: ViewContainerRef;

  activity: Activity | null = null;
  session: ActivitySession | null = null;
  isLoading = true;
  errorMessage = '';
  activityId = '';

  // Dynamic module reference
  private moduleComponentRef: ComponentRef<any> | null = null;

  // Completion modal
  showCompletionModal = false;
  completionResult: ActivityModuleResult | null = null;
  confettiArray: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService,
    private activitySessionService: ActivitySessionService,
    private moduleRegistry: ActivityModuleRegistryService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.activityId = params['id'];
      this.loadActivity();
    });
  }

  ngOnDestroy(): void {
    this.cleanupModule();
  }

  /**
   * Load activity from API and start session
   */
  loadActivity(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Start session instead of just loading activity
    this.activitySessionService.startSession(this.activityId).subscribe({
      next: (session) => {
        this.session = session;
        this.activity = session.activity;
        this.activitySessionService.setCurrentSession(session);

        console.log('✅ Session started:', session.id);
        this.checkAndLoadModule();
      },
      error: (error) => {
        console.error('Error starting session:', error);
        this.errorMessage = 'Failed to start activity session. Please try again.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Check if module exists for this activity type and load it
   */
  private checkAndLoadModule(): void {
    if (!this.activity) {
      this.errorMessage = 'Activity data is missing';
      this.isLoading = false;
      return;
    }

    // Check if module is registered
    const module = this.moduleRegistry.getModule(this.activity.type);

    if (!module) {
      // Module not found - show error with helpful message
      this.errorMessage = `Activity type "${this.activity.type}" is not yet available in the modular system. ` +
        `This activity will use the old system instead.`;
      this.isLoading = false;

      // Could redirect to old start-activity component here
      // this.router.navigate(['/student/activities', this.activityId, 'start']);
      return;
    }

    // Module found! Load it dynamically
    this.loadModuleComponent(module.component);
  }

  /**
   * Dynamically load the module component
   */
  private loadModuleComponent(componentType: Type<any>): void {
    if (!this.moduleContainer || !this.activity) {
      this.errorMessage = 'Cannot load module: container not ready';
      this.isLoading = false;
      return;
    }

    try {
      // Clear any existing component
      this.moduleContainer.clear();

      // Create the component dynamically
      this.moduleComponentRef = this.moduleContainer.createComponent(componentType);

      // Prepare module configuration
      const config: ActivityModuleConfig = {
        activityId: this.activity.id,
        activityType: this.activity.type,
        title: this.activity.title,
        description: this.activity.description,
        difficulty: this.activity.difficulty as any,
        skillArea: this.activity.skillArea,
        pointsReward: this.activity.pointsReward,
        content: this.activity.content,
        currentStage: 1,
        totalStages: this.calculateTotalStages()
      };

      // Set the config on the module
      this.moduleComponentRef.instance.config = config;

      // Subscribe to module events
      this.subscribeToModuleEvents();

      this.isLoading = false;

      console.log(`✅ Module loaded successfully: ${this.activity.type}`);
    } catch (error) {
      console.error('Error loading module component:', error);
      this.errorMessage = 'Failed to load activity module. Please try again.';
      this.isLoading = false;
    }
  }

  /**
   * Subscribe to events emitted by the module
   */
  private subscribeToModuleEvents(): void {
    if (!this.moduleComponentRef) return;

    const instance = this.moduleComponentRef.instance;

    // Listen for stage completion (EventEmitter from BaseActivityModuleComponent)
    if (instance.stageComplete && instance.stageComplete.subscribe) {
      instance.stageComplete.subscribe((data: StageSubmissionData) => {
        this.handleStageComplete(data);
      });
    }

    // Listen for activity completion (EventEmitter from BaseActivityModuleComponent)
    if (instance.activityComplete && instance.activityComplete.subscribe) {
      instance.activityComplete.subscribe((result: ActivityModuleResult) => {
        this.handleActivityComplete(result);
      });
    }

    // Listen for exit request (EventEmitter from BaseActivityModuleComponent)
    if (instance.activityExit && instance.activityExit.subscribe) {
      instance.activityExit.subscribe(() => {
        this.handleExit();
      });
    }

    // Listen for errors
    if (instance.error && instance.error.subscribe) {
      instance.error.subscribe((message: string) => {
        this.errorMessage = message;
      });
    }
  }

  /**
   * Handle stage completion from module
   */
  private handleStageComplete(data: StageSubmissionData): void {
    console.log('Stage completed:', data);
    // Could send to backend here if needed
  }

  /**
   * Handle activity completion from module
   */
  private handleActivityComplete(result: ActivityModuleResult): void {
    console.log('Activity completed:', result);

    this.completionResult = result;

    // Generate confetti
    this.generateConfetti();

    // Show completion modal
    this.showCompletionModal = true;

    // Send completion to backend
    if (this.session) {
      const completionData = {
        finalScore: result.score,
        score: result.score, // Backup field
        pointsEarned: result.totalPointsEarned,
        totalTime: result.timeSpent,
        timeSpent: result.timeSpent, // Backup field
        stagesCompleted: result.stagesCompleted,
        stageResults: result.submissionData,
        submissionData: result.submissionData, // Backup field
        feedback: result.feedback,
        completedAt: result.completedAt
      };

      console.log('📤 Sending completion to backend:', completionData);

      this.activitySessionService.completeSession(this.session.id, completionData).subscribe({
        next: (response) => {
          console.log('✅ Activity completion saved to database:', response);

          // Update student points in UI if needed
          if (response.student) {
            // Could update local student data here
          }
        },
        error: (error) => {
          console.error('❌ Error saving completion:', error);
          // Don't show error to user, they already completed the activity
          // But log it for debugging
        }
      });
    } else {
      console.warn('⚠️ No session found, cannot save completion');
    }
  }

  /**
   * Handle exit request from module
   */
  private handleExit(): void {
    this.router.navigate(['/student/activities']);
  }

  /**
   * Calculate total stages (if not provided by content)
   */
  private calculateTotalStages(): number {
    if (!this.activity || !this.activity.content) return 1;

    const content = this.activity.content;

    // Try to infer from content structure
    if (content.words && Array.isArray(content.words)) {
      return content.words.length;
    }

    if (content.questions && Array.isArray(content.questions)) {
      return content.questions.length;
    }

    if (content.vocabulary && Array.isArray(content.vocabulary)) {
      const itemsPerRound = content.itemsPerRound || 4;
      return Math.ceil(content.vocabulary.length / itemsPerRound);
    }

    return 1; // Default
  }

  /**
   * Cleanup module on destroy
   */
  private cleanupModule(): void {
    if (this.moduleComponentRef) {
      this.moduleComponentRef.destroy();
      this.moduleComponentRef = null;
    }
  }

  /**
   * Generate confetti for celebration
   */
  private generateConfetti(): void {
    this.confettiArray = [];
    for (let i = 0; i < 50; i++) {
      this.confettiArray.push({
        id: i,
        left: Math.random() * 100 + '%',
        animationDelay: Math.random() * 3 + 's',
        backgroundColor: this.getRandomColor()
      });
    }
  }

  /**
   * Get random color for confetti
   */
  private getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Close completion modal
   */
  closeCompletionModal(): void {
    this.showCompletionModal = false;
  }

  /**
   * Try activity again
   */
  tryAgain(): void {
    this.showCompletionModal = false;
    this.loadActivity(); // Reload the activity
  }

  /**
   * Go to activities list
   */
  goToActivities(): void {
    this.router.navigate(['/student/activities']);
  }

  /**
   * Get achievement level based on score
   */
  getAchievementLevel(): string {
    if (!this.completionResult) return 'bronze';
    if (this.completionResult.score >= 90) return 'gold';
    if (this.completionResult.score >= 75) return 'silver';
    return 'bronze';
  }

  /**
   * Get achievement icon
   */
  getAchievementIcon(): string {
    if (!this.completionResult) return '🏆';
    if (this.completionResult.score >= 95) return '🏆';
    if (this.completionResult.score >= 85) return '🥇';
    if (this.completionResult.score >= 75) return '🥈';
    return '🥉';
  }

  /**
   * Get completion title
   */
  getCompletionTitle(): string {
    if (!this.completionResult) return 'Activity Complete!';
    if (this.completionResult.score >= 95) return '🌟 Outstanding Performance!';
    if (this.completionResult.score >= 85) return '🎉 Excellent Work!';
    if (this.completionResult.score >= 75) return '👏 Great Job!';
    if (this.completionResult.score >= 60) return '👍 Good Effort!';
    return '💪 Keep Practicing!';
  }
}
