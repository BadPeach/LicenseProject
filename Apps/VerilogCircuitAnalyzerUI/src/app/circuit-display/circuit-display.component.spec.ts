import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircuitDisplayComponent } from './circuit-display.component';

describe('CircuitDisplayComponent', () => {
  let component: CircuitDisplayComponent;
  let fixture: ComponentFixture<CircuitDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CircuitDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircuitDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
