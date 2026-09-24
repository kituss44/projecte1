import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultarAlumne } from './consultar-alumne';

describe('ConsultarAlumne', () => {
  let component: ConsultarAlumne;
  let fixture: ComponentFixture<ConsultarAlumne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarAlumne],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarAlumne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
