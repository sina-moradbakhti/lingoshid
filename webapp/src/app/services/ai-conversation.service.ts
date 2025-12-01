import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StartConversationRequest {
  scenario: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  activityId: string;
}

export interface StartConversationResponse {
  success: boolean;
  data: {
    sessionId: string;
    firstMessage: string;
  };
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    aiResponse: string;
    turnCount: number;
    shouldEnd: boolean;
  };
}

export interface ConversationEvaluation {
  grammarScore: number;
  vocabularyScore: number;
  coherenceScore: number;
  fluencyScore: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  grammarMistakes?: Array<{
    mistake: string;
    correction: string;
    explanation: string;
  }>;
  vocabularyUsed: string[];
  conversationQuality: string;
}

export interface EndConversationResponse {
  success: boolean;
  data: {
    evaluation: ConversationEvaluation;
    pointsEarned: number;
  };
}

export interface ConversationSessionResponse {
  success: boolean;
  data: {
    id: string;
    scenario: string;
    difficultyLevel: string;
    status: string;
    turnCount: number;
    messages: Array<{
      role: 'student' | 'ai';
      content: string;
      timestamp: Date;
    }>;
    aiEvaluation: ConversationEvaluation | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface ConversationHistoryResponse {
  success: boolean;
  data: Array<{
    id: string;
    scenario: string;
    difficultyLevel: string;
    status: string;
    turnCount: number;
    aiEvaluation: ConversationEvaluation | null;
    createdAt: Date;
  }>;
}

export interface HealthCheckResponse {
  success: boolean;
  data: {
    status: string;
    claude: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AiConversationService {
  private apiUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  /**
   * Start a new AI conversation session
   */
  startConversation(request: StartConversationRequest): Observable<StartConversationResponse> {
    return this.http.post<StartConversationResponse>(`${this.apiUrl}/conversation/start`, request);
  }

  /**
   * Send a message in ongoing conversation
   */
  sendMessage(request: SendMessageRequest): Observable<SendMessageResponse> {
    return this.http.post<SendMessageResponse>(`${this.apiUrl}/conversation/message`, request);
  }

  /**
   * End conversation and get evaluation
   */
  endConversation(sessionId: string): Observable<EndConversationResponse> {
    return this.http.post<EndConversationResponse>(`${this.apiUrl}/conversation/${sessionId}/end`, {});
  }

  /**
   * Get conversation session details
   */
  getSession(sessionId: string): Observable<ConversationSessionResponse> {
    return this.http.get<ConversationSessionResponse>(`${this.apiUrl}/conversation/${sessionId}`);
  }

  /**
   * Get student's conversation history
   */
  getConversations(): Observable<ConversationHistoryResponse> {
    return this.http.get<ConversationHistoryResponse>(`${this.apiUrl}/conversations`);
  }

  /**
   * Health check for AI service (public - no auth required)
   */
  healthCheck(): Observable<HealthCheckResponse> {
    return this.http.get<HealthCheckResponse>(`${this.apiUrl}/public/health`);
  }
}
