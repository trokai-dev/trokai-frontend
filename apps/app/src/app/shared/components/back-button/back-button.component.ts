import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
  IonNav,
  NavController,
  Platform,
  IonIcon,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { NgStyle } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
  standalone: true,
  imports: [IonButtons, MatButtonModule, IonBackButton, IonIcon, NgStyle],
})
export class BackButtonComponent {
  @Input() defaultHref = '';
  @Input() blockNavigation = false;
  @Input() nav = false;

  @Output() buttonClick = new EventEmitter();

  mode = 'md';
  text = '';

  private platform = inject(Platform);
  private navCtrl = inject(NavController);

  constructor() {
    if (this.platform.is('ios')) this.mode = 'ios';
    addIcons({ arrowBackOutline });
  }

  async click($ev) {
    $ev.stopPropagation();

    if (this.blockNavigation || this.nav) this.buttonClick.emit();
    else this.navCtrl.pop();
  }
}
