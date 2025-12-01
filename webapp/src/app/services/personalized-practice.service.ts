import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Type definitions matching backend
export interface SkillAnalysis {
  skillArea: string;
  currentScore: number;
  averageScore: number;
  trend: 'improving' | 'stable' | 'declining';
  weaknessLevel: 'critical' | 'moderate' | 'minor' | 'none';
  recommendations: string[];
  activitiesCompleted: number;
}

export interface WeaknessAnalysis {
  primaryWeakness: string | null;
  secondaryWeakness: string | null;
  skillAnalyses: SkillAnalysis[];
  overallLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  grammarIssues: string[];
  vocabularyGaps: string[];
}

export interface GeneratedPractice {
  title: string;
  description: string;
  type: 'quiz' | 'vocabulary' | 'conversation_prompt' | 'pronunciation';
  difficulty: string;
  skillArea: string;
  content: any;
  reasoning: string;
  targetWeaknesses: string[];
}

export interface PersonalizedRecommendations {
  studentProfile: {
    name: string;
    grade: number;
    overallLevel: string;
  };
  weaknessAnalysis: {
    primaryWeakness: string | null;
    secondaryWeakness: string | null;
    focusAreas: string[];
    grammarIssues: string[];
    vocabularyGaps: string[];
  };
  skillBreakdown: SkillAnalysis[];
  suggestedPractices: GeneratedPractice[];
  actionPlan: string[];
  generatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonalizedPracticeService {
  private apiUrl = `${environment.apiUrl}/ai/personalized`;

  constructor(private http: HttpClient) {}

  /**
   * Get student weakness analysis
   */
  getWeaknessAnalysis(): Observable<ApiResponse<WeaknessAnalysis>> {
    return this.http.get<ApiResponse<WeaknessAnalysis>>(`${this.apiUrl}/analysis`);
  }

  /**
   * Generate personalized practice activities
   */
  generatePractices(): Observable<ApiResponse<{
    practices: GeneratedPractice[];
    analysis: WeaknessAnalysis;
    generatedAt: Date;
  }>> {
    return this.http.post<ApiResponse<{
      practices: GeneratedPractice[];
      analysis: WeaknessAnalysis;
      generatedAt: Date;
    }>>(`${this.apiUrl}/generate`, {});
  }

  /**
   * Get comprehensive personalized recommendations
   */
  getRecommendations(): Observable<ApiResponse<PersonalizedRecommendations>> {
    return this.http.get<ApiResponse<PersonalizedRecommendations>>(`${this.apiUrl}/recommendations`);
  }
}
