import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ForgotPasswordEmailPage } from './forgot-password-email.page';

describe('ForgotPasswordEmailPage', () => {
  let component: ForgotPasswordEmailPage;
  let fixture: ComponentFixture<ForgotPasswordEmailPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ForgotPasswordEmailPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
