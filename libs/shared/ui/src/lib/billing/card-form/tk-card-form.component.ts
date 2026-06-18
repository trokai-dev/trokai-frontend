import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { Card, User } from '@trokai/shared-core';
import { BuyingService } from '@trokai/shared-data-access';
import { AlertService } from '../../alert/alert.service';
import { getCreditCardBrand, PaymentBrands } from '@trokai/shared-core';
import { TkPaymentIconComponent } from '../payment-icon/tk-payment-icon.component';

@Component({
  selector: 'tk-card-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    NgxMaskDirective,
    TkPaymentIconComponent,
  ],
  templateUrl: './tk-card-form.component.html',
  styleUrl: './tk-card-form.component.scss',
})
export class TkCardFormComponent implements OnInit {
  @Input() user!: User;
  @Output() saved = new EventEmitter<Partial<Card>>();

  private fb = inject(FormBuilder);
  private buyingService = inject(BuyingService);
  private alert = inject(AlertService);

  useUserAddress = false;
  cardBrand = PaymentBrands.CARD;

  form: FormGroup = this.fb.group({
    holderName: [null, Validators.required],
    holderDocument: [null, Validators.required],
    number: [null, Validators.required],
    cvv: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
    expirationFull: [null, Validators.required],
  });

  addressForm: FormGroup = this.fb.group({
    street: [null, Validators.required],
    neighborhood: [null, Validators.required],
    city: [null, Validators.required],
    state: [null, Validators.required],
    zipCode: [null, Validators.required],
    number: [null, Validators.required],
    complement: [null],
  });



  ngOnInit() {
    this.useUserAddress = !!this.user?.address;
  }

  checkBrand() {
    this.cardBrand = getCreditCardBrand(this.form.value.number);
  }

  isValid() {
    if (this.form.invalid) return false;
    if (!this.useUserAddress && this.addressForm.invalid) return false;
    return true;
  }

  async save(): Promise<Partial<Card> | null> {
    this.form.markAllAsTouched();
    if (!this.useUserAddress) this.addressForm.markAllAsTouched();

    if (!this.isValid()) {
      this.alert.formError();
      return null;
    }

    const fv = this.form.value;
    const card = new Card();

    card.number = fv.number.match(/\d/g).join('');
    card.holderName = fv.holderName;
    card.expMonth = fv.expirationFull.substring(0, 2);
    card.expYear = fv.expirationFull.substring(2);
    card.cvv = fv.cvv;
    card.holderDocument = fv.holderDocument.match(/\d/g).join('');

    if (this.useUserAddress) {
      card.address = { ...this.user.address };
      delete card.address.location;
    } else {
      card.address = { ...this.addressForm.value };
    }
    card.address.country = 'BR';

    const created = await this.buyingService.createCard(card);
    this.saved.emit(created);
    return created;
  }
}
