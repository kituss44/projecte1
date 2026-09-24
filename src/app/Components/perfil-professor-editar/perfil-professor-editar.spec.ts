import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilProfessorEditar } from './perfil-professor-editar';

describe('PerfilProfessorEditar', () => {
  let component: PerfilProfessorEditar;
  let fixture: ComponentFixture<PerfilProfessorEditar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilProfessorEditar],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilProfessorEditar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
