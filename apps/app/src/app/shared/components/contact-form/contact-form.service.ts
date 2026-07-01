import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ContactFormService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);
  private platform = inject(Platform);

  sendMessage(message: string, name: string, email: string) {
    const user = this.authService.getUserValue();

    let platform = null;

    if (this.platform.is('ios')) platform = 'iOS';
    else if (this.platform.is('android')) platform = 'Android';
    else platform = 'Web';

    const contact = { userId: user?._id, message, name, platform, email };
    return this.httpClient.post(
      environment.urlApi + '/contact-form/app/',
      contact,
    );
  }
}
