import {
  Component,
  EventEmitter,
  Input,
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
import { User } from '@trokai/shared-core';
import { TkUserAvatarComponent } from '../user-avatar/user-avatar.component';

export interface ReportUserValue {
  type: string;
  message: string;
}

@Component({
  selector: 'tk-report-user',
  templateUrl: './report-user.component.html',
  styleUrls: ['./report-user.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    TkUserAvatarComponent,
  ],
})
export class ReportUserComponent {
  @Input() otherUser!: User;
  @Input() loading = false;
  @Input() done = false;

  @Output() submitted = new EventEmitter<ReportUserValue>();
  @Output() closed = new EventEmitter<void>();

  readonly form = new FormGroup({
    type: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
  });

  get firstName(): string {
    const name = this.otherUser?.storeName ?? this.otherUser?.name ?? '';
    return name.split(' ')[0];
  }

  submit() {
    if (this.loading || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }
}
