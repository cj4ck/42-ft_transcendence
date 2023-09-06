import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  // const executeGuard: CanActivateFn = (...guardParameters) => 
  //     TestBed.runInInjectionContext(() => AuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});2
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
