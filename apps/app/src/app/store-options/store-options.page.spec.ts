import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StoreOptionsPage } from './store-options.page';

describe('StoreOptionsPage', () => {
  let component: StoreOptionsPage;
  let fixture: ComponentFixture<StoreOptionsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), StoreOptionsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(StoreOptionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
