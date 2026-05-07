import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [authGuard], // protege todas las tabs
    children: [
      {
        path: 'mascotas',
        loadComponent: () =>
          import('../mascotas/mascotas.page').then((m) => m.MascotasPage),
        canActivate: [authGuard]
      },
      {
        path: 'tienda',
        loadComponent: () =>
          import('../tienda/tienda.page').then((m) => m.TiendaPage),
        canActivate: [authGuard]
      },
      {
        path: 'noticias',
        loadComponent: () =>
          import('../noticias/noticias.page').then((m) => m.NoticiasPage),
        canActivate: [authGuard]
      },
      {
        path: '',
        redirectTo: 'mascotas',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login' 
  }
];
