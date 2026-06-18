import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostageOptionsComponent } from './postage-options.component';

describe('PostageOptionsComponent', () => {
  let component: PostageOptionsComponent;
  let fixture: ComponentFixture<PostageOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostageOptionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PostageOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
