// 💡 CanActivate is deprecated - fix is to not implement it
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(private router: Router, private jwtService: JwtHelperService){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
	console.log(this.jwtService.isTokenExpired());
		if (this.jwtService.isTokenExpired()) {
			this.router.navigate(['']);
			return false;
		} else {
			return true;
		}
  }

}