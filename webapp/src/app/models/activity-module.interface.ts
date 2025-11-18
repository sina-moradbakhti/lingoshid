/**
 * Activity Module System - Core Interfaces
 *
 * This defines the contract that ALL activity modules must follow.
 * Modules provide input (config) and return output (result) in a standardized way.
 */

import { Type } from '@angular/core';

/**
 * Base configuration that every activity module receives as INPUT
 */
export interface ActivityModuleConfig {
  activityId: string;
  activityType: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skillArea: string;
  pointsReward: number;
  content: any; // Module-specific content from database
  sessionId?: string;
  currentStage?: number;
  totalStages?: number;
}

/**
 * Standardized OUTPUT that every activity module must return
 */
export interface ActivityModuleResult {
  // Core metrics
  score: number; // 0-100
  timeSpent: number; // seconds
  stagesCompleted: number;

  // Points calculation
  basePoints: number;
  bonusPoints: number;
  totalPointsEarned: number;

  // Performance data
  submissionData: any; // Module-specific submission data

  // Feedback
  feedback?: ActivityFeedback;

  // Session tracking
  sessionId?: string;
  completedAt: Date;
}

/**
 * Feedback structure for student
 */
export interface ActivityFeedback {
  score: number;
  message: string;
  encouragement: string;
  suggestions: string[];
  strengths?: string[];
  improvements?: string[];
}

/**
 * Stage submission during activity execution
 */
export interface StageSubmissionData {
  stageNumber: number;
  stageType: string;
  submissionContent: any; // Module-specific (audio, text, etc.)
  timeSpent: number;
  timestamp: Date;
}

/**
 * Stage result after processing
 */
export interface StageResult {
  stageNumber: number;
  score: number;
  feedback: ActivityFeedback;
  processingResult?: any; // Module-specific processing result
}

/**
 * Base interface that all Activity Module Components must implement
 */
export interface ActivityModuleComponent {
  // Module receives configuration
  config: ActivityModuleConfig;

  // Module emits events
  onStageComplete: (data: StageSubmissionData) => void;
  onActivityComplete: (result: ActivityModuleResult) => void;
  onActivityExit: () => void;

  // Module lifecycle methods
  initialize(): void;
  cleanup(): void;
}

/**
 * Metadata about an activity module for the registry
 */
export interface ActivityModuleMetadata {
  type: string; // Activity type identifier
  name: string; // Human-readable name
  description: string;
  version: string;
  component: Type<any>; // Angular component class
  processor: Type<ActivityModuleProcessor>; // Backend processor class reference
  supportedFeatures: string[]; // e.g., ['audio', 'video', 'text']
  minLevel?: number;
  maxLevel?: number;
}

/**
 * Interface for backend processors (TypeScript reference only)
 * Actual implementation will be in NestJS backend
 */
export interface ActivityModuleProcessor {
  processStage(
    stageData: StageSubmissionData,
    activityContent: any
  ): Promise<StageResult>;

  calculateFinalScore(
    stageResults: StageResult[],
    config: ActivityModuleConfig
  ): Promise<ActivityModuleResult>;

  generateFeedback(
    score: number,
    activityType: string
  ): ActivityFeedback;
}

/**
 * Module validation schema
 */
export interface ActivityModuleValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Module capabilities declaration
 */
export interface ActivityModuleCapabilities {
  requiresAudio: boolean;
  requiresVideo: boolean;
  requiresInternet: boolean;
  supportsOffline: boolean;
  estimatedDuration: number; // seconds
  averageStages: number;
}
