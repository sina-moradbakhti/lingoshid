import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeChatOptions {
  systemPrompt: string;
  messages: ClaudeMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface ClaudeChatResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

@Injectable()
export class ClaudeProvider {
  private client: Anthropic;
  private readonly defaultModel = 'claude-3-5-haiku-20241022'; // Fast and cheap

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');

    if (!apiKey) {
      console.warn('⚠️  ANTHROPIC_API_KEY not found in environment variables');
    }

    this.client = new Anthropic({
      apiKey: apiKey || 'dummy-key', // Fallback for development
    });
  }

  /**
   * Send a chat message to Claude and get response
   */
  async chat(options: ClaudeChatOptions): Promise<ClaudeChatResponse> {
    try {
      const response = await this.client.messages.create({
        model: options.model || this.defaultModel,
        max_tokens: options.maxTokens || 300,
        temperature: options.temperature || 0.7,
        system: options.systemPrompt,
        messages: options.messages,
      });

      const content = response.content[0];
      const text = content.type === 'text' ? content.text : '';

      return {
        content: text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error(`Failed to get response from Claude: ${error.message}`);
    }
  }

  /**
   * Evaluate student's conversation for educational feedback
   */
  async evaluateConversation(
    studentMessages: string[],
    aiResponses: string[],
    studentLevel: 'beginner' | 'intermediate' | 'advanced',
    grade: number
  ): Promise<any> {
    const conversationText = studentMessages
      .map((msg, i) => `Student: ${msg}\nAI: ${aiResponses[i] || ''}`)
      .join('\n\n');

    const evaluationPrompt = `You are an expert English teacher evaluating an elementary student's conversation.

Student Grade: ${grade} (Ages 9-12)
Student Level: ${studentLevel}

Conversation:
${conversationText}

Please evaluate the student's English skills and provide:
1. Grammar Score (0-100): Assess sentence structure, verb tenses, subject-verb agreement
2. Vocabulary Score (0-100): Assess word choice, variety, appropriateness
3. Coherence Score (0-100): Assess logical flow, staying on topic, understanding
4. Fluency Score (0-100): Estimate naturalness and confidence from responses
5. Overall Score (0-100): Average weighted score

Also provide:
- 2-3 specific strengths (be encouraging!)
- 2-3 areas for improvement (be gentle and constructive)
- 2-3 learning suggestions (age-appropriate next steps)
- List of grammar mistakes (if any) with corrections and simple explanations
- New vocabulary words the student used successfully

Format your response as JSON:
{
  "grammarScore": number,
  "vocabularyScore": number,
  "coherenceScore": number,
  "fluencyScore": number,
  "overallScore": number,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "suggestions": ["...", "..."],
  "grammarMistakes": [
    {"mistake": "...", "correction": "...", "explanation": "..."}
  ],
  "vocabularyUsed": ["word1", "word2", "..."],
  "conversationQuality": "excellent" | "good" | "needs_improvement"
}`;

    try {
      const response = await this.chat({
        systemPrompt: 'You are an expert English teacher specializing in elementary education. Always be encouraging, patient, and age-appropriate.',
        messages: [
          {
            role: 'user',
            content: evaluationPrompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent evaluation
        maxTokens: 1000,
      });

      // Parse JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Failed to parse evaluation response');
    } catch (error) {
      console.error('Evaluation Error:', error);
      // Return default evaluation on error
      return {
        grammarScore: 70,
        vocabularyScore: 70,
        coherenceScore: 70,
        fluencyScore: 70,
        overallScore: 70,
        strengths: ['Participated in conversation'],
        improvements: ['Keep practicing!'],
        suggestions: ['Try using more descriptive words'],
        grammarMistakes: [],
        vocabularyUsed: [],
        conversationQuality: 'good',
      };
    }
  }

  /**
   * Check if Claude API is configured and working
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.chat({
        systemPrompt: 'You are a helpful assistant.',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 10,
      });
      return true;
    } catch {
      return false;
    }
  }
}
