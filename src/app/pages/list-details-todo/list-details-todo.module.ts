import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListDetailsTodoPageRoutingModule } from './list-details-todo-routing.module';

import { ListDetailsTodoPage } from './list-details-todo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListDetailsTodoPageRoutingModule
  ],
  declarations: [ListDetailsTodoPage]
})
export class ListDetailsTodoPageModule {}
