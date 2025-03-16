import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircuitAnalyzerComponent } from './circuit-analyzer.component';

describe('CircuitAnalyzerComponent', () => {
  let component: CircuitAnalyzerComponent;
  let fixture: ComponentFixture<CircuitAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircuitAnalyzerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircuitAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
