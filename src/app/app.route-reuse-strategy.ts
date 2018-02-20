
import { ActivatedRouteSnapshot,DetachedRouteHandle,RouteReuseStrategy } from '@angular/router';

/*
 * https://stackoverflow.com/questions/41280471/how-to-implement-routereusestrategy-shoulddetach-for-specific-routes-in-angular/41515648#41515648
 */
export class AppRouteReuseStrategy implements RouteReuseStrategy
{
  private routesToCache: string[] = []; // [ 'clients' ];
  private storedRouteHandles = new Map<string,DetachedRouteHandle>();

  /*
   * decides if the route should be stored
   */
  shouldDetach( route:ActivatedRouteSnapshot ) : boolean {
    const detach = ( this.routesToCache.indexOf( route.routeConfig.path ) > -1 );
    // console.log( 'shouldDetach ' + route.routeConfig.path + ' ' + detach );
    return detach;
  }

  /*
   * store the information for the route we're destructing
   */
  store( route:ActivatedRouteSnapshot,handle:DetachedRouteHandle|any ) : void {
    // console.log( 'store ' + route.routeConfig.path + ' ' + handle );
    this.storedRouteHandles.set( route.routeConfig.path,handle );
  }

  /*
   * return true if we have a stored route object for the next rout
   */
  shouldAttach( route:ActivatedRouteSnapshot ) : boolean {
    const attach = this.storedRouteHandles.has( route.routeConfig.path );
    // console.log( 'shouldAttach ' + route.routeConfig.path + ' ' + attach );
    return attach;
  }

  /*
   * if we returned true in shouldAttach(), now return the actual route data for restoration
   */
  retrieve( route:ActivatedRouteSnapshot ) : DetachedRouteHandle|any {
    // console.log( 'retrieve ' + route.routeConfig.path );
    return this.storedRouteHandles.get( route.routeConfig.path );
  }

  /*
   * reuse the route if we're going to and from the same route
   */
  shouldReuseRoute( future:ActivatedRouteSnapshot,curr:ActivatedRouteSnapshot ) : boolean {
    const reuse = ( future.routeConfig === curr.routeConfig );
    // console.log( 'shouldReuseRoute ' + future.routeConfig + ',' + curr.routeConfig + ' ' + reuse );
    return reuse;
  }
}
