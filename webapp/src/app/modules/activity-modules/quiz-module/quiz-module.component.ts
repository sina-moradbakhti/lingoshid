/**
 * Quiz Challenge Module
 *
 * Example of a text-based activity module for multiple-choice questions.
 * Shows a different pattern from the audio-based pronunciation module.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseActivityModuleComponent } from '../base-activity-module.component';
import { StageSubmissionData, StageResult } from '../../../models/activity-module.interface';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation?: string;
  category?: string;
}

interface QuizContent {
  questions: QuizQuestion[];
  passingScore?: number; // e.g., 70%
  showExplanations?: boolean;
  shuffleQuestions?: boolean;
}

@Component({
  selector: 'app-quiz-module',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-module.component.html',
  styleUrls: ['./quiz-module.component.scss']
})
export class QuizModuleComponent extends BaseActivityModuleComponent {
  // Quiz-specific state
  questions: QuizQuestion[] = [];
  currentQuestion: QuizQuestion | null = null;
  selectedAnswer: number | null = null;
  isAnswerSubmitted = false;
  isCorrect = false;
  showExplanation = false;

  // Quiz settings
  passingScore = 70;
  showExplanations = true;

  // Statistics
  correctAnswers = 0;
  incorrectAnswers = 0;

  /**
   * Initialize the quiz module
   */
  initialize(): void {
    console.log('📝 Initializing Quiz Module', this.config);

    // Extract quiz content
    const content = this.config.content as QuizContent;
    this.questions = content?.questions || this.getDefaultQuestions();
    this.passingScore = content?.passingScore || 70;
    this.showExplanations = content?.showExplanations !== false;

    // Shuffle questions if requested
    if (content?.shuffleQuestions) {
      this.shuffleArray(this.questions);
    }

    // Set total stages
    this.config.totalStages = this.questions.length;

    // Load first question
    this.loadCurrentQuestion();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Nothing to clean up for quiz module
  }

  /**
   * Get default questions for testing
   */
  private getDefaultQuestions(): QuizQuestion[] {
    return [
      {
        question: 'What is the past tense of "go"?',
        options: ['goed', 'went', 'gone', 'going'],
        correctAnswer: 1,
        explanation: 'The past tense of "go" is "went". "Gone" is the past participle.',
        category: 'Grammar'
      },
      {
        question: 'Which word is a noun?',
        options: ['run', 'happy', 'cat', 'quickly'],
        correctAnswer: 2,
        explanation: 'A noun is a person, place, or thing. "Cat" is a thing, so it\'s a noun.',
        category: 'Parts of Speech'
      },
      {
        question: 'What does "delicious" mean?',
        options: ['Very tasty', 'Very big', 'Very fast', 'Very loud'],
        correctAnswer: 0,
        explanation: '"Delicious" means very tasty or pleasant to taste.',
        category: 'Vocabulary'
      }
    ];
  }

  /**
   * Load current question based on stage
   */
  private loadCurrentQuestion(): void {
    const index = this.currentStage - 1;
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestion = this.questions[index];
      this.selectedAnswer = null;
      this.isAnswerSubmitted = false;
      this.isCorrect = false;
      this.showExplanation = false;
    }
  }

  /**
   * Override: Called when stage changes
   */
  protected override onStageChanged(newStage: number): void {
    this.loadCurrentQuestion();
  }

  /**
   * Override: Get total stages
   */
  protected override getTotalStages(): number {
    return this.questions.length;
  }

  /**
   * Select an answer option
   */
  selectAnswer(optionIndex: number): void {
    if (this.isAnswerSubmitted) return;
    this.selectedAnswer = optionIndex;
  }

  /**
   * Submit the selected answer
   */
  submitAnswer(): void {
    if (this.selectedAnswer === null || this.isAnswerSubmitted || !this.currentQuestion) {
      return;
    }

    this.isAnswerSubmitted = true;
    this.isCorrect = this.selectedAnswer === this.currentQuestion.correctAnswer;

    // Update statistics
    if (this.isCorrect) {
      this.correctAnswers++;
    } else {
      this.incorrectAnswers++;
    }

    // Show explanation if enabled and answer is wrong
    if (this.showExplanations && !this.isCorrect && this.currentQuestion.explanation) {
      this.showExplanation = true;
    }

    // Submit stage data
    this.submitStage({
      questionIndex: this.currentStage - 1,
      selectedAnswer: this.selectedAnswer,
      correctAnswer: this.currentQuestion.correctAnswer,
      isCorrect: this.isCorrect,
      question: this.currentQuestion.question,
      category: this.currentQuestion.category,
      timeSpent: Math.floor((Date.now() - this.stageStartTime) / 1000)
    });
  }

  /**
   * Move to next question
   */
  nextQuestion(): void {
    if (this.currentStage < this.getTotalStages()) {
      this.currentStage++;
      this.loadCurrentQuestion();
      this.stageStartTime = Date.now();
    } else {
      // All questions answered, complete the quiz
      this.completeActivity();
    }
  }

  /**
   * Override: Process stage result
   */
  protected override async processStageResult(data: StageSubmissionData): Promise<StageResult> {
    const submissionContent = data.submissionContent;
    const isCorrect = submissionContent.isCorrect;

    // Score: 100 for correct, 0 for incorrect
    const score = isCorrect ? 100 : 0;

    // Generate feedback
    const feedback = this.generateQuizFeedback(score, submissionContent);

    return {
      stageNumber: data.stageNumber,
      score,
      feedback,
      processingResult: {
        isCorrect,
        selectedAnswer: submissionContent.selectedAnswer,
        correctAnswer: submissionContent.correctAnswer,
        category: submissionContent.category
      }
    };
  }

  /**
   * Generate question-specific feedback
   */
  private generateQuizFeedback(score: number, submissionContent: any): any {
    const suggestions: string[] = [];

    if (score === 0) {
      suggestions.push('Review the material for this topic');
      if (submissionContent.category) {
        suggestions.push(`Focus on studying ${submissionContent.category}`);
      }
    }

    return {
      score,
      message: score === 100 ? '✓ Correct!' : '✗ Incorrect',
      encouragement: score === 100 ? 'Great job!' : 'Keep practicing!',
      suggestions,
      isCorrect: score === 100
    };
  }

  /**
   * Override: Calculate final result with quiz-specific logic
   */
  protected override calculateFinalResult(): any {
    const totalQuestions = this.stageResults.length;
    const correctCount = this.stageResults.filter(r => r.score === 100).length;
    const percentageScore = Math.round((correctCount / totalQuestions) * 100);

    // Check if passed
    const passed = percentageScore >= this.passingScore;

    const basePoints = Math.floor((percentageScore / 100) * this.config.pointsReward);
    const bonusPoints = this.calculateQuizBonus(percentageScore, passed);
    const totalPoints = basePoints + bonusPoints;

    return {
      score: percentageScore,
      timeSpent: this.totalTimeSpent,
      stagesCompleted: totalQuestions,
      basePoints,
      bonusPoints,
      totalPointsEarned: totalPoints,
      submissionData: {
        totalQuestions,
        correctAnswers: correctCount,
        incorrectAnswers: totalQuestions - correctCount,
        percentageScore,
        passed,
        stageResults: this.stageResults,
        activityType: this.config.activityType
      },
      feedback: this.generateQuizFinalFeedback(percentageScore, passed, correctCount, totalQuestions),
      sessionId: this.config.sessionId,
      completedAt: new Date()
    };
  }

  /**
   * Calculate bonus points for quiz
   */
  private calculateQuizBonus(percentageScore: number, passed: boolean): number {
    let bonus = 0;

    // Perfect score bonus
    if (percentageScore === 100) {
      bonus += Math.floor(this.config.pointsReward * 0.5);
    }

    // First attempt bonus (if completed quickly)
    const avgTimePerQuestion = this.totalTimeSpent / this.questions.length;
    if (avgTimePerQuestion < 30) { // Less than 30 seconds per question
      bonus += Math.floor(this.config.pointsReward * 0.2);
    }

    // Passing bonus
    if (passed && percentageScore >= 90) {
      bonus += Math.floor(this.config.pointsReward * 0.1);
    }

    return bonus;
  }

  /**
   * Generate final quiz feedback
   */
  private generateQuizFinalFeedback(
    percentageScore: number,
    passed: boolean,
    correctCount: number,
    totalQuestions: number
  ): any {
    let message = '';
    let encouragement = '';
    const suggestions: string[] = [];
    const strengths: string[] = [];

    if (percentageScore === 100) {
      message = 'Perfect Score! Outstanding!';
      encouragement = 'You mastered this material! Excellent work!';
      strengths.push('Complete understanding of all concepts');
    } else if (percentageScore >= 90) {
      message = 'Excellent Performance!';
      encouragement = 'You have a great understanding of the material!';
      strengths.push('Strong grasp of most concepts');
    } else if (percentageScore >= this.passingScore) {
      message = 'Good Job! You Passed!';
      encouragement = 'You demonstrated good understanding!';
      strengths.push('Good foundation in the material');
      suggestions.push('Review the questions you missed');
    } else if (percentageScore >= 50) {
      message = 'Keep Practicing!';
      encouragement = 'You\'re making progress! Study a bit more and try again.';
      suggestions.push('Review all the material carefully');
      suggestions.push('Focus on areas where you struggled');
    } else {
      message = 'More Practice Needed';
      encouragement = 'Don\'t give up! Learning takes time.';
      suggestions.push('Review the entire lesson');
      suggestions.push('Ask your teacher for help');
      suggestions.push('Try the easier difficulty first');
    }

    return {
      score: percentageScore,
      message,
      encouragement,
      suggestions,
      strengths,
      summary: `You answered ${correctCount} out of ${totalQuestions} questions correctly (${percentageScore}%)`,
      passed
    };
  }

  /**
   * Utility: Shuffle array
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Get CSS class for option button
   */
  getOptionClass(optionIndex: number): string {
    if (!this.isAnswerSubmitted) {
      return this.selectedAnswer === optionIndex ? 'selected' : '';
    }

    if (!this.currentQuestion) return '';

    const isCorrectOption = optionIndex === this.currentQuestion.correctAnswer;
    const isSelectedOption = optionIndex === this.selectedAnswer;

    if (isCorrectOption) {
      return 'correct';
    }

    if (isSelectedOption && !isCorrectOption) {
      return 'incorrect';
    }

    return 'disabled';
  }

  /**
   * Get statistics for display
   */
  getStatistics(): { correct: number; incorrect: number; total: number; percentage: number } {
    const total = this.stageResults.length;
    const correct = this.stageResults.filter(r => r.score === 100).length;
    const incorrect = total - correct;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { correct, incorrect, total, percentage };
  }
}
