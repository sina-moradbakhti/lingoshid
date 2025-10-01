import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.scss']
})
export class ComingSoonComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  getCurrentUserRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.role || 'Unknown';
  }

  isStudent(): boolean {
    return this.authService.isStudent();
  }

  isParent(): boolean {
    return this.authService.isParent();
  }

  isTeacher(): boolean {
    return this.authService.isTeacher();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToStudentDemo(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}