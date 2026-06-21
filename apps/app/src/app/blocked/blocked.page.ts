import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonContent,
  IonGrid,
  IonIcon,
  isPlatform,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { addIcons } from 'ionicons';
import { sadOutline } from 'ionicons/icons';

@Component({
  selector: 'app-blocked',
  templateUrl: './blocked.page.html',
  styleUrls: ['./blocked.page.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    IonContent, IonGrid, IonIcon],
})
export class BlockedPage implements OnInit {
  private router = inject(Router);

  banned;
  outdated;

  ngOnInit() {
    addIcons({ sadOutline });
    this.banned = this.router.url.includes('banned');
    this.outdated = this.router.url.includes('outdated');
  }

  async openStore() {
    if (isPlatform('ios'))
      window.location.href =
        'https://apps.apple.com/us/app/troka%C3%AD/id1487495619?l=pt&ls=1';
    else
      window.location.href =
        'https://play.google.com/store/apps/details?id=com.trokai.mobile';
  }
}
