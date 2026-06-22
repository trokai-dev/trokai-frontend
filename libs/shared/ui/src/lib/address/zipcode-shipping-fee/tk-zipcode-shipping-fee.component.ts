import { CurrencyPipe, NgClass, isPlatformServer } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearchLocationService } from '@trokai/shared-core';
import { BuyingService, ShippingInfo } from '@trokai/shared-data-access';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { CostPipe } from '../../pipes/cost.pipe';

@Component({
  selector: 'tk-zipcode-shipping-fee',
  standalone: true,
  imports: [
    MatFormFieldModule,
    NgClass,
    MatInputModule,
    FormsModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
    CostPipe,
    NgxMaskDirective,
    NgxMaskPipe,
  ],
  template: `
    <div class="flex">
      @if (!typeZip && !zipLoading && zipCode) {
        <span
          class="block shipping-label label-body-2"
          role="button"
          tabindex="0"
          (click)="clickShippingLabel($event)"
          (keyup.enter)="clickShippingLabel($event)"
        >
          Em até {{ shippingInfo?.maxDeliveryTime }} dias após o envio por
          <span>
            @if (
              shippingInfo?.fullShippingCost &&
              shippingInfo!.fullShippingCost! > shippingInfo!.shippingCost
            ) {
              <span class="label-body-2 color-gray-light-1 line-through">
                {{
                  shippingInfo!.fullShippingCost
                    | cost
                    | currency: 'BRL' : 'symbol' : '1.2'
                }}
              </span>
            }
            <b>{{
              shippingInfo?.shippingCost ?? 0
                | cost
                | currency: 'BRL' : 'symbol' : '1.0-2'
            }}</b>
          </span>
          (CEP {{ zipCode | mask: '00000-000' }})
        </span>
      }
      @if (!typeZip && !zipLoading && !zipCode) {
        <span
          class="block shipping-label label-body-2 color-primary"
          role="button"
          tabindex="0"
          (click)="clickShippingLabel($event)"
          (keyup.enter)="clickShippingLabel($event)"
        >
          <b>Calcular frete de entrega</b>
        </span>
      }
      @if (typeZip) {
        <mat-form-field
          appearance="outline"
          [ngClass]="{ hidden: !typeZip, block: typeZip }"
        >
          <input
            matInput
            #zipInput
            [(ngModel)]="zipCode"
            (blur)="zipBlur()"
            (input)="zipChange()"
            type="text"
            mask="00000-000"
            placeholder="Digite o CEP"
          />
        </mat-form-field>
      }
      @if (zipLoading) {
        <div class="flex items-center">
          <mat-spinner color="primary" class="spinner-nano"></mat-spinner>
          <span class="label-caption ml-24">Buscando valor do frete</span>
        </div>
      }
    </div>
  `,
})
export class TkZipcodeShippingFeeComponent implements OnInit {
  @Input() productId?: string;
  @ViewChild('zipInput') zipInput?: ElementRef;

  shippingInfo?: ShippingInfo;
  zipCode?: number;
  typeZip = false;
  zipLoading = false;

  private buyingService = inject(BuyingService);
  private locationService = inject(SearchLocationService);
  private platformId = inject<object>(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformServer(this.platformId)) return;
    setTimeout(() => this.start());
  }

  start() {
    const location = this.locationService.getSearchLocationValue();
    if (location) {
      this.zipCode = location.zip;
      this.getShippingFee();
    }
  }

  async clickShippingLabel(event: Event) {
    event.stopPropagation();
    setTimeout(() => this.zipInput?.nativeElement.focus(), 200);
    this.typeZip = true;
  }

  async zipChange() {
    if (this.zipCode?.toString().length === 8) this.getShippingFee();
  }

  async getShippingFee() {
    this.zipLoading = true;
    this.typeZip = false;
    try {
      if (!this.productId || !this.zipCode) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.shippingInfo = await this.buyingService.calculateShippingFee(
        this.zipCode.toString(),
        [{ _id: this.productId } as any],
      );
      this.locationService.changeSearchZip(this.zipCode!);
    } catch {
      this.zipCode = undefined;
      this.shippingInfo = undefined;
      this.typeZip = false;
    } finally {
      this.zipLoading = false;
    }
  }

  async zipBlur() {
    this.typeZip = false;
    if (this.zipCode?.toString().length !== 8) this.zipCode = undefined;
  }
}
