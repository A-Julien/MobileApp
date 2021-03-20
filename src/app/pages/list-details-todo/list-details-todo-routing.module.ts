import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListDetailsTodoPage } from './list-details-todo.page';

const routes: Routes = [
  {
    path: '',
    component: ListDetailsTodoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListDetailsTodoPageRoutingModule {}
