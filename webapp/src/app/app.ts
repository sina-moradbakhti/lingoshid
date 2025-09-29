import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserRole } from './models/user.model';

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
    private router: Router
  ) {}

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
}
