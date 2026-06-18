import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  Output,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '@trokai/shared-ui';
import { BuyingService } from '@trokai/shared-data-access';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reserve-time',
  templateUrl: './reserve-time.component.html',
  styleUrls: ['./reserve-time.component.scss'],
  standalone: true,
  imports: [MatButtonModule, DatePipe],
})
export class ReserveTimeComponent implements OnInit, OnDestroy {
  private buyingService = inject(BuyingService);
  private alert = inject(AlertService);
  private ngZone = inject(NgZone);

  @Input() ownerId = '';
  @Input() text = 'Adicionar à sacola';
  @Input() color = 'primary';
  @Input() hideCancel = false;
  @Input() showTimeOnly = false;

  @Output() open = new EventEmitter();

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

        // Only re-enter Angular to update the UI
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
    this.alert.showDialog(
      'Reserva expirada',
      'Aguarde alguns instantes para fazer uma nova reserva.',
    );
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
    if (this.reserveSub) this.reserveSub.unsubscribe();
  }
}
