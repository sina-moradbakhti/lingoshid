import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ActivityService } from '../../../services/activity.service';
import { ActivitySessionService, ActivitySession } from '../../../services/activity-session.service';
import { AuthService } from '../../../services/auth.service';
import { Activity } from '../../../models/user.model';

@Component({
  selector: 'app-enhanced-start-activity',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="activity-runner">
      <!-- Header with Progress -->
      <div class="activity-header">
        <button (click)="exitActivity()" class="exit-btn" [class.disabled]="isProcessing">
          ← Exit Activity
        </button>
        <div class="activity-info" *ngIf="currentSession">
          <h2>{{ currentSession.activity.title }}</h2>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progressPercentage"></div>
            </div>
            <span class="progress-text">{{ currentSession.currentStage }}/{{ currentSession.totalStages }}</span>
          </div>
        </div>
        <div class="score-display" *ngIf="currentSession">
          <span class="points">{{ currentSession.pointsEarned }} pts</span>
          <span class="score">{{ currentSession.currentScore }}%</span>
        </div>
      </div>

      <!-- Session Status Bar -->
      <div class="status-bar" *ngIf="currentSession">
        <div class="status-item">
          <span class="status-icon">⏱️</span>
          <span>{{ getFormattedTime(currentSession.timeSpent) }}</span>
        </div>
        <div class="status-item" *ngIf="isRecording">
          <div class="recording-indicator">
            <div class="pulse"></div>
            <span>Recording {{ recordingTime }}s</span>
          </div>
        </div>
        <div class="status-item" *ngIf="isListening">
          <span class="processing-indicator">
            <div class="spinner-small"></div>
            <span>Listening...</span>
          </span>
        </div>
      </div>

      <!-- Activity Content -->
      <div class="activity-content" *ngIf="currentSession && !isLoading">

        <!-- Pronunciation Challenge -->
        <div *ngIf="currentSession.activity.type === 'pronunciation_challenge'" class="pronunciation-activity">
          <div class="stage-header">
            <h3>🗣️ Pronunciation Challenge - Stage {{ currentSession.currentStage }}</h3>
            <p>Listen carefully and repeat what you hear</p>
          </div>

          <div class="pronunciation-content">
            <div class="target-word">
              <h4>{{ getCurrentWord() }}</h4>
              <p class="phonetic" *ngIf="getCurrentPhonetic()">{{ getCurrentPhonetic() }}</p>
            </div>

            <div class="audio-controls">
              <button (click)="playTargetAudio()" class="play-btn" [class.playing]="isPlaying">
                {{ isPlaying ? '⏸️ Stop' : '🔊 Listen' }}
              </button>
            </div>

            <div class="recording-section">
              <button
                (click)="toggleRecording()"
                class="record-btn"
                [class.recording]="isRecording"
                [disabled]="isProcessing">
                {{ isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording' }}
              </button>
            </div>

            <!-- Real-time Feedback -->
            <div class="feedback-section" *ngIf="lastStageFeedback">
              <div class="score-card" [class]="lastStageFeedback.level">
                <div class="score-value">{{ lastStageFeedback.score }}%</div>
                <div class="score-text">{{ lastStageFeedback.message }}</div>
                <div class="audio-feedback" *ngIf="lastStageFeedback.audioFeedback">
                  <p><strong>What you said:</strong> "{{ lastStageFeedback.audioFeedback.transcription }}"</p>
                  <div class="pronunciation-tips" *ngIf="lastStageFeedback.audioFeedback.pronunciationTips.length > 0">
                    <p><strong>Tips:</strong></p>
                    <ul>
                      <li *ngFor="let tip of lastStageFeedback.audioFeedback.pronunciationTips">{{ tip }}</li>
                    </ul>
                  </div>
                </div>
                <div class="encouragement">{{ lastStageFeedback.encouragement }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Picture Description -->
        <div *ngIf="currentSession.activity.type === 'picture_description'" class="picture-activity">
          <div class="stage-header">
            <h3>🖼️ Picture Description - Stage {{ currentSession.currentStage }}</h3>
            <p>Describe what you see in the picture</p>
          </div>

          <div class="picture-content">
            <div class="picture-display">
              <img [src]="getCurrentPicture()" [alt]="'Picture ' + currentSession.currentStage" class="activity-image">
            </div>

            <div class="description-prompt">
              <h4>{{ getCurrentPrompt() }}</h4>
              <p class="helper-text">Use complete sentences and describe colors, objects, and actions you see.</p>
            </div>

            <div class="recording-section">
              <button
                (click)="toggleRecording()"
                class="record-btn large"
                [class.recording]="isRecording"
                [disabled]="isProcessing">
                {{ isRecording ? '⏹️ Stop Recording' : '🎤 Describe the Picture' }}
              </button>
            </div>

            <div class="vocabulary-hints" *ngIf="!isRecording && getCurrentVocabulary().length > 0">
              <h5>Helpful Words:</h5>
              <div class="word-chips">
                <span class="word-chip" *ngFor="let word of getCurrentVocabulary()">{{ word }}</span>
              </div>
            </div>

            <!-- Real-time Feedback -->
            <div class="feedback-section" *ngIf="lastStageFeedback">
              <div class="description-feedback">
                <div class="score-value">{{ lastStageFeedback.score }}%</div>
                <div class="transcription" *ngIf="lastStageFeedback.audioFeedback">
                  <p><strong>Your description:</strong></p>
                  <p class="transcription-text">"{{ lastStageFeedback.audioFeedback.transcription }}"</p>
                </div>
                <div class="feedback-message">{{ lastStageFeedback.message }}</div>
                <div class="suggestions" *ngIf="lastStageFeedback.suggestions.length > 0">
                  <p><strong>Suggestions:</strong></p>
                  <ul>
                    <li *ngFor="let suggestion of lastStageFeedback.suggestions">{{ suggestion }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Virtual Conversation -->
        <div *ngIf="currentSession.activity.type === 'virtual_conversation'" class="conversation-activity">
          <div class="stage-header">
            <h3>💬 Virtual Conversation - Stage {{ currentSession.currentStage }}</h3>
            <p>Have a conversation with {{ getCurrentCharacter().name }}</p>
          </div>

          <div class="conversation-content">
            <div class="character-display">
              <div class="avatar">{{ getCurrentCharacter().avatar }}</div>
              <h4>{{ getCurrentCharacter().name }}</h4>
              <p class="character-bio">{{ getCurrentCharacter().bio }}</p>
            </div>

            <div class="conversation-history">
              <div class="message"
                   *ngFor="let message of conversationHistory"
                   [class]="message.sender">
                <div class="message-content">{{ message.text }}</div>
                <div class="message-time">{{ message.timestamp | date:'short' }}</div>
              </div>
            </div>

            <div class="conversation-controls">
              <div class="current-prompt" *ngIf="currentConversationPrompt">
                <p><strong>{{ getCurrentCharacter().name }} says:</strong></p>
                <p class="character-speech">{{ currentConversationPrompt }}</p>
                <button (click)="playConversationAudio()" class="play-small-btn">🔊</button>
              </div>

              <div class="response-section">
                <button
                  (click)="toggleRecording()"
                  class="record-btn conversation"
                  [class.recording]="isRecording"
                  [disabled]="isProcessing">
                  {{ isRecording ? '⏹️ Stop' : '🎤 Respond' }}
                </button>
              </div>
            </div>

            <!-- Real-time Conversation Feedback -->
            <div class="feedback-section" *ngIf="lastStageFeedback">
              <div class="conversation-feedback">
                <div class="score-display">
                  <span class="fluency-score">Fluency: {{ getScoreComponent('fluency') }}%</span>
                  <span class="accuracy-score">Accuracy: {{ getScoreComponent('accuracy') }}%</span>
                </div>
                <div class="transcription" *ngIf="lastStageFeedback.audioFeedback">
                  <p><strong>Your response:</strong></p>
                  <p class="transcription-text">"{{ lastStageFeedback.audioFeedback.transcription }}"</p>
                </div>
                <div class="feedback-message">{{ lastStageFeedback.message }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Controls -->
        <div class="activity-navigation">
          <button
            (click)="previousStage()"
            class="nav-btn"
            [disabled]="currentSession.currentStage <= 1 || isProcessing">
            ← Previous
          </button>

          <button
            (click)="nextStage()"
            class="nav-btn primary"
            [disabled]="!canProceed() || isProcessing">
            {{ currentSession.currentStage >= currentSession.totalStages ? 'Complete Activity' : 'Next →' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="isLoading">
        <div class="spinner">🎮</div>
        <p>{{ loadingMessage }}</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="!isLoading && !currentSession && errorMessage">
        <div class="error-icon">❌</div>
        <h3>{{ errorMessage }}</h3>
        <p>Please try again or go back to activities.</p>
        <button (click)="goBack()" class="retry-btn">Go Back</button>
      </div>

      <!-- Completion Modal -->
      <div class="completion-modal" *ngIf="showCompletionModal" (click)="closeCompletionModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="completion-header">
            <h2>🎉 Activity Complete!</h2>
            <p>Great job on completing {{ currentSession?.activity?.title }}!</p>
          </div>

          <div class="completion-stats" *ngIf="completionResult">
            <div class="stat-item">
              <div class="stat-value">{{ completionResult.finalScore || completionResult.score || 0 }}%</div>
              <div class="stat-label">Final Score</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ completionResult.pointsEarned }}</div>
              <div class="stat-label">Points Earned</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ getFormattedTime(completionResult.timeSpent) }}</div>
              <div class="stat-label">Time Spent</div>
            </div>
          </div>

          <div class="detailed-feedback" *ngIf="completionResult?.message">
            <h3>Your Performance</h3>
            <p class="feedback-message">{{ completionResult.message }}</p>

            <div class="achievements" *ngIf="completionResult.achievements?.length > 0">
              <h4>🏆 New Achievements!</h4>
              <div class="achievement-list">
                <div class="achievement-item" *ngFor="let achievement of completionResult.achievements">
                  {{ achievement.icon }} {{ achievement.name }}
                </div>
              </div>
            </div>

            <div class="improvement-tips" *ngIf="completionResult.improvement?.length > 0">
              <h4>💡 Tips for Improvement</h4>
              <ul>
                <li *ngFor="let tip of completionResult.improvement">{{ tip }}</li>
              </ul>
            </div>
          </div>

          <div class="completion-actions">
            <button (click)="tryAgain()" class="secondary-btn">Try Again</button>
            <button (click)="goToActivities()" class="primary-btn">Continue Learning</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Base styles from the original component */
    .activity-runner {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .activity-header {
      background: white;
      padding: 15px 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .exit-btn {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .exit-btn:hover:not(.disabled) {
      background: #5a6268;
    }

    .exit-btn.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .score-display {
      text-align: right;
      display: flex;
      gap: 10px;
    }

    .points, .score {
      background: #667eea;
      color: white;
      padding: 6px 10px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .score {
      background: #28a745;
    }

    /* Status Bar */
    .status-bar {
      background: #f8f9fa;
      padding: 8px 20px;
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 0.9rem;
      border-bottom: 1px solid #e9ecef;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .status-icon {
      font-size: 1rem;
    }

    .recording-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #dc3545;
      font-weight: 600;
    }

    .processing-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #17a2b8;
      font-weight: 600;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid #e9ecef;
      border-top: 2px solid #17a2b8;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Enhanced Feedback Sections */
    .feedback-section {
      margin-top: 30px;
      background: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .audio-feedback {
      margin-top: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .transcription-text {
      font-style: italic;
      color: #333;
      background: white;
      padding: 10px;
      border-radius: 5px;
      margin: 5px 0;
    }

    .pronunciation-tips ul,
    .improvement-tips ul {
      margin: 10px 0 0 0;
      padding-left: 20px;
    }

    .pronunciation-tips li,
    .improvement-tips li {
      margin-bottom: 5px;
      color: #666;
    }

    .description-feedback,
    .conversation-feedback {
      text-align: center;
    }

    .score-display {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 15px;
    }

    .fluency-score, .accuracy-score {
      background: #e9ecef;
      color: #495057;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    /* Enhanced completion modal */
    .detailed-feedback {
      margin: 20px 0;
      text-align: left;
    }

    .detailed-feedback h3, .detailed-feedback h4 {
      margin: 15px 0 10px 0;
      color: #333;
    }

    .feedback-message {
      color: #666;
      font-size: 1.1rem;
      margin: 10px 0;
    }

    .achievements {
      background: #fff3cd;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }

    .achievement-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }

    .achievement-item {
      background: white;
      padding: 8px 12px;
      border-radius: 15px;
      font-size: 0.9rem;
      font-weight: 600;
      color: #856404;
    }

    /* All other styles remain the same as original component */
    .activity-info {
      flex: 1;
      text-align: center;
      margin: 0 20px;
    }

    .activity-info h2 {
      margin: 0 0 10px 0;
      color: #667eea;
      font-size: 1.5rem;
    }

    .progress-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .progress-bar {
      background: #e9ecef;
      border-radius: 10px;
      height: 8px;
      width: 200px;
      overflow: hidden;
    }

    .progress-fill {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      height: 100%;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.9rem;
      color: #666;
      font-weight: 600;
    }

    .activity-content {
      flex: 1;
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
    }

    .stage-header {
      background: white;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      text-align: center;
    }

    .stage-header h3 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 1.5rem;
    }

    .stage-header p {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    /* All pronunciation, picture, conversation styles remain the same */
    .pronunciation-content, .picture-content, .conversation-content {
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .target-word {
      text-align: center;
      margin-bottom: 30px;
    }

    .target-word h4 {
      font-size: 2.5rem;
      margin: 0 0 10px 0;
      color: #667eea;
      font-weight: bold;
    }

    .phonetic {
      font-size: 1.2rem;
      color: #666;
      font-style: italic;
      margin: 0;
    }

    .audio-controls {
      text-align: center;
      margin-bottom: 30px;
    }

    .play-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .play-btn:hover {
      background: #218838;
      transform: translateY(-2px);
    }

    .play-btn.playing {
      background: #dc3545;
    }

    .recording-section {
      text-align: center;
      margin-bottom: 30px;
    }

    .record-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      min-width: 200px;
    }

    .record-btn:hover:not(:disabled) {
      background: #c82333;
      transform: translateY(-2px);
    }

    .record-btn.recording {
      background: #17a2b8;
      animation: pulse 1.5s infinite;
    }

    .record-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .record-btn.large {
      padding: 20px 40px;
      font-size: 1.2rem;
    }

    .record-btn.conversation {
      min-width: 150px;
      padding: 12px 20px;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .pulse {
      width: 12px;
      height: 12px;
      background: #dc3545;
      border-radius: 50%;
      animation: pulse 1s infinite;
    }

    .score-card {
      background: white;
      border: 3px solid #e9ecef;
      border-radius: 15px;
      padding: 20px;
      max-width: 400px;
      margin: 0 auto;
    }

    .score-card.excellent {
      border-color: #28a745;
      background: #d4edda;
    }

    .score-card.good {
      border-color: #ffc107;
      background: #fff3cd;
    }

    .score-card.needs-practice {
      border-color: #dc3545;
      background: #f8d7da;
    }

    .score-value {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 10px;
      text-align: center;
    }

    .score-text {
      font-size: 1.1rem;
      margin-bottom: 10px;
      text-align: center;
    }

    .encouragement {
      font-size: 0.9rem;
      color: #666;
      font-style: italic;
      text-align: center;
      margin-top: 10px;
    }

    /* Picture Description Styles */
    .picture-display {
      text-align: center;
      margin-bottom: 20px;
    }

    .activity-image {
      max-width: 100%;
      max-height: 300px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    .description-prompt {
      text-align: center;
      margin-bottom: 30px;
    }

    .description-prompt h4 {
      color: #333;
      margin: 0 0 10px 0;
      font-size: 1.3rem;
    }

    .helper-text {
      color: #666;
      margin: 0;
      font-size: 0.9rem;
    }

    .vocabulary-hints {
      margin-top: 20px;
      text-align: center;
    }

    .vocabulary-hints h5 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .word-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }

    .word-chip {
      background: #e9ecef;
      color: #495057;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* Virtual Conversation Styles */
    .character-display {
      text-align: center;
      margin-bottom: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .avatar {
      font-size: 3rem;
      margin-bottom: 10px;
    }

    .character-display h4 {
      margin: 0 0 5px 0;
      color: #333;
    }

    .character-bio {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .conversation-history {
      max-height: 200px;
      overflow-y: auto;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .message {
      margin-bottom: 15px;
      padding: 10px 15px;
      border-radius: 15px;
      max-width: 80%;
    }

    .message.character {
      background: #e3f2fd;
      margin-right: auto;
    }

    .message.user {
      background: #667eea;
      color: white;
      margin-left: auto;
    }

    .message-content {
      margin-bottom: 5px;
    }

    .message-time {
      font-size: 0.8rem;
      opacity: 0.7;
    }

    .current-prompt {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 15px;
      position: relative;
    }

    .character-speech {
      font-style: italic;
      margin: 5px 0;
      font-size: 1.1rem;
    }

    .play-small-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 0.8rem;
      position: absolute;
      top: 10px;
      right: 10px;
    }

    .response-section {
      text-align: center;
    }

    /* Navigation */
    .activity-navigation {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin-top: 30px;
      padding: 20px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .nav-btn {
      padding: 12px 24px;
      border: 2px solid #667eea;
      border-radius: 8px;
      background: white;
      color: #667eea;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      flex: 1;
      max-width: 200px;
    }

    .nav-btn:hover:not(:disabled) {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
    }

    .nav-btn.primary {
      background: #667eea;
      color: white;
    }

    .nav-btn.primary:hover:not(:disabled) {
      background: #5a6fd8;
    }

    .nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Loading and Error States */
    .loading, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .spinner {
      font-size: 4rem;
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    /* Completion Modal */
    .completion-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .completion-header h2 {
      margin: 0 0 10px 0;
      color: #667eea;
      font-size: 2rem;
    }

    .completion-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 30px 0;
    }

    .stat-item {
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
    }

    .completion-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .secondary-btn, .primary-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .secondary-btn {
      background: #6c757d;
      color: white;
    }

    .secondary-btn:hover {
      background: #5a6268;
    }

    .primary-btn {
      background: #667eea;
      color: white;
    }

    .primary-btn:hover {
      background: #5a6fd8;
    }

    .retry-btn {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .activity-header {
        flex-direction: column;
        gap: 10px;
        text-align: center;
      }

      .progress-bar {
        width: 150px;
      }

      .completion-stats {
        grid-template-columns: 1fr;
      }

      .completion-actions {
        flex-direction: column;
      }

      .activity-navigation {
        flex-direction: column;
      }

      .nav-btn {
        max-width: none;
      }

      .score-display {
        justify-content: center;
      }

      .status-bar {
        flex-wrap: wrap;
        gap: 10px;
      }
    }
  `]
})
export class StartActivityComponent implements OnInit, OnDestroy {
  currentSession: ActivitySession | null = null;
  isLoading = true;
  isProcessing = false;
  isPlaying = false;
  isRecording = false;
  recordingTime = 0;
  showCompletionModal = false;
  progressPercentage = 0;
  errorMessage = '';
  loadingMessage = 'Loading activity...';

  lastStageFeedback: any = null;
  completionResult: any = null;
  conversationHistory: any[] = [];
  currentConversationPrompt = '';

  // Speech recognition
  private speechRecognition?: any;
  private recognizedText = '';
  public isListening = false;
  private recordingTimer?: number;
  private sessionTimer?: number;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Celebration properties
  public confettiArray: any[] = [];

  // Mock data (will be replaced by real API data)
  private pronunciationWords = [
    { word: 'Hello', phonetic: '/həˈloʊ/' },
    { word: 'Thank you', phonetic: '/θæŋk ju/' },
    { word: 'Goodbye', phonetic: '/ɡʊdˈbaɪ/' },
    { word: 'Please', phonetic: '/pliːz/' },
    { word: 'Excuse me', phonetic: '/ɪkˈskjuːz mi/' }
  ];

  private pictureDescriptions = [
    {
      image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop',
      prompt: 'Describe the playground scene',
      vocabulary: ['swing', 'slide', 'children', 'playing', 'happy', 'colorful']
    },
    {
      image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
      prompt: 'Tell me about this family',
      vocabulary: ['mother', 'father', 'children', 'smiling', 'together', 'home']
    },
    {
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
      prompt: 'What do you see at this school?',
      vocabulary: ['students', 'teacher', 'classroom', 'books', 'learning', 'desk']
    }
  ];

  private conversationCharacters = [
    {
      name: 'Alex',
      avatar: '👦',
      bio: 'A friendly student who loves sports and music'
    },
    {
      name: 'Emma',
      avatar: '👧',
      bio: 'A curious girl who enjoys reading and art'
    }
  ];

  private conversationPrompts = [
    "Hi! What's your name?",
    "What do you like to do for fun?",
    "Do you have any hobbies?",
    "What's your favorite subject in school?",
    "Would you like to be friends?"
  ];

  constructor(
    private activityService: ActivityService,
    private activitySessionService: ActivitySessionService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Component initialization complete
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const activityId = params['id'];
      this.startNewSession(activityId);
    });

    // Subscribe to session updates
    const sessionSub = this.activitySessionService.currentSession$.subscribe(session => {
      if (session) {
        this.currentSession = session;
        this.updateProgress();
        this.updateConversationData();
      }
    });

    this.subscriptions.push(sessionSub);
  }

  ngOnDestroy() {
    this.stopAudio(); // Stop any playing audio
    this.cleanup();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private cleanup() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
    this.activitySessionService.clearCurrentSession();
  }

  async startNewSession(activityId: string) {
    try {
      this.isLoading = true;
      this.loadingMessage = 'Starting activity session...';

      const session = await this.activitySessionService.startSession(activityId).toPromise();
      this.currentSession = session!;
      this.activitySessionService.setCurrentSession(session!);

      this.updateProgress();
      this.initializeActivityData();
      this.startSessionTimer();

      this.isLoading = false;
    } catch (error) {
      console.error('Error starting session:', error);
      this.errorMessage = 'Failed to start activity session';
      this.isLoading = false;
    }
  }

  private startSessionTimer() {
    this.sessionTimer = window.setInterval(() => {
      if (this.currentSession) {
        this.currentSession.timeSpent++;
      }
    }, 1000);
  }

  private initializeActivityData() {
    if (!this.currentSession) return;

    switch (this.currentSession.activity.type) {
      case 'virtual_conversation':
        this.currentConversationPrompt = this.conversationPrompts[0];
        this.conversationHistory = [];
        break;
    }
  }

  private updateProgress() {
    if (!this.currentSession) return;
    this.progressPercentage = this.activitySessionService.calculateProgress(this.currentSession);
  }

  private updateConversationData() {
    if (!this.currentSession || this.currentSession.activity.type !== 'virtual_conversation') return;

    if (this.currentSession.currentStage <= this.conversationPrompts.length) {
      this.currentConversationPrompt = this.conversationPrompts[this.currentSession.currentStage - 1];
    }
  }

  async toggleRecording() {
    if (this.isRecording) {
      this.stopSpeechRecognition();
    } else {
      this.startSpeechRecognition();
    }
  }

  private startSpeechRecognition() {
    try {
      // Check if browser supports speech recognition
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
        this.isRecording = true;
        this.isListening = true;
        this.recognizedText = '';
        this.recordingTime = 0;

        // Start timer
        this.recordingTimer = window.setInterval(() => {
          this.recordingTime++;
        }, 1000);
      };

      this.speechRecognition.onresult = (event: any) => {
        const result = event.results[0];
        if (result.isFinal) {
          this.recognizedText = result[0].transcript;
          this.processSpeechAndAdvance(this.recognizedText, result[0].confidence);
        }
      };

      this.speechRecognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isRecording = false;
        this.isListening = false;
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
      };

      this.speechRecognition.onend = () => {
        this.isRecording = false;
        this.isListening = false;
        if (this.recordingTimer) {
          clearInterval(this.recordingTimer);
        }
      };

      this.speechRecognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  }

  private stopSpeechRecognition() {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
    this.isRecording = false;
    this.isListening = false;
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }
  }

  private async processSpeechAndAdvance(recognizedText: string, confidence: number) {
    try {
      if (!this.currentSession) return;

      // Calculate score based on speech recognition confidence and word matching
      let score = Math.round(confidence * 100);
      let feedback: string[] = [];

      if (this.currentSession.activity.type === 'pronunciation_challenge') {
        const targetWord = this.getCurrentWord().toLowerCase();
        const spokenWord = recognizedText.toLowerCase().trim();

        if (targetWord && spokenWord.includes(targetWord)) {
          score = Math.max(score, 80); // Boost score if word matches
          feedback.push('Great pronunciation!');
        } else {
          score = Math.max(30, score - 20); // Reduce score if word doesn't match
          feedback.push(`You said: "${recognizedText}". Try saying: "${targetWord}"`);
        }
      } else {
        // For other activities, use confidence as base score
        if (confidence > 0.8) {
          feedback.push('Excellent speech clarity!');
        } else if (confidence > 0.6) {
          feedback.push('Good speech recognition!');
        } else {
          feedback.push('Try speaking more clearly.');
        }
      }

      // Simulate stage completion with browser-based processing
      this.lastStageFeedback = {
        transcription: recognizedText,
        score: score,
        feedback: feedback,
        confidence: confidence
      };

      // Update session progress
      if (this.currentSession) {
        this.currentSession.currentScore += score;
        this.currentSession.pointsEarned += Math.round(score * 0.1);
        this.updateProgress();

        // Handle conversation history
        if (this.currentSession.activity.type === 'virtual_conversation') {
          this.addToConversationHistory('user', recognizedText);

          // Add mock response
          setTimeout(() => {
            const responses = [
              "That's really interesting! Tell me more.",
              "Nice! I like that too.",
              "How do you feel about that?",
              "Can you explain that in more detail?",
              "What else would you like to share?"
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.addToConversationHistory('system', randomResponse);

            // Speak the response
            this.speakText(randomResponse);
          }, 1000);
        }

        // Auto-advance to next stage or complete
        setTimeout(() => {
          if (this.currentSession && this.currentSession.currentStage < this.currentSession.totalStages) {
            this.nextStage();
          } else {
            this.completeActivity();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing speech:', error);
      alert('There was an error processing your speech. Please try again.');
    }
  }

  private addToConversationHistory(sender: string, text: string) {
    this.conversationHistory.push({
      sender,
      text,
      timestamp: new Date()
    });
  }

  private speakText(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      speechSynthesis.cancel(); // Cancel any ongoing speech
      speechSynthesis.speak(utterance);
    }
  }

  canProceed(): boolean {
    if (!this.currentSession) return false;
    return this.activitySessionService.hasStageData(this.currentSession, this.currentSession.currentStage);
  }

  async nextStage() {
    if (!this.currentSession) return;

    if (this.currentSession.currentStage >= this.currentSession.totalStages) {
      await this.completeActivity();
    } else {
      // Move to next stage
      this.currentSession.currentStage++;
      this.updateProgress();
      this.resetStageData();
      this.updateConversationData();
    }
  }

  previousStage() {
    if (!this.currentSession || this.currentSession.currentStage <= 1) return;

    this.currentSession.currentStage--;
    this.updateProgress();
    this.resetStageData();
    this.updateConversationData();
  }

  private resetStageData() {
    this.lastStageFeedback = null;
    this.recordingTime = 0;
  }

  private async completeActivity() {
    if (!this.currentSession) return;

    try {
      this.isProcessing = true;
      this.loadingMessage = 'Calculating results...';

      // Calculate comprehensive results locally
      const completionData = this.calculateActivityResults();
      console.log('Calculated completion data:', completionData);
      console.log('Current session:', this.currentSession);

      // Send completion to server (if available) or store locally
      try {
        const serverResult = await this.activitySessionService.completeSession(this.currentSession.id, completionData).toPromise();
        console.log('Server completion result:', serverResult);
        // Keep our local scoring, but merge any additional server fields
        this.completionResult = { ...completionData, ...serverResult };
      } catch (serverError) {
        console.warn('Server completion failed, using local calculation:', serverError);
        this.completionResult = completionData;
      }

      // Update local student data with new points and XP
      this.updateStudentProgress(this.completionResult);

      // Generate confetti for celebration
      this.generateConfetti();

      this.showCompletionModal = true;

    } catch (error) {
      console.error('Error completing activity:', error);
      alert('There was an error completing the activity. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  // Utility methods for getting current activity data
  getCurrentWord(): string {
    if (!this.currentSession || this.currentSession.activity.type !== 'pronunciation_challenge') return '';
    const content = this.currentSession.activity.content;
    if (!content?.words || !Array.isArray(content.words)) {
      // Fallback to hardcoded data if content not available
      const index = this.currentSession.currentStage - 1;
      return this.pronunciationWords[index]?.word || '';
    }
    const index = this.currentSession.currentStage - 1;
    return content.words[index]?.word || '';
  }

  getCurrentPhonetic(): string {
    if (!this.currentSession || this.currentSession.activity.type !== 'pronunciation_challenge') return '';
    const content = this.currentSession.activity.content;
    if (!content?.words || !Array.isArray(content.words)) {
      // Fallback to hardcoded data if content not available
      const index = this.currentSession.currentStage - 1;
      return this.pronunciationWords[index]?.phonetic || '';
    }
    const index = this.currentSession.currentStage - 1;
    return content.words[index]?.phonetic || '';
  }

  getCurrentPicture(): string {
    if (!this.currentSession || this.currentSession.activity.type !== 'picture_description') return '';
    const content = this.currentSession.activity.content;
    if (!content?.pictures || !Array.isArray(content.pictures)) {
      // Fallback to hardcoded data if content not available
      const index = this.currentSession.currentStage - 1;
      return this.pictureDescriptions[index]?.image || '';
    }
    const index = this.currentSession.currentStage - 1;
    return content.pictures[index]?.imageUrl || '';
  }

  getCurrentPrompt(): string {
    if (!this.currentSession || this.currentSession.activity.type !== 'picture_description') return '';
    const content = this.currentSession.activity.content;
    if (!content?.pictures || !Array.isArray(content.pictures)) {
      // Fallback to hardcoded data if content not available
      const index = this.currentSession.currentStage - 1;
      return this.pictureDescriptions[index]?.prompt || '';
    }
    const index = this.currentSession.currentStage - 1;
    return content.pictures[index]?.prompt || '';
  }

  getCurrentVocabulary(): string[] {
    if (!this.currentSession || this.currentSession.activity.type !== 'picture_description') return [];
    const content = this.currentSession.activity.content;
    if (!content?.pictures || !Array.isArray(content.pictures)) {
      // Fallback to hardcoded data if content not available
      const index = this.currentSession.currentStage - 1;
      return this.pictureDescriptions[index]?.vocabulary || [];
    }
    const index = this.currentSession.currentStage - 1;
    return content.pictures[index]?.vocabularyHints || [];
  }

  getCurrentCharacter() {
    if (!this.currentSession || this.currentSession.activity.type !== 'virtual_conversation') {
      return this.conversationCharacters[0]; // Fallback
    }
    const content = this.currentSession.activity.content;
    if (!content?.character) {
      // Fallback to hardcoded data if content not available
      return this.conversationCharacters[0];
    }
    return content.character;
  }

  getScoreComponent(component: string): number {
    if (!this.lastStageFeedback?.audioFeedback) return 0;

    switch (component) {
      case 'fluency':
        return this.lastStageFeedback.audioFeedback.fluencyScore || 0;
      case 'accuracy':
        return this.lastStageFeedback.audioFeedback.matchAccuracy || 0;
      default:
        return 0;
    }
  }

  playTargetAudio() {
    if (this.isPlaying) {
      this.stopAudio();
      return;
    }

    const currentWord = this.getCurrentWord();
    if (!currentWord) return;

    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      this.isPlaying = true;

      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // Slower rate for learning
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        this.isPlaying = false;
      };

      utterance.onerror = () => {
        this.isPlaying = false;
        console.error('Speech synthesis error');
      };

      // Cancel any ongoing speech
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    } else {
      // Fallback: Play a simple beep or show message
      alert(`Listen: "${currentWord}"`);
    }
  }

  private stopAudio() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    this.isPlaying = false;
  }

  playConversationAudio() {
    if (this.isPlaying) {
      this.stopAudio();
      return;
    }

    if (!this.currentConversationPrompt) return;

    // Use Web Speech API for conversation audio
    if ('speechSynthesis' in window) {
      this.isPlaying = true;

      const utterance = new SpeechSynthesisUtterance(this.currentConversationPrompt);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Natural conversation rate
      utterance.pitch = 1.1; // Slightly higher pitch for character voice
      utterance.volume = 1.0;

      utterance.onend = () => {
        this.isPlaying = false;
      };

      utterance.onerror = () => {
        this.isPlaying = false;
        console.error('Speech synthesis error');
      };

      // Cancel any ongoing speech
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    } else {
      // Fallback
      alert(`${this.getCurrentCharacter().name} says: "${this.currentConversationPrompt}"`);
    }
  }

  getFormattedTime(seconds: number): string {
    return this.activitySessionService.getFormattedTime(seconds);
  }

  // Modal and navigation methods
  closeCompletionModal() {
    this.showCompletionModal = false;
  }

  async tryAgain() {
    this.showCompletionModal = false;
    if (this.currentSession) {
      await this.startNewSession(this.currentSession.activity.id);
    }
  }

  goToActivities() {
    this.router.navigate(['/student/activities']);
  }

  exitActivity() {
    if (this.isProcessing) return;

    const confirmExit = confirm('Are you sure you want to exit this activity? Your progress will be saved.');
    if (confirmExit) {
      // Pause the session before leaving
      if (this.currentSession) {
        this.activitySessionService.pauseSession(this.currentSession.id).subscribe();
      }
      this.router.navigate(['/student/activities']);
    }
  }

  goBack() {
    this.router.navigate(['/student/activities']);
  }

  // Enhanced completion and celebration methods
  private calculateActivityResults() {
    if (!this.currentSession) return {};

    // Ensure we have valid scores, use accumulated score or calculate from stages completed
    const totalScore = this.currentSession.currentScore || 0;
    const stagesCompleted = Math.max(1, this.currentSession.currentStage || 1);
    const finalScore = totalScore > 0 ? Math.round(totalScore / stagesCompleted) : 65; // Default to 65% for participation
    const basePoints = Math.max(10, Math.round(finalScore * 2)); // Minimum 10 points
    const timeBonus = this.calculateTimeBonus();
    const accuracyBonus = finalScore >= 80 ? 20 : finalScore >= 60 ? 10 : 0;

    const totalPointsEarned = basePoints + timeBonus + accuracyBonus;
    const experienceGained = Math.round(totalPointsEarned * 1.5);

    // Determine if level up
    const currentXP = this.getCurrentStudentXP();
    const newXP = currentXP + experienceGained;
    const currentLevel = this.calculateLevel(currentXP);
    const newLevel = this.calculateLevel(newXP);
    const levelUp = newLevel > currentLevel;

    // Check for new badges
    const badgesEarned = this.checkNewBadges(finalScore, this.currentSession.activity.type);

    // Generate feedback message based on score
    const feedbackMessage = this.generateFeedbackMessage(finalScore);
    const improvementTips = this.generateImprovementTips(finalScore, this.currentSession.activity.type);

    return {
      finalScore,
      pointsEarned: totalPointsEarned,
      experienceGained,
      timeSpent: this.currentSession.timeSpent || 0,
      totalTime: this.currentSession.timeSpent || 0,
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
      badgesEarned,
      timeBonus,
      accuracyBonus,
      message: feedbackMessage,
      improvement: improvementTips,
      achievements: badgesEarned
    };
  }

  private calculateTimeBonus(): number {
    if (!this.currentSession) return 0;
    const timeSpent = this.currentSession.timeSpent || 0;
    const expectedTime = this.currentSession.totalStages * 30; // 30 seconds per stage

    if (timeSpent <= expectedTime * 0.5) return 15; // Very fast
    if (timeSpent <= expectedTime * 0.75) return 10; // Fast
    if (timeSpent <= expectedTime) return 5; // Normal
    return 0; // Slow
  }

  private getCurrentStudentXP(): number {
    // This would normally come from a service, using mock data for now
    return parseInt(localStorage.getItem('studentXP') || '0');
  }

  private calculateLevel(xp: number): number {
    // Level calculation: Level 1 = 0-99 XP, Level 2 = 100-299 XP, etc.
    return Math.floor(xp / 100) + 1;
  }

  private checkNewBadges(score: number, activityType: string): any[] {
    const badges = [];

    if (score === 100) {
      badges.push({ name: 'Perfect Score', icon: '💯' });
    } else if (score >= 90) {
      badges.push({ name: 'Excellence', icon: '⭐' });
    }

    if (activityType === 'pronunciation_challenge' && score >= 85) {
      badges.push({ name: 'Pronunciation Master', icon: '🗣️' });
    }

    return badges;
  }

  private generateFeedbackMessage(score: number): string {
    if (score >= 95) return 'Outstanding performance! You nailed it! 🌟';
    if (score >= 85) return 'Excellent work! You\'re doing great! 👏';
    if (score >= 75) return 'Good job! Keep up the good work! 💪';
    if (score >= 65) return 'Nice effort! You\'re improving! 🎯';
    return 'Good effort! Keep practicing and you\'ll get better! 💛';
  }

  private generateImprovementTips(score: number, activityType: string): string[] {
    const tips = [];

    if (score < 80) {
      if (activityType === 'pronunciation_challenge') {
        tips.push('Practice individual sounds');
        tips.push('Use pronunciation apps');
        tips.push('Listen to native speakers');
      } else if (activityType === 'picture_description') {
        tips.push('Use more descriptive vocabulary');
        tips.push('Practice describing everyday objects');
        tips.push('Focus on sentence structure');
      } else {
        tips.push('Practice more frequently');
        tips.push('Focus on accuracy');
        tips.push('Take your time to think');
      }
    } else {
      tips.push('Try more challenging activities');
      tips.push('Focus on fluency');
      tips.push('Keep up the excellent work!');
    }

    return tips;
  }

  private updateStudentProgress(completionResult: any) {
    // Update local storage (in a real app this would sync with server)
    const currentXP = this.getCurrentStudentXP();
    const newXP = currentXP + completionResult.experienceGained;
    const currentPoints = parseInt(localStorage.getItem('studentPoints') || '0');
    const newPoints = currentPoints + completionResult.pointsEarned;

    localStorage.setItem('studentXP', newXP.toString());
    localStorage.setItem('studentPoints', newPoints.toString());

    // Update streak
    const lastActivityDate = localStorage.getItem('lastActivityDate');
    const today = new Date().toDateString();
    const currentStreak = parseInt(localStorage.getItem('studentStreak') || '0');

    if (lastActivityDate === today) {
      // Same day, don't update streak
    } else if (lastActivityDate &&
        new Date(lastActivityDate).getTime() === new Date(today).getTime() - 86400000) {
      // Consecutive day
      localStorage.setItem('studentStreak', (currentStreak + 1).toString());
    } else {
      // Broken streak or first activity
      localStorage.setItem('studentStreak', '1');
    }

    localStorage.setItem('lastActivityDate', today);
  }

  private generateConfetti() {
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

  private getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Methods for enhanced completion modal
  getAchievementLevel(): string {
    if (!this.completionResult) return 'bronze';
    if (this.completionResult.finalScore >= 90) return 'gold';
    if (this.completionResult.finalScore >= 75) return 'silver';
    return 'bronze';
  }

  getAchievementIcon(): string {
    if (!this.completionResult) return '🏆';
    if (this.completionResult.finalScore >= 95) return '🏆';
    if (this.completionResult.finalScore >= 85) return '🥇';
    if (this.completionResult.finalScore >= 75) return '🥈';
    return '🥉';
  }

  getCompletionTitle(): string {
    if (!this.completionResult) return 'Activity Complete!';
    if (this.completionResult.finalScore >= 95) return '🌟 Outstanding Performance!';
    if (this.completionResult.finalScore >= 85) return '🎉 Excellent Work!';
    if (this.completionResult.finalScore >= 75) return '👏 Great Job!';
    if (this.completionResult.finalScore >= 60) return '👍 Good Effort!';
    return '💪 Keep Practicing!';
  }

  getEncouragementMessage(): string {
    if (!this.completionResult) return 'Well done!';
    if (this.completionResult.finalScore >= 90) return "You're amazing! Your English skills are really shining!";
    if (this.completionResult.finalScore >= 75) return "Fantastic progress! You're getting better every day!";
    if (this.completionResult.finalScore >= 60) return "Good work! Keep practicing and you'll improve even more!";
    return "Don't give up! Every practice session makes you better!";
  }
}