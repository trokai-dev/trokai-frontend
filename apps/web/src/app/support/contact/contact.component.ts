import { GlobalService } from 'src/app/services/global.service';
import { Component, OnInit, inject } from '@angular/core';
import {
  AlertService,
  ContactFormComponent,
  ContactFormValue,
} from '@trokai/shared-ui';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  standalone: true,
  imports: [ContactFormComponent, MatButtonModule, MatIconModule, RouterLink],
})
export class ContactComponent implements OnInit {
  private globalService = inject(GlobalService);
  private alert = inject(AlertService);
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = false;
  name = '';
  email = '';

  ngOnInit(): void {
    this.globalService.setTitle('Contato');
    const user = this.authService.getUserValue();
    this.name = user?.name ?? '';
    this.email = user?.email ?? '';
  }

  async sendMail(value: ContactFormValue) {
    try {
      this.loading = true;
      await this.globalService.sendContactMail(
        value.name,
        value.email,
        value.message,
      );
      this.router.navigate(['/']);
      this.alert.showDialog(
        'Mensagem enviada!',
        'Recebemos sua mensagem e responderemos em breve através do email.',
      );
    } catch {
      // sendContactMail surfaces its own error
    } finally {
      this.loading = false;
    }
  }
}
