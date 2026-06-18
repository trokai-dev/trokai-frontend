import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RequiredAdjustsComponent } from './required-adjusts.component';

describe('RequiredAdjustsComponent', () => {
  let component: RequiredAdjustsComponent;
  let fixture: ComponentFixture<RequiredAdjustsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), RequiredAdjustsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RequiredAdjustsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
