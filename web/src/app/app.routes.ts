import { Routes } from '@angular/router';
import { Shell } from './layout/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        title: 'Dashboard · Disbatch',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'tasks',
        title: 'Tasks · Disbatch',
        loadComponent: () => import('./features/tasks/query/tasks-query').then((m) => m.TasksQuery),
      },
      {
        path: 'tasks/:id',
        title: 'Task · Disbatch',
        loadComponent: () =>
          import('./features/tasks/detail/task-detail').then((m) => m.TaskDetail),
      },
      {
        path: 'balance',
        title: 'Balance · Disbatch',
        loadComponent: () => import('./features/balance/balance').then((m) => m.Balance),
      },
      {
        path: 'monitoring',
        title: 'Monitoring · Disbatch',
        loadComponent: () => import('./features/monitoring/monitoring').then((m) => m.Monitoring),
      },
      {
        path: 'info',
        title: 'Info · Disbatch',
        loadComponent: () => import('./features/info/info').then((m) => m.Info),
      },
    ],
  },
];
