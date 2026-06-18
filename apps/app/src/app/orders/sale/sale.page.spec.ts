import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SalePage } from './sale.page';

describe('SalePage', () => {
  let component: SalePage;
  let fixture: ComponentFixture<SalePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), SalePage],
    }).compileComponents();

    fixture = TestBed.createComponent(SalePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
