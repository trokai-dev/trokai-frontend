import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailUnsubscribeComponent } from './email-unsubscribe.component';

describe('EmailUnsubscribeComponent', () => {
  let component: EmailUnsubscribeComponent;
  let fixture: ComponentFixture<EmailUnsubscribeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailUnsubscribeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailUnsubscribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
