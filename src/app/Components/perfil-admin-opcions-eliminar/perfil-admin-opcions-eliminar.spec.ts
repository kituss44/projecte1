import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilAdminOpcionsEliminar } from './perfil-admin-opcions-eliminar';

describe('PerfilAdminOpcionsEliminar', () => {
  let component: PerfilAdminOpcionsEliminar;
  let fixture: ComponentFixture<PerfilAdminOpcionsEliminar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilAdminOpcionsEliminar],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilAdminOpcionsEliminar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
