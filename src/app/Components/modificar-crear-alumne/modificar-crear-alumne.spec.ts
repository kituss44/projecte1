import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarCrearAlumne } from './modificar-crear-alumne';

describe('ModificarCrearAlumne', () => {
  let component: ModificarCrearAlumne;
  let fixture: ComponentFixture<ModificarCrearAlumne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarCrearAlumne],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificarCrearAlumne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
