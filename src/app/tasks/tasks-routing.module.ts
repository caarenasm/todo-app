import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskListPage } from './task-list/task-list.page';
import { TaskEditPage } from './task-edit/task-edit.page';

const routes: Routes = [
  {
    path: '',
    component: TaskListPage
  },
  {
    path: 'new',
    component: TaskEditPage
  },
  {
    path: 'edit/:id',
    component: TaskEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule {}
