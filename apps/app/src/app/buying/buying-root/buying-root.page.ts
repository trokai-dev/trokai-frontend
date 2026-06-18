import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { IonNav } from '@ionic/angular/standalone';
import { ShippingOptionsPage } from '../shipping-options/shipping-options.page';

@Component({
  selector: 'app-buying-root',
  templateUrl: './buying-root.page.html',
  styleUrls: ['./buying-root.page.scss'],
  standalone: true,
  imports: [IonNav],
})
export class BuyingRootPage implements AfterViewInit {
  @ViewChild('ionNav', { static: true }) ionNav: IonNav;

  rootPage = ShippingOptionsPage;

  ngAfterViewInit() {
    this.ionNav.setRoot(this.rootPage);
  }
}
