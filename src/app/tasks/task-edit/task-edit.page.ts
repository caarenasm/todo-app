import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.page.html',
  styleUrls: ['./task-edit.page.scss'],
  standalone: false,
})
export class TaskEditPage implements OnInit {
  title: string = '';
  description: string = '';
  completed: boolean = false;
  task: any = {
    client_id: '',
    title: '',
    description: '',
    completed: false,
  };
  isEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    await this.taskService.init();

    const client_id = this.route.snapshot.paramMap.get('id');
    if (client_id) {
      this.isEdit = true;
      const all = await this.taskService.getAllLocal();
      const found = all.find((t: { client_id: string; }) => t.client_id === client_id);
      if (found) this.task = found;
    }
  }

  // async saveTask() {
  //   try {
  //     if (this.isEdit) {
  //       await this.taskService.updateTaskLocal(this.task.client_id, {
  //         title: this.task.title,
  //         description: this.task.description,
  //         completed: this.task.completed
  //       });
  //     } else {
  //       await this.taskService.createTask(this.task.title, this.task.description, this.task.completed);
  //     }

  //     await this.taskService.syncWithServer();

  //     await this.router.navigateByUrl('/tasks', { state: { toast: 'Tarea guardada exitosamente' } });
  //   } catch (error) {
  //     const toast = await this.toastCtrl.create({
  //       message: 'Error al guardar la tarea',
  //       duration: 1000,
  //       color: 'danger'
  //     });
  //     await toast.present();
  //   }
  //   if (!this.title || !this.description) return;

  //   await this.taskService.createTask(this.title, this.description, this.completed);

  //   const toast = await this.toastCtrl.create({
  //     message: 'Tarea guardada exitosamente',
  //     duration: 1500,
  //     color: 'success'
  //   });
  //   await toast.present();

  //   this.navCtrl.navigateBack('/tasks')
  // }

  async saveTask() {
    try {
      if (!this.task.title || !this.task.description) {
        const toast = await this.toastCtrl.create({
          message: 'Por favor completa todos los campos',
          duration: 1500,
          color: 'warning'
        });
        await toast.present();
        return;
      }

      if (this.isEdit) {
        // 🔹 Si está editando, actualiza incluyendo el estado "completed"
        await this.taskService.updateTaskLocal(this.task.client_id, {
          title: this.task.title,
          description: this.task.description,
          completed: this.task.completed
        });
      } else {
        // 🔹 Si está creando, envía también el valor de completed
        await this.taskService.createTask(
          this.task.title,
          this.task.description,
          this.task.completed
        );
      }

      // 🔹 Sincroniza con backend y vuelve a la lista
      await this.taskService.syncWithServer();

      const toast = await this.toastCtrl.create({
        message: 'Tarea guardada exitosamente',
        duration: 1500,
        color: 'success'
      });
      await toast.present();

      this.navCtrl.navigateBack('/tasks');
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Error al guardar la tarea',
        duration: 1500,
        color: 'danger'
      });
      await toast.present();
    }
  }

}