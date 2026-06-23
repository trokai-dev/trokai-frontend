import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global.service';
import { BackButtonComponent } from 'src/app/shared/components/back-button/back-button.component';
import { FaqData } from '@trokai/shared-core';
import { TkFaqComponent } from '@trokai/shared-features';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
  standalone: true,
  imports: [
    TkFaqComponent,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    FormsModule,
    BackButtonComponent,
  ],
})
export class FaqPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private globalService = inject(GlobalService);

  faq?: FaqData;

  async ngOnInit() {
    try {
      const slug = this.route.snapshot.paramMap.get('slug');

      if (!slug) throw new Error('Slug not found');

      this.faq = await this.globalService.getFaq(slug);

      if (!this.faq) throw new Error('FAQ not found');
    } catch {
      this.router.navigate(['/help']);
    }
  }
}
