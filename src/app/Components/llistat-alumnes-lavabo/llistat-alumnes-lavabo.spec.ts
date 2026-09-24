import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LlistatAlumnesLavabo } from './llistat-alumnes-lavabo';

describe('LlistatAlumnesLavabo', () => {
  let component: LlistatAlumnesLavabo;
  let fixture: ComponentFixture<LlistatAlumnesLavabo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LlistatAlumnesLavabo],
    }).compileComponents();

    fixture = TestBed.createComponent(LlistatAlumnesLavabo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
