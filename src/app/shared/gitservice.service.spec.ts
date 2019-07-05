import { TestBed } from '@angular/core/testing';

import { GitserviceService } from './gitservice.service';

describe('GitserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GitserviceService = TestBed.get(GitserviceService);
    expect(service).toBeTruthy();
  });
});
