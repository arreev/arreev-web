
import { Router,CanActivate,ActivatedRouteSnapshot,RouterStateSnapshot } from '@angular/router';
import { Authentication } from './authentication.service';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthGuard implements CanActivate
{
  /*
   * https://angular.io/guide/router#milestone-5-route-guards
   * https://medium.com/@ryanchenkie_40935/angular-authentication-using-route-guards-bf7a4ca13ae3
   */

  constructor( private router:Router,private authentication:Authentication ) {}

  canActivate( route:ActivatedRouteSnapshot,snapshot:RouterStateSnapshot ) : Observable<boolean> | Promise<boolean> | boolean {
    let loggedin = false;

    try {
      if ( this.authentication.isAuthorized( snapshot ) ) {
        loggedin = true;
      }
    } catch ( x ) {
      console.log( x );
    }

    /*
     * warning: side-effect
     */
    if ( !loggedin ) {
      this.router.navigate([ 'login' ], { queryParams: { content: snapshot.url } } );
    }

    return loggedin;
  }
}
