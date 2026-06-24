import { User } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { AuthService } from 'src/app/auth/auth.service';
import { ShortDatePipe } from '@trokai/shared-ui';
import { GlobalService } from 'src/app/services/global.service';
import {
  NotificationsService,
  NotificationModel,
} from '@trokai/shared-data-access';
import { environment } from 'src/environments/environment';

import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NgClass, ShortDatePipe],
  templateUrl: './notifications-list.component.html',
  styleUrl: './notifications-list.component.scss',
})
export class NotificationsListComponent implements OnInit {
  private globalService = inject(GlobalService);
  private notificationsService = inject(NotificationsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  notifications: NotificationModel[] = [];

  user!: User;
  url = environment.imageURL;

  constructor() {
    this.globalService.setTitle('Notificações');
  }

  ngOnInit() {
    this.authService.user$.subscribe((u) => {
      if (u) this.user = u;
    });
    this.startNotifications();
  }

  async startNotifications() {
    try {
      const res = await this.notificationsService.fetchNotifications(0);
      this.notifications = res.data;
      this.notificationsService.markAsRead();
    } finally {
      /* intentional */
    }
  }

  // Navigate using the server-provided deep link, mapped to web routes.
  open(n: NotificationModel) {
    const url = n.target_url;
    if (!url) return;
    const path = url.replace(/^\//, '');

    if (path === 'wallet') {
      this.router.navigateByUrl('/account/bank');
    } else if (path === 'profile/products') {
      this.router.navigateByUrl(`/users/${this.user?._id}`);
    } else {
      this.router.navigateByUrl(`/${path}`);
    }
  }
}
