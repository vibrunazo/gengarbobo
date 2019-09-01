import { TestBed } from '@angular/core/testing';

import { NetlifyIdentityService } from './netlify-identity.service';

describe('NetlifyIdentityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NetlifyIdentityService = TestBed.get(NetlifyIdentityService);
    expect(service).toBeTruthy();
  });
});
