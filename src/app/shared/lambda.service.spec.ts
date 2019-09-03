import { TestBed } from '@angular/core/testing';

import { LambdaService } from './lambda.service';

describe('LambdaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LambdaService = TestBed.get(LambdaService);
    expect(service).toBeTruthy();
  });
});
