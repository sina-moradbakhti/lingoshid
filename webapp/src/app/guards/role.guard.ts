import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data?.['role'] as UserRole;
  const user = authService.getCurrentUser();

  if (user && user.role === requiredRole) {
    return true;
  }

  // Redirect to appropriate dashboard based on user role
  if (user) {
    switch (user.role) {
      case UserRole.STUDENT:
        router.navigate(['/student']);
        break;
      case UserRole.PARENT:
        router.navigate(['/parent']);
        break;
      case UserRole.TEACHER:
        router.navigate(['/teacher']);
        break;
      case UserRole.ADMIN:
        router.navigate(['/admin']);
        break;
      default:
        router.navigate(['/login']);
    }
  } else {
    router.navigate(['/login']);
  }

  return false;
};