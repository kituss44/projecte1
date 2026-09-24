import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BddEliminar } from './bdd-eliminar';

describe('BddEliminar', () => {
  let component: BddEliminar;
  let fixture: ComponentFixture<BddEliminar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BddEliminar],
    }).compileComponents();

    fixture = TestBed.createComponent(BddEliminar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
