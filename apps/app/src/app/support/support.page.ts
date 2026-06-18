import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonGrid,
} from '@ionic/angular/standalone';
import { MatDialog } from '@angular/material/dialog';
import { BackButtonComponent } from '../shared/components/back-button/back-button.component';
import { addIcons } from 'ionicons';
import {
  cartOutline,
  logoWhatsapp,
  mailOutline,
  storefrontOutline,
} from 'ionicons/icons';
import { ContactFormDialogComponent } from '../shared/components/contact-form/contact-form-dialog.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
  standalone: true,
  imports: [
    IonGrid,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    FormsModule,
    RouterModule,
    BackButtonComponent,
  ],
})
export class SupportPage implements OnInit {
  private dialog = inject(MatDialog);

  ngOnInit() {
    addIcons({ storefrontOutline, cartOutline, mailOutline, logoWhatsapp });
  }

  contact() {
    this.dialog.open(ContactFormDialogComponent, {
      panelClass: 'modal-95',
    });
  }
}
