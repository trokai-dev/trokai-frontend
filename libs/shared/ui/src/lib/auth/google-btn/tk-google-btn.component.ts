import {
  Component,
  EventEmitter,
  Output,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

/**
 * Dumb "Continue with Google" button. Web-oriented (native Google on the app),
 * but lives in shared-ui so both shells can reuse it. Platform OAuth stays in
 * the shell: the button only emits `googleClick`.
 *
 * Hidden inside the Instagram in-app browser, where Google OAuth is blocked.
 */
@Component({
  selector: 'tk-google-btn',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './tk-google-btn.component.html',
  styleUrl: './tk-google-btn.component.scss',
})
export class TkGoogleBtnComponent {
  @Output() googleClick = new EventEmitter<void>();

  protected readonly show = signal(true);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.show.set(!/Instagram/.test(navigator.userAgent));
    }
  }
}
