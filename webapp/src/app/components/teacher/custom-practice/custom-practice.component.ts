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
      max-height: 700px;
      overflow-y: auto;
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
    assignedStudents: []
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
    // Reset content when type changes
    this.newPractice.content = {};
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

  createPractice() {
    this.createError = '';
    this.createSuccess = '';
    this.isCreating = true;

    const practiceData = {
      ...this.newPractice,
      assignedStudents: this.assignToAll ? [] : this.newPractice.assignedStudents
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
      assignedStudents: []
    };
    this.assignToAll = true;
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