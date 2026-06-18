import { Component, Input, OnInit, OnChanges, inject } from '@angular/core';
import { HideLoadingImageDirective } from '../../directives/hide-loading-image.directive';
import { MatBadgeModule } from '@angular/material/badge';
import { User, APP_CONFIG } from '@trokai/shared-core';

@Component({
  selector: 'tk-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
  standalone: true,
  imports: [HideLoadingImageDirective, MatBadgeModule],
})
export class TkUserAvatarComponent implements OnInit, OnChanges {
  @Input() user!: User;
  @Input() size: 'small' | 'medium' | 'large' = 'small';
  @Input() notificationCount = 0;
  @Input() overrideUrl?: string;

  avatar = '';

  private config = inject(APP_CONFIG);

  ngOnInit(): void {
    this.process();
  }

  ngOnChanges(): void {
    this.process();
  }

  private process(): void {
    if (this.overrideUrl) {
      this.avatar = this.overrideUrl;
    } else if (this.user?.avatar) {
      this.avatar = this.config.imageURL + this.user._id + '/avatar/' + this.user.avatar;
    } else {
      this.avatar = this.config.defaultAvatar;
    }
  }
}
