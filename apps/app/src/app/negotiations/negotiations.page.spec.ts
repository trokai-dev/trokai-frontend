import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NegotiationsPage } from './negotiations.page';

describe('NegotiationsPage', () => {
  let component: NegotiationsPage;
  let fixture: ComponentFixture<NegotiationsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), NegotiationsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(NegotiationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
