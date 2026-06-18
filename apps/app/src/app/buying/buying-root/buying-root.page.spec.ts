import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BuyingRootPage } from './buying-root.page';

describe('BuyingRootPage', () => {
  let component: BuyingRootPage;
  let fixture: ComponentFixture<BuyingRootPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), BuyingRootPage],
    }).compileComponents();

    fixture = TestBed.createComponent(BuyingRootPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
