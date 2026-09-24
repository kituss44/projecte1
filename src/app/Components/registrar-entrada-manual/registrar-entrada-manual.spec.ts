import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarEntradaManual } from './registrar-entrada-manual';

describe('RegistrarEntradaManual', () => {
  let component: RegistrarEntradaManual;
  let fixture: ComponentFixture<RegistrarEntradaManual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarEntradaManual],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarEntradaManual);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
