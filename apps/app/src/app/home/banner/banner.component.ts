import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HomePayloadRowItem } from '@trokai/shared-core';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  standalone: true,
})
export class BannerComponent {
  @Input() item: HomePayloadRowItem;

  @Output() navigate = new EventEmitter();

  _navigate() {
    this.navigate.emit();
  }
}
