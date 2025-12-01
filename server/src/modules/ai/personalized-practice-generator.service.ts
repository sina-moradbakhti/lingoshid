import { Injectable } from '@nestjs/common';
import { ClaudeProvider } from './providers/claude.provider';
import { SkillArea, DifficultyLevel } from '../../enums/activity-type.enum';
import { WeaknessAnalysis, SkillAnalysis } from './student-analytics.service';

export interface GeneratedPractice {
  title: string;
  description: string;
  type: 'quiz' | 'vocabulary' | 'conversation_prompt' | 'pronunciation';
  difficulty: string;
  skillArea: SkillArea;
  content: any;
  reasoning: string; // Why this practice was generated
  targetWeaknesses: string[];
}

@Injectable()
export class PersonalizedPracticeGeneratorService {
  constructor(private claudeProvider: ClaudeProvider) {}

  /**
   * Generate personalized practice activities based on student weaknesses
   */
  async generatePersonalizedPractices(
    studentName: string,
    grade: number,
    weaknessAnalysis: WeaknessAnalysis
  ): Promise<GeneratedPractice[]> {
    const practices: GeneratedPractice[] = [];

    // Generate practice for primary weakness (most important)
    if (weaknessAnalysis.primaryWeakness) {
      const primaryAnalysis = weaknessAnalysis.skillAnalyses.find(
        s => s.skillArea === weaknessAnalysis.primaryWeakness
      );
      if (primaryAnalysis) {
        const practice = await this.generatePracticeForSkill(
          studentName,
          grade,
          primaryAnalysis,
          weaknessAnalysis,
          'primary'
        );
        practices.push(practice);
      }
    }

    // Generate practice for secondary weakness
    if (weaknessAnalysis.secondaryWeakness) {
      const secondaryAnalysis = weaknessAnalysis.skillAnalyses.find(
        s => s.skillArea === weaknessAnalysis.secondaryWeakness
      );
      if (secondaryAnalysis) {
        const practice = await this.generatePracticeForSkill(
          studentName,
          grade,
          secondaryAnalysis,
          weaknessAnalysis,
          'secondary'
        );
        practices.push(practice);
      }
    }

    // Generate grammar-focused practice if there are grammar issues
    if (weaknessAnalysis.grammarIssues.length > 0) {
      const grammarPractice = await this.generateGrammarPractice(
        studentName,
        grade,
        weaknessAnalysis
      );
      practices.push(grammarPractice);
    }

    return practices;
  }

  /**
   * Generate practice for a specific skill area
   */
  private async generatePracticeForSkill(
    studentName: string,
    grade: number,
    skillAnalysis: SkillAnalysis,
    weaknessAnalysis: WeaknessAnalysis,
    priority: 'primary' | 'secondary'
  ): Promise<GeneratedPractice> {
    const difficulty = this.determineDifficulty(skillAnalysis, weaknessAnalysis.overallLevel);

    switch (skillAnalysis.skillArea) {
      case SkillArea.VOCABULARY:
        return this.generateVocabularyPractice(studentName, grade, skillAnalysis, difficulty, priority);

      case SkillArea.PRONUNCIATION:
        return this.generatePronunciationPractice(studentName, grade, skillAnalysis, difficulty, priority);

      case SkillArea.FLUENCY:
        return this.generateFluencyPractice(studentName, grade, skillAnalysis, difficulty, weaknessAnalysis, priority);

      case SkillArea.CONFIDENCE:
        return this.generateConfidencePractice(studentName, grade, skillAnalysis, difficulty, priority);

      default:
        return this.generateVocabularyPractice(studentName, grade, skillAnalysis, difficulty, priority);
    }
  }

  /**
   * Generate vocabulary practice
   */
  private async generateVocabularyPractice(
    studentName: string,
    grade: number,
    skillAnalysis: SkillAnalysis,
    difficulty: string,
    priority: string
  ): Promise<GeneratedPractice> {
    const prompt = `You are an expert English teacher creating personalized vocabulary practice for an elementary student.

Student Profile:
- Name: ${studentName}
- Grade: ${grade} (Ages 9-12)
- Vocabulary Score: ${skillAnalysis.averageScore}/100
- Difficulty Level: ${difficulty}
- Trend: ${skillAnalysis.recentTrend}

Create a vocabulary matching activity with 6 words appropriate for this student's level.
${difficulty === 'beginner' ? 'Use simple, common words (top 1000).' : ''}
${difficulty === 'intermediate' ? 'Use everyday words with some variety.' : ''}
${difficulty === 'advanced' ? 'Include more sophisticated vocabulary.' : ''}

Format your response as JSON:
{
  "title": "Engaging title for the activity",
  "description": "Brief description (1-2 sentences)",
  "words": [
    {
      "word": "word in English",
      "definition": "Child-friendly definition",
      "exampleSentence": "Simple example sentence using the word",
      "category": "Theme/category (e.g., Animals, Food, School)"
    }
  ],
  "theme": "Overall theme of the word set"
}`;

    const response = await this.claudeProvider.chat({
      systemPrompt: 'You are a helpful English teacher for elementary students. Always respond with valid JSON only.',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      maxTokens: 1000,
    });

    const data = this.parseJSON(response.content);

    return {
      title: data.title || `Personalized Vocabulary Practice - ${skillAnalysis.skillArea}`,
      description: data.description || 'Practice vocabulary tailored to your level',
      type: 'vocabulary',
      difficulty,
      skillArea: SkillArea.VOCABULARY,
      content: {
        vocabulary: data.words.map((w: any) => ({
          word: w.word,
          imageUrl: `https://source.unsplash.com/400x300/?${encodeURIComponent(w.word)}`,
          translation: w.definition,
          category: w.category,
          exampleSentence: w.exampleSentence
        })),
        itemsPerRound: Math.min(data.words.length, 6),
        showTranslations: true,
        theme: data.theme
      },
      reasoning: `Generated to improve vocabulary skills (${priority} weakness). Current score: ${skillAnalysis.averageScore}/100`,
      targetWeaknesses: ['Vocabulary', skillAnalysis.recentTrend === 'declining' ? 'Declining performance' : '']
    };
  }

  /**
   * Generate pronunciation practice
   */
  private async generatePronunciationPractice(
    studentName: string,
    grade: number,
    skillAnalysis: SkillAnalysis,
    difficulty: string,
    priority: string
  ): Promise<GeneratedPractice> {
    const prompt = `Create pronunciation practice for an elementary student.

Student: ${studentName}, Grade ${grade}
Pronunciation Score: ${skillAnalysis.averageScore}/100
Level: ${difficulty}

Generate 5-7 words or phrases focusing on common pronunciation challenges for young learners.
${difficulty === 'beginner' ? 'Use simple words with clear sounds.' : ''}
${difficulty === 'intermediate' ? 'Include some challenging sounds (th, r, l).' : ''}
${difficulty === 'advanced' ? 'Include difficult sound combinations and longer words.' : ''}

Respond with JSON:
{
  "title": "Practice title",
  "description": "Brief description",
  "words": ["word1", "word2", "word3", ...],
  "focusSounds": "Sounds being practiced (e.g., 'th sound', 'r vs l')"
}`;

    const response = await this.claudeProvider.chat({
      systemPrompt: 'You are a pronunciation expert for elementary English learners. Respond with JSON only.',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      maxTokens: 800,
    });

    const data = this.parseJSON(response.content);

    return {
      title: data.title || `Pronunciation Practice - ${difficulty}`,
      description: data.description || `Practice ${data.focusSounds || 'important sounds'}`,
      type: 'pronunciation',
      difficulty,
      skillArea: SkillArea.PRONUNCIATION,
      content: {
        words: data.words,
        focusSounds: data.focusSounds
      },
      reasoning: `Generated to improve pronunciation skills (${priority} weakness). Focus: ${data.focusSounds}`,
      targetWeaknesses: ['Pronunciation', data.focusSounds]
    };
  }

  /**
   * Generate fluency practice (conversation prompts)
   */
  private async generateFluencyPractice(
    studentName: string,
    grade: number,
    skillAnalysis: SkillAnalysis,
    difficulty: string,
    weaknessAnalysis: WeaknessAnalysis,
    priority: string
  ): Promise<GeneratedPractice> {
    const grammarContext = weaknessAnalysis.grammarIssues.length > 0
      ? `\nGrammar focus: ${weaknessAnalysis.grammarIssues.join(', ')}`
      : '';

    const prompt = `Create a conversation practice topic for an elementary student to improve fluency.

Student: ${studentName}, Grade ${grade}
Fluency Score: ${skillAnalysis.averageScore}/100
Level: ${difficulty}${grammarContext}

Create an engaging conversation scenario appropriate for their age and level.
The scenario should encourage natural speaking and sentence formation.

Respond with JSON:
{
  "title": "Conversation topic title",
  "description": "What this conversation is about",
  "scenario": "Scenario identifier (e.g., 'favorite_games', 'weekend_plans')",
  "starterQuestions": ["Question 1", "Question 2", "Question 3"],
  "targetGrammar": "Grammar structure to practice (if applicable)"
}`;

    const response = await this.claudeProvider.chat({
      systemPrompt: 'You are an English conversation teacher for children. Respond with JSON only.',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      maxTokens: 800,
    });

    const data = this.parseJSON(response.content);

    return {
      title: data.title || 'Conversation Practice',
      description: data.description || 'Practice speaking naturally about interesting topics',
      type: 'conversation_prompt',
      difficulty,
      skillArea: SkillArea.FLUENCY,
      content: {
        scenario: data.scenario,
        difficultyLevel: difficulty,
        customInstructions: `Help ${studentName} practice fluency with ${difficulty} level conversation. ${data.targetGrammar ? `Focus on: ${data.targetGrammar}` : ''}`,
        starterQuestions: data.starterQuestions
      },
      reasoning: `Generated to improve fluency and natural speaking (${priority} weakness). ${data.targetGrammar ? `Grammar focus: ${data.targetGrammar}` : ''}`,
      targetWeaknesses: ['Fluency', ...(weaknessAnalysis.grammarIssues || [])]
    };
  }

  /**
   * Generate confidence-building practice
   */
  private async generateConfidencePractice(
    studentName: string,
    grade: number,
    skillAnalysis: SkillAnalysis,
    difficulty: string,
    priority: string
  ): Promise<GeneratedPractice> {
    // Confidence is built through easy, achievable activities
    // Use simpler difficulty even if overall level is higher
    const adjustedDifficulty = difficulty === 'advanced' ? 'intermediate' : 'beginner';

    return {
      title: `Confidence Builder - Simple Practice`,
      description: 'Easy practice to build your speaking confidence!',
      type: 'conversation_prompt',
      difficulty: adjustedDifficulty,
      skillArea: SkillArea.CONFIDENCE,
      content: {
        scenario: 'favorite_things',
        difficultyLevel: adjustedDifficulty,
        customInstructions: `Be extra encouraging and supportive. Keep questions very simple. Praise every response.`
      },
      reasoning: `Generated to build confidence (${priority} focus). Using simpler level to ensure success.`,
      targetWeaknesses: ['Confidence', 'Speaking anxiety']
    };
  }

  /**
   * Generate grammar-focused practice
   */
  private async generateGrammarPractice(
    studentName: string,
    grade: number,
    weaknessAnalysis: WeaknessAnalysis
  ): Promise<GeneratedPractice> {
    const grammarIssues = weaknessAnalysis.grammarIssues.join(', ');

    const prompt = `Create a quiz to help an elementary student practice specific grammar concepts.

Student: ${studentName}, Grade ${grade}
Grammar Issues: ${grammarIssues}
Level: ${weaknessAnalysis.overallLevel}

Create 4-5 multiple choice questions focusing on these grammar concepts.
Make questions age-appropriate and engaging.

Respond with JSON:
{
  "title": "Quiz title",
  "description": "What this quiz practices",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct (child-friendly)",
      "category": "Grammar category"
    }
  ]
}`;

    const response = await this.claudeProvider.chat({
      systemPrompt: 'You are a grammar teacher for elementary students. Respond with JSON only.',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      maxTokens: 1200,
    });

    const data = this.parseJSON(response.content);

    return {
      title: data.title || 'Grammar Practice Quiz',
      description: data.description || `Practice ${grammarIssues}`,
      type: 'quiz',
      difficulty: weaknessAnalysis.overallLevel,
      skillArea: SkillArea.VOCABULARY, // Grammar is part of vocabulary skill
      content: {
        questions: data.questions,
        passingScore: 70,
        showExplanations: true
      },
      reasoning: `Generated to address grammar weaknesses: ${grammarIssues}`,
      targetWeaknesses: weaknessAnalysis.grammarIssues
    };
  }

  /**
   * Determine appropriate difficulty level
   */
  private determineDifficulty(skillAnalysis: SkillAnalysis, overallLevel: string): string {
    // If skill is a critical weakness, use beginner level regardless of overall level
    if (skillAnalysis.weaknessLevel === 'critical') {
      return 'beginner';
    }

    // If skill is moderate weakness and overall is advanced, use intermediate
    if (skillAnalysis.weaknessLevel === 'moderate' && overallLevel === 'advanced') {
      return 'intermediate';
    }

    // Otherwise use overall level
    return overallLevel;
  }

  /**
   * Parse JSON from Claude response (handles markdown code blocks)
   */
  private parseJSON(content: string): any {
    try {
      // Try direct parse first
      return JSON.parse(content);
    } catch {
      // Try extracting from markdown code block
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      throw new Error('Failed to parse JSON from Claude response');
    }
  }
}
