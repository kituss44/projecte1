import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultarData } from './consultar-data';

describe('ConsultarData', () => {
  let component: ConsultarData;
  let fixture: ComponentFixture<ConsultarData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarData],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarData);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
