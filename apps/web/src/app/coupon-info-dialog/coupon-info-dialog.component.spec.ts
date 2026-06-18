import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouponInfoDialogComponent } from './coupon-info-dialog.component';

describe('CouponInfoDialogComponent', () => {
  let component: CouponInfoDialogComponent;
  let fixture: ComponentFixture<CouponInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CouponInfoDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CouponInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
