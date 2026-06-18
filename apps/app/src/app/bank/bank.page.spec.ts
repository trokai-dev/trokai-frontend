import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BankPage } from './bank.page';

describe('BankPage', () => {
  let component: BankPage;
  let fixture: ComponentFixture<BankPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), BankPage],
    }).compileComponents();

    fixture = TestBed.createComponent(BankPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
