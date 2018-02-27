
import { ActivatedRouteSnapshot,CanActivate,Router,RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SecureGuard implements CanActivate
{
  constructor( private router:Router ) {}

  canActivate( route: ActivatedRouteSnapshot,state: RouterStateSnapshot ): Observable<boolean> | Promise<boolean> | boolean {
    const secure = ( window.location.protocol.toLocaleLowerCase().startsWith( 'https' ) || (window.location.hostname === 'localhost') );
    if ( !secure ) {
      this.router.navigate([ '403' ] );
      return false;
    }
    return true;
  }
}
