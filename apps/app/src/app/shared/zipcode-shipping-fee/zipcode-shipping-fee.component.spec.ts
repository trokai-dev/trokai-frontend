import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ZipcodeShippingFeeComponent } from './zipcode-shipping-fee.component';

describe('ZipcodeShippingFeeComponent', () => {
  let component: ZipcodeShippingFeeComponent;
  let fixture: ComponentFixture<ZipcodeShippingFeeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ZipcodeShippingFeeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ZipcodeShippingFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
