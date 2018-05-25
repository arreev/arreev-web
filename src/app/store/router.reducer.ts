
import { ActivatedRouteSnapshot,RouterStateSnapshot,Params } from '@angular/router';
import { createFeatureSelector,Action } from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';
import { Actions,Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';

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
  extra?: any;
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
    const extra = null;

    return { url,params,queryParams,extra };
  }
}

@Injectable()
export class RouterEffects
{
  constructor( private actions:Actions ) {}

  /**
   * TODO: could make this dispatch some store action (i.e. a GET based on the url and queryParams,ex /routes?routeid=1)
   *       conceivable architecture: this is the single-source-of-truth action that gets from api andputs in store
   *
   * @type {Observable<RouterNavigationAction<RouterStateUrl>>}
   */
  @Effect({ dispatch: false })
  navigate$: Observable<Action> = this.actions.ofType( fromRouter.ROUTER_NAVIGATION )
    .do( (action:fromRouter.RouterNavigationAction<RouterStateUrl>) => { this.navigateEffect( action.payload.routerState ); } );

  private navigateEffect( routerstateurl:RouterStateUrl ) {
    // console.log( 'navigation effect: ' + routerstateurl.url );
  }
}
