import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderActions } from './order-actions';

describe('OrderActions', () => {
  let component: OrderActions;
  let fixture: ComponentFixture<OrderActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
