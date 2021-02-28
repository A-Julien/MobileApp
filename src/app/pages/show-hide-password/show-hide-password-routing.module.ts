import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowHidePasswordPage } from './show-hide-password.page';

const routes: Routes = [
  {
    path: '',
    component: ShowHidePasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowHidePasswordPageRoutingModule {}
