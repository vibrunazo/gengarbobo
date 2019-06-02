import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DexComponent } from './dex.component';

describe('DexComponent', () => {
  let component: DexComponent;
  let fixture: ComponentFixture<DexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
