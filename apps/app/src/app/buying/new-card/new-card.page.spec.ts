import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewCardPage } from './new-card.page';

describe('NewCardPage', () => {
  let component: NewCardPage;
  let fixture: ComponentFixture<NewCardPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), NewCardPage],
    }).compileComponents();

    fixture = TestBed.createComponent(NewCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
