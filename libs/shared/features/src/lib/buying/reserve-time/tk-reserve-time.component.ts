import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '@trokai/shared-ui';
import { BuyingService } from '@trokai/shared-data-access';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';

/**
 * Reservation countdown + CTA (canonical web). Injects only the shared
 * BuyingService/AlertService, so it is platform-agnostic. Emits `reserveOpen`
 * when the user continues the reserved purchase.
 */
@Component({
  selector: 'tk-reserve-time',
  templateUrl: './tk-reserve-time.component.html',
  styleUrl: './tk-reserve-time.component.scss',
  standalone: true,
  imports: [MatButtonModule, DatePipe],
})
export class TkReserveTimeComponent implements OnInit, OnDestroy {
  private buyingService = inject(BuyingService);
  private alert = inject(AlertService);
  private ngZone = inject(NgZone);

  @Input() ownerId = '';
  @Input() text = 'Adicionar à sacola';
  @Input() color = 'primary';
  @Input() hideCancel = false;
  @Input() showTimeOnly = false;

  @Output() reserveOpen = new EventEmitter<void>();

  timeLeft: Date | null = null;
  interval: ReturnType<typeof setInterval> | null = null;

  reserveSub!: Subscription;

  ngOnInit() {
    this.reserveSub = this.buyingService.reserves$.subscribe((clothes) => {
      this.finish();

      if (!clothes) return;

      for (const c of clothes) {
        if (c.owner === this.ownerId) {
          this.startCountDown(c['reserve']['reservedAt']);
          break;
        }
      }
    });
  }

  finish() {
    if (this.interval) clearInterval(this.interval);
    this.timeLeft = null;
    this.interval = null;
  }

  startCountDown(reservedAt: string | number | Date) {
    reservedAt = new Date(reservedAt);

    const limitTime = new Date(
      new Date(reservedAt).setMinutes(reservedAt.getMinutes() + 10),
    );
    this.timeLeft = new Date(
      new Date().setTime(limitTime.getTime() - new Date().getTime()),
    );

    if (this.timeLeft.getTime() <= 0) return;

    this.ngZone.runOutsideAngular(() => {
      this.interval = setInterval(() => {
        this.timeLeft = new Date(
          new Date().setTime(limitTime.getTime() - new Date().getTime()),
        );

        if (this.timeLeft.getTime() <= 0) {
          clearInterval(this.interval ?? undefined);
          this.buyingService.reserveExpired();
        }

        this.ngZone.run(() => {
          /* trigger change detection */
        });
      }, 1000);
    });
  }

  async cancel() {
    await this.buyingService.cancelReserve(this.ownerId);
  }

  expired() {
    this.alert.showAlert(
      'Reserva expirada',
      'Aguarde alguns instantes para fazer uma nova reserva.',
    );
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
    if (this.reserveSub) this.reserveSub.unsubscribe();
  }
}
