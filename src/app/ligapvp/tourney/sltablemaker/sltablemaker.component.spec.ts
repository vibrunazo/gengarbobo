import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SltablemakerComponent } from './sltablemaker.component';

describe('SltablemakerComponent', () => {
  let component: SltablemakerComponent;
  let fixture: ComponentFixture<SltablemakerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SltablemakerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SltablemakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
