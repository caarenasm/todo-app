import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TasksRoutingModule } from './tasks-routing.module';
import { TaskListPage } from './task-list/task-list.page';
import { TaskEditPage } from './task-edit/task-edit.page';

@NgModule({
  declarations: [TaskListPage, TaskEditPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TasksRoutingModule
  ]
})
export class TasksModule {}
