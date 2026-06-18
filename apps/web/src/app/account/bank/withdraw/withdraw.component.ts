import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TkWithdrawComponent } from '@trokai/shared-ui';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [TkWithdrawComponent],
  template: '<tk-withdraw [gatewayWithdrawFee]="fee" (done)="onDone()" />',
})
export class WithdrawComponent implements OnInit {
  private globalService = inject(GlobalService);
  private router = inject(Router);

  fee = 0;

  ngOnInit() {
    this.globalService.params.subscribe((p) => {
      this.fee = p?.gatewayWithdrawFee ?? 0;
    });
  }

  onDone() {
    this.router.navigateByUrl('/account/bank', { replaceUrl: true });
  }
}
