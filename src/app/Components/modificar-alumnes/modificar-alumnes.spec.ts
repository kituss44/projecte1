import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarAlumnes } from './modificar-alumnes';

describe('ModificarAlumnes', () => {
  let component: ModificarAlumnes;
  let fixture: ComponentFixture<ModificarAlumnes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarAlumnes],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificarAlumnes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
