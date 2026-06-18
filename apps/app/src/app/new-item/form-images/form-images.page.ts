import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IDeactivatableComponent } from 'src/app/shared/classes/deactivatable-component.interface';
import { AlertService, TkFormImagesComponent } from '@trokai/shared-ui';
import { UploadPictureItem } from '@trokai/shared-core';
import { IonRouterOutlet } from '@ionic/angular/standalone';
import { TutorialService } from 'src/app/services/tutorial.service';

/**
 * Thin Ionic shell around the shared `tk-form-images`. Keeps the platform concerns —
 * the new-item route's deactivate guard + swipe gesture and the product-register tutorial.
 */
@Component({
  selector: 'app-form-images',
  standalone: true,
  imports: [TkFormImagesComponent],
  template: `
    <tk-form-images
      [inputImages]="inputImages"
      (onOutputImages)="outputImages.emit($event)"
      (helpRequested)="onHelpPictures()"
    ></tk-form-images>
  `,
})
export class FormImagesPage implements IDeactivatableComponent {
  @Input() inputImages: UploadPictureItem[] = [];
  @Output() outputImages = new EventEmitter<UploadPictureItem[]>();

  navigatingEdit = false;

  private routerOutlet = inject(IonRouterOutlet);
  private alertService = inject(AlertService);
  private tutorialService = inject(TutorialService);

  ionViewWillEnter() {
    this.navigatingEdit = false;
  }

  ionViewDidLeave() {
    this.routerOutlet.swipeGesture = true;
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.navigatingEdit) return true;
    return this.alertService.askQuestion(
      'Descartar alterações?',
      'Deseja sair e descartar as alterações?',
    );
  }

  async onHelpPictures() {
    await this.tutorialService.productRegisterTutorial(true);
  }
}
