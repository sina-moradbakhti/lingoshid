/**
 * Base Activity Module Component
 *
 * Abstract base class that all activity modules should extend.
 * Provides common functionality and enforces the module contract.
 */

import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import {
  ActivityModuleConfig,
  ActivityModuleResult,
  ActivityModuleComponent,
  StageSubmissionData,
  StageResult,
  ActivityFeedback
} from '../../models/activity-module.interface';

@Component({
  template: '' // This is abstract, no template needed
})
export abstract class BaseActivityModuleComponent implements ActivityModuleComponent, OnInit, OnDestroy {
  /**
   * INPUT: Module configuration from parent
   */
  @Input() config!: ActivityModuleConfig;

  /**
   * OUTPUTS: Events emitted by the module
   */
  @Output() stageComplete = new EventEmitter<StageSubmissionData>();
  @Output() activityComplete = new EventEmitter<ActivityModuleResult>();
  @Output() activityExit = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();

  /**
   * Common state management
   */
  protected currentStage = 1;
  protected stageResults: StageResult[] = [];
  protected startTime = Date.now();
  protected stageStartTime = Date.now();
  protected totalTimeSpent = 0;

  /**
   * Common UI state
   */
  public isLoading = false;
  public isProcessing = false;
  public errorMessage = '';

  constructor() {}

  ngOnInit(): void {
    this.validateConfig();
    this.initialize();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Validate the configuration received
   */
  private validateConfig(): void {
    if (!this.config) {
      throw new Error('Activity module config is required');
    }

    if (!this.config.activityId) {
      throw new Error('Activity ID is required in config');
    }

    if (!this.config.activityType) {
      throw new Error('Activity type is required in config');
    }

    // Call custom validation if implemented
    this.onConfigValidated();
  }

  /**
   * Abstract methods that child modules MUST implement
   */
  abstract initialize(): void;
  abstract cleanup(): void;

  /**
   * Optional lifecycle hooks for child modules
   */
  protected onConfigValidated(): void {
    // Override if needed
  }

  /**
   * Common method: Submit current stage
   */
  protected submitStage(submissionContent: any): void {
    const stageTime = Math.floor((Date.now() - this.stageStartTime) / 1000);

    const submission: StageSubmissionData = {
      stageNumber: this.currentStage,
      stageType: this.config.activityType,
      submissionContent,
      timeSpent: stageTime,
      timestamp: new Date()
    };

    this.onStageComplete(submission);
  }

  /**
   * Common method: Handle stage completion
   */
  public onStageComplete(data: StageSubmissionData): void {
    this.stageComplete.emit(data);

    // Process stage result (child class should override processStageResult)
    this.processStageResult(data).then(result => {
      this.stageResults.push(result);

      // Check if activity is complete
      if (this.isActivityComplete()) {
        this.completeActivity();
      } else {
        // Move to next stage
        this.nextStage();
      }
    }).catch(error => {
      console.error('Error processing stage:', error);
      this.error.emit(error.message);
    });
  }

  /**
   * Abstract: Process stage submission and return result
   * Child modules must implement their own scoring logic
   */
  protected abstract processStageResult(data: StageSubmissionData): Promise<StageResult>;

  /**
   * Check if all stages are complete
   */
  protected isActivityComplete(): boolean {
    const totalStages = this.config.totalStages || this.getTotalStages();
    return this.currentStage >= totalStages;
  }

  /**
   * Get total number of stages (override if dynamic)
   */
  protected getTotalStages(): number {
    return this.config.totalStages || 1;
  }

  /**
   * Move to next stage
   */
  protected nextStage(): void {
    this.currentStage++;
    this.stageStartTime = Date.now();
    this.onStageChanged(this.currentStage);
  }

  /**
   * Hook called when stage changes
   */
  protected onStageChanged(newStage: number): void {
    // Override if needed
  }

  /**
   * Complete the activity and emit result
   */
  protected completeActivity(): void {
    this.totalTimeSpent = Math.floor((Date.now() - this.startTime) / 1000);

    const result = this.calculateFinalResult();
    this.onActivityComplete(result);
  }

  /**
   * Calculate final activity result
   * Child modules can override for custom calculation
   */
  protected calculateFinalResult(): ActivityModuleResult {
    const averageScore = this.stageResults.length > 0
      ? this.stageResults.reduce((sum, r) => sum + r.score, 0) / this.stageResults.length
      : 0;

    const basePoints = Math.floor((averageScore / 100) * this.config.pointsReward);
    const bonusPoints = this.calculateBonusPoints(averageScore);
    const totalPoints = basePoints + bonusPoints;

    return {
      score: Math.round(averageScore),
      timeSpent: this.totalTimeSpent,
      stagesCompleted: this.stageResults.length,
      basePoints,
      bonusPoints,
      totalPointsEarned: totalPoints,
      submissionData: {
        stageResults: this.stageResults,
        activityType: this.config.activityType
      },
      feedback: this.generateFeedback(averageScore),
      sessionId: this.config.sessionId,
      completedAt: new Date()
    };
  }

  /**
   * Calculate bonus points based on performance
   * Override for custom bonus logic
   */
  protected calculateBonusPoints(averageScore: number): number {
    let bonus = 0;

    // Perfect score bonus
    if (averageScore === 100) {
      bonus += Math.floor(this.config.pointsReward * 0.5);
    } else if (averageScore >= 90) {
      bonus += Math.floor(this.config.pointsReward * 0.3);
    }

    // Speed bonus (if completed quickly)
    const expectedTime = this.getTotalStages() * 60; // 60 seconds per stage
    if (this.totalTimeSpent <= expectedTime * 0.7) {
      bonus += Math.floor(this.config.pointsReward * 0.2);
    }

    return bonus;
  }

  /**
   * Generate feedback based on score
   * Override for custom feedback
   */
  protected generateFeedback(score: number): ActivityFeedback {
    let message = '';
    let encouragement = '';
    const suggestions: string[] = [];

    if (score >= 90) {
      message = 'Outstanding performance!';
      encouragement = 'You nailed it! Keep up the excellent work!';
    } else if (score >= 75) {
      message = 'Great job!';
      encouragement = 'You\'re doing really well. Keep practicing!';
      suggestions.push('Try to improve your accuracy even more');
    } else if (score >= 60) {
      message = 'Good effort!';
      encouragement = 'You\'re making progress. Keep it up!';
      suggestions.push('Practice regularly to improve');
      suggestions.push('Focus on the areas where you struggled');
    } else {
      message = 'Keep practicing!';
      encouragement = 'Don\'t give up! Every attempt makes you better!';
      suggestions.push('Review the material before trying again');
      suggestions.push('Take your time and focus on accuracy');
      suggestions.push('Ask your teacher for help if needed');
    }

    return {
      score,
      message,
      encouragement,
      suggestions
    };
  }

  /**
   * Handle activity completion event
   */
  public onActivityComplete(result: ActivityModuleResult): void {
    this.activityComplete.emit(result);
  }

  /**
   * Handle exit event
   */
  public onActivityExit(): void {
    if (confirm('Are you sure you want to exit? Your progress may be lost.')) {
      this.activityExit.emit();
    }
  }

  /**
   * Common utility: Format time
   */
  protected formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Common utility: Get progress percentage
   */
  public getProgressPercentage(): number {
    const totalStages = this.getTotalStages();
    return Math.floor((this.currentStage / totalStages) * 100);
  }
}
