import { TestBed } from '@angular/core/testing';

import { MenuGuardService } from './menu-guard.service';

// @ts-ignore
describe('MenuGuardService', () => {
  let service: MenuGuardService;

  // @ts-ignore
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuGuardService);
  });

  // @ts-ignore
  it('should be created', () => {
    // @ts-ignore
    expect(service).toBeTruthy();
  });
});
