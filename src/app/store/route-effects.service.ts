
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Actions,Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Action,Store } from '@ngrx/store';
import { dumpRoute } from '../model/route';
import { RouteState } from '../app.state';
import { API } from '../api.service';

import {
  ROUTE_DELETE,ROUTE_FETCH,ROUTE_POST,ROUTE_DELETED,
  RouteDeleteAction,RouteFetchAction,RoutePostAction,RouteDeletedAction } from './route.actions';
import * as RouteActions from './route.actions';

import 'rxjs/add/operator/take';

@Injectable()
export class RouteEffects
{
  private readonly _post = new BehaviorSubject<string>( '' );

  constructor( private routeStore:Store<RouteState>,private actions$:Actions,private api:API ) {
    /*
     * we will post from store to server no more than once a second
     */
    this._post.asObservable().skip( 1 ).debounceTime( 1000 ).subscribe(ownerid => { this.post( ownerid ); } );
  }

  /**
   * TODO: should dispatch an Action
   * @type {Observable<any>}
   */
  @Effect( { dispatch:false } )
  routefetch$: Observable<Action> = this.actions$.ofType<RouteFetchAction>( ROUTE_FETCH ).do( action => { this.get( action.id ); } );

  /**
   * TODO: should dispatch an Action
   * @type {Observable<any>}
   */
  @Effect( { dispatch:false } )
  route$: Observable<Action> = this.actions$.ofType<RoutePostAction>( ROUTE_POST ).do( action => { this._post.next( action.ownerid ); } );

  /**
   * TODO: should dispatch an Action
   * @type {Observable<any>}
   */
  @Effect( { dispatch:false } )
  routedelete$: Observable<Action> = this.actions$.ofType<RouteDeleteAction>( ROUTE_DELETE ).do( action => { this.delete( action.ownerid,action.id ); } );

  /*
   *
   */
  private get( id:string ) {
    this.api.getRoute( id ).subscribe(
      r => { this.routeStore.dispatch( new RouteActions.RouteFetchedAction( r ) ); },
      e => { console.log( e ); }
    );
  }

  /*
   * take current state from store and send to server
   */
  private post( ownerid:string ) {
    this.routeStore.select('route' ).take( 1 ).subscribe( route => {
      this.api.postRoute( ownerid,route ).subscribe(
        r => {},
        e => { console.log( e ); }
      );
    } );
  }

  /*
   *
   */
  private delete( ownerid:string,id:string ) {
    this.api.deleteRoute( ownerid,id ).subscribe(
      b => { this.routeStore.dispatch( new RouteActions.RouteDeletedAction() ); },
      e => { console.log( e ); }
    );
  }
}

