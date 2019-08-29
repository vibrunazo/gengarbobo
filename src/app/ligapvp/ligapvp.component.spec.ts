import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LigapvpComponent } from './ligapvp.component';

describe('LigapvpComponent', () => {
  let component: LigapvpComponent;
  let fixture: ComponentFixture<LigapvpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LigapvpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LigapvpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
