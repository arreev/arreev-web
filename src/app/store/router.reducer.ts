
import { ActivatedRouteSnapshot,RouterStateSnapshot,Params } from '@angular/router';
import { createFeatureSelector } from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';

/**
 * https://www.youtube.com/watch?v=YsG44g6_Fo0
 * https://www.youtube.com/watch?v=Mwo52v3ajmE
 * https://www.youtube.com/watch?v=pBZaWuew-Cg
 */

export interface RouterStateUrl
{
  url: string;
  params: Params;
  queryParams: Params;
}

export interface State
{
  routerReducer: fromRouter.RouterReducerState<RouterStateUrl>;
}

export const getRouterState = createFeatureSelector<fromRouter.RouterReducerState<RouterStateUrl>>('routerReducer' );

export class CustomSerializer implements fromRouter.RouterStateSerializer<RouterStateUrl>
{
  serialize( routerState:RouterStateSnapshot ) : RouterStateUrl {
    let state: ActivatedRouteSnapshot = routerState.root;
    while ( state.firstChild ) {
      state = state.firstChild;
    }

    const { url } = routerState; // ES6 destructuring
    const { params } = state;
    const { queryParams } = routerState.root;

    return { url,params,queryParams };
  }
}
