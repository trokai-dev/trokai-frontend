import { Component, OnInit, inject } from '@angular/core';
import {
  CameraPreview,
  CameraPreviewOptions,
  CameraPreviewPictureOptions,
} from '@capacitor-community/camera-preview';
import {
  isPlatform,
  ModalController,
  Platform,
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  cameraOutline,
  cameraReverseOutline,
  checkmarkOutline,
  closeOutline,
  flashOffOutline,
  flashOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-camera-preview',
  templateUrl: './camera-preview.component.html',
  styleUrls: ['./camera-preview.component.scss'],
  standalone: true,
  imports: [IonContent, IonIcon],
})
export class CameraPreviewComponent implements OnInit {
  viewHeight = 0;
  viewWidth = 0;

  divsStyle = null;

  btn1Style = null;
  btn2Style = null;
  btn3Style = null;

  flashOn = false;
  image = null;

  contentWidth = 0;
  contentHeight = 0;
  contentTop = 0;

  imageStyle = null;
  isFlipped = false;

  mayRotate = false;

  private modalCtrl = inject(ModalController);
  private platform = inject(Platform);

  constructor() {
    addIcons({
      flashOutline,
      flashOffOutline,
      closeOutline,
      cameraOutline,
      cameraReverseOutline,
      checkmarkOutline,
    });

    this.viewHeight = parseInt(this.platform.height().toString());

    this.viewWidth = parseInt(this.platform.width().toString());

    this.divsStyle = {
      height: parseInt((0.1 * this.viewHeight).toString()) + 'px',
      width: parseInt(this.viewWidth.toString()) + 'px',
    };

    const third = parseInt((this.viewWidth / 3).toString());

    this.btn1Style = {
      width: third + 'px',
      height: this.divsStyle.height,
      left: 0 + 'px',
    };

    this.btn2Style = {
      width: third + 'px',
      height: this.divsStyle.height,
      left: third + 'px',
    };

    this.btn3Style = {
      width: third + 'px',
      height: this.divsStyle.height,
      left: 2 * third + 'px',
    };

    this.contentTop = parseInt((0.1 * this.viewHeight).toString());
    this.contentWidth = parseInt(this.viewWidth.toString());
    this.contentHeight = parseInt((0.8 * this.viewHeight).toString());

    this.imageStyle = {
      position: 'absolute',
      top: this.contentTop + 'px',
      width: this.contentWidth + 'px',
      heigth: this.contentHeight + 'px',
    };
  }

  ngOnInit() {
    this.openCamera();
  }

  setFlash() {
    this.flashOn = !this.flashOn;
    CameraPreview.setFlashMode({ flashMode: this.flashOn ? 'on' : 'off' });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  openCamera() {
    this.isFlipped = false;

    const cameraPreviewOptions: CameraPreviewOptions = {
      position: 'rear',
      parent: 'cameraPreview',
      className: 'cameraPreview',
      x: 0,
      y: this.contentTop,
      width: this.contentWidth,
      height: this.contentHeight,
      disableAudio: true,
      // toBack: true
    };

    CameraPreview.start(cameraPreviewOptions);
  }

  rotateImage(base64data) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const image = new Image();
    image.src = base64data;

    image.onload = () => {
      canvas.width = image.height;
      canvas.height = image.width;
      ctx.rotate((-90 * Math.PI) / 180);
      ctx.translate(-canvas.height, 0);
      ctx.drawImage(image, 0, 0);
      this.image = canvas.toDataURL();
    };
  }

  back() {
    this.modalCtrl.dismiss();
  }

  flipCamera() {
    this.isFlipped = !this.isFlipped;
    CameraPreview.flip();
  }

  async captureImage() {
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 90,
    };

    const result = await CameraPreview.capture(cameraPreviewPictureOptions);
    const base64 = 'data:image/jpeg;base64,' + result.value;

    // precisa em todos os androids?
    // se nao, tirar isso e deixar o botao de rotate
    if (this.isFlipped && isPlatform('android')) this.rotateImage(base64);
    else this.image = base64;

    CameraPreview.stop();
  }

  again() {
    this.image = null;
    this.openCamera();
  }

  confirm() {
    this.modalCtrl.dismiss({ image: this.image });
  }

  ionViewWillLeave() {
    if (!this.image) CameraPreview.stop();
  }
}
