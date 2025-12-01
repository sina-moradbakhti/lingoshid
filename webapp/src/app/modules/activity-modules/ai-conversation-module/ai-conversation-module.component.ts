/**
 * AI Conversation Module
 *
 * Chat-based conversation practice with AI feedback and evaluation.
 * Students practice English through natural conversations with age-appropriate AI responses.
 */

import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseActivityModuleComponent } from '../base-activity-module.component';
import { StageSubmissionData, StageResult } from '../../../models/activity-module.interface';
import { AiConversationService, ConversationEvaluation } from '../../../services/ai-conversation.service';

interface ChatMessage {
  role: 'student' | 'ai';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-conversation-module',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-conversation-module.component.html',
  styleUrls: ['./ai-conversation-module.component.scss']
})
export class AiConversationModuleComponent extends BaseActivityModuleComponent {
  // Conversation state
  sessionId: string | null = null;
  messages: ChatMessage[] = [];
  userMessage: string = '';
  isAiTyping = false;
  conversationStarted = false;
  conversationEnded = false;

  // Activity content
  scenario: string = '';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  customInstructions?: string;

  // Evaluation
  evaluation: ConversationEvaluation | null = null;
  pointsEarned: number = 0;
  showEvaluation = false;

  // UI state
  isInitializing = true;
  messageInputDisabled = false;

  constructor(
    private ngZone: NgZone,
    private aiConversationService: AiConversationService
  ) {
    super();
  }

  /**
   * Initialize the module
   */
  initialize(): void {
    console.log('💬 Initializing AI Conversation Module', this.config);

    // Extract conversation settings from content
    const content = this.config.content;
    this.scenario = content?.scenario || 'making_friends';
    this.difficultyLevel = content?.difficultyLevel || 'beginner';
    this.customInstructions = content?.customInstructions;

    // Set total stages to 1 (conversation is single-stage)
    this.config.totalStages = 1;

    // Start the conversation
    this.startAiConversation();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Nothing to clean up for AI conversation
  }

  /**
   * Start AI conversation
   */
  private startAiConversation(): void {
    this.isInitializing = true;
    this.isLoading = true;

    this.aiConversationService.startConversation({
      scenario: this.scenario,
      difficultyLevel: this.difficultyLevel,
      activityId: this.config.activityId
    }).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.sessionId = response.data.sessionId;
          this.conversationStarted = true;
          this.isInitializing = false;
          this.isLoading = false;

          // Add AI's first message
          this.addMessage('ai', response.data.firstMessage);

          console.log('✅ Conversation started:', this.sessionId);
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('❌ Error starting conversation:', error);
          this.isInitializing = false;
          this.isLoading = false;
          this.errorMessage = 'Failed to start conversation. Please try again.';
          this.error.emit(this.errorMessage);
        });
      }
    });
  }

  /**
   * Send student message to AI
   */
  sendMessage(): void {
    if (!this.userMessage.trim() || !this.sessionId || this.messageInputDisabled) {
      return;
    }

    const userMsg = this.userMessage.trim();
    this.userMessage = ''; // Clear input immediately
    this.messageInputDisabled = true;
    this.isAiTyping = true;

    // Add student message to chat
    this.addMessage('student', userMsg);

    // Send to AI
    this.aiConversationService.sendMessage({
      sessionId: this.sessionId,
      message: userMsg
    }).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          // Add AI response
          this.addMessage('ai', response.data.aiResponse);

          // Update turn count
          this.currentStage = response.data.turnCount;

          // Check if conversation should end
          if (response.data.shouldEnd) {
            setTimeout(() => {
              this.endConversationAndEvaluate();
            }, 1000);
          } else {
            this.isAiTyping = false;
            this.messageInputDisabled = false;
          }
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('❌ Error sending message:', error);
          this.isAiTyping = false;
          this.messageInputDisabled = false;
          this.errorMessage = 'Failed to send message. Please try again.';
        });
      }
    });
  }

  /**
   * Add message to chat
   */
  private addMessage(role: 'student' | 'ai', content: string): void {
    this.messages.push({
      role,
      content,
      timestamp: new Date()
    });

    // Auto-scroll to bottom
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  /**
   * Scroll chat to bottom
   */
  private scrollToBottom(): void {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  /**
   * End conversation manually
   */
  endConversationManually(): void {
    if (confirm('End conversation now and see your evaluation?')) {
      this.endConversationAndEvaluate();
    }
  }

  /**
   * End conversation and get evaluation
   */
  private endConversationAndEvaluate(): void {
    if (!this.sessionId) return;

    this.isProcessing = true;
    this.messageInputDisabled = true;

    this.aiConversationService.endConversation(this.sessionId).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.evaluation = response.data.evaluation;
          this.pointsEarned = response.data.pointsEarned;
          this.conversationEnded = true;
          this.showEvaluation = true;
          this.isProcessing = false;

          console.log('✅ Conversation ended. Evaluation:', this.evaluation);

          // Complete the activity
          this.completeWithEvaluation();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error('❌ Error ending conversation:', error);
          this.isProcessing = false;
          this.errorMessage = 'Failed to get evaluation. Please try again.';
        });
      }
    });
  }

  /**
   * Complete activity with AI evaluation
   */
  private completeWithEvaluation(): void {
    if (!this.evaluation) return;

    // Create submission data for stage
    const submissionData: StageSubmissionData = {
      stageNumber: 1,
      stageType: this.config.activityType,
      submissionContent: {
        sessionId: this.sessionId,
        messageCount: this.messages.length,
        studentMessages: this.messages.filter(m => m.role === 'student').map(m => m.content),
        aiMessages: this.messages.filter(m => m.role === 'ai').map(m => m.content),
        evaluation: this.evaluation
      },
      timeSpent: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date()
    };

    // Process and complete
    this.processStageResult(submissionData).then(result => {
      this.stageResults.push(result);
      this.completeActivity();
    });
  }

  /**
   * Override: Process stage result
   */
  protected override async processStageResult(data: StageSubmissionData): Promise<StageResult> {
    const evaluation = data.submissionContent.evaluation as ConversationEvaluation;

    return {
      stageNumber: data.stageNumber,
      score: evaluation.overallScore,
      feedback: {
        score: evaluation.overallScore,
        message: this.getEvaluationMessage(evaluation.overallScore),
        encouragement: this.getEncouragement(evaluation.conversationQuality),
        suggestions: evaluation.suggestions,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements
      },
      processingResult: {
        evaluation,
        messageCount: data.submissionContent.messageCount
      }
    };
  }

  /**
   * Override: Calculate final result
   */
  protected override calculateFinalResult(): any {
    if (!this.evaluation) {
      return super.calculateFinalResult();
    }

    const score = this.evaluation.overallScore;
    const basePoints = this.pointsEarned;
    const bonusPoints = 0; // Already calculated by backend

    return {
      score,
      timeSpent: this.totalTimeSpent,
      stagesCompleted: 1,
      basePoints,
      bonusPoints,
      totalPointsEarned: this.pointsEarned,
      submissionData: {
        sessionId: this.sessionId,
        messageCount: this.messages.length,
        evaluation: this.evaluation,
        activityType: this.config.activityType
      },
      feedback: {
        score,
        message: this.getEvaluationMessage(score),
        encouragement: this.getEncouragement(this.evaluation.conversationQuality),
        suggestions: this.evaluation.suggestions,
        strengths: this.evaluation.strengths,
        improvements: this.evaluation.improvements,
        detailedScores: {
          grammar: this.evaluation.grammarScore,
          vocabulary: this.evaluation.vocabularyScore,
          coherence: this.evaluation.coherenceScore,
          fluency: this.evaluation.fluencyScore
        },
        grammarMistakes: this.evaluation.grammarMistakes,
        vocabularyUsed: this.evaluation.vocabularyUsed
      },
      sessionId: this.config.sessionId,
      completedAt: new Date()
    };
  }

  /**
   * Get evaluation message based on score
   */
  getEvaluationMessage(score: number): string {
    if (score >= 90) return 'Outstanding conversation!';
    if (score >= 75) return 'Great conversation!';
    if (score >= 60) return 'Good effort!';
    return 'Keep practicing!';
  }

  /**
   * Get encouragement based on quality
   */
  getEncouragement(quality: string): string {
    switch (quality) {
      case 'excellent':
        return 'You had an excellent conversation! Your English is very good!';
      case 'good':
        return 'You did well! Keep practicing to improve even more!';
      case 'needs_improvement':
        return 'Good try! With more practice, you\'ll get better!';
      default:
        return 'Keep going! Every conversation helps you learn!';
    }
  }

  /**
   * Get score class for styling
   */
  getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'needs-improvement';
  }

  /**
   * Handle Enter key in message input
   */
  onMessageKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Retry conversation (restart)
   */
  retryConversation(): void {
    if (confirm('Start a new conversation?')) {
      // Reset state
      this.sessionId = null;
      this.messages = [];
      this.userMessage = '';
      this.isAiTyping = false;
      this.conversationStarted = false;
      this.conversationEnded = false;
      this.evaluation = null;
      this.pointsEarned = 0;
      this.showEvaluation = false;
      this.messageInputDisabled = false;
      this.errorMessage = '';

      // Restart
      this.startAiConversation();
    }
  }
}
