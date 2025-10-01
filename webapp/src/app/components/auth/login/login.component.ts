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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
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