import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo-section">
          <h1 class="app-title">🎮 Lingoshid</h1>
          <p class="app-subtitle">Gamified English Learning for Young Minds</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">Email or Username</label>
            <input
              type="text"
              id="email"
              formControlName="email"
              class="form-control"
              placeholder="Enter your email or username"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            <div class="error-message" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Email or username is required
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              placeholder="Enter your password"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Password is required
            </div>
          </div>

          <button type="submit" class="login-btn" [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="!isLoading">Login</span>
            <span *ngIf="isLoading">Logging in...</span>
          </button>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
        </form>

        <!-- Registration will be available soon -->

        <div class="demo-accounts">
          <h3>Demo Accounts</h3>
          <div class="demo-buttons">
            <button (click)="loginAsDemo('student')" class="demo-btn student">
              👨‍🎓 Student Demo
            </button>
            <button (click)="loginAsDemo('parent')" class="demo-btn parent">
              👨‍👩‍👧‍👦 Parent Demo
            </button>
            <button (click)="loginAsDemo('teacher')" class="demo-btn teacher">
              👩‍🏫 Teacher Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 30px;
    }

    .app-title {
      font-size: 2.5rem;
      color: #667eea;
      margin: 0;
      font-weight: bold;
    }

    .app-subtitle {
      color: #666;
      margin: 10px 0 0 0;
      font-size: 0.9rem;
    }

    .login-form {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e1e5e9;
      border-radius: 10px;
      font-size: 16px;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-control.error {
      border-color: #e74c3c;
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.8rem;
      margin-top: 5px;
    }

    .login-btn {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .register-link {
      text-align: center;
      margin: 20px 0;
    }

    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .demo-accounts {
      border-top: 1px solid #eee;
      padding-top: 20px;
      text-align: center;
    }

    .demo-accounts h3 {
      margin: 0 0 15px 0;
      color: #666;
      font-size: 1rem;
    }

    .demo-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .demo-btn {
      padding: 10px;
      border: 2px solid;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .demo-btn.student {
      border-color: #3498db;
      color: #3498db;
    }

    .demo-btn.student:hover {
      background: #3498db;
      color: white;
    }

    .demo-btn.parent {
      border-color: #e67e22;
      color: #e67e22;
    }

    .demo-btn.parent:hover {
      background: #e67e22;
      color: white;
    }

    .demo-btn.teacher {
      border-color: #27ae60;
      color: #27ae60;
    }

    .demo-btn.teacher:hover {
      background: #27ae60;
      color: white;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.redirectUser(response.user.role);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }

  loginAsDemo(role: string) {
    const demoCredentials = {
      student: { email: 'student@demo.com', password: 'demo123' },
      parent: { email: 'parent@demo.com', password: 'demo123' },
      teacher: { email: 'teacher@demo.com', password: 'demo123' }
    };

    const credentials = demoCredentials[role as keyof typeof demoCredentials];
    if (credentials) {
      this.loginForm.patchValue(credentials);
      this.onSubmit();
    }
  }

  private redirectUser(role: UserRole) {
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
      default:
        this.router.navigate(['/']);
    }
  }
}