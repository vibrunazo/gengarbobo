import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourneyComponent } from './tourney.component';

describe('TourneyComponent', () => {
  let component: TourneyComponent;
  let fixture: ComponentFixture<TourneyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TourneyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
