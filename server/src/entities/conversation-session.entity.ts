import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Student } from './student.entity';
import { Activity } from './activity.entity';

export interface ChatMessage {
  role: 'student' | 'ai';
  content: string;
  timestamp: Date;
}

export interface AiEvaluation {
  grammarScore: number;        // 0-100
  vocabularyScore: number;     // 0-100
  coherenceScore: number;      // 0-100
  fluencyScore: number;        // 0-100
  overallScore: number;        // 0-100

  // Detailed feedback
  strengths: string[];
  improvements: string[];
  suggestions: string[];

  // Specific issues found
  grammarMistakes?: Array<{
    mistake: string;
    correction: string;
    explanation: string;
  }>;

  vocabularyUsed: string[];    // New words student used
  conversationQuality: string;  // 'excellent' | 'good' | 'needs_improvement'
}

@Entity('conversation_sessions')
export class ConversationSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  status: 'active' | 'completed' | 'abandoned';

  @Column({ default: 1 })
  turnCount: number;

  @Column({ default: 0 })
  totalTimeSpent: number; // in seconds

  @Column('json')
  messages: ChatMessage[];

  @Column('json', { nullable: true })
  aiEvaluation: AiEvaluation | null;

  @Column({ nullable: true })
  scenario: string; // Conversation topic/scenario

  @Column({ default: 'beginner' })
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Student, student => student.conversationSessions)
  student: Student;

  @ManyToOne(() => Activity, activity => activity.conversationSessions)
  activity: Activity;
}
