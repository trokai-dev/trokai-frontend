import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TrokaiErrorStateMatcher } from '../../forms';

export interface ContactFormValue {
  name: string;
  email: string;
  message: string;
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
    MatProgressSpinnerModule,
  ],
})
export class ContactFormComponent implements OnInit {
  /** App renders a close icon + inline success state. */
  @Input() dismissable = false;
  /** Prefilled from the logged-in user, if any; name/email become readonly. */
  @Input() name = '';
  @Input() email = '';
  @Input() loading = false;
  @Input() done = false;

  @Output() submitted = new EventEmitter<ContactFormValue>();
  @Output() closed = new EventEmitter<void>();

  readonly matcher = new TrokaiErrorStateMatcher();

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
  });

  ngOnInit() {
    this.form.patchValue({ name: this.name, email: this.email });
    if (this.name) this.form.controls.name.disable();
    if (this.email) this.form.controls.email.disable();
  }

  submit() {
    if (this.loading || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }
}
