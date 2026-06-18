import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideMenuNav } from './side-menu-nav.component';

describe('SideMenuNav', () => {
  let component: SideMenuNav;
  let fixture: ComponentFixture<SideMenuNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideMenuNav],
    }).compileComponents();

    fixture = TestBed.createComponent(SideMenuNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
