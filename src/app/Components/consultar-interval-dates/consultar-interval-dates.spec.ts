import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultarIntervalDates } from './consultar-interval-dates';

describe('ConsultarIntervalDates', () => {
  let component: ConsultarIntervalDates;
  let fixture: ComponentFixture<ConsultarIntervalDates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarIntervalDates],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarIntervalDates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
