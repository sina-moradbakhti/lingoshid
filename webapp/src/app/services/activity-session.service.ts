import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ActivitySession {
  id: string;
  status: 'active' | 'completed' | 'abandoned' | 'paused';
  currentStage: number;
  totalStages: number;
  currentScore: number;
  pointsEarned: number;
  timeSpent: number;
  stageData: any;
  sessionConfig: any;
  startedAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
  activity: any;
  student: any;
}

export interface StageSubmission {
  sessionId: string;
  stageNumber: number;
  stageType: string;
  audioData?: {
    blob: Blob;
    duration: number;
    format: string;
  };
  textData?: {
    response: string;
    timeSpent: number;
  };
  timeSpent: number;
  isCompleted: boolean;
}

export interface StageResult {
  session: ActivitySession;
  stageScore: number;
  feedback: any;
  audioProcessingResult?: any;
}

export interface AudioProcessingResult {
  transcription: string;
  pronunciationScore: number;
  fluencyScore: number;
  clarityScore: number;
  matchAccuracy: number;
  detectedWords: string[];
  feedback: string[];
  processingTime: number;
  audioPath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivitySessionService {
  private apiUrl = `${environment.apiUrl}/activities`;
  private currentSession = new BehaviorSubject<ActivitySession | null>(null);
  private processingAudio = new BehaviorSubject<boolean>(false);

  public currentSession$ = this.currentSession.asObservable();
  public processingAudio$ = this.processingAudio.asObservable();

  constructor(private http: HttpClient) {}

  startSession(activityId: string, sessionConfig?: any): Observable<ActivitySession> {
    return this.http.post<ActivitySession>(`${this.apiUrl}/sessions/start`, {
      activityId,
      sessionConfig
    });
  }

  getSession(sessionId: string): Observable<ActivitySession> {
    return this.http.get<ActivitySession>(`${this.apiUrl}/sessions/${sessionId}`);
  }

  submitStage(submission: StageSubmission): Observable<StageResult> {
    const formData = new FormData();

    // Add stage data
    formData.append('sessionId', submission.sessionId);
    formData.append('stageNumber', submission.stageNumber.toString());
    formData.append('stageType', submission.stageType);
    formData.append('timeSpent', submission.timeSpent.toString());
    formData.append('isCompleted', submission.isCompleted.toString());

    // Add audio if provided
    if (submission.audioData) {
      formData.append('audio', submission.audioData.blob, `stage_${submission.stageNumber}_audio.wav`);
      formData.append('audioData', JSON.stringify({
        duration: submission.audioData.duration,
        format: submission.audioData.format
      }));
    }

    // Add text data if provided
    if (submission.textData) {
      formData.append('textData', JSON.stringify(submission.textData));
    }

    this.processingAudio.next(true);

    return new Observable(observer => {
      this.http.post<StageResult>(`${this.apiUrl}/sessions/${submission.sessionId}/stage`, formData)
        .subscribe({
          next: (result) => {
            this.processingAudio.next(false);
            this.currentSession.next(result.session);
            observer.next(result);
            observer.complete();
          },
          error: (error) => {
            this.processingAudio.next(false);
            observer.error(error);
          }
        });
    });
  }

  completeSession(sessionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/${sessionId}/complete`, {});
  }

  getStageFeedback(sessionId: string, stageNumber: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/sessions/${sessionId}/feedback/${stageNumber}`);
  }

  pauseSession(sessionId: string): Observable<ActivitySession> {
    return this.http.post<ActivitySession>(`${this.apiUrl}/sessions/${sessionId}/pause`, {});
  }

  resumeSession(sessionId: string): Observable<ActivitySession> {
    return this.http.post<ActivitySession>(`${this.apiUrl}/sessions/${sessionId}/resume`, {});
  }

  processAudio(audioBlob: Blob, metadata: any): Observable<AudioProcessingResult> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    formData.append('metadata', JSON.stringify(metadata));

    this.processingAudio.next(true);

    return new Observable(observer => {
      this.http.post<AudioProcessingResult>(`${this.apiUrl}/process-audio`, formData)
        .subscribe({
          next: (result) => {
            this.processingAudio.next(false);
            observer.next(result);
            observer.complete();
          },
          error: (error) => {
            this.processingAudio.next(false);
            observer.error(error);
          }
        });
    });
  }

  // Audio Recording Utilities
  async startAudioRecording(): Promise<MediaRecorder> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'
      });

      return recorder;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw new Error('Unable to access microphone. Please check your permissions.');
    }
  }

  convertAudioToWav(audioBlob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const arrayBuffer = fileReader.result as ArrayBuffer;
        // In a real implementation, you would use a library like 'wav-encoder'
        // or similar to properly convert to WAV format
        // For now, we'll just return the original blob
        resolve(audioBlob);
      };
      fileReader.onerror = () => reject(fileReader.error);
      fileReader.readAsArrayBuffer(audioBlob);
    });
  }

  // Session Management
  setCurrentSession(session: ActivitySession | null) {
    this.currentSession.next(session);
  }

  getCurrentSession(): ActivitySession | null {
    return this.currentSession.value;
  }

  clearCurrentSession() {
    this.currentSession.next(null);
  }

  // Utility methods
  calculateProgress(session: ActivitySession): number {
    if (!session || session.totalStages === 0) return 0;
    return Math.floor((session.currentStage / session.totalStages) * 100);
  }

  getFormattedTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  isSessionActive(session: ActivitySession): boolean {
    return session && session.status === 'active';
  }

  getStageData(session: ActivitySession, stageNumber: number): any {
    return session?.stageData?.[`stage_${stageNumber}`] || null;
  }

  hasStageData(session: ActivitySession, stageNumber: number): boolean {
    return !!this.getStageData(session, stageNumber);
  }
}