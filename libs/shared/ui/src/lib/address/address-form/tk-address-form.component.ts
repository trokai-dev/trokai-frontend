import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Address, RespostaCep } from '@trokai/shared-core';
import { AlertService } from '../../alert/alert.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'tk-address-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgxMaskDirective,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" class="tk-address-form">
      <div class="tk-row">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>CEP</mat-label>
          <input
            matInput
            type="text"
            mask="00000-000"
            formControlName="zipCode"
            (keyup)="onChangeCEP()"
          />
          @if (viaCepError) {
            <mat-hint>CEP inválido</mat-hint>
          }
        </mat-form-field>
      </div>
      <div class="tk-row">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Endereço</mat-label>
          <input matInput type="text" formControlName="street" />
        </mat-form-field>
      </div>
      <div class="tk-row tk-row--cols">
        <mat-form-field appearance="outline" class="tk-col-4">
          <mat-label>Número</mat-label>
          <input matInput type="text" formControlName="number" maxlength="6" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="tk-col-8">
          <mat-label>Complemento</mat-label>
          <input matInput type="text" formControlName="complement" />
        </mat-form-field>
      </div>
      <div class="tk-row">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Bairro</mat-label>
          <input matInput type="text" formControlName="neighborhood" />
        </mat-form-field>
      </div>
      <div class="tk-row tk-row--cols">
        <mat-form-field appearance="outline" class="tk-col-8">
          <mat-label>Cidade</mat-label>
          <input matInput readonly type="text" formControlName="city" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="tk-col-4">
          <mat-label>Estado</mat-label>
          <input matInput readonly type="text" formControlName="state" />
        </mat-form-field>
      </div>
      @if (submit) {
        <div class="tk-row tk-actions">
          @if (encapsulated) {
            <button type="button" mat-button color="light" (click)="close()">
              Cancelar
            </button>
          }
          <button type="submit" mat-flat-button color="primary">Salvar</button>
        </div>
      }
    </form>
  `,
  styles: [
    `
      .tk-address-form {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .tk-row {
        width: 100%;
      }
      .tk-row--cols {
        display: flex;
        gap: var(--space-12);
      }
      .tk-col-4 {
        flex: 0 0 33.33%;
      }
      .tk-col-8 {
        flex: 1;
      }
      .tk-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-8);
        margin-top: var(--space-16);
      }
    `,
  ],
})
export class TkAddressFormComponent implements OnChanges {
  @Input() encapsulated = false;
  @Input() address?: Address;
  @Input() submit = true;
  @Output() addressSave = new EventEmitter<Address>();
  @Output() formClose = new EventEmitter<void>();

  private http = inject(HttpClient);
  private alert = inject(AlertService);

  viaCepError = false;

  form = new FormGroup({
    street: new FormControl<string | null>(null, [Validators.required]),
    neighborhood: new FormControl<string | null>(null, [Validators.required]),
    city: new FormControl<string | null>(null, [Validators.required]),
    state: new FormControl<string | null>(null, [Validators.required]),
    zipCode: new FormControl<string | null>(null, [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(8),
    ]),
    number: new FormControl<string | null>(null, [
      Validators.required,
      Validators.maxLength(6),
    ]),
    complement: new FormControl<string | null>(null),
  });

  onChangeCEP() {
    const zip = this.form.get('zipCode')?.value?.toString().replace('-', '');
    if (zip?.length === 8) this.requestCep(zip);
  }

  async requestCep(cep: string) {
    try {
      const res = await lastValueFrom(
        this.http.get<RespostaCep>(`https://viacep.com.br/ws/${cep}/json/`),
      );
      this.form.patchValue({
        street: res.logradouro,
        neighborhood: res.bairro,
        city: res.localidade,
        state: res.uf,
        number: null,
        complement: null,
      });
      this.viaCepError = !!res.erro;
      // eslint-disable-next-line no-empty
    } catch {}
  }

  async save() {
    if (!this.form.valid) {
      this.alert.formError();
      return;
    }
    const v = this.form.value;
    const zipCode = v.zipCode!.toString().replace('-', '');
    const address: Address = {
      zipCode,
      street: v.street!,
      number: v.number || undefined,
      complement: v.complement || undefined,
      neighborhood: v.neighborhood!,
      city: v.city!,
      state: v.state!,
      country: 'BRA',
    };
    if (!address.complement) delete address.complement;
    this.addressSave.emit(address);
  }

  validateForm() {
    Object.keys(this.form.controls).forEach((key) => {
      const c = this.form.get(key)!;
      c.markAsTouched();
      c.updateValueAndValidity();
    });
  }

  close() {
    this.formClose.emit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['address'] &&
      changes['address'].previousValue == null &&
      changes['address'].currentValue != null &&
      !this.form.valid
    ) {
      const a = this.address!;
      this.form.patchValue({
        ...a,
        zipCode: a.zipCode?.toString(),
        number: a.number?.toString(),
      });
    }
  }
}
