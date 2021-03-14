import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {LoginGuard} from './guards/login.guard';
import {canActivate, emailVerified, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard';

const redirectToLogin = () => redirectLoggedInTo(['home']);
const UnauthorizedAccess = () => emailVerified && redirectUnauthorizedTo(['loginRegister']);


const routes: Routes = [

  {
    path: '',
    redirectTo: 'loginRegister',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),
    ...canActivate(UnauthorizedAccess)
  },
  {
    path: 'list-details/:listId',
    canActivate: [LoginGuard],
    loadChildren: () => import('./pages/list-details/list-details.module').then( m => m.ListDetailsPageModule),
    ...canActivate(UnauthorizedAccess)
  },
  {
    path: 'list-details/:listId/todo-details/:todoId',
    canActivate: [LoginGuard],
    loadChildren: () => import('./pages/todo-details/todo-details.module').then( m => m.TodoDetailsPageModule),
    ...canActivate(UnauthorizedAccess)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
    ...canActivate(redirectToLogin)
  },
  {
    path: 'loginRegister',
    loadChildren: () => import('./pages/login-register/login-register.module').then( m => m.LoginRegisterPageModule),
    ...canActivate(redirectToLogin)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule),
    ...canActivate(redirectToLogin)
  },
  {
    path: 'password-recovery',
    loadChildren: () => import('./pages/password-recovery/password-recovery.module').then( m => m.PasswordRecoveryPageModule),
    ...canActivate(redirectToLogin)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
