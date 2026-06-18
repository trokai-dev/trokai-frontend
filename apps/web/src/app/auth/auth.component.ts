import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs';
import { Router, RouterOutlet } from '@angular/router';
import { CompletingInformationService } from '@trokai/shared-data-access';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [RouterOutlet],
})
export class AuthComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private completingService = inject(CompletingInformationService);
  private router = inject(Router);

  authsub!: Subscription;

  ngOnInit(): void {
    this.authsub = this.authService.logged.subscribe((logged) => {
      if (logged && !this.completingService.hasFlow)
        this.router.navigate(['/']);
    });
  }

  ngOnDestroy(): void {
    if (this.authsub) this.authsub.unsubscribe();
  }
}
