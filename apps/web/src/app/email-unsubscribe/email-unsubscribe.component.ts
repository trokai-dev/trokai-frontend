import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { UserService } from '@trokai/shared-data-access';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-email-unsubscribe',
  standalone: true,
  imports: [MatButtonModule, RouterModule],
  templateUrl: './email-unsubscribe.component.html',
  styleUrl: './email-unsubscribe.component.scss',
})
export class EmailUnsubscribeComponent implements OnInit {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  success = false;
  loading = true;

  public async unsubscribeUser(email: string, source: string) {
    try {
      await this.userService.unsubscribeEmailMarketing(email, source);
    } finally {
      this.loading = false;
    }
  }

  async ngOnInit() {
    if (isPlatformServer(this.platformId)) return;

    const email = this.route.snapshot.queryParamMap.get('email');
    const source = this.route.snapshot.queryParamMap.get('source');

    if (!email) {
      this.router.navigate(['/']);
      return;
    }

    await this.unsubscribeUser(email, source ?? '');
  }
}
