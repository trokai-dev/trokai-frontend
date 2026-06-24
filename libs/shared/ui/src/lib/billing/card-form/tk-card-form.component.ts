import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { NgxMaskDirective } from 'ngx-mask';
import { Card, User, getCreditCardBrand, PaymentBrands } from '@trokai/shared-core';
import { BuyingService } from '@trokai/shared-data-access';
import { AlertService } from '../../alert/alert.service';
import { TkAddressFormComponent } from '../../address/address-form/tk-address-form.component';
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
    MatDividerModule,
    MatIconModule,
    MatListModule,
    NgxMaskDirective,
    TkAddressFormComponent,
    TkPaymentIconComponent,
  ],
  templateUrl: './tk-card-form.component.html',
  styleUrl: './tk-card-form.component.scss',
})
export class TkCardFormComponent implements OnInit, OnChanges {
  @Input() user!: User;
  @Input() encapsulated = false; // ? (1 cta grande) : (salvar e cancelar pequenos)
  @Input() onlyForm = false;

  @Output() saved = new EventEmitter<Partial<Card>>();

  @ViewChild(TkAddressFormComponent) addressForm!: TkAddressFormComponent;

  private fb = inject(FormBuilder);
  private alert = inject(AlertService);
  private buyingService = inject(BuyingService);

  cardBrand = PaymentBrands.CARD;
  formNew = false;
  useUserAddress = false;

  form: FormGroup = this.fb.group({
    holderName: [null, Validators.required],
    holderDocument: [null, Validators.required],
    number: [null, Validators.required],
    cvv: [
      null,
      [Validators.required, Validators.minLength(3), Validators.maxLength(4)],
    ],
    expirationFull: [null, Validators.required],
  });

  ngOnInit(): void {
    this.useUserAddress = !!this.user?.address;
    if (this.onlyForm) this.formNew = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && !changes['user'].firstChange) {
      this.useUserAddress = !!this.user?.address;
    }
  }

  addressValid(): boolean {
    return this.useUserAddress || this.addressForm?.form?.valid;
  }

  checkBrand() {
    this.cardBrand = getCreditCardBrand(this.form.value.number);
  }

  async save(): Promise<Partial<Card> | null> {
    if (!this.useUserAddress) this.addressForm.validateForm();

    if (this.form.invalid || (!this.useUserAddress && this.addressForm.form.invalid)) {
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
      const av = this.addressForm.form.value;
      card.address = {
        ...av,
        zipCode: av.zipCode ? av.zipCode.replace('-', '') : undefined,
        number: av.number || undefined,
      } as typeof card.address;
    }

    card.address.country = 'BR';

    const created = await this.buyingService.createCard(card);
    this.close();
    this.saved.emit(created);
    return created;
  }

  close() {
    this.form.reset();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.formNew = false;
  }

  async deleteCard(card: Card) {
    const answer = await this.alert.question(
      'Essa ação não pode ser desfeita.',
      'Excluir cartão?',
      'Excluir',
      'Cancelar',
    );
    if (!answer) return;

    await this.buyingService.deleteCard(card);
    this.alert.alert('Cartão apagado!');
  }
}
