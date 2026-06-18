import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonicSlides,
  IonToolbar,
  NavController,
  Platform,
} from '@ionic/angular/standalone';

import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { IDeactivatableComponent } from 'src/app/shared/classes/deactivatable-component.interface';

import { AuthService } from '../../services/auth.service';
import { Swiper } from 'swiper';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { AlertService } from '@trokai/shared-ui';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-update-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonIcon,
    IonContent,
    IonButton,
    LottieComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OnboardingPage
  implements OnInit, OnDestroy, IDeactivatableComponent
{
  swiperInstance: Swiper;

  @ViewChild('swiper') set swiper(swiperRef: ElementRef) {
    setTimeout(() => {
      this.swiperInstance = swiperRef.nativeElement.swiper;
      this.swiperInstance.modules = [IonicSlides];
    });
  }

  user;
  afterTime = false;
  clickedToLeave = false;

  options1: AnimationOptions = { path: 'assets/presentation/bag.json' };
  options3: AnimationOptions = { path: 'assets/presentation/map.json' };
  options4: AnimationOptions = { path: 'assets/presentation/shield.json' };
  options5: AnimationOptions = { path: 'assets/lottie/formcheck.json' };
  options6: AnimationOptions = { path: 'assets/lottie/truck.json' };
  options7: AnimationOptions = { path: 'assets/lottie/relax.json' };

  showFooter = false;
  subBack: Subscription;

  private authService = inject(AuthService);
  private navCtrl = inject(NavController);
  private platform = inject(Platform);
  private alertService = inject(AlertService);

  constructor() {
    addIcons({ close });
  }

  ngOnInit() {
    this.authService.user.pipe(take(1)).subscribe((u) => (this.user = u));

    this.subBack = this.platform.backButton.subscribeWithPriority(201, () => {
      this.onClose();
    });
  }

  onGo() {
    this.clickedToLeave = true;
    this.navCtrl.back();
  }

  async onClose() {
    const answer = await this.alertService.askQuestion(
      'Pular apresentação',
      'Deseja pular a apresentação?',
    );
    if (answer) this.onGo();
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.clickedToLeave;
  }

  async slideChanged() {
    const i = this.swiperInstance.activeIndex;
    const len = this.swiperInstance.slides.length;
    this.showFooter = i === len - 1;
  }

  ngOnDestroy(): void {
    if (this.subBack) this.subBack.unsubscribe();
  }
}
