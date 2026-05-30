import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layouts/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'system/user',
        loadComponent: () => import('./pages/system/user/user.component').then(m => m.UserComponent),
      },
      {
        path: 'system/role',
        loadComponent: () => import('./pages/system/role/role.component').then(m => m.RoleComponent),
      },
      {
        path: 'system/menu',
        loadComponent: () => import('./pages/system/menu/menu.component').then(m => m.MenuComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
