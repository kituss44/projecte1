import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultarVista } from './consultar-vista';

describe('ConsultarVista', () => {
  let component: ConsultarVista;
  let fixture: ComponentFixture<ConsultarVista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarVista],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarVista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
