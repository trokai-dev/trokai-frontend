import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostageLabelComponent } from './postage-label.component';

describe('PostageLabelComponent', () => {
  let component: PostageLabelComponent;
  let fixture: ComponentFixture<PostageLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostageLabelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostageLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
