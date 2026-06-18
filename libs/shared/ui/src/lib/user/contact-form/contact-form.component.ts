import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TrokaiErrorStateMatcher } from '../../forms';

export interface ContactFormValue {
  name: string;
  email: string;
  message: string;
  type: string;
}

@Component({
  selector: 'tk-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatProgressSpinnerModule,
  ],
})
export class ContactFormComponent implements OnInit {
  /** Web shows a name field; app prefills the email from the logged user. */
  @Input() showName = false;
  /** App offers a message-type selector (Problema / Dúvida / Sugestão). */
  @Input() showType = false;
  /** App renders a close icon + inline success state. */
  @Input() dismissable = false;
  @Input() name = '';
  @Input() email = '';
  @Input() loading = false;
  @Input() done = false;

  @Output() submitted = new EventEmitter<ContactFormValue>();
  @Output() closed = new EventEmitter<void>();

  readonly matcher = new TrokaiErrorStateMatcher();

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
    type: new FormControl('', { nonNullable: true }),
  });

  ngOnInit() {
    if (this.showName)
      this.form.controls.name.addValidators(Validators.required);
    if (this.showType)
      this.form.controls.type.addValidators(Validators.required);

    this.form.patchValue({ name: this.name, email: this.email });
  }

  submit() {
    if (this.loading || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }
}
