import { Component, OnInit, inject } from '@angular/core';
import { User } from '@trokai/shared-core';
import { TkCardFormComponent } from '@trokai/shared-ui';
import { AuthService } from './../../auth/auth.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  standalone: true,
  imports: [TkCardFormComponent],
})
export class CardsComponent implements OnInit {
  private authService = inject(AuthService);

  user?: User;

  ngOnInit(): void {
    this.authService.user$.subscribe((u) => {
      if (u) this.user = u;
    });
  }
}
