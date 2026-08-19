import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitrineLayout } from './vitrine-layout';

describe('VitrineLayout', () => {
  let component: VitrineLayout;
  let fixture: ComponentFixture<VitrineLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VitrineLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VitrineLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
