import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PostageLabelPresentationComponent } from './postage-label-presentation.component';

describe('PostageLabelPresentationComponent', () => {
  let component: PostageLabelPresentationComponent;
  let fixture: ComponentFixture<PostageLabelPresentationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), PostageLabelPresentationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostageLabelPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
