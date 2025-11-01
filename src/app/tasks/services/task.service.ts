import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { SqliteService } from 'src/app/core/sqlite.service';
import { HttpClient } from '@angular/common/http';
import { NetworkService } from 'src/app/core/network.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  apiUrl = 'http://localhost:8080/api/tasks'; // Cambia por tu endpoint real

  constructor(
    private sqlite: SqliteService,
    private http: HttpClient,
    private network: NetworkService
  ) {}

  async init() { await this.sqlite.init(); }

  // Método para crear una nueva tarea localmente
  async createTask(title: string, description = '', completed = false) {
    const client_id = uuidv4();
    const now = new Date().toISOString();
    const task = {
      client_id,
      title,
      description,
      completed: completed,
      created_at: now,
      updated_at: now,
      deleted: false
    };
    this.sqlite.saveTask(task);
    this.sqlite.addToQueue({
      op_type: 'create',
      client_id,
      payload: task,
      timestamp: now
    });
    await this.syncWithServer(); // sincroniza con backend
  }

  async getAllLocal() {
    return this.sqlite.getTasks().filter((t: any) => !t.deleted);
  }

  // Método para actualizar una tarea localmente
  async updateTaskLocal(client_id: string, changes: any) {
    const now = new Date().toISOString();
    const tasks = this.sqlite.getTasks();
    const idx = tasks.findIndex((t: any) => t.client_id === client_id);
    if (idx > -1) {
      const updated = {
        ...tasks[idx],
        ...changes,
        updated_at: now
      };
      this.sqlite.saveTask(updated);
      this.sqlite.addToQueue({
        op_type: 'update',
        client_id,
        payload: updated,
        timestamp: now
      });
    }
  }

  // Método para eliminar una tarea localmente (marca como deleted)
  async deleteTaskLocal(client_id: string) {
    const now = new Date().toISOString();
    const tasks = this.sqlite.getTasks();
    const idx = tasks.findIndex((t: any) => t.client_id === client_id);
    if (idx > -1) {
      const deleted = {
        ...tasks[idx],
        deleted: true,
        updated_at: now
      };
      this.sqlite.saveTask(deleted);
      this.sqlite.addToQueue({
        op_type: 'delete',
        client_id,
        payload: { client_id },
        timestamp: now
      });
      await this.syncWithServer();
    }
  }

  // Método CRUD para sincronizar con el servidor 
  async syncWithServer() {
    if (this.network.isOnline()) {
      const queue = this.sqlite.getQueue();
      for (const op of queue) {
        try {
          if (op.op_type === 'create') {
            await this.http.post(`${this.apiUrl}/crear`, op.payload).toPromise();
          } else if (op.op_type === 'update') {
            await this.http.post(`${this.apiUrl}/editar`, op.payload).toPromise();
          } else if (op.op_type === 'delete') {
            await this.http.request('delete', `${this.apiUrl}/eliminar`, {
              body: op.payload,
              headers: { 'Content-Type': 'application/json' }
            }).toPromise();
          }
        } catch (e) {
          // Si falla, no borres la cola
          return;
        }
      }
      this.sqlite.clearQueue();
    }
    // Si está offline, no hace nada
    return this.getAllLocal(); // devuelve las tareas actualizadas
  }

  //Método para cambiar estado "completed" de una tarea
  async toggleCompleted(task: any) {
    const newCompleted = !task.completed; // cambia de true a false o viceversa
    await this.updateTaskLocal(task.client_id, { completed: newCompleted });
    await this.syncWithServer(); // sincroniza con backend
    
    return this.getAllLocal();
  }
}