import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SqliteService {
  private TASKS_KEY = 'tasks';
  private QUEUE_KEY = 'operations_queue';

  async init() {
    // No es necesario inicializar nada para localStorage
    console.log('LocalStorage inicializado correctamente');
  }

  private getArray(key: string): any[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setArray(key: string, arr: any[]) {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  async createTables() {
    // No es necesario crear tablas en localStorage
  }

  async run(statement: string, values: any[] = []) {
    // Implementa solo los métodos necesarios para tu lógica
    // Ejemplo: insertar, actualizar, eliminar en tasks y operations_queue
    throw new Error('Método run no implementado para localStorage');
  }

  async query(statement: string, values: any[] = []) {
    // Implementa solo los métodos necesarios para tu lógica
    throw new Error('Método query no implementado para localStorage');
  }

  // Métodos CRUD para tareas
  getTasks(): any[] {
    return this.getArray(this.TASKS_KEY);
  }

  saveTask(task: any) {
    const tasks = this.getArray(this.TASKS_KEY);
    const idx = tasks.findIndex((t: any) => t.client_id === task.client_id);
    if (idx > -1) {
      tasks[idx] = task;
    } else {
      tasks.push(task);
    }
    this.setArray(this.TASKS_KEY, tasks);
  }

  deleteTask(client_id: string) {
    const tasks = this.getArray(this.TASKS_KEY).filter((t: any) => t.client_id !== client_id);
    this.setArray(this.TASKS_KEY, tasks);
  }

  // Métodos para la cola de operaciones
  getQueue(): any[] {
    return this.getArray(this.QUEUE_KEY);
  }

  addToQueue(op: any) {
    const queue = this.getArray(this.QUEUE_KEY);
    queue.push(op);
    this.setArray(this.QUEUE_KEY, queue);
  }

  clearQueue() {
    this.setArray(this.QUEUE_KEY, []);
  }
}