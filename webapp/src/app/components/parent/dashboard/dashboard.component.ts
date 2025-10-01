import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ParentService } from '../../../services/parent.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class ParentDashboardComponent implements OnInit {
  children: any[] = [];
  userName = '';
  isLoading = true;

  constructor(
    private router: Router,
    private parentService: ParentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.userName = user?.firstName || 'Parent';
    this.loadChildren();
  }

  loadChildren() {
    this.parentService.getChildren().subscribe({
      next: (children) => {
        this.children = children;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading children:', error);
        this.isLoading = false;
      }
    });
  }

  viewProgress(studentId: string) {
    this.router.navigate(['/parent/progress', studentId]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}