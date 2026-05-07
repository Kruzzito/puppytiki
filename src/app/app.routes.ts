import { Routes } from '@angular/router';
import { SplashComponent } from './components/splash/splash.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: SplashComponent }, 
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [authGuard] 
  },
  {
    path: 'detalle-mascota',
    loadComponent: () =>
      import('./detalle-mascota/detalle-mascota.page').then(m => m.DetalleMascotaPage),
    canActivate: [authGuard]
  },
  {
    path: 'agenda-mascota',
    loadComponent: () =>
      import('./agenda-mascota/agenda-mascota.page').then(m => m.AgendaMascotaPage),
    canActivate: [authGuard]
  },
  {
    path: 'agenda-completa',
    loadComponent: () =>
      import('./agenda-completa/agenda-completa.page').then(m => m.AgendaCompletaPage),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: '**',
    redirectTo: '/login' 
  }
];
