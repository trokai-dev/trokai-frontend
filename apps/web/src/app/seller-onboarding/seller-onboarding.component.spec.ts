import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerOnboardingComponent } from './seller-onboarding.component';

describe('SellerOnboardingComponent', () => {
  let component: SellerOnboardingComponent;
  let fixture: ComponentFixture<SellerOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerOnboardingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SellerOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
