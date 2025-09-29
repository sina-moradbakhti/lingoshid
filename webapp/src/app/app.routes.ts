import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'student',
    canActivate: [authGuard, roleGuard],
    data: { role: UserRole.STUDENT },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/student/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'activities',
        loadComponent: () => import('./components/student/activities/activities.component').then(m => m.ActivitiesComponent)
      },
      {
        path: 'activities/:id',
        loadComponent: () => import('./components/student/activity-detail/activity-detail.component').then(m => m.ActivityDetailComponent)
      },
      {
        path: 'activities/:id/start',
        loadComponent: () => import('./components/student/start-activity/start-activity.component').then(m => m.StartActivityComponent)
      },
      {
        path: 'leaderboard',
        loadComponent: () => import('./components/student/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
      },
      {
        path: 'progress',
        loadComponent: () => import('./components/student/progress/progress.component').then(m => m.ProgressComponent)
      },
      {
        path: 'badges',
        loadComponent: () => import('./components/student/badges/badges.component').then(m => m.BadgesComponent)
      }
    ]
  },
  {
    path: 'parent',
    canActivate: [authGuard, roleGuard],
    data: { role: UserRole.PARENT },
    loadComponent: () => import('./components/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'teacher',
    canActivate: [authGuard, roleGuard],
    data: { role: UserRole.TEACHER },
    loadComponent: () => import('./components/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: UserRole.ADMIN },
    loadComponent: () => import('./components/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
