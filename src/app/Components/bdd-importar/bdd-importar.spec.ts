import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BddImportar } from './bdd-importar';

describe('BddImportar', () => {
  let component: BddImportar;
  let fixture: ComponentFixture<BddImportar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BddImportar],
    }).compileComponents();

    fixture = TestBed.createComponent(BddImportar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
