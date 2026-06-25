import {
  AfterViewInit,
  Component,
  EventEmitter,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { NgxMaskPipe } from 'ngx-mask';
import { Observable, startWith, map } from 'rxjs';
import {
  BasicModel,
  FeedbackService,
  getBanksList,
  User,
} from '@trokai/shared-core';
import {
  BankAccountHolderType,
  BankAccountModel,
  BankService,
} from '@trokai/shared-data-access';
import { NavigationManager } from '@trokai/shared-core';
import { canSaveForm } from '../../forms';

@Component({
  selector: 'tk-bank-account-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatOptionModule,
    NgxMaskPipe,
    AsyncPipe,
    TitleCasePipe,
  ],
  templateUrl: './tk-bank-account-form.component.html',
  styleUrl: './tk-bank-account-form.component.scss',
})
export class TkBankAccountFormComponent implements AfterViewInit {
  loaded = false;
  accountBkp!: BankAccountModel;
  changingAccount = false;

  form: FormGroup;
  banks = getBanksList();
  filteredBanks$: Observable<BasicModel<string>[]>;

  user!: User;

  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @Output() saved = new EventEmitter<void>();

  private bankService = inject(BankService);
  private nav = inject(NavigationManager);
  private feedback = inject(FeedbackService);

  constructor() {
    this.form = new FormGroup({
      holderName: new FormControl(null, Validators.required),
      bank: new FormControl(null, Validators.required),
      branchNumber: new FormControl(null, [
        Validators.required,
        Validators.minLength(4),
      ]),
      branchCheckDigit: new FormControl(null, Validators.maxLength(1)),
      accountNumber: new FormControl(null, [
        Validators.required,
        Validators.minLength(4),
      ]),
      accountCheckDigit: new FormControl(null, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(1),
      ]),
    });

    this.filteredBanks$ = this.form.get('bank')!.valueChanges.pipe(
      startWith(''),
      map((v) => {
        if (v && typeof v !== 'string') return [];
        return this._filterBanks(v ?? '');
      }),
    );
  }

  displayBank(option: BasicModel<string>): string {
    return option?.value ?? '';
  }

  get canSave(): boolean {
    return (
      canSaveForm(this.form, !!this.accountBkp) &&
      !!this.form.get('bank')?.value?._id
    );
  }

  private _filterBanks(value: string): BasicModel<string>[] {
    const lower = value.toLowerCase();
    if (!lower) return this.banks.slice(0, 30);
    return this.banks
      .filter((b) => b.value.toLowerCase().includes(lower))
      .slice(0, 30);
  }

  ngAfterViewInit() {
    this.load();
  }

  async load() {
    this.loaded = false;
    this.user = this.nav.currentUser()!;
    const account = await this.bankService.fetchAccount();

    if (account) {
      const banco = this.banks.find(
        (b) =>
          b._id === account.bank ||
          b._id === account.bank?.toString().padStart(3, '0'),
      );
      this.form.patchValue({ ...account, bank: banco });
      this.form.disable();
      this.accountBkp = account;
    }
    this.loaded = true;
  }

  selectBank(banco: BasicModel<string>) {
    this.form.get('bank')!.setValue(banco);
  }

  changeAccount() {
    this.formGroupDirective.resetForm();
    this.form.reset();
    this.form.enable();
    this.changingAccount = true;
  }

  cancelChange() {
    this.changingAccount = false;
    this.load();
  }

  async save() {
    if (this.form.invalid || !this.form.get('bank')?.value?._id) return;

    const fv = this.form.getRawValue();
    const account = new BankAccountModel();

    account.holderName = fv.holderName;
    account.bank = fv.bank._id.toString().padStart(3, '0');
    account.branchNumber = fv.branchNumber;
    account.branchCheckDigit = fv.branchCheckDigit;
    account.accountNumber = fv.accountNumber;
    account.accountCheckDigit = fv.accountCheckDigit;
    account.holderDocument = this.user?.cpf ?? '';
    account.holderType =
      account.holderDocument.length === 11
        ? BankAccountHolderType.INDIVIDUAL
        : BankAccountHolderType.COMPANY;

    if (
      !this.accountBkp ||
      account.holderName !== this.accountBkp.holderName ||
      account.holderDocument !== this.accountBkp.holderDocument ||
      +account.bank! !== +(this.accountBkp.bank ?? '') ||
      account.branchNumber !== this.accountBkp.branchNumber ||
      account.branchCheckDigit !== this.accountBkp.branchCheckDigit ||
      account.accountNumber !== this.accountBkp.accountNumber ||
      account.accountCheckDigit !== this.accountBkp.accountCheckDigit
    ) {
      await this.bankService.saveAccount(account);
      this.feedback.success('Conta bancária salva!');
    }

    this.saved.emit();
  }
}
