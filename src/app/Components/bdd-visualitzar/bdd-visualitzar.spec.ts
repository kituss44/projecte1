import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BddVisualitzar } from './bdd-visualitzar';

describe('BddVisualitzar', () => {
  let component: BddVisualitzar;
  let fixture: ComponentFixture<BddVisualitzar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BddVisualitzar],
    }).compileComponents();

    fixture = TestBed.createComponent(BddVisualitzar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
