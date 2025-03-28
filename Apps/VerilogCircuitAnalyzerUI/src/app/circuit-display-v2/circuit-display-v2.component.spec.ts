import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircuitDisplayV2Component } from './circuit-display-v2.component';

describe('CircuitDisplayV2Component', () => {
  let component: CircuitDisplayV2Component;
  let fixture: ComponentFixture<CircuitDisplayV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CircuitDisplayV2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircuitDisplayV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
