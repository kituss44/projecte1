import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultarGrup } from './consultar-grup';

describe('ConsultarGrup', () => {
  let component: ConsultarGrup;
  let fixture: ComponentFixture<ConsultarGrup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarGrup],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultarGrup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
