// Content structure interfaces for different activity types

export interface PronunciationWord {
  word: string;
  phonetic: string;
  audioUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface PronunciationChallengeContent {
  words: PronunciationWord[];
  instruction?: string;
}

export interface PictureDescriptionItem {
  imageUrl: string;
  prompt: string;
  vocabularyHints?: string[];
  sampleAnswer?: string;
}

export interface PictureDescriptionContent {
  pictures: PictureDescriptionItem[];
  instruction?: string;
}

export interface ConversationMessage {
  role: 'character' | 'student';
  text: string;
  audioUrl?: string;
}

export interface VirtualConversationContent {
  character: {
    name: string;
    avatar: string;
    bio: string;
  };
  topic: string;
  prompts: string[];
  sampleDialogue?: ConversationMessage[];
  instruction?: string;
}

export interface RolePlayScenario {
  title: string;
  description: string;
  characters: {
    name: string;
    role: string;
    description: string;
  }[];
  dialoguePrompts: string[];
  targetPhrases?: string[];
}

export interface RolePlayContent {
  scenarios: RolePlayScenario[];
  instruction?: string;
}

export interface StoryCreationContent {
  theme: string;
  storyStarter?: string;
  vocabularyWords?: string[];
  imagePrompts?: string[];
  guidingQuestions?: string[];
  instruction?: string;
}

export interface SingingChantingContent {
  title: string;
  lyrics: string[];
  audioUrl?: string;
  rhythmPattern?: string;
  actions?: string[];
  instruction?: string;
}

// Union type for all activity content types
export type ActivityContent =
  | PronunciationChallengeContent
  | PictureDescriptionContent
  | VirtualConversationContent
  | RolePlayContent
  | StoryCreationContent
  | SingingChantingContent;