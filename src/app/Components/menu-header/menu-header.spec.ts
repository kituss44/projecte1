import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuHeader } from './menu-header';

describe('MenuHeader', () => {
  let component: MenuHeader;
  let fixture: ComponentFixture<MenuHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
