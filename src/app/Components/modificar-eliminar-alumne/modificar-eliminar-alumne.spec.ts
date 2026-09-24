import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarEliminarAlumne } from './modificar-eliminar-alumne';

describe('ModificarEliminarAlumne', () => {
  let component: ModificarEliminarAlumne;
  let fixture: ComponentFixture<ModificarEliminarAlumne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarEliminarAlumne],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificarEliminarAlumne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
