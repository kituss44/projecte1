import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FotoAlumne } from './foto-alumne';

describe('FotoAlumne', () => {
  let component: FotoAlumne;
  let fixture: ComponentFixture<FotoAlumne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FotoAlumne],
    }).compileComponents();

    fixture = TestBed.createComponent(FotoAlumne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
