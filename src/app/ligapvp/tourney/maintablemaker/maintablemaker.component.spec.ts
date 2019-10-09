import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintablemakerComponent } from './maintablemaker.component';

describe('MaintablemakerComponent', () => {
  let component: MaintablemakerComponent;
  let fixture: ComponentFixture<MaintablemakerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintablemakerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintablemakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
