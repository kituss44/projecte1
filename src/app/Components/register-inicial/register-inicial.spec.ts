import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterInicial } from './register-inicial';

describe('RegisterInicial', () => {
  let component: RegisterInicial;
  let fixture: ComponentFixture<RegisterInicial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterInicial],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterInicial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
