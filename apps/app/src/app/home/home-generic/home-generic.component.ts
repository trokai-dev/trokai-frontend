import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TkProductCardComponent } from '@trokai/shared-ui';

@Component({
  selector: 'app-home-generic',
  templateUrl: './home-generic.component.html',
  styleUrls: ['./home-generic.component.scss'],
  standalone: true,
  imports: [TkProductCardComponent],
})
export class HomeGenericComponent {
  @Input() home_generic: any;
  @Input() home_row: any;
  @Output() navigate: EventEmitter<any> = new EventEmitter();

  _navigate() {
    this.navigate.emit();
  }
}
