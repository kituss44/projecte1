import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilProfessor } from './perfil-professor';

describe('PerfilProfessor', () => {
  let component: PerfilProfessor;
  let fixture: ComponentFixture<PerfilProfessor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilProfessor],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilProfessor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
