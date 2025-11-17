# Activity Module System - Developer Guide

## 📚 Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Creating a New Module](#creating-a-new-module)
5. [Module Contract](#module-contract)
6. [Backend Integration](#backend-integration)
7. [Testing Your Module](#testing-your-module)
8. [Examples](#examples)

---

## Overview

The Activity Module System allows developers and supervisors to add new activity types to the platform **without modifying core application code**. Each module is self-contained and follows a standardized input/output contract.

### Key Benefits
- ✅ Add new activity types independently
- ✅ No need to edit core code (start-activity component, etc.)
- ✅ Consistent user experience across all activities
- ✅ Easy to test and maintain
- ✅ Standardized scoring and feedback

### How It Works
```
Activity Data (Database)
         ↓
   Module Registry
         ↓
  Your Custom Module
         ↓
  Standardized Result
         ↓
   Points, Leaderboard, Analytics
```

---

## Quick Start

### Creating Your First Module (5 Steps)

**Step 1:** Create a new component
```bash
cd webapp/src/app/modules/activity-modules
mkdir my-custom-module
cd my-custom-module
```

**Step 2:** Create component file `my-custom-module.component.ts`
```typescript
import { Component } from '@angular/core';
import { BaseActivityModuleComponent } from '../base-activity-module.component';
import { StageSubmissionData, StageResult } from '../../../models/activity-module.interface';

@Component({
  selector: 'app-my-custom-module',
  standalone: true,
  templateUrl: './my-custom-module.component.html',
  styleUrls: ['./my-custom-module.component.scss']
})
export class MyCustomModuleComponent extends BaseActivityModuleComponent {

  initialize(): void {
    console.log('My module initialized!', this.config);
    // Setup your module here
  }

  cleanup(): void {
    // Clean up resources
  }

  protected async processStageResult(data: StageSubmissionData): Promise<StageResult> {
    // Score the student's submission
    const score = 75; // Your scoring logic here

    return {
      stageNumber: data.stageNumber,
      score,
      feedback: this.generateFeedback(score)
    };
  }
}
```

**Step 3:** Create template `my-custom-module.component.html`
```html
<div class="my-module">
  <h2>{{ config.title }}</h2>

  <!-- Your activity UI here -->
  <button (click)="submitStage({ answer: 'test' })">
    Submit
  </button>
</div>
```

**Step 4:** Register your module in `app.component.ts` (or module registry initialization)
```typescript
import { MyCustomModuleComponent } from './modules/activity-modules/my-custom-module/my-custom-module.component';

// In constructor or ngOnInit
this.activityModuleRegistry.register({
  type: 'my_custom_activity',
  name: 'My Custom Activity',
  description: 'A new activity type',
  version: '1.0.0',
  component: MyCustomModuleComponent,
  processor: null, // Backend processor (optional)
  supportedFeatures: ['text', 'audio']
});
```

**Step 5:** Create activity in database with `type: 'my_custom_activity'`

That's it! Your module is now integrated! 🎉

---

## Architecture

### The Module Contract

Every module follows this flow:

```
INPUT (from database) → MODULE PROCESSES → OUTPUT (to system)
```

#### INPUT: ActivityModuleConfig
```typescript
{
  activityId: string;
  activityType: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skillArea: string;
  pointsReward: number;
  content: any; // YOUR module-specific data
  sessionId?: string;
  currentStage?: number;
  totalStages?: number;
}
```

#### OUTPUT: ActivityModuleResult
```typescript
{
  score: number; // 0-100
  timeSpent: number; // seconds
  stagesCompleted: number;
  basePoints: number;
  bonusPoints: number;
  totalPointsEarned: number;
  submissionData: any; // Your module's data
  feedback?: ActivityFeedback;
  sessionId?: string;
  completedAt: Date;
}
```

### What You Ignore

The beauty of the module system: **You don't need to worry about:**
- ❌ Leaderboard updates (automatic)
- ❌ Points calculation (provided by base class)
- ❌ Progress tracking (automatic)
- ❌ Analytics (automatic)
- ❌ Parent/Teacher dashboards (they work automatically)

You **ONLY** focus on:
- ✅ Your activity UI
- ✅ Scoring logic for your activity type
- ✅ Content structure for your activity

---

## Creating a New Module

### Full Example: Quiz Module

#### 1. Component TypeScript

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseActivityModuleComponent } from '../base-activity-module.component';
import { StageSubmissionData, StageResult } from '../../../models/activity-module.interface';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

@Component({
  selector: 'app-quiz-module',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-module.component.html'
})
export class QuizModuleComponent extends BaseActivityModuleComponent {
  questions: QuizQuestion[] = [];
  currentQuestion: QuizQuestion | null = null;
  selectedAnswer: number | null = null;

  initialize(): void {
    // Extract questions from config.content
    this.questions = this.config.content?.questions || [];
    this.config.totalStages = this.questions.length;
    this.loadCurrentQuestion();
  }

  cleanup(): void {
    // Nothing to clean up for this simple module
  }

  private loadCurrentQuestion(): void {
    const index = this.currentStage - 1;
    this.currentQuestion = this.questions[index] || null;
    this.selectedAnswer = null;
  }

  protected override onStageChanged(newStage: number): void {
    this.loadCurrentQuestion();
  }

  selectAnswer(answerIndex: number): void {
    this.selectedAnswer = answerIndex;
  }

  submitAnswer(): void {
    if (this.selectedAnswer === null) return;

    this.submitStage({
      questionIndex: this.currentStage - 1,
      selectedAnswer: this.selectedAnswer,
      question: this.currentQuestion?.question
    });
  }

  protected async processStageResult(data: StageSubmissionData): Promise<StageResult> {
    const questionIndex = data.submissionContent.questionIndex;
    const selectedAnswer = data.submissionContent.selectedAnswer;
    const correctAnswer = this.questions[questionIndex].correctAnswer;

    // Simple scoring: 100 if correct, 0 if wrong
    const score = selectedAnswer === correctAnswer ? 100 : 0;

    return {
      stageNumber: data.stageNumber,
      score,
      feedback: {
        score,
        message: score === 100 ? 'Correct!' : 'Incorrect',
        encouragement: score === 100 ? 'Great job!' : 'Keep trying!',
        suggestions: score === 0 ? ['Review the material'] : []
      }
    };
  }

  protected override getTotalStages(): number {
    return this.questions.length;
  }
}
```

#### 2. Template HTML

```html
<div class="quiz-module">
  <h2>{{ config.title }}</h2>

  <div class="progress">
    Stage {{ currentStage }}/{{ getTotalStages() }}
  </div>

  <div class="question" *ngIf="currentQuestion">
    <h3>{{ currentQuestion.question }}</h3>

    <div class="options">
      <button
        *ngFor="let option of currentQuestion.options; let i = index"
        (click)="selectAnswer(i)"
        [class.selected]="selectedAnswer === i">
        {{ option }}
      </button>
    </div>

    <button
      (click)="submitAnswer()"
      [disabled]="selectedAnswer === null">
      Submit Answer
    </button>
  </div>
</div>
```

#### 3. Database Content Structure

```json
{
  "type": "quiz_challenge",
  "title": "English Grammar Quiz",
  "content": {
    "questions": [
      {
        "question": "What is the past tense of 'go'?",
        "options": ["goed", "went", "gone", "going"],
        "correctAnswer": 1
      },
      {
        "question": "Which is a noun?",
        "options": ["run", "happy", "cat", "quickly"],
        "correctAnswer": 2
      }
    ]
  }
}
```

#### 4. Register Module

```typescript
registry.register({
  type: 'quiz_challenge',
  name: 'Quiz Challenge',
  description: 'Multiple choice quiz',
  version: '1.0.0',
  component: QuizModuleComponent,
  processor: null,
  supportedFeatures: ['text']
});
```

Done! Your quiz module is ready! 🎓

---

## Module Contract

### Required Methods

Every module **MUST** implement:

```typescript
// 1. Initialize your module
initialize(): void {
  // Load data from this.config
  // Set up your state
}

// 2. Clean up resources
cleanup(): void {
  // Stop timers, clear intervals, etc.
}

// 3. Process each stage submission
protected processStageResult(data: StageSubmissionData): Promise<StageResult> {
  // Score the submission
  // Return result with score and feedback
}
```

### Optional Overrides

You **CAN** override for custom behavior:

```typescript
// Custom total stages
protected getTotalStages(): number {
  return this.myQuestions.length;
}

// Custom bonus points calculation
protected calculateBonusPoints(averageScore: number): number {
  return averageScore >= 95 ? 50 : 0;
}

// Custom feedback generation
protected generateFeedback(score: number): ActivityFeedback {
  // Your custom feedback logic
}

// Stage change hook
protected onStageChanged(newStage: number): void {
  // Load next stage data
}
```

### Provided Utilities

The base class gives you these for FREE:

```typescript
// Progress tracking
this.currentStage       // Current stage number
this.stageResults       // Array of completed stage results
this.getProgressPercentage()  // Returns 0-100

// Time tracking
this.totalTimeSpent     // Total seconds spent
this.formatTime(seconds)  // Format as "MM:SS"

// Submission
this.submitStage(data)  // Submit current stage
this.completeActivity() // Mark activity as complete

// Events
this.stageComplete.emit(data)
this.activityComplete.emit(result)
this.activityExit.emit()
this.error.emit(message)

// State
this.isLoading
this.isProcessing
this.errorMessage
```

---

## Backend Integration

### Backend Processor (Optional)

If your module needs server-side processing (e.g., AI scoring, audio analysis), create a backend processor:

**File:** `server/src/modules/activities/processors/my-module.processor.ts`

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyModuleProcessor {
  async processStage(stageData: any, activityContent: any): Promise<any> {
    // Server-side scoring logic
    const score = this.calculateScore(stageData);

    return {
      score,
      feedback: this.generateFeedback(score),
      processingResult: {
        // Any extra data
      }
    };
  }

  private calculateScore(data: any): number {
    // Your scoring algorithm
    return 75;
  }

  private generateFeedback(score: number): any {
    return {
      message: score >= 80 ? 'Great!' : 'Keep practicing',
      suggestions: []
    };
  }
}
```

### Register Backend Processor

In `activities.service.ts`:

```typescript
async processModuleStage(type: string, stageData: any, content: any) {
  switch(type) {
    case 'my_custom_activity':
      return this.myModuleProcessor.processStage(stageData, content);
    // ... other modules
  }
}
```

---

## Testing Your Module

### Manual Testing Checklist

- [ ] Module loads correctly with config
- [ ] All stages can be completed
- [ ] Scoring works as expected
- [ ] Feedback displays correctly
- [ ] Progress bar updates
- [ ] Time tracking works
- [ ] Completion dialog shows correct results
- [ ] Points are awarded
- [ ] Leaderboard updates
- [ ] Teacher/Parent dashboards show completion

### Test Data

Create a test activity in the database:

```sql
INSERT INTO activities (id, title, description, type, difficulty, skillArea, pointsReward, content, isActive)
VALUES (
  uuid_generate_v4(),
  'Test My Module',
  'Testing new module',
  'my_custom_activity',
  'beginner',
  'vocabulary',
  20,
  '{"testData": "value"}',
  true
);
```

---

## Examples

### Example 1: Pronunciation Module
Location: `webapp/src/app/modules/activity-modules/pronunciation-module/`

Features:
- Audio playback
- Speech recognition
- Real-time feedback

### Example 2: Picture Description (To be migrated)
Current: `start-activity.component.ts` (lines 94-146)
Future: Standalone module

### Example 3: Conversation (To be migrated)
Current: `start-activity.component.ts` (lines 148-200+)
Future: Standalone module

---

## Best Practices

### DO ✅
- Keep modules self-contained
- Use TypeScript interfaces
- Handle errors gracefully
- Provide clear feedback
- Test thoroughly before deployment
- Document your content structure
- Use the base class utilities

### DON'T ❌
- Don't modify core app code
- Don't hard-code data (use config.content)
- Don't forget to cleanup resources
- Don't skip error handling
- Don't assume content structure (validate)

---

## Migration Plan

We're gradually migrating existing activity types to the modular system:

| Activity Type | Status | Priority |
|--------------|--------|----------|
| Pronunciation | ✅ Migrated | N/A |
| Picture Description | 🔄 Planned | High |
| Virtual Conversation | 🔄 Planned | High |
| Role Play | 🔄 Planned | Medium |
| Story Creation | 🔄 Planned | Medium |
| Singing/Chanting | 🔄 Planned | Low |

---

## Support

Questions? Issues?

1. Check this guide first
2. Review the pronunciation module example
3. Check the interface definitions in `activity-module.interface.ts`
4. Ask the development team

---

## Version History

- **v1.0.0** (2025-01) - Initial module system with pronunciation example
- **v1.1.0** (Planned) - Picture description migration
- **v2.0.0** (Planned) - All activity types migrated

---

**Happy Module Building! 🚀**
