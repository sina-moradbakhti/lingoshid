/**
 * Speech Service
 *
 * Centralized service for text-to-speech functionality across the application.
 * Provides child-friendly voice settings optimized for elementary school students.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private selectedVoice: SpeechSynthesisVoice | null = null;

  // Child-friendly speech settings
  private readonly SPEECH_RATE = 0.5;  // Slower for children learning
  private readonly SPEECH_PITCH = 1.6; // Higher pitch for softer, friendlier sound
  private readonly SPEECH_VOLUME = 1.0;

  constructor() {
    this.loadChildFriendlyVoice();
  }

  /**
   * Load a child-friendly voice (soft, clear, preferably female)
   */
  private loadChildFriendlyVoice(): void {
    if ('speechSynthesis' in window) {
      // Voices might not be loaded immediately
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        console.log('🔊 Available voices:', voices.map(v => `${v.name} (${v.lang})`));

        // Priority 1: Look for child-friendly voices by name
        let voice = voices.find(v =>
          v.lang.startsWith('en') && (
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('karen') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('child')
          )
        );

        // Priority 2: Look for US English female voices
        if (!voice) {
          voice = voices.find(v =>
            v.lang === 'en-US' &&
            (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman'))
          );
        }

        // Priority 3: Any US English voice (preferably not male)
        if (!voice) {
          voice = voices.find(v =>
            v.lang === 'en-US' &&
            !v.name.toLowerCase().includes('male')
          );
        }

        // Priority 4: Any English voice
        if (!voice) {
          voice = voices.find(v => v.lang.startsWith('en'));
        }

        // Fallback: First available voice
        if (!voice && voices.length > 0) {
          voice = voices[0];
        }

        if (voice) {
          this.selectedVoice = voice;
          console.log('✅ Selected voice for children:', voice.name, voice.lang);
        } else {
          console.warn('⚠️ No suitable voice found, will use default');
        }
      };

      // Load voices
      loadVoices();

      // Some browsers need this event
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Speak text using child-friendly voice and settings
   *
   * @param text - Text to speak
   * @param onEnd - Optional callback when speech ends
   * @param onError - Optional callback on error
   * @returns Promise that resolves when speech completes
   */
  speak(text: string, onEnd?: () => void, onError?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        console.error('Speech synthesis not supported');
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = this.SPEECH_RATE;
      utterance.pitch = this.SPEECH_PITCH;
      utterance.volume = this.SPEECH_VOLUME;

      // Use child-friendly voice if available
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        console.log('🗣️ Using voice:', this.selectedVoice.name);
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        if (onError) onError();
        reject(event);
      };

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stop any ongoing speech
   */
  stop(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    if ('speechSynthesis' in window) {
      return speechSynthesis.speaking;
    }
    return false;
  }

  /**
   * Get current speech settings (for display or debugging)
   */
  getSettings() {
    return {
      rate: this.SPEECH_RATE,
      pitch: this.SPEECH_PITCH,
      volume: this.SPEECH_VOLUME,
      voice: this.selectedVoice?.name || 'Default'
    };
  }
}
