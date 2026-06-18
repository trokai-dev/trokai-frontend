import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZipcodeShippingFeeComponent } from './zipcode-shipping-fee.component';

describe('ZipcodeShippingFeeComponent', () => {
  let component: ZipcodeShippingFeeComponent;
  let fixture: ComponentFixture<ZipcodeShippingFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZipcodeShippingFeeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZipcodeShippingFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
