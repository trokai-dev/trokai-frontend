import { User } from '@trokai/shared-core';
import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { AuthService } from '../services/auth.service';
import {
  Platform,
  IonTabs,
  NavController,
  IonIcon,
  IonTabBar,
  IonTabButton,
} from '@ionic/angular/standalone';
import { InventoryService } from '../services/inventory.service';
import { MainService } from '../services/main.service';
import { NgStyle } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  home,
  homeOutline,
  search,
  searchOutline,
  cameraOutline,
  menu,
  menuOutline,
  enter,
  enterOutline,
  cubeOutline,
  cube,
} from 'ionicons/icons';
import { CompletingInformationService } from '@trokai/shared-data-access';
import { TutorialService } from '../services/tutorial.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonIcon, NgStyle, IonTabs, IonTabBar, IonTabButton],
})
export class MainPage implements OnInit {
  private authService = inject(AuthService);
  private mainService = inject(MainService);
  private inventoryService = inject(InventoryService);
  private platform = inject(Platform);
  private navCtrl = inject(NavController);
  private completingInfoService = inject(CompletingInformationService);
  private tutorialService = inject(TutorialService);

  shouldAskForPlaces = false;
  myPlaces = [];

  @ViewChild('tabs') tabs: IonTabs;
  @ViewChild('mainTabBar') tabBar: ElementRef;
  @ViewChild('rowBar') rowBar: ElementRef;

  user: User;

  ngOnInit() {
    addIcons({
      home,
      homeOutline,
      search,
      searchOutline,
      cameraOutline,
      menu,
      menuOutline,
      enter,
      enterOutline,
      cubeOutline,
      cube,
    });

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.navCtrl.back();
    });

    this.authService.user$.subscribe((u) => (this.user = u));
  }

  async registerItem() {
    await this.completingInfoService.tryRegisterProduct();
  }

  getTab() {
    if (this.tabs) {
      return this.tabs.getSelected();
    }
  }

  // SCROLLS MAIN

  homeScroll() {
    if (this.getTab() === 'home') this.mainService.homeTab.next(null);
  }

  searchScroll() {
    if (this.getTab() === 'search') this.mainService.searchTab.next(null);
  }

  negotiationsScroll() {
    if (this.getTab() === 'negotiations')
      this.mainService.negotiationsTab.next(null);
  }

  profileScroll() {
    if (this.getTab() === 'profile') this.mainService.profileTab.next(null);
  }
}
