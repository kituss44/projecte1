import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarModificarAlumne } from './modificar-modificar-alumne';

describe('ModificarModificarAlumne', () => {
  let component: ModificarModificarAlumne;
  let fixture: ComponentFixture<ModificarModificarAlumne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarModificarAlumne],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificarModificarAlumne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
