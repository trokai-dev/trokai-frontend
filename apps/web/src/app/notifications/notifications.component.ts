import { Component, inject } from '@angular/core';
import { NotificationsListComponent } from './notifications-list/notifications-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ChatListComponent } from '../chat-list/chat-list.component';
import { MessagesService } from '@trokai/shared-data-access';
import { NotificationsService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [NotificationsListComponent, ChatListComponent, MatTabsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  private notificationsService = inject(NotificationsService);
  private messagesService = inject(MessagesService);

  notificationsCount = 0;
  messagesCount = 0;

  constructor() {
    this.notificationsService.notReadedCount$.subscribe((count) => {
      this.notificationsCount = count;
    });

    this.messagesService.notReadCount$.subscribe((count) => {
      this.messagesCount = count;
    });
  }

  notificationsString() {
    if (this.notificationsCount > 0) return `(${this.notificationsCount})`;
    return '';
  }
  messagesString() {
    if (this.messagesCount > 0) return `(${this.messagesCount})`;
    return '';
  }
}
