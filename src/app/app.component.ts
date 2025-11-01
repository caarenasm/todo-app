import { Component } from '@angular/core';
import { TaskService } from './tasks/services/task.service';
import { NetworkService } from './core/network.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private taskService: TaskService,
    private network: NetworkService
  ) {
    this.network.getOnlineStatus().subscribe(isOnline => {
      if (isOnline) {
        this.taskService.syncWithServer();
      }
    });
  }
}
