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
    path: 'welcome',
    loadChildren: () => import('./slides/new-user/new-user.module').then(m => m.NewUserPageModule),
    ...canActivate(UnauthorizedAccess)
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
  {
    path: 'new-user',
    loadChildren: () => import('./slides/new-user/new-user.module').then( m => m.NewUserPageModule),
    ...canActivate(UnauthorizedAccess)
  },
  {
    path: 'list-details-todo/:listId',
    loadChildren: () => import('./pages/list-details-todo/list-details-todo.module').then( m => m.ListDetailsTodoPageModule),
    ...canActivate(UnauthorizedAccess)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
