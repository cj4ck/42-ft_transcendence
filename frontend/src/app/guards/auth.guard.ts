import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { JwtHelperService } from "@auth0/angular-jwt";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

    constructor(private router: Router, private jwtService: JwtHelperService) {}

    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        const token : string = localStorage.getItem('pentacode') || null;
        if (!token || token == 'undefined' || this.jwtService.isTokenExpired(token)) {
          this.router.navigate(['']);
          return false;
        } else {
          return true;
        }
      }
}
