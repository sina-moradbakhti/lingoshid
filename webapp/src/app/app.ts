import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserRole } from './models/user.model';
import { ActivityModuleRegistryService } from './services/activity-module-registry.service';
import { PronunciationModuleComponent } from './modules/activity-modules/pronunciation-module/pronunciation-module.component';
import { QuizModuleComponent } from './modules/activity-modules/quiz-module/quiz-module.component';
import { VocabularyMatchModuleComponent } from './modules/activity-modules/vocabulary-match-module/vocabulary-match-module.component';
import { AiConversationModuleComponent } from './modules/activity-modules/ai-conversation-module/ai-conversation-module.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    :host ::ng-deep * {
      box-sizing: border-box;
    }

    :host ::ng-deep body {
      margin: 0;
      padding: 0;
    }
  `]
})
export class App implements OnInit {
  title = 'Lingoshid - Gamified EFL Learning';

  constructor(
    private authService: AuthService,
    private router: Router,
    private activityModuleRegistry: ActivityModuleRegistryService
  ) {
    // Initialize activity modules on app startup
    this.initializeActivityModules();
  }

  ngOnInit() {
    // Check if user is authenticated and redirect to appropriate dashboard
    this.authService.currentUser$.subscribe(user => {
      if (user && this.router.url === '/') {
        this.redirectToDashboard(user.role);
      }
    });
  }

  private redirectToDashboard(role: UserRole) {
    switch (role) {
      case UserRole.STUDENT:
        this.router.navigate(['/student']);
        break;
      case UserRole.PARENT:
        this.router.navigate(['/parent']);
        break;
      case UserRole.TEACHER:
        this.router.navigate(['/teacher']);
        break;
      case UserRole.ADMIN:
        this.router.navigate(['/admin']);
        break;
    }
  }

  /**
   * Initialize Activity Module System
   * Register all available activity modules
   */
  private initializeActivityModules() {
    console.log('🚀 Initializing Activity Module System...');

    // Register Pronunciation Module
    this.activityModuleRegistry.register({
      type: 'pronunciation_challenge',
      name: 'Pronunciation Challenge',
      description: 'Practice pronunciation with speech recognition',
      version: '1.0.0',
      component: PronunciationModuleComponent,
      processor: null as any, // Backend processor reference (not used in frontend)
      supportedFeatures: ['audio', 'speech-recognition'],
      minLevel: 1
    });

    // Register Quiz Module
    this.activityModuleRegistry.register({
      type: 'quiz_challenge',
      name: 'Quiz Challenge',
      description: 'Multiple choice quiz to test knowledge',
      version: '1.0.0',
      component: QuizModuleComponent,
      processor: null as any,
      supportedFeatures: ['text', 'multiple-choice'],
      minLevel: 1
    });

    // Register Vocabulary Match Module
    this.activityModuleRegistry.register({
      type: 'vocabulary_match',
      name: 'Vocabulary Matching',
      description: 'Match words with pictures',
      version: '1.0.0',
      component: VocabularyMatchModuleComponent,
      processor: null as any,
      supportedFeatures: ['images', 'interactive', 'matching'],
      minLevel: 1
    });

    // Register AI Conversation Module
    this.activityModuleRegistry.register({
      type: 'ai_conversation',
      name: 'AI Conversation',
      description: 'Practice English through natural conversations with AI',
      version: '1.0.0',
      component: AiConversationModuleComponent,
      processor: null as any,
      supportedFeatures: ['ai', 'conversation', 'chat', 'evaluation'],
      minLevel: 1
    });

    console.log('✅ Activity Module System initialized successfully');
    console.log(`📦 Registered ${this.activityModuleRegistry.getRegisteredTypes().length} module types`);

    // Debug: Print all registered modules
    if (console.table) {
      const modules = this.activityModuleRegistry.getAllModules().map(m => ({
        Type: m.type,
        Name: m.name,
        Version: m.version,
        Features: m.supportedFeatures.join(', ')
      }));
      console.table(modules);
    }
  }
}
