import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Bdd } from './bdd';

describe('Bdd', () => {
  let component: Bdd;
  let fixture: ComponentFixture<Bdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bdd],
    }).compileComponents();

    fixture = TestBed.createComponent(Bdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
