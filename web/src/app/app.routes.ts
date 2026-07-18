import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks.component').then((m) => m.TasksComponent),
  },
  {
    path: 'tasks/:id',
    loadComponent: () =>
      import('./task-detail/task-detail.component').then((m) => m.TaskDetailComponent),
  },
  {
    path: 'balance',
    loadComponent: () => import('./balance/balance.component').then((m) => m.BalanceComponent),
  },
  { path: '**', redirectTo: '' },
];
