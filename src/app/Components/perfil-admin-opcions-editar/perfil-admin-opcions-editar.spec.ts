import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilAdminOpcionsEditar } from './perfil-admin-opcions-editar';

describe('PerfilAdminOpcionsEditar', () => {
  let component: PerfilAdminOpcionsEditar;
  let fixture: ComponentFixture<PerfilAdminOpcionsEditar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilAdminOpcionsEditar],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilAdminOpcionsEditar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
