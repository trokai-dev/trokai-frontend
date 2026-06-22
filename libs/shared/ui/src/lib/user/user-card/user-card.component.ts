import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '@trokai/shared-core';
import { TkUserAvatarComponent } from '../user-avatar/user-avatar.component';

/**
 * Stacked user tile (avatar over name + nickname). Used by the app user search grid.
 * Extracted from the former `tk-user-header` "card" layout.
 */
@Component({
  selector: 'tk-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  standalone: true,
  imports: [TkUserAvatarComponent],
})
export class TkUserCardComponent {
  @Input() user!: User;
  @Output() clicked = new EventEmitter<User>();

  onClick() {
    this.clicked.emit(this.user);
  }
}
