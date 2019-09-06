import { TestBed } from '@angular/core/testing';

import { LambidaService } from './lambida.service';

describe('LambidaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LambidaService = TestBed.get(LambidaService);
    expect(service).toBeTruthy();
  });
});
