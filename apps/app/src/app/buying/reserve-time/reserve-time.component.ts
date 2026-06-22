import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { BuyingService } from '@trokai/shared-data-access';
import { DatePipe } from '@angular/common';
import { IonText } from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { AlertService } from '@trokai/shared-ui';

@Component({
  selector: 'app-reserve-time',
  templateUrl: './reserve-time.component.html',
  styleUrls: ['./reserve-time.component.scss'],
  standalone: true,
  imports: [MatButtonModule, IonText, DatePipe],
})
export class ReserveTimeComponent implements OnInit, OnDestroy {
  @Input() ownerId: string = null;
  @Input() hideCancel = false;
  @Input() timerOnly = false;
  @Input() text = 'Adicionar à sacola';
  @Input() color = 'primary';

  @Output() reserveOpen = new EventEmitter();

  timeLeft: Date = null;
  interval;

  reserveSub: Subscription;

  private buyingService = inject(BuyingService);
  private alert = inject(AlertService);

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

  startCountDown(reservedAt) {
    reservedAt = new Date(reservedAt);

    const limitTime = new Date(
      new Date(reservedAt).setMinutes(reservedAt.getMinutes() + 10),
    );
    this.timeLeft = new Date(
      new Date().setTime(limitTime.getTime() - new Date().getTime()),
    );

    if (this.timeLeft.getTime() <= 0) return;

    this.interval = setInterval(() => {
      this.timeLeft = new Date(
        new Date().setTime(limitTime.getTime() - new Date().getTime()),
      );

      if (this.timeLeft.getTime() <= 0) {
        clearInterval(this.interval);
        this.buyingService.reserveExpired();
      }
    }, 1000);
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
