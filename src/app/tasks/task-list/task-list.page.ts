import { Component, OnInit } from '@angular/core';
import { TaskService } from '../services/task.service';
import { AlertController, ToastController } from '@ionic/angular';
import { NetworkService } from 'src/app/core/network.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.page.html',
  styleUrls: ['./task-list.page.scss'],
  standalone: false,
})
export class TaskListPage implements OnInit {
  tasks: any[] = [];
  loading = false;
  isOnline = true;
  isApiAvailable = true;

  constructor(
    private taskService: TaskService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private network: NetworkService
  ) {}

  async ngOnInit() {
    await this.taskService.init();
    await this.loadTasks();
    this.isOnline = this.network.isOnline();
    this.isApiAvailable = this.network.isApiAvailable();

    this.network.getOnlineStatus().subscribe(status => {
      this.isOnline = status;
    });
    this.network.getApiStatus().subscribe(status => {
      this.isApiAvailable = status;
    });
  }

  async ionViewWillEnter() {
    await this.loadTasks();

    const nav = window.history.state;
    if (nav && nav.toast) {
      const toast = await this.toastCtrl.create({
        message: nav.toast,
        duration: 1500,
        color: 'success'
      });
      await toast.present();
      window.history.replaceState({}, '');
    }
  }

  async loadTasks(event?: any) {
    this.loading = true;
    this.tasks = await this.taskService.getAllLocal();
    this.loading = false;
    if (event) event.target.complete();
  }

  async toggleCompleted(task: any) {
  // Cambia el estado localmente (true/false)
  const newCompleted = !task.completed;

  // Actualiza en SQLite
  await this.taskService.updateTaskLocal(task.client_id, { completed: newCompleted });

  // Sincroniza de inmediato con el backend
  await this.taskService.syncWithServer();

  // Actualiza la lista visible en pantalla sin recargar toda la página
  this.tasks = await this.taskService.getAllLocal();
  }
  // async toggleCompleted(task: any) {
  //   await this.taskService.updateTaskLocal(task.client_id, { completed: task.completed });
  //   await this.loadTasks();
  // }

  async confirmDelete(client_id: string) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar tarea?',
      message: '¿Estás seguro que deseas borrar esta tarea?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.deleteTask(client_id);
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteTask(client_id: string) {
    await this.taskService.deleteTaskLocal(client_id);
    await this.loadTasks();
    const toast = await this.toastCtrl.create({
      message: 'Tarea eliminada exitosamente',
      duration: 1500,
      color: 'danger'
    });
    await toast.present();
  }

  async syncNow() {
    await this.taskService.syncWithServer();
    await this.loadTasks();
  }
}