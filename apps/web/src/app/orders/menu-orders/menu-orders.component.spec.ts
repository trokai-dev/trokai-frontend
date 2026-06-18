import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuOrdersComponent } from './menu-orders.component';

describe('MenuOrdersComponent', () => {
  let component: MenuOrdersComponent;
  let fixture: ComponentFixture<MenuOrdersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MenuOrdersComponent],
    });
    fixture = TestBed.createComponent(MenuOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
