/**
 * Vocabulary Matching Module
 *
 * Example of an image/word matching activity module.
 * Shows how to handle visual content and drag-drop or tap-to-match interactions.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseActivityModuleComponent } from '../base-activity-module.component';
import { StageSubmissionData, StageResult } from '../../../models/activity-module.interface';

interface VocabularyItem {
  word: string;
  imageUrl?: string;
  audioUrl?: string;
  translation?: string;
  category?: string;
}

interface MatchPair {
  word: string;
  imageUrl: string;
  id: string;
}

interface VocabularyMatchContent {
  vocabulary: VocabularyItem[];
  itemsPerRound?: number;
  showTranslations?: boolean;
}

@Component({
  selector: 'app-vocabulary-match-module',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vocabulary-match-module.component.html',
  styleUrls: ['./vocabulary-match-module.component.scss']
})
export class VocabularyMatchModuleComponent extends BaseActivityModuleComponent {
  // Vocabulary data
  allVocabulary: VocabularyItem[] = [];
  currentPairs: MatchPair[] = [];

  // Shuffled arrays for matching
  words: { text: string; id: string; matched: boolean }[] = [];
  images: { url: string; id: string; matched: boolean }[] = [];

  // Game state
  selectedWord: string | null = null;
  selectedImage: string | null = null;
  matchedPairs = 0;
  totalPairs = 0;
  attempts = 0;
  errors = 0;

  // Settings
  itemsPerRound = 4;
  showTranslations = false;

  // Animation
  showCorrectFeedback = false;
  showIncorrectFeedback = false;
  currentFeedbackPair: { word: string; image: string } | null = null;

  /**
   * Initialize the module
   */
  initialize(): void {
    console.log('🎯 Initializing Vocabulary Match Module', this.config);

    // Extract vocabulary content
    const content = this.config.content as VocabularyMatchContent;
    this.allVocabulary = content?.vocabulary || this.getDefaultVocabulary();
    this.itemsPerRound = content?.itemsPerRound || 4;
    this.showTranslations = content?.showTranslations || false;

    // Calculate total stages (rounds)
    const totalItems = this.allVocabulary.length;
    this.config.totalStages = Math.ceil(totalItems / this.itemsPerRound);

    // Load first round
    this.loadCurrentRound();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Nothing to clean up
  }

  /**
   * Get default vocabulary for testing
   */
  private getDefaultVocabulary(): VocabularyItem[] {
    return [
      {
        word: 'Cat',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
        translation: 'گربه',
        category: 'Animals'
      },
      {
        word: 'Dog',
        imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop',
        translation: 'سگ',
        category: 'Animals'
      },
      {
        word: 'Apple',
        imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop',
        translation: 'سیب',
        category: 'Fruits'
      },
      {
        word: 'Book',
        imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop',
        translation: 'کتاب',
        category: 'Objects'
      },
      {
        word: 'Tree',
        imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&h=300&fit=crop',
        translation: 'درخت',
        category: 'Nature'
      },
      {
        word: 'Sun',
        imageUrl: 'https://images.unsplash.com/photo-1590533277856-d50fa5d53b69?w=400&h=300&fit=crop',
        translation: 'خورشید',
        category: 'Nature'
      }
    ];
  }

  /**
   * Load current round of vocabulary
   */
  private loadCurrentRound(): void {
    const startIndex = (this.currentStage - 1) * this.itemsPerRound;
    const endIndex = Math.min(startIndex + this.itemsPerRound, this.allVocabulary.length);

    const roundVocab = this.allVocabulary.slice(startIndex, endIndex);

    // Create match pairs
    this.currentPairs = roundVocab.map((item, index) => ({
      word: item.word,
      imageUrl: item.imageUrl || '',
      id: `pair-${startIndex + index}`
    }));

    this.totalPairs = this.currentPairs.length;
    this.matchedPairs = 0;
    this.attempts = 0;
    this.errors = 0;

    // Create shuffled word and image arrays
    this.words = this.shuffleArray(
      this.currentPairs.map(pair => ({
        text: pair.word,
        id: pair.id,
        matched: false
      }))
    );

    this.images = this.shuffleArray(
      this.currentPairs.map(pair => ({
        url: pair.imageUrl,
        id: pair.id,
        matched: false
      }))
    );

    this.selectedWord = null;
    this.selectedImage = null;
  }

  /**
   * Override: Called when stage changes
   */
  protected override onStageChanged(newStage: number): void {
    this.loadCurrentRound();
  }

  /**
   * Override: Get total stages
   */
  protected override getTotalStages(): number {
    return Math.ceil(this.allVocabulary.length / this.itemsPerRound);
  }

  /**
   * Select a word
   */
  selectWord(wordId: string): void {
    const word = this.words.find(w => w.id === wordId);
    if (!word || word.matched) return;

    this.selectedWord = wordId;

    // Check for match if image is already selected
    if (this.selectedImage) {
      this.checkMatch();
    }
  }

  /**
   * Select an image
   */
  selectImage(imageId: string): void {
    const image = this.images.find(img => img.id === imageId);
    if (!image || image.matched) return;

    this.selectedImage = imageId;

    // Check for match if word is already selected
    if (this.selectedWord) {
      this.checkMatch();
    }
  }

  /**
   * Check if selected word and image match
   */
  private checkMatch(): void {
    if (!this.selectedWord || !this.selectedImage) return;

    this.attempts++;

    // Check if IDs match
    if (this.selectedWord === this.selectedImage) {
      // Correct match!
      this.handleCorrectMatch();
    } else {
      // Incorrect match
      this.handleIncorrectMatch();
    }
  }

  /**
   * Handle correct match
   */
  private handleCorrectMatch(): void {
    if (!this.selectedWord || !this.selectedImage) return;

    // Mark as matched
    const word = this.words.find(w => w.id === this.selectedWord);
    const image = this.images.find(img => img.id === this.selectedImage);

    if (word && image) {
      word.matched = true;
      image.matched = true;
      this.matchedPairs++;

      // Show feedback
      this.showCorrectFeedback = true;
      this.currentFeedbackPair = {
        word: word.text,
        image: image.url
      };

      setTimeout(() => {
        this.showCorrectFeedback = false;
        this.currentFeedbackPair = null;

        // Check if round is complete
        if (this.matchedPairs >= this.totalPairs) {
          this.completeRound();
        }
      }, 1500);
    }

    // Reset selections
    this.selectedWord = null;
    this.selectedImage = null;
  }

  /**
   * Handle incorrect match
   */
  private handleIncorrectMatch(): void {
    this.errors++;

    // Show feedback
    this.showIncorrectFeedback = true;

    setTimeout(() => {
      this.showIncorrectFeedback = false;

      // Reset selections
      this.selectedWord = null;
      this.selectedImage = null;
    }, 1000);
  }

  /**
   * Complete current round
   */
  private completeRound(): void {
    const accuracy = this.totalPairs > 0
      ? Math.round((this.totalPairs / this.attempts) * 100)
      : 100;

    // Submit stage data
    this.submitStage({
      roundNumber: this.currentStage,
      totalPairs: this.totalPairs,
      matchedPairs: this.matchedPairs,
      attempts: this.attempts,
      errors: this.errors,
      accuracy,
      timeSpent: Math.floor((Date.now() - this.stageStartTime) / 1000)
    });
  }

  /**
   * Override: Process stage result
   */
  protected override async processStageResult(data: StageSubmissionData): Promise<StageResult> {
    const submissionContent = data.submissionContent;
    const accuracy = submissionContent.accuracy || 0;

    // Score based on accuracy and speed
    let score = accuracy;

    // Bonus for perfect round (no errors)
    if (submissionContent.errors === 0) {
      score = Math.min(100, score + 10);
    }

    // Generate feedback
    const feedback = this.generateRoundFeedback(score, submissionContent);

    return {
      stageNumber: data.stageNumber,
      score,
      feedback,
      processingResult: {
        accuracy: submissionContent.accuracy,
        attempts: submissionContent.attempts,
        errors: submissionContent.errors
      }
    };
  }

  /**
   * Generate round-specific feedback
   */
  private generateRoundFeedback(score: number, submissionContent: any): any {
    const suggestions: string[] = [];

    if (submissionContent.errors > 2) {
      suggestions.push('Take your time to match carefully');
      suggestions.push('Look at the images closely before matching');
    }

    if (score < 70) {
      suggestions.push('Review the vocabulary words');
      suggestions.push('Practice with picture flashcards');
    }

    return {
      score,
      message: score >= 90 ? 'Excellent matching!' : score >= 70 ? 'Good work!' : 'Keep practicing!',
      encouragement: score >= 90 ? 'You know these words well!' : 'You\'re learning!',
      suggestions,
      summary: `${submissionContent.matchedPairs} matches with ${submissionContent.errors} errors`
    };
  }

  /**
   * Utility: Shuffle array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get CSS class for word button
   */
  getWordClass(wordId: string): string {
    const word = this.words.find(w => w.id === wordId);
    if (!word) return '';

    if (word.matched) return 'matched';
    if (this.selectedWord === wordId) return 'selected';
    return '';
  }

  /**
   * Get CSS class for image button
   */
  getImageClass(imageId: string): string {
    const image = this.images.find(img => img.id === imageId);
    if (!image) return '';

    if (image.matched) return 'matched';
    if (this.selectedImage === imageId) return 'selected';
    return '';
  }

  /**
   * Get progress stats
   */
  getMatchProgress(): string {
    return `${this.matchedPairs}/${this.totalPairs}`;
  }

  /**
   * Get accuracy percentage for current round
   */
  getAccuracy(): number {
    return this.attempts > 0
      ? Math.round((this.matchedPairs / this.attempts) * 100)
      : 100;
  }
}
