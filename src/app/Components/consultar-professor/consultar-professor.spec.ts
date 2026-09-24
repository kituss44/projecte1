import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultarProfessor } from './consultar-professor';

describe('ConsultarProfessor', () => {
  let component: ConsultarProfessor;
  let fixture: ComponentFixture<ConsultarProfessor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarProfessor],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarProfessor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
