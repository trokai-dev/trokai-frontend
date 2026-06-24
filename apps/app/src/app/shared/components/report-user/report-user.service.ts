import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';
import { map, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportUserService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);

  sendMessage(reportedUserId: string, message: string, type: string) {
    let user;
    this.authService.user$.pipe(take(1)).subscribe((u) => (user = u));

    const contact = {
      reportedUserId: reportedUserId,
      type: type,
      message: message,
    };

    return this.httpClient.post(
      environment.urlApi + '/contact-form/report-user/',
      contact,
    );
  }
}
