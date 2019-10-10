import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GcfgDialogComponent } from './gcfg-dialog.component';

describe('GcfgDialogComponent', () => {
  let component: GcfgDialogComponent;
  let fixture: ComponentFixture<GcfgDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GcfgDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GcfgDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
