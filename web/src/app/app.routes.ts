import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        title: 'Dashboard · Disbatch',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'tasks',
        title: 'Tasks · Disbatch',
        loadComponent: () => import('./features/tasks/query/tasks-query').then((m) => m.TasksQueryComponent),
      },
      {
        path: 'tasks/:id',
        title: 'Task · Disbatch',
        loadComponent: () => import('./features/tasks/detail/task-detail').then((m) => m.TaskDetailComponent),
      },
      {
        path: 'balance',
        title: 'Balance · Disbatch',
        loadComponent: () => import('./features/balance/balance').then((m) => m.BalanceComponent),
      },
      {
        path: 'monitoring',
        title: 'Monitoring · Disbatch',
        loadComponent: () => import('./features/monitoring/monitoring').then((m) => m.MonitoringComponent),
      },
      {
        path: 'info',
        title: 'Info · Disbatch',
        loadComponent: () => import('./features/info/info').then((m) => m.InfoComponent),
      },
    ],
  },
];
