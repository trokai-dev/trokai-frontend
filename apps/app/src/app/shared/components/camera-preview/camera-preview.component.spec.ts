import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CameraPreviewComponent } from './camera-preview.component';

describe('CameraPreviewComponent', () => {
  let component: CameraPreviewComponent;
  let fixture: ComponentFixture<CameraPreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CameraPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
