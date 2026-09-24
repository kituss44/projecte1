import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilAdminOpcions } from './perfil-admin-opcions';

describe('PerfilAdminOpcions', () => {
  let component: PerfilAdminOpcions;
  let fixture: ComponentFixture<PerfilAdminOpcions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilAdminOpcions],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilAdminOpcions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
