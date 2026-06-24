import { Card, User } from '@trokai/shared-core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
  OnChanges,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AlertService } from '@trokai/shared-ui';
import { TkAddressFormComponent as FormAddressComponent } from '@trokai/shared-ui';
import { AuthService } from 'src/app/auth/auth.service';
import { BuyingService } from '@trokai/shared-data-access';
import { GlobalService } from 'src/app/services/global.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

import { NgxMaskDirective } from 'ngx-mask';
import { getCreditCardBrand, PaymentBrands } from '@trokai/shared-core';
import { TkPaymentIconComponent as PaymentIconComponent } from '@trokai/shared-ui';

@Component({
  selector: 'app-form-card',
  templateUrl: './form-card.component.html',
  styleUrls: ['./form-card.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    FormAddressComponent,
    NgxMaskDirective,
    PaymentIconComponent,
  ],
})
export class FormCardComponent implements OnInit, OnChanges {
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private alert = inject(AlertService);
  private buyingService = inject(BuyingService);
  private globalService = inject(GlobalService);

  @Input() encapsulated = false; // ? (1 cta grande) : (salvar e cancelar pequenos)
  @Input() cardId!: string;
  @Input() selectable = false;
  @Input() onlyForm = false;

  @Output() cardSave = new EventEmitter<Card>();
  @Output() formClose = new EventEmitter();
  @Output() cardSelected = new EventEmitter<Card | null>();

  @ViewChild(FormAddressComponent) formAddressComponent!: FormAddressComponent;

  cardBrand = PaymentBrands.CARD;
  selectedCard: Card | null = null;

  user!: User;
  formNew = false;
  useUserAddress = false;

  form: FormGroup = this.formBuilder.group({
    holderName: [null, Validators.compose([Validators.required])],
    holderDocument: [null, Validators.compose([Validators.required])],
    number: [null, Validators.compose([Validators.required])],
    cvv: [
      null,
      Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(4),
      ]),
    ],
    expirationFull: [null, Validators.compose([Validators.required])],
  });

  addressValid() {
    return this.useUserAddress || this.formAddressComponent?.form?.valid;
  }

  ngOnInit(): void {
    this.authService.user$.subscribe((u) => {
      if (u) {
        this.user = u;
        this.useUserAddress = !!u.address;
      }
    });

    if (this.onlyForm) {
      this.formNew = true;
    }
  }

  async save(): Promise<Partial<Card> | null> {
    if (!this.useUserAddress) this.formAddressComponent.validateForm();

    if (
      this.form.invalid ||
      (!this.useUserAddress && this.formAddressComponent.form.invalid)
    ) {
      this.alert.formError();
      return null;
    }

    const frmCard = { ...this.form.value };

    const card = new Card();

    card.number = frmCard.number.match(/\d/g).join('');
    card.holderName = frmCard.holderName;
    card.expMonth = frmCard.expirationFull.substring(0, 2);
    card.expYear = frmCard.expirationFull.substring(2);
    card.cvv = frmCard.cvv;
    card.holderDocument = frmCard.holderDocument.match(/\d/g).join('');

    if (this.useUserAddress) {
      card.address = { ...this.user.address };
      delete card.address.location;
    } else {
      const av = this.formAddressComponent.form.value;
      card.address = {
        ...av,
        zipCode: av.zipCode ? av.zipCode.replace('-', '') : undefined,
        number: av.number || undefined,
      } as typeof card.address;
    }

    card.address.country = 'BR';

    try {
      const _card = await this.buyingService.createCard(card);
      this.close();
      return _card;
    } finally {
      /* intentional */
    }
  }

  selectCard(event: { value: Card }) {
    this.selectedCard = event.value;
    this.cardSelected.emit(this.selectedCard);
  }

  clearSelection() {
    this.selectedCard = null;
    this.cardSelected.emit(null);
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

    try {
      await this.buyingService.deleteCard(card);
      this.alert.alert('Cartão apagado!');
    } finally {
      /* intentional */
    }
  }

  checkBrand() {
    this.cardBrand = getCreditCardBrand(this.form.value.number);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.cardId) return;

    if (
      changes.cardId.previousValue == undefined &&
      changes.cardId.currentValue != undefined
    ) {
      this.selectedCard = changes.cardId.currentValue;
    }
  }
}
