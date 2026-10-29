import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BddEliminarUsuaris } from './bdd-eliminar-usuaris';

describe('BddEliminarUsuaris', () => {
  let component: BddEliminarUsuaris;
  let fixture: ComponentFixture<BddEliminarUsuaris>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BddEliminarUsuaris],
    }).compileComponents();

    fixture = TestBed.createComponent(BddEliminarUsuaris);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
