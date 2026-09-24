import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginInicial } from './login-inicial';

describe('LoginInicial', () => {
  let component: LoginInicial;
  let fixture: ComponentFixture<LoginInicial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginInicial],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginInicial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
