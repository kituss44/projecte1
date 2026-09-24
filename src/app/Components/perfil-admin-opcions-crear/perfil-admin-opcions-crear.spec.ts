import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilAdminOpcionsCrear } from './perfil-admin-opcions-crear';

describe('PerfilAdminOpcionsCrear', () => {
  let component: PerfilAdminOpcionsCrear;
  let fixture: ComponentFixture<PerfilAdminOpcionsCrear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilAdminOpcionsCrear],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilAdminOpcionsCrear);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
