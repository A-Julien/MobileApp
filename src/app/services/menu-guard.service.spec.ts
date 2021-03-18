import { TestBed } from '@angular/core/testing';

import { MenuGuardService } from './menu-guard.service';

describe('MenuGuardService', () => {
  let service: MenuGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
