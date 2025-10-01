import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../../services/teacher.service';

interface ActivityType {
  value: string;
  label: string;
  description: string;
}

interface DifficultyLevel {
  value: string;
  label: string;
}

interface SkillArea {
  value: string;
  label: string;
}

@Component({
  selector: 'app-custom-practice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-practice.component.html',
  styleUrls: ['./custom-practice.component.scss']
})
export class CustomPracticeComponent implements OnInit {
  activityTypes: ActivityType[] = [
    { value: 'pronunciation_challenge', label: 'Pronunciation Challenge', description: 'Practice pronouncing words and sentences clearly' },
    { value: 'virtual_conversation', label: 'Virtual Conversation', description: 'Have a conversation about a specific topic' },
    { value: 'picture_description', label: 'Picture Description', description: 'Describe images using English vocabulary' },
    { value: 'role_play', label: 'Role Play', description: 'Act out scenarios and practice real-life situations' },
    { value: 'story_creation', label: 'Story Creation', description: 'Create and tell stories in English' },
    { value: 'singing_chanting', label: 'Singing & Chanting', description: 'Learn through songs and rhythmic chants' }
  ];

  difficultyLevels: DifficultyLevel[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  skillAreas: SkillArea[] = [
    { value: 'fluency', label: 'Fluency' },
    { value: 'pronunciation', label: 'Pronunciation' },
    { value: 'confidence', label: 'Confidence' },
    { value: 'vocabulary', label: 'Vocabulary' }
  ];

  newPractice: any = {
    title: '',
    description: '',
    type: '',
    difficulty: '',
    skillArea: '',
    pointsReward: 20,
    minLevel: 1,
    maxLevel: null,
    assignedStudents: [],
    content: null
  };

  // Content structures for each activity type
  content: any = {
    pronunciation: {
      instruction: '',
      words: []
    },
    pictureDescription: {
      instruction: '',
      pictures: []
    },
    conversation: {
      instruction: '',
      character: { name: '', avatar: '', bio: '' },
      topic: '',
      prompts: []
    },
    rolePlay: {
      instruction: '',
      scenarios: []
    },
    storyCreation: {
      instruction: '',
      theme: '',
      storyStarter: '',
      vocabularyWords: '',
      imagePrompts: '',
      guidingQuestions: []
    },
    singingChanting: {
      instruction: '',
      title: '',
      audioUrl: '',
      rhythmPattern: '',
      lyrics: [],
      actions: []
    }
  };

  students: any[] = [];
  customPractices: any[] = [];
  assignToAll = true;
  isCreating = false;
  isLoadingPractices = true;
  createError = '';
  createSuccess = '';

  constructor(
    private router: Router,
    private teacherService: TeacherService
  ) {}

  ngOnInit() {
    this.loadStudents();
    this.loadCustomPractices();
  }

  loadStudents() {
    this.teacherService.getStudentsList().subscribe({
      next: (students) => {
        this.students = students;
      },
      error: (error) => {
        console.error('Error loading students:', error);
      }
    });
  }

  loadCustomPractices() {
    this.isLoadingPractices = true;
    this.teacherService.getCustomPractices().subscribe({
      next: (practices) => {
        this.customPractices = practices;
        this.isLoadingPractices = false;
      },
      error: (error) => {
        console.error('Error loading custom practices:', error);
        this.isLoadingPractices = false;
      }
    });
  }

  onActivityTypeChange() {
    // Reset all content structures
    this.content = {
      pronunciation: { instruction: '', words: [] },
      pictureDescription: { instruction: '', pictures: [] },
      conversation: {
        instruction: '',
        character: { name: '', avatar: '', bio: '' },
        topic: '',
        prompts: []
      },
      rolePlay: { instruction: '', scenarios: [] },
      storyCreation: {
        instruction: '',
        theme: '',
        storyStarter: '',
        vocabularyWords: '',
        imagePrompts: '',
        guidingQuestions: []
      },
      singingChanting: {
        instruction: '',
        title: '',
        audioUrl: '',
        rhythmPattern: '',
        lyrics: [],
        actions: []
      }
    };
  }

  // Pronunciation Challenge methods
  addPronunciationWord() {
    this.content.pronunciation.words.push({ word: '', phonetic: '', audioUrl: '' });
  }

  removePronunciationWord(index: number) {
    this.content.pronunciation.words.splice(index, 1);
  }

  // Picture Description methods
  addPicture() {
    this.content.pictureDescription.pictures.push({ imageUrl: '', prompt: '', vocabularyHints: '' });
  }

  removePicture(index: number) {
    this.content.pictureDescription.pictures.splice(index, 1);
  }

  // Virtual Conversation methods
  addConversationPrompt() {
    this.content.conversation.prompts.push('');
  }

  removeConversationPrompt(index: number) {
    this.content.conversation.prompts.splice(index, 1);
  }

  // Role Play methods
  addScenario() {
    this.content.rolePlay.scenarios.push({
      title: '',
      description: '',
      characters: [],
      dialoguePrompts: []
    });
  }

  removeScenario(index: number) {
    this.content.rolePlay.scenarios.splice(index, 1);
  }

  addScenarioCharacter(scenarioIndex: number) {
    this.content.rolePlay.scenarios[scenarioIndex].characters.push({ name: '', role: '', description: '' });
  }

  removeScenarioCharacter(scenarioIndex: number, charIndex: number) {
    this.content.rolePlay.scenarios[scenarioIndex].characters.splice(charIndex, 1);
  }

  addDialoguePrompt(scenarioIndex: number) {
    this.content.rolePlay.scenarios[scenarioIndex].dialoguePrompts.push('');
  }

  removeDialoguePrompt(scenarioIndex: number, promptIndex: number) {
    this.content.rolePlay.scenarios[scenarioIndex].dialoguePrompts.splice(promptIndex, 1);
  }

  // Story Creation methods
  addGuidingQuestion() {
    this.content.storyCreation.guidingQuestions.push('');
  }

  removeGuidingQuestion(index: number) {
    this.content.storyCreation.guidingQuestions.splice(index, 1);
  }

  // Singing & Chanting methods
  addLyricLine() {
    this.content.singingChanting.lyrics.push('');
  }

  removeLyricLine(index: number) {
    this.content.singingChanting.lyrics.splice(index, 1);
  }

  addAction() {
    this.content.singingChanting.actions.push('');
  }

  removeAction(index: number) {
    this.content.singingChanting.actions.splice(index, 1);
  }

  getTypeDescription(type: string): string {
    return this.activityTypes.find(t => t.value === type)?.description || '';
  }

  toggleAssignAll() {
    if (this.assignToAll) {
      this.newPractice.assignedStudents = [];
    }
  }

  toggleStudent(studentId: string) {
    const index = this.newPractice.assignedStudents.indexOf(studentId);
    if (index > -1) {
      this.newPractice.assignedStudents.splice(index, 1);
    } else {
      this.newPractice.assignedStudents.push(studentId);
    }
  }

  isStudentSelected(studentId: string): boolean {
    return this.newPractice.assignedStudents.includes(studentId);
  }

  prepareContentForSubmission(): any {
    switch (this.newPractice.type) {
      case 'pronunciation_challenge':
        return {
          instruction: this.content.pronunciation.instruction,
          words: this.content.pronunciation.words.filter((w: any) => w.word && w.phonetic)
        };

      case 'picture_description':
        return {
          instruction: this.content.pictureDescription.instruction,
          pictures: this.content.pictureDescription.pictures.filter((p: any) => p.imageUrl && p.prompt)
            .map((p: any) => ({
              ...p,
              vocabularyHints: p.vocabularyHints ? p.vocabularyHints.split(',').map((v: string) => v.trim()) : []
            }))
        };

      case 'virtual_conversation':
        return {
          instruction: this.content.conversation.instruction,
          character: this.content.conversation.character,
          topic: this.content.conversation.topic,
          prompts: this.content.conversation.prompts.filter((p: string) => p.trim())
        };

      case 'role_play':
        return {
          instruction: this.content.rolePlay.instruction,
          scenarios: this.content.rolePlay.scenarios.filter((s: any) => s.title && s.description)
        };

      case 'story_creation':
        return {
          instruction: this.content.storyCreation.instruction,
          theme: this.content.storyCreation.theme,
          storyStarter: this.content.storyCreation.storyStarter,
          vocabularyWords: this.content.storyCreation.vocabularyWords
            ? this.content.storyCreation.vocabularyWords.split(',').map((v: string) => v.trim())
            : [],
          imagePrompts: this.content.storyCreation.imagePrompts
            ? this.content.storyCreation.imagePrompts.split(',').map((v: string) => v.trim())
            : [],
          guidingQuestions: this.content.storyCreation.guidingQuestions.filter((q: string) => q.trim())
        };

      case 'singing_chanting':
        return {
          instruction: this.content.singingChanting.instruction,
          title: this.content.singingChanting.title,
          audioUrl: this.content.singingChanting.audioUrl,
          rhythmPattern: this.content.singingChanting.rhythmPattern,
          lyrics: this.content.singingChanting.lyrics.filter((l: string) => l.trim()),
          actions: this.content.singingChanting.actions.filter((a: string) => a.trim())
        };

      default:
        return null;
    }
  }

  createPractice() {
    this.createError = '';
    this.createSuccess = '';

    // Validate content exists
    const contentData = this.prepareContentForSubmission();
    if (!contentData) {
      this.createError = 'Please fill in the activity content';
      return;
    }

    this.isCreating = true;

    const practiceData = {
      ...this.newPractice,
      content: contentData,
      assignedStudents: this.newPractice.assignedStudents
    };

    this.teacherService.createCustomPractice(practiceData).subscribe({
      next: (response) => {
        this.createSuccess = response.message;
        this.resetForm();
        this.loadCustomPractices();
        this.isCreating = false;
        setTimeout(() => this.createSuccess = '', 5000);
      },
      error: (error) => {
        this.createError = error.error?.message || 'Failed to create custom practice';
        this.isCreating = false;
      }
    });
  }

  deletePractice(activityId: string) {
    if (confirm('Are you sure you want to delete this custom practice?')) {
      this.teacherService.deleteCustomPractice(activityId).subscribe({
        next: () => {
          this.loadCustomPractices();
        },
        error: (error) => {
          console.error('Error deleting practice:', error);
          alert('Failed to delete custom practice');
        }
      });
    }
  }

  resetForm() {
    this.newPractice = {
      title: '',
      description: '',
      type: '',
      difficulty: '',
      skillArea: '',
      pointsReward: 20,
      minLevel: 1,
      maxLevel: null,
      assignedStudents: [],
      content: null
    };
    this.assignToAll = true;
    this.onActivityTypeChange();
  }

  formatType(type: string): string {
    return this.activityTypes.find(t => t.value === type)?.label || type;
  }

  formatDifficulty(difficulty: string): string {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  }

  formatSkillArea(skillArea: string): string {
    return skillArea.charAt(0).toUpperCase() + skillArea.slice(1);
  }

  goBack() {
    this.router.navigate(['/teacher']);
  }
}