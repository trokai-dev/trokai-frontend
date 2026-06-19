import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { addIcons } from 'ionicons';
import { logoApple } from 'ionicons/icons';
import { defineCustomElement as defineIonIcon } from 'ionicons/components/ion-icon.js';

// Standalone ion-icon: no @ionic/angular, only logoApple svg bundled.
// Guard customElements for SSR (web shell prerenders on the server).
if (typeof customElements !== 'undefined') defineIonIcon();
addIcons({ logoApple });

/**
 * Dumb "Continue with Apple" button. Lives in shared-ui so both shells reuse
 * it. Platform OAuth stays in the shell: the button only emits `appleClick`.
 * Parent gates visibility (iOS / web).
 */
@Component({
  selector: 'tk-apple-btn',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './tk-apple-btn.component.html',
  styleUrl: './tk-apple-btn.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TkAppleBtnComponent {
  @Output() appleClick = new EventEmitter<void>();
}
