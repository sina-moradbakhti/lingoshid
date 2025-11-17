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
  templateUrl: './start-activity.component.html',
  styleUrls: ['./start-activity.component.scss']
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

      // Check if this activity type is supported by the old component
      // If not, redirect to the new modular system
      const supportedTypes = ['pronunciation_challenge', 'picture_description', 'virtual_conversation', 'role_play', 'story_creation', 'singing_chanting'];
      if (!supportedTypes.includes(this.currentSession.activity.type)) {
        console.log(`🔄 Activity type "${this.currentSession.activity.type}" not supported by old component, redirecting to modular system...`);
        this.router.navigate(['/student/module-activities', activityId, 'start']);
        return;
      }

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
    if (!content?.words || !Array.isArray(content.words) || content.words.length === 0) {
      // Fallback to hardcoded data if content not available
      const index = this.currentSession.currentStage - 1;
      return this.pronunciationWords[index]?.word || '';
    }
    const index = this.currentSession.currentStage - 1;
    // Words can be either strings or objects with word property
    const wordData = content.words[index];
    if (typeof wordData === 'string') {
      return wordData; // API returns strings directly
    } else if (wordData && typeof wordData === 'object') {
      return wordData.word || ''; // Fallback format with word property
    }
    return '';
  }

  getCurrentPhonetic(): string {
    if (!this.currentSession || this.currentSession.activity.type !== 'pronunciation_challenge') return '';
    const content = this.currentSession.activity.content;
    if (!content?.words || !Array.isArray(content.words) || content.words.length === 0) {
      // Fallback to hardcoded data if content not available
      const index = this.currentSession.currentStage - 1;
      return this.pronunciationWords[index]?.phonetic || '';
    }
    const index = this.currentSession.currentStage - 1;
    const wordData = content.words[index];
    // Words array from API are strings only, no phonetics provided
    // Return empty for now, or could add phonetics to seeder
    if (typeof wordData === 'string') {
      return ''; // API doesn't provide phonetics for string format
    } else if (wordData && typeof wordData === 'object') {
      return wordData.phonetic || ''; // Object format with phonetic property
    }
    return '';
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