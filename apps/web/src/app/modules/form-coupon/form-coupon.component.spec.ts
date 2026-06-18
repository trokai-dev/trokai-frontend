import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCouponComponent } from './form-coupon.component';

describe('FormCouponComponent', () => {
  let component: FormCouponComponent;
  let fixture: ComponentFixture<FormCouponComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormCouponComponent],
    });
    fixture = TestBed.createComponent(FormCouponComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
