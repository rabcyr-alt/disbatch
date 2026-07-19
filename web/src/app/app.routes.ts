import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks').then((m) => m.Tasks),
  },
  {
    path: 'tasks/:id',
    loadComponent: () =>
      import('./task-detail/task-detail').then((m) => m.TaskDetail),
  },
  {
    path: 'balance',
    loadComponent: () => import('./balance/balance').then((m) => m.Balance),
  },
  { path: '**', redirectTo: '' },
];
