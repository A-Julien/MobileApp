import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {LoginGuard} from './guards/login.guard';

const routes: Routes = [
  {
    path: 'home',
    canActivate: [LoginGuard],
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'loginRegister',
    pathMatch: 'full'
  },
  {
    path: 'list-details/:listId',
    loadChildren: () => import('./pages/list-details/list-details.module').then( m => m.ListDetailsPageModule)
  },
  {
    path: 'list-details/:listId/todo-details/:todoId',
    loadChildren: () => import('./pages/todo-details/todo-details.module').then( m => m.TodoDetailsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'loginRegister',
    loadChildren: () => import('./pages/login-register/login-register.module').then( m => m.LoginRegisterPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'password-recovery',
    loadChildren: () => import('./pages/password-recovery/password-recovery.module').then( m => m.PasswordRecoveryPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
