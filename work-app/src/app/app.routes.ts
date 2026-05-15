import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home.component').then(m => m.HomeComponent) },
  { path: 'auth', loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent) },
  { path: 'auth/callback/:provider', loadComponent: () => import('./auth/auth-callback.component').then(m => m.AuthCallbackComponent) },
  { path: 'work/:workID', loadComponent: () => import('./work.component').then(m => m.WorkComponent) },
  { path: 'group/:groupID', loadComponent: () => import('./group.component').then(m => m.GroupComponent) },
  { path: 'md', loadComponent: () => import('./markdown/markdown.component').then(m => m.MdViewComponent) }
];
