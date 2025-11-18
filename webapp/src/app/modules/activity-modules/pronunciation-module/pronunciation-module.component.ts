/**
 * Pronunciation Challenge Module
 *
 * Example implementation of an activity module using the modular system.
 * This demonstrates how to create a new activity type without modifying core code.
 */

import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseActivityModuleComponent } from '../base-activity-module.component';
import { StageSubmissionData, StageResult } from '../../../models/activity-module.interface';
import { SpeechService } from '../../../services/speech.service';

interface PronunciationWord {
  word: string;
  phonetic?: string;
  audioUrl?: string;
}

@Component({
  selector: 'app-pronunciation-module',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pronunciation-module.component.html',
  styleUrls: ['./pronunciation-module.component.scss']
})
export class PronunciationModuleComponent extends BaseActivityModuleComponent {
  // Module-specific state
  words: PronunciationWord[] = [];
  currentWord: PronunciationWord | null = null;

  // Speech recognition
  isRecording = false;
  isPlaying = false;
  recordingTime = 0;
  private speechRecognition: any;
  private recordingTimer: any;

  // Feedback from last attempt
  lastFeedback: any = null;
  showingFeedback = false;

  // Track if user has listened to current word
  hasListenedToCurrentWord = false;

  constructor(
    private ngZone: NgZone,
    private speechService: SpeechService
  ) {
    super();
  }

  /**
   * Initialize the module
   */
  initialize(): void {
    console.log('🎤 Initializing Pronunciation Module', this.config);

    // Extract words from content
    this.words = this.extractWordsFromContent();

    // Set total stages based on number of words
    this.config.totalStages = this.words.length;

    // Load first word
    this.loadCurrentWord();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopRecording();
    this.stopAudio();

    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }
  }

  /**
   * Extract words from activity content
   */
  private extractWordsFromContent(): PronunciationWord[] {
    const content = this.config.content;

    // Handle different content formats
    if (content?.words && Array.isArray(content.words)) {
      return content.words.map((item: any) => {
        if (typeof item === 'string') {
          return { word: item };
        } else if (typeof item === 'object') {
          return {
            word: item.word || '',
            phonetic: item.phonetic,
            audioUrl: item.audioUrl
          };
        }
        return { word: '' };
      }).filter((w: PronunciationWord) => w.word);
    }

    // Fallback: default words
    return [
      { word: 'Hello', phonetic: '/həˈloʊ/' },
      { word: 'Thank you', phonetic: '/θæŋk ju/' },
      { word: 'Goodbye', phonetic: '/ɡʊdˈbaɪ/' }
    ];
  }

  /**
   * Load current word based on stage
   */
  private loadCurrentWord(): void {
    const index = this.currentStage - 1;
    if (index >= 0 && index < this.words.length) {
      this.currentWord = this.words[index];
      this.lastFeedback = null;
      this.showingFeedback = false;
      this.hasListenedToCurrentWord = false; // Reset for new word
    }
  }

  /**
   * Override: Called when stage changes
   */
  protected override onStageChanged(): void {
    this.loadCurrentWord();
  }

  /**
   * Override: Get total stages
   */
  protected override getTotalStages(): number {
    return this.words.length;
  }

  /**
   * Play target audio for current word
   */
  playAudio(): void {
    if (this.isPlaying) {
      this.stopAudio();
      return;
    }

    if (!this.currentWord) return;

    this.isPlaying = true;
    this.hasListenedToCurrentWord = true; // Mark that user has listened

    // Use shared speech service with child-friendly settings
    this.speechService.speak(
      this.currentWord.word,
      () => {
        // On end
        this.ngZone.run(() => {
          this.isPlaying = false;
        });
      },
      () => {
        // On error
        this.ngZone.run(() => {
          this.isPlaying = false;
        });
      }
    );
  }

  /**
   * Stop audio playback
   */
  stopAudio(): void {
    this.speechService.stop();
    this.isPlaying = false;
  }

  /**
   * Start recording pronunciation
   */
  startRecording(): void {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
        return;
      }

      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang = 'en-US';
      this.speechRecognition.maxAlternatives = 1;

      this.speechRecognition.onstart = () => {
        this.ngZone.run(() => {
          this.isRecording = true;
          this.recordingTime = 0;

          this.recordingTimer = setInterval(() => {
            this.ngZone.run(() => {
              this.recordingTime++;
            });
          }, 1000);
        });
      };

      this.speechRecognition.onresult = (event: any) => {
        this.ngZone.run(() => {
          const result = event.results[0];
          if (result.isFinal) {
            const transcript = result[0].transcript;
            const confidence = result[0].confidence;
            this.handleRecordingComplete(transcript, confidence);
          }
        });
      };

      this.speechRecognition.onerror = (event: any) => {
        this.ngZone.run(() => {
          console.error('Speech recognition error:', event.error);
          this.isRecording = false;

          if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
          }

          let errorMessage = 'Speech recognition failed. Please try again.';
          if (event.error === 'no-speech') {
            errorMessage = 'No speech detected. Please try speaking again.';
          } else if (event.error === 'not-allowed') {
            errorMessage = 'Microphone access denied. Please enable microphone permissions.';
          }
          alert(errorMessage);
        });
      };

      this.speechRecognition.onend = () => {
        this.ngZone.run(() => {
          this.isRecording = false;

          if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
          }
        });
      };

      this.speechRecognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }

    this.isRecording = false;

    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }
  }

  /**
   * Handle recording completion
   */
  private handleRecordingComplete(transcript: string, confidence: number): void {
    if (!this.currentWord) return;

    // Submit this stage
    this.submitStage({
      transcript,
      confidence,
      targetWord: this.currentWord.word,
      recordingTime: this.recordingTime
    });
  }

  /**
   * Override: Process stage result
   * This is where we score the pronunciation attempt
   */
  protected override async processStageResult(data: StageSubmissionData): Promise<StageResult> {
    const submissionContent = data.submissionContent;
    const targetWord = submissionContent.targetWord.toLowerCase().trim();
    const spokenWord = submissionContent.transcript.toLowerCase().trim();
    const confidence = submissionContent.confidence;

    // Calculate score
    let score = Math.round(confidence * 100);

    // Boost score if words match
    if (spokenWord.includes(targetWord) || targetWord.includes(spokenWord)) {
      score = Math.max(score, 85);
    } else {
      score = Math.max(30, score - 20);
    }

    // Generate feedback with confidence percentage
    const feedback = this.generateStageFeedback(score, targetWord, spokenWord, confidence);

    // Store for display - MUST run in Angular zone for UI update
    this.ngZone.run(() => {
      this.lastFeedback = feedback;
      this.showingFeedback = true;

      console.log('💾 lastFeedback set to:', this.lastFeedback);
      console.log('🔍 Confidence value:', this.lastFeedback.confidence);
    });

    // IMPORTANT: Wait 2 seconds before resolving so base component doesn't auto-advance immediately
    // This gives user time to see the feedback
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('⏰ 2 seconds passed, ready to advance');

    return {
      stageNumber: data.stageNumber,
      score,
      feedback,
      processingResult: {
        transcript: submissionContent.transcript,
        confidence,
        matched: spokenWord.includes(targetWord)
      }
    };
  }

  /**
   * Generate stage-specific feedback
   */
  private generateStageFeedback(score: number, targetWord: string, spokenWord: string, confidence: number): any {
    const suggestions: string[] = [];
    const confidencePercent = Math.round(confidence * 100);

    console.log('📊 Generating feedback:', {
      rawConfidence: confidence,
      confidencePercent,
      score,
      targetWord,
      spokenWord
    });

    if (score < 80) {
      suggestions.push('Try speaking more clearly');
      suggestions.push('Practice the word slowly first');
      if (targetWord !== spokenWord) {
        suggestions.push(`You said "${spokenWord}", try saying "${targetWord}"`);
      }
    }

    const feedback = {
      score,
      confidence: confidencePercent,
      message: score >= 80 ? 'Great pronunciation!' : 'Keep practicing!',
      encouragement: score >= 80 ? 'You\'re doing excellent!' : 'You\'re improving!',
      suggestions,
      transcript: spokenWord,
      target: targetWord
    };

    console.log('✅ Feedback object:', feedback);
    return feedback;
  }

  /**
   * Get score color class
   */
  getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'needs-improvement';
  }
}
