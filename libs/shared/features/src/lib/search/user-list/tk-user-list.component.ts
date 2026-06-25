import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '@trokai/shared-core';
import { TkUserCardComponent } from '@trokai/shared-ui';

/**
 * Shared vendor/user results grid via the existing `TkUserCardComponent`.
 * Deliberately has no `filter`/`Filters` input — filters are product-only,
 * and there's no prop here to wire one to even by mistake.
 */
@Component({
  selector: 'tk-user-list',
  standalone: true,
  imports: [TkUserCardComponent],
  templateUrl: './tk-user-list.component.html',
  styleUrl: './tk-user-list.component.scss',
})
export class TkUserListComponent {
  @Input() users: User[] = [];
  @Output() clicked = new EventEmitter<User>();
}
