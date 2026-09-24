import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilAdminOpcionsAcceptar } from './perfil-admin-opcions-acceptar';

describe('PerfilAdminOpcionsAcceptar', () => {
  let component: PerfilAdminOpcionsAcceptar;
  let fixture: ComponentFixture<PerfilAdminOpcionsAcceptar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilAdminOpcionsAcceptar],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilAdminOpcionsAcceptar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
