import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'queues', pathMatch: 'full' },
      {
        path: 'queues',
        title: 'Queues · Disbatch',
        loadComponent: () => import('./features/queues/queues-list.component').then((m) => m.QueuesListComponent),
      },
      {
        path: 'nodes',
        title: 'Nodes · Disbatch',
        loadComponent: () => import('./features/nodes/nodes-list.component').then((m) => m.NodesListComponent),
      },
      {
        path: 'tasks',
        title: 'Tasks · Disbatch',
        loadComponent: () => import('./features/tasks/query/tasks-query.component').then((m) => m.TasksQueryComponent),
      },
      {
        path: 'tasks/:id',
        title: 'Task · Disbatch',
        loadComponent: () => import('./features/tasks/detail/task-detail.component').then((m) => m.TaskDetailComponent),
      },
      {
        path: 'balance',
        title: 'Balance · Disbatch',
        loadComponent: () => import('./features/balance/balance.component').then((m) => m.BalanceComponent),
      },
      {
        path: 'monitoring',
        title: 'Monitoring · Disbatch',
        loadComponent: () => import('./features/monitoring/monitoring.component').then((m) => m.MonitoringComponent),
      },
      {
        path: 'info',
        title: 'Info · Disbatch',
        loadComponent: () => import('./features/info/info.component').then((m) => m.InfoComponent),
      },
    ],
  },
];
