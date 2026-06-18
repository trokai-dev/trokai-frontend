import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BlockedPage } from './blocked.page';

describe('BlockedPage', () => {
  let component: BlockedPage;
  let fixture: ComponentFixture<BlockedPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), BlockedPage],
    }).compileComponents();

    fixture = TestBed.createComponent(BlockedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
