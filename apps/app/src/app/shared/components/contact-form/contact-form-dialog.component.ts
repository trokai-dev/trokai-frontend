import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ContactFormComponent, ContactFormValue } from '@trokai/shared-ui';
import { FeedbackService } from '@trokai/shared-core';
import { ContactFormService } from './contact-form.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-contact-form',
  template: `
    <tk-contact-form
      [dismissable]="true"
      [name]="name"
      [email]="email"
      [loading]="loading"
      [done]="done"
      (submitted)="sendMessage($event)"
      (closed)="close()"
    />
  `,
  standalone: true,
  imports: [ContactFormComponent],
})
export class ContactFormDialogComponent {
  name = '';
  email = '';
  loading = false;
  done = false;

  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<ContactFormDialogComponent>);
  private contactFormService = inject(ContactFormService);
  private firebaseService = inject(FirebaseService);
  private feedback = inject(FeedbackService);

  constructor() {
    const user = this.authService.getUserValue();
    this.name = user?.name ?? '';
    this.email = user?.email ?? '';
  }

  async sendMessage(value: ContactFormValue) {
    this.loading = true;
    try {
      await firstValueFrom(
        this.contactFormService.sendMessage(
          value.message,
          value.name,
          value.email,
        ),
      );
      this.done = true;
      this.feedback.success('Mensagem enviada!');
      this.firebaseService.log('AJUDA_FALE_CONOSCO_ENVIADO');
    } finally {
      this.loading = false;
    }
  }

  close() {
    this.dialogRef.close();
  }
}
