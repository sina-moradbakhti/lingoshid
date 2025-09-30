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
  template: `
    <div class="container">
      <div class="header">
        <button (click)="goBack()" class="back-btn">← Back</button>
        <h1>Create Custom Practice</h1>
      </div>

      <div class="two-column-layout">
        <!-- Left: Create Form -->
        <div class="form-section">
          <h2>New Practice</h2>
          <form (ngSubmit)="createPractice()" class="practice-form">
            <div class="form-group">
              <label>Title *</label>
              <input type="text" [(ngModel)]="newPractice.title" name="title" required placeholder="e.g., Describe Your Favorite Food" />
            </div>

            <div class="form-group">
              <label>Description *</label>
              <textarea [(ngModel)]="newPractice.description" name="description" required rows="3" placeholder="What will students do in this activity?"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Activity Type *</label>
                <select [(ngModel)]="newPractice.type" name="type" required (change)="onActivityTypeChange()">
                  <option value="">Select type...</option>
                  <option *ngFor="let type of activityTypes" [value]="type.value">{{ type.label }}</option>
                </select>
                <small *ngIf="newPractice.type" class="type-description">{{ getTypeDescription(newPractice.type) }}</small>
              </div>

              <div class="form-group">
                <label>Difficulty *</label>
                <select [(ngModel)]="newPractice.difficulty" name="difficulty" required>
                  <option value="">Select...</option>
                  <option *ngFor="let diff of difficultyLevels" [value]="diff.value">{{ diff.label }}</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Skill Area *</label>
                <select [(ngModel)]="newPractice.skillArea" name="skillArea" required>
                  <option value="">Select...</option>
                  <option *ngFor="let skill of skillAreas" [value]="skill.value">{{ skill.label }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Points Reward *</label>
                <input type="number" [(ngModel)]="newPractice.pointsReward" name="pointsReward" required min="5" max="50" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Min Level *</label>
                <input type="number" [(ngModel)]="newPractice.minLevel" name="minLevel" required min="1" max="10" />
              </div>

              <div class="form-group">
                <label>Max Level (Optional)</label>
                <input type="number" [(ngModel)]="newPractice.maxLevel" name="maxLevel" min="1" max="10" />
              </div>
            </div>

            <!-- Dynamic Content Fields Based on Activity Type -->
            <div *ngIf="newPractice.type" class="content-section">
              <h3>Activity Content</h3>

              <!-- Pronunciation Challenge Content -->
              <div *ngIf="newPractice.type === 'pronunciation_challenge'" class="content-fields">
                <div class="form-group">
                  <label>Instruction (Optional)</label>
                  <textarea [(ngModel)]="content.pronunciation.instruction" name="pronInstruction" rows="2"
                    placeholder="e.g., Listen carefully and repeat each word clearly"></textarea>
                </div>

                <div class="words-section">
                  <label>Words to Practice *</label>
                  <div *ngFor="let word of content.pronunciation.words; let i = index" class="word-item">
                    <div class="word-header">
                      <span class="word-number">Word {{i + 1}}</span>
                      <button type="button" (click)="removePronunciationWord(i)" class="btn-remove">×</button>
                    </div>
                    <div class="word-fields">
                      <input type="text" [(ngModel)]="word.word" [name]="'word_' + i" placeholder="Word" required />
                      <input type="text" [(ngModel)]="word.phonetic" [name]="'phonetic_' + i" placeholder="Phonetic (e.g., /həˈloʊ/)" required />
                      <input type="text" [(ngModel)]="word.audioUrl" [name]="'audioUrl_' + i" placeholder="Audio URL (optional)" />
                    </div>
                  </div>
                  <button type="button" (click)="addPronunciationWord()" class="btn-add">+ Add Word</button>
                </div>
              </div>

              <!-- Picture Description Content -->
              <div *ngIf="newPractice.type === 'picture_description'" class="content-fields">
                <div class="form-group">
                  <label>Instruction (Optional)</label>
                  <textarea [(ngModel)]="content.pictureDescription.instruction" name="picInstruction" rows="2"
                    placeholder="e.g., Look at the picture and describe what you see"></textarea>
                </div>

                <div class="pictures-section">
                  <label>Pictures *</label>
                  <div *ngFor="let picture of content.pictureDescription.pictures; let i = index" class="picture-item">
                    <div class="picture-header">
                      <span class="picture-number">Picture {{i + 1}}</span>
                      <button type="button" (click)="removePicture(i)" class="btn-remove">×</button>
                    </div>
                    <div class="picture-fields">
                      <input type="text" [(ngModel)]="picture.imageUrl" [name]="'imageUrl_' + i" placeholder="Image URL" required />
                      <textarea [(ngModel)]="picture.prompt" [name]="'prompt_' + i" rows="2" placeholder="Prompt" required></textarea>
                      <input type="text" [(ngModel)]="picture.vocabularyHints" [name]="'vocab_' + i"
                        placeholder="Vocabulary hints (comma-separated)" />
                    </div>
                  </div>
                  <button type="button" (click)="addPicture()" class="btn-add">+ Add Picture</button>
                </div>
              </div>

              <!-- Virtual Conversation Content -->
              <div *ngIf="newPractice.type === 'virtual_conversation'" class="content-fields">
                <div class="form-group">
                  <label>Instruction (Optional)</label>
                  <textarea [(ngModel)]="content.conversation.instruction" name="convInstruction" rows="2"
                    placeholder="e.g., Have a conversation with the character"></textarea>
                </div>

                <div class="character-section">
                  <h4>Character Information</h4>
                  <div class="form-group">
                    <label>Character Name *</label>
                    <input type="text" [(ngModel)]="content.conversation.character.name" name="charName" placeholder="e.g., Alex" required />
                  </div>
                  <div class="form-group">
                    <label>Avatar (Emoji) *</label>
                    <input type="text" [(ngModel)]="content.conversation.character.avatar" name="charAvatar" placeholder="e.g., 👦" required />
                  </div>
                  <div class="form-group">
                    <label>Character Bio *</label>
                    <textarea [(ngModel)]="content.conversation.character.bio" name="charBio" rows="2"
                      placeholder="e.g., A friendly student who loves sports" required></textarea>
                  </div>
                </div>

                <div class="form-group">
                  <label>Conversation Topic *</label>
                  <input type="text" [(ngModel)]="content.conversation.topic" name="convTopic" placeholder="e.g., Hobbies and Interests" required />
                </div>

                <div class="prompts-section">
                  <label>Conversation Prompts *</label>
                  <div *ngFor="let prompt of content.conversation.prompts; let i = index" class="prompt-item">
                    <input type="text" [(ngModel)]="content.conversation.prompts[i]" [name]="'prompt_' + i" placeholder="Prompt" required />
                    <button type="button" (click)="removeConversationPrompt(i)" class="btn-remove-small">×</button>
                  </div>
                  <button type="button" (click)="addConversationPrompt()" class="btn-add">+ Add Prompt</button>
                </div>
              </div>

              <!-- Role Play Content -->
              <div *ngIf="newPractice.type === 'role_play'" class="content-fields">
                <div class="form-group">
                  <label>Instruction (Optional)</label>
                  <textarea [(ngModel)]="content.rolePlay.instruction" name="roleInstruction" rows="2"
                    placeholder="e.g., Act out the scenario with your partner"></textarea>
                </div>

                <div class="scenarios-section">
                  <label>Scenarios *</label>
                  <div *ngFor="let scenario of content.rolePlay.scenarios; let i = index" class="scenario-item">
                    <div class="scenario-header">
                      <span class="scenario-number">Scenario {{i + 1}}</span>
                      <button type="button" (click)="removeScenario(i)" class="btn-remove">×</button>
                    </div>
                    <div class="scenario-fields">
                      <input type="text" [(ngModel)]="scenario.title" [name]="'scenarioTitle_' + i" placeholder="Scenario Title" required />
                      <textarea [(ngModel)]="scenario.description" [name]="'scenarioDesc_' + i" rows="2" placeholder="Description" required></textarea>

                      <div class="characters-subsection">
                        <label>Characters</label>
                        <div *ngFor="let char of scenario.characters; let j = index" class="character-item-small">
                          <input type="text" [(ngModel)]="char.name" [name]="'charName_' + i + '_' + j" placeholder="Name" required />
                          <input type="text" [(ngModel)]="char.role" [name]="'charRole_' + i + '_' + j" placeholder="Role" required />
                          <button type="button" (click)="removeScenarioCharacter(i, j)" class="btn-remove-small">×</button>
                        </div>
                        <button type="button" (click)="addScenarioCharacter(i)" class="btn-add-small">+ Character</button>
                      </div>

                      <div class="prompts-subsection">
                        <label>Dialogue Prompts</label>
                        <div *ngFor="let prompt of scenario.dialoguePrompts; let j = index" class="prompt-item-small">
                          <input type="text" [(ngModel)]="scenario.dialoguePrompts[j]" [name]="'dialoguePrompt_' + i + '_' + j" placeholder="Prompt" />
                          <button type="button" (click)="removeDialoguePrompt(i, j)" class="btn-remove-small">×</button>
                        </div>
                        <button type="button" (click)="addDialoguePrompt(i)" class="btn-add-small">+ Prompt</button>
                      </div>
                    </div>
                  </div>
                  <button type="button" (click)="addScenario()" class="btn-add">+ Add Scenario</button>
                </div>
              </div>

              <!-- Story Creation Content -->
              <div *ngIf="newPractice.type === 'story_creation'" class="content-fields">
                <div class="form-group">
                  <label>Instruction (Optional)</label>
                  <textarea [(ngModel)]="content.storyCreation.instruction" name="storyInstruction" rows="2"
                    placeholder="e.g., Create your own story using the vocabulary words"></textarea>
                </div>

                <div class="form-group">
                  <label>Theme *</label>
                  <input type="text" [(ngModel)]="content.storyCreation.theme" name="storyTheme" placeholder="e.g., Adventure" required />
                </div>

                <div class="form-group">
                  <label>Story Starter (Optional)</label>
                  <textarea [(ngModel)]="content.storyCreation.storyStarter" name="storyStarter" rows="2"
                    placeholder="e.g., Once upon a time, in a faraway land..."></textarea>
                </div>

                <div class="form-group">
                  <label>Vocabulary Words (comma-separated)</label>
                  <input type="text" [(ngModel)]="content.storyCreation.vocabularyWords" name="storyVocab"
                    placeholder="e.g., adventure, forest, treasure" />
                </div>

                <div class="form-group">
                  <label>Image Prompts (URLs, comma-separated)</label>
                  <input type="text" [(ngModel)]="content.storyCreation.imagePrompts" name="storyImages"
                    placeholder="Image URLs" />
                </div>

                <div class="guiding-questions-section">
                  <label>Guiding Questions</label>
                  <div *ngFor="let question of content.storyCreation.guidingQuestions; let i = index" class="question-item">
                    <input type="text" [(ngModel)]="content.storyCreation.guidingQuestions[i]" [name]="'question_' + i" placeholder="Question" />
                    <button type="button" (click)="removeGuidingQuestion(i)" class="btn-remove-small">×</button>
                  </div>
                  <button type="button" (click)="addGuidingQuestion()" class="btn-add">+ Add Question</button>
                </div>
              </div>

              <!-- Singing & Chanting Content -->
              <div *ngIf="newPractice.type === 'singing_chanting'" class="content-fields">
                <div class="form-group">
                  <label>Instruction (Optional)</label>
                  <textarea [(ngModel)]="content.singingChanting.instruction" name="singInstruction" rows="2"
                    placeholder="e.g., Sing along and follow the rhythm"></textarea>
                </div>

                <div class="form-group">
                  <label>Song/Chant Title *</label>
                  <input type="text" [(ngModel)]="content.singingChanting.title" name="songTitle" placeholder="e.g., Twinkle Twinkle Little Star" required />
                </div>

                <div class="form-group">
                  <label>Audio URL (Optional)</label>
                  <input type="text" [(ngModel)]="content.singingChanting.audioUrl" name="songAudio" placeholder="Audio file URL" />
                </div>

                <div class="form-group">
                  <label>Rhythm Pattern (Optional)</label>
                  <input type="text" [(ngModel)]="content.singingChanting.rhythmPattern" name="songRhythm"
                    placeholder="e.g., 4/4 time, steady beat" />
                </div>

                <div class="lyrics-section">
                  <label>Lyrics *</label>
                  <div *ngFor="let line of content.singingChanting.lyrics; let i = index" class="lyric-item">
                    <textarea [(ngModel)]="content.singingChanting.lyrics[i]" [name]="'lyric_' + i" rows="1" placeholder="Lyric line" required></textarea>
                    <button type="button" (click)="removeLyricLine(i)" class="btn-remove-small">×</button>
                  </div>
                  <button type="button" (click)="addLyricLine()" class="btn-add">+ Add Line</button>
                </div>

                <div class="actions-section">
                  <label>Actions (Optional)</label>
                  <div *ngFor="let action of content.singingChanting.actions; let i = index" class="action-item">
                    <input type="text" [(ngModel)]="content.singingChanting.actions[i]" [name]="'action_' + i" placeholder="Action description" />
                    <button type="button" (click)="removeAction(i)" class="btn-remove-small">×</button>
                  </div>
                  <button type="button" (click)="addAction()" class="btn-add">+ Add Action</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Assign To</label>
              <div class="student-selection">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="assignToAll" name="assignToAll" (change)="toggleAssignAll()" />
                  All Students
                </label>
                <div *ngIf="!assignToAll" class="student-list-selector">
                  <div *ngFor="let student of students" class="checkbox-label">
                    <input type="checkbox" [checked]="isStudentSelected(student.id)" (change)="toggleStudent(student.id)" />
                    {{ student.firstName }} {{ student.lastName }} (Grade {{ student.grade }})
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="createError" class="error-message">{{ createError }}</div>
            <div *ngIf="createSuccess" class="success-message">{{ createSuccess }}</div>

            <button type="submit" class="btn-create" [disabled]="isCreating">
              {{ isCreating ? 'Creating...' : 'Create Practice' }}
            </button>
          </form>
        </div>

        <!-- Right: Existing Practices -->
        <div class="practices-section">
          <h2>My Custom Practices</h2>

          <div *ngIf="isLoadingPractices" class="loading">Loading...</div>

          <div *ngIf="!isLoadingPractices && customPractices.length === 0" class="empty-state">
            No custom practices yet. Create one to get started!
          </div>

          <div *ngIf="!isLoadingPractices && customPractices.length > 0" class="practices-list">
            <div *ngFor="let practice of customPractices" class="practice-card">
              <div class="practice-header">
                <h3>{{ practice.activity.title }}</h3>
                <button (click)="deletePractice(practice.activity.id)" class="btn-delete" title="Delete">🗑️</button>
              </div>
              <p class="practice-description">{{ practice.activity.description }}</p>
              <div class="practice-meta">
                <span class="badge">{{ formatType(practice.activity.type) }}</span>
                <span class="badge">{{ formatDifficulty(practice.activity.difficulty) }}</span>
                <span class="badge">{{ formatSkillArea(practice.activity.skillArea) }}</span>
              </div>
              <div class="practice-stats">
                <div class="stat-item">
                  <strong>{{ practice.activity.pointsReward }}</strong> pts
                </div>
                <div class="stat-item">
                  <strong>{{ practice.totalAssigned }}</strong> students
                </div>
                <div class="stat-item">
                  Level <strong>{{ practice.activity.minLevel }}</strong>
                  <span *ngIf="practice.activity.maxLevel">- {{ practice.activity.maxLevel }}</span>
                </div>
              </div>
              <details class="assigned-students">
                <summary>View assigned students ({{ practice.totalAssigned }})</summary>
                <ul>
                  <li *ngFor="let student of practice.assignedStudents">
                    {{ student.name }}
                  </li>
                </ul>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .header {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header h1 {
      margin: 0;
      color: #667eea;
    }

    .back-btn {
      padding: 10px 15px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    .back-btn:hover {
      background: #5a67d8;
    }

    .two-column-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-section, .practices-section {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-height: 90vh;
      overflow-y: auto;
    }

    .form-section h2, .practices-section h2 {
      margin: 0 0 20px 0;
      color: #2d3748;
    }

    .practice-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .form-group label {
      color: #4a5568;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 10px;
      border: 2px solid #e2e8f0;
      border-radius: 5px;
      font-size: 1rem;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }

    .type-description {
      color: #718096;
      font-size: 0.85rem;
      font-style: italic;
    }

    .content-section {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
    }

    .content-section h3 {
      margin: 0 0 15px 0;
      color: #667eea;
      font-size: 1.1rem;
    }

    .content-fields {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .content-fields h4 {
      margin: 10px 0 5px 0;
      color: #4a5568;
      font-size: 0.95rem;
    }

    .word-item, .picture-item, .scenario-item {
      background: white;
      padding: 15px;
      border-radius: 5px;
      border: 1px solid #e2e8f0;
      margin-bottom: 10px;
    }

    .word-header, .picture-header, .scenario-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .word-number, .picture-number, .scenario-number {
      font-weight: 600;
      color: #667eea;
    }

    .word-fields, .picture-fields, .scenario-fields {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .word-fields input, .picture-fields input, .picture-fields textarea,
    .scenario-fields input, .scenario-fields textarea {
      padding: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .character-item-small, .prompt-item-small, .question-item,
    .lyric-item, .action-item, .prompt-item {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      align-items: center;
    }

    .character-item-small input, .prompt-item-small input,
    .question-item input, .lyric-item textarea, .action-item input,
    .prompt-item input {
      flex: 1;
      padding: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .btn-remove {
      background: #fc8181;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 5px 12px;
      cursor: pointer;
      font-size: 1.2rem;
      line-height: 1;
    }

    .btn-remove:hover {
      background: #f56565;
    }

    .btn-remove-small {
      background: #fc8181;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-remove-small:hover {
      background: #f56565;
    }

    .btn-add, .btn-add-small {
      background: #48bb78;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .btn-add:hover, .btn-add-small:hover {
      background: #38a169;
    }

    .btn-add-small {
      font-size: 0.8rem;
      padding: 5px 10px;
    }

    .characters-subsection, .prompts-subsection {
      margin-top: 10px;
      padding: 10px;
      background: #f7fafc;
      border-radius: 4px;
    }

    .characters-subsection label, .prompts-subsection label {
      font-size: 0.85rem;
      color: #4a5568;
      font-weight: 600;
      margin-bottom: 5px;
      display: block;
    }

    .student-selection {
      border: 2px solid #e2e8f0;
      border-radius: 5px;
      padding: 10px;
      max-height: 200px;
      overflow-y: auto;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px;
      cursor: pointer;
    }

    .checkbox-label:hover {
      background: #f7fafc;
      border-radius: 3px;
    }

    .student-list-selector {
      margin-top: 10px;
      padding-left: 20px;
      border-left: 3px solid #667eea;
    }

    .btn-create {
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      margin-top: 10px;
    }

    .btn-create:hover:not(:disabled) {
      background: #5a67d8;
    }

    .btn-create:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-message {
      padding: 12px;
      background: #fed7d7;
      color: #c53030;
      border-radius: 5px;
      font-size: 0.9rem;
    }

    .success-message {
      padding: 12px;
      background: #c6f6d5;
      color: #22543d;
      border-radius: 5px;
      font-size: 0.9rem;
    }

    .loading, .empty-state {
      text-align: center;
      padding: 40px;
      color: #a0aec0;
    }

    .practices-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .practice-card {
      padding: 15px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .practice-card:hover {
      border-color: #667eea;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.1);
    }

    .practice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .practice-header h3 {
      margin: 0;
      color: #2d3748;
      font-size: 1.1rem;
    }

    .btn-delete {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .btn-delete:hover {
      opacity: 1;
    }

    .practice-description {
      color: #718096;
      font-size: 0.9rem;
      margin: 0 0 10px 0;
    }

    .practice-meta {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .badge {
      padding: 4px 10px;
      background: #edf2f7;
      color: #4a5568;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .practice-stats {
      display: flex;
      gap: 20px;
      padding: 10px;
      background: #f7fafc;
      border-radius: 5px;
      margin-bottom: 10px;
    }

    .stat-item {
      font-size: 0.85rem;
      color: #718096;
    }

    .stat-item strong {
      color: #667eea;
      font-size: 1rem;
    }

    .assigned-students {
      margin-top: 10px;
      cursor: pointer;
    }

    .assigned-students summary {
      color: #667eea;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .assigned-students ul {
      margin: 10px 0 0 0;
      padding-left: 20px;
    }

    .assigned-students li {
      color: #4a5568;
      font-size: 0.85rem;
      padding: 2px 0;
    }

    @media (max-width: 1200px) {
      .two-column-layout {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
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