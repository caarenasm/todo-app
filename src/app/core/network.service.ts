import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private online$ = new BehaviorSubject<boolean>(navigator.onLine);
  private apiAvailable$ = new BehaviorSubject<boolean>(true);
  private apiCheckInterval: any;

  constructor(private http: HttpClient) {
    window.addEventListener('online', () => this.updateStatus(true));
    window.addEventListener('offline', () => this.updateStatus(false));
    this.checkApiStatus();
    this.startApiCheckInterval();
  }

  private updateStatus(status: boolean) {
    this.online$.next(status);
    if (status) this.checkApiStatus();
    else this.apiAvailable$.next(false);
  }

  isOnline(): boolean {
    return this.online$.value;
  }

  getOnlineStatus() {
    return this.online$.asObservable();
  }

  isApiAvailable(): boolean {
    return this.apiAvailable$.value;
  }

  getApiStatus() {
    return this.apiAvailable$.asObservable();
  }

  async checkApiStatus() {
    try {
      await this.http.get('http://localhost:8080/api/tasks/status').toPromise();
      this.apiAvailable$.next(true);
    } catch {
      this.apiAvailable$.next(false);
    }
  }

  private startApiCheckInterval() {
    this.apiCheckInterval = setInterval(() => {
      if (this.isOnline()) {
        this.checkApiStatus();
      }
    }, 10000); // cada 10 segundos
  }
}