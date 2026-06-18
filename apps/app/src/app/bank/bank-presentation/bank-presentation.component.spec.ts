import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BankPresentationComponent } from './bank-presentation.component';

describe('BankPresentationComponent', () => {
  let component: BankPresentationComponent;
  let fixture: ComponentFixture<BankPresentationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), BankPresentationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BankPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
