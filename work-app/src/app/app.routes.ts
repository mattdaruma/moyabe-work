import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'auth', loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent) },
  { path: 'auth/callback/:provider', loadComponent: () => import('./auth/auth-callback.component').then(m => m.AuthCallbackComponent) },
  { path: 'work/:workID', loadComponent: () => import('./form-view/form-view.component').then(m => m.FormViewComponent) },
  { path: 'group/:groupID', loadComponent: () => import('./table-view/table-view.component').then(m => m.TableViewComponent) },
  { path: 'md', loadComponent: () => import('./markdown-view/markdown-view.component').then(m => m.MarkdownViewComponent) },
  { path: 'code', loadComponent: () => import('./code-view/code-view.component').then(m => m.CodeViewComponent) }
];
