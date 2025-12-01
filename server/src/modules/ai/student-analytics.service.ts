import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../entities/student.entity';
import { Progress } from '../../entities/progress.entity';
import { ActivityCompletion } from '../../entities/activity-completion.entity';
import { ConversationSession } from '../../entities/conversation-session.entity';
import { SkillArea } from '../../enums/activity-type.enum';

export interface SkillAnalysis {
  skillArea: SkillArea;
  currentScore: number;
  averageScore: number;
  recentTrend: 'improving' | 'stable' | 'declining';
  activitiesCompleted: number;
  weaknessLevel: 'critical' | 'moderate' | 'minor' | 'none';
  recommendations: string[];
}

export interface WeaknessAnalysis {
  primaryWeakness: SkillArea | null;
  secondaryWeakness: SkillArea | null;
  skillAnalyses: SkillAnalysis[];
  overallLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
  grammarIssues: string[];
  vocabularyGaps: string[];
}

@Injectable()
export class StudentAnalyticsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    @InjectRepository(ActivityCompletion)
    private activityCompletionRepository: Repository<ActivityCompletion>,
    @InjectRepository(ConversationSession)
    private conversationRepository: Repository<ConversationSession>,
  ) {}

  /**
   * Analyze student's weaknesses across all skill areas
   */
  async analyzeStudentWeaknesses(studentId: string): Promise<WeaknessAnalysis> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['progress', 'activityCompletions', 'activityCompletions.activity'],
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Get all skill areas
    const skillAreas = Object.values(SkillArea);

    // Analyze each skill area
    const skillAnalyses: SkillAnalysis[] = [];
    for (const skillArea of skillAreas) {
      const analysis = await this.analyzeSkillArea(studentId, skillArea);
      skillAnalyses.push(analysis);
    }

    // Sort by weakness level (critical first)
    skillAnalyses.sort((a, b) => {
      const levelOrder = { critical: 0, moderate: 1, minor: 2, none: 3 };
      return levelOrder[a.weaknessLevel] - levelOrder[b.weaknessLevel];
    });

    // Determine primary and secondary weaknesses
    const criticalWeaknesses = skillAnalyses.filter(s => s.weaknessLevel === 'critical');
    const moderateWeaknesses = skillAnalyses.filter(s => s.weaknessLevel === 'moderate');

    const primaryWeakness = criticalWeaknesses.length > 0
      ? criticalWeaknesses[0].skillArea
      : moderateWeaknesses.length > 0
        ? moderateWeaknesses[0].skillArea
        : null;

    const secondaryWeakness = criticalWeaknesses.length > 1
      ? criticalWeaknesses[1].skillArea
      : moderateWeaknesses.length > 0
        ? moderateWeaknesses[0].skillArea
        : null;

    // Determine overall level
    const averageScore = skillAnalyses.reduce((sum, s) => sum + s.averageScore, 0) / skillAnalyses.length;
    const overallLevel = averageScore >= 75 ? 'advanced' : averageScore >= 50 ? 'intermediate' : 'beginner';

    // Get specific issues from AI conversations
    const { grammarIssues, vocabularyGaps } = await this.extractAIConversationIssues(studentId);

    // Generate focus areas
    const focusAreas = this.generateFocusAreas(skillAnalyses, grammarIssues, vocabularyGaps);

    return {
      primaryWeakness,
      secondaryWeakness,
      skillAnalyses,
      overallLevel,
      focusAreas,
      grammarIssues,
      vocabularyGaps,
    };
  }

  /**
   * Analyze a specific skill area for a student
   */
  private async analyzeSkillArea(studentId: string, skillArea: SkillArea): Promise<SkillAnalysis> {
    // Get progress data
    const progress = await this.progressRepository.findOne({
      where: { student: { id: studentId }, skillArea },
    });

    // Get recent activity completions for this skill area (last 10)
    const completions = await this.activityCompletionRepository.find({
      where: { student: { id: studentId }, activity: { skillArea } },
      order: { completedAt: 'DESC' },
      take: 10,
      relations: ['activity'],
    });

    const currentScore = progress?.currentScore || 0;
    const previousScore = progress?.previousScore || 0;
    const activitiesCompleted = completions.length;

    // Calculate average score from recent completions
    const averageScore = activitiesCompleted > 0
      ? completions.reduce((sum, c) => sum + c.score, 0) / activitiesCompleted
      : currentScore;

    // Determine trend
    const recentTrend = this.determineTrend(completions);

    // Determine weakness level
    const weaknessLevel = this.determineWeaknessLevel(averageScore, activitiesCompleted, recentTrend);

    // Generate recommendations
    const recommendations = this.generateRecommendations(skillArea, weaknessLevel, averageScore);

    return {
      skillArea,
      currentScore,
      averageScore,
      recentTrend,
      activitiesCompleted,
      weaknessLevel,
      recommendations,
    };
  }

  /**
   * Determine score trend from recent completions
   */
  private determineTrend(completions: ActivityCompletion[]): 'improving' | 'stable' | 'declining' {
    if (completions.length < 3) return 'stable';

    const recent = completions.slice(0, 3);
    const older = completions.slice(3, 6);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, c) => sum + c.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, c) => sum + c.score, 0) / older.length;

    const difference = recentAvg - olderAvg;

    if (difference >= 10) return 'improving';
    if (difference <= -10) return 'declining';
    return 'stable';
  }

  /**
   * Determine weakness level based on score and trend
   */
  private determineWeaknessLevel(
    averageScore: number,
    activitiesCompleted: number,
    trend: 'improving' | 'stable' | 'declining'
  ): 'critical' | 'moderate' | 'minor' | 'none' {
    // Critical: Low score and declining or very few activities
    if (averageScore < 50 && (trend === 'declining' || activitiesCompleted < 3)) {
      return 'critical';
    }

    // Moderate: Below average score or declining trend
    if (averageScore < 60 || (averageScore < 70 && trend === 'declining')) {
      return 'moderate';
    }

    // Minor: Average score but could improve
    if (averageScore < 75) {
      return 'minor';
    }

    // None: Good score and stable or improving
    return 'none';
  }

  /**
   * Generate recommendations for a skill area
   */
  private generateRecommendations(
    skillArea: SkillArea,
    weaknessLevel: string,
    averageScore: number
  ): string[] {
    const recommendations: string[] = [];

    switch (skillArea) {
      case SkillArea.PRONUNCIATION:
        if (weaknessLevel === 'critical') {
          recommendations.push('Practice pronunciation daily with audio exercises');
          recommendations.push('Listen to native speakers and repeat after them');
          recommendations.push('Focus on difficult sounds for your native language');
        } else if (weaknessLevel === 'moderate') {
          recommendations.push('Continue pronunciation practice 3-4 times per week');
          recommendations.push('Try more challenging words and phrases');
        }
        break;

      case SkillArea.VOCABULARY:
        if (weaknessLevel === 'critical') {
          recommendations.push('Learn 5-10 new words every day');
          recommendations.push('Use vocabulary matching games');
          recommendations.push('Practice using new words in sentences');
        } else if (weaknessLevel === 'moderate') {
          recommendations.push('Expand vocabulary with themed word sets');
          recommendations.push('Practice synonyms and antonyms');
        }
        break;

      case SkillArea.FLUENCY:
        if (weaknessLevel === 'critical') {
          recommendations.push('Practice speaking in complete sentences');
          recommendations.push('Have daily AI conversations');
          recommendations.push('Focus on natural flow and rhythm');
        } else if (weaknessLevel === 'moderate') {
          recommendations.push('Engage in longer conversations');
          recommendations.push('Try more complex topics');
        }
        break;

      case SkillArea.CONFIDENCE:
        if (weaknessLevel === 'critical') {
          recommendations.push('Start with simple activities to build confidence');
          recommendations.push('Practice in a comfortable environment');
          recommendations.push('Celebrate small wins');
        } else if (weaknessLevel === 'moderate') {
          recommendations.push('Challenge yourself with new activity types');
          recommendations.push('Practice speaking more often');
        }
        break;
    }

    return recommendations;
  }

  /**
   * Extract grammar issues and vocabulary gaps from AI conversations
   */
  private async extractAIConversationIssues(studentId: string): Promise<{
    grammarIssues: string[];
    vocabularyGaps: string[];
  }> {
    const conversations = await this.conversationRepository.find({
      where: { student: { id: studentId }, status: 'completed' },
      order: { createdAt: 'DESC' },
      take: 5, // Last 5 conversations
    });

    const grammarIssues: string[] = [];
    const vocabularyGaps: string[] = [];
    const grammarSet = new Set<string>();
    const vocabSet = new Set<string>();

    for (const conversation of conversations) {
      if (conversation.aiEvaluation) {
        // Extract unique grammar issues
        if (conversation.aiEvaluation.grammarMistakes) {
          for (const mistake of conversation.aiEvaluation.grammarMistakes) {
            // Extract general grammar pattern (e.g., "verb tense", "subject-verb agreement")
            const pattern = this.extractGrammarPattern(mistake.explanation);
            if (pattern) grammarSet.add(pattern);
          }
        }

        // Identify vocabulary gaps (words student struggles with)
        if (conversation.aiEvaluation.vocabularyScore < 70) {
          // Could extract specific vocabulary areas from evaluation
          vocabSet.add('Basic conversational vocabulary');
        }
      }
    }

    return {
      grammarIssues: Array.from(grammarSet),
      vocabularyGaps: Array.from(vocabSet),
    };
  }

  /**
   * Extract general grammar pattern from explanation
   */
  private extractGrammarPattern(explanation: string): string | null {
    const lowerExplanation = explanation.toLowerCase();

    if (lowerExplanation.includes('tense')) return 'Verb tenses';
    if (lowerExplanation.includes('subject-verb')) return 'Subject-verb agreement';
    if (lowerExplanation.includes('pronoun')) return 'Pronoun usage';
    if (lowerExplanation.includes('article')) return 'Articles (a, an, the)';
    if (lowerExplanation.includes('plural')) return 'Singular/plural forms';
    if (lowerExplanation.includes('preposition')) return 'Prepositions';

    return null;
  }

  /**
   * Generate focus areas based on analyses
   */
  private generateFocusAreas(
    skillAnalyses: SkillAnalysis[],
    grammarIssues: string[],
    vocabularyGaps: string[]
  ): string[] {
    const focusAreas: string[] = [];

    // Add critical and moderate weaknesses
    skillAnalyses
      .filter(s => s.weaknessLevel === 'critical' || s.weaknessLevel === 'moderate')
      .forEach(s => {
        focusAreas.push(`Improve ${s.skillArea} skills`);
      });

    // Add specific grammar issues
    grammarIssues.forEach(issue => {
      focusAreas.push(`Practice ${issue.toLowerCase()}`);
    });

    // Add vocabulary gaps
    vocabularyGaps.forEach(gap => {
      focusAreas.push(`Build ${gap.toLowerCase()}`);
    });

    // Limit to top 5 focus areas
    return focusAreas.slice(0, 5);
  }

  /**
   * Get personalized activity difficulty
   */
  getRecommendedDifficulty(overallLevel: string, skillArea: SkillArea, skillAnalysis: SkillAnalysis): string {
    // Start with overall level
    let difficulty = overallLevel;

    // Adjust based on specific skill weakness
    if (skillAnalysis.weaknessLevel === 'critical' && difficulty !== 'beginner') {
      difficulty = 'beginner'; // Drop to beginner for critical weaknesses
    } else if (skillAnalysis.weaknessLevel === 'moderate' && difficulty === 'advanced') {
      difficulty = 'intermediate'; // Drop to intermediate for moderate weaknesses
    }

    return difficulty;
  }
}
