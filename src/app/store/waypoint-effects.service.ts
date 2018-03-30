
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { dumpWaypoint } from '../model/waypoint';
import { Actions,Effect } from '@ngrx/effects';
import { WaypointState } from '../app.state';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Action,Store } from '@ngrx/store';
import { API } from '../api.service';

import { WAYPOINT_FETCH,WAYPOINT_POST,WaypointFetchAction,WaypointPostAction } from './waypoint.actions';
import * as WaypointActions from './waypoint.actions';

@Injectable()
export class WaypointEffects
{
  private readonly _post = new BehaviorSubject<string>( '' );

  constructor( private waypointStore:Store<WaypointState>,private actions$:Actions,private api:API ) {
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
  waypointfetch$: Observable<Action> = this.actions$.ofType<WaypointFetchAction>( WAYPOINT_FETCH ).do( action => { this.get( action.id ); } );

  /**
   * TODO: should dispatch an Action
   * @type {Observable<any>}
   */
  @Effect( { dispatch:false } )
  waypoint$: Observable<Action> = this.actions$.ofType<WaypointPostAction>( WAYPOINT_POST ).do( action => { this._post.next( action.ownerid ); } );

  /*
   *
   */
  private get( id:string ) {
    this.api.getWaypoint( id ).subscribe(
      w => { this.waypointStore.dispatch( new WaypointActions.WaypointFetchedAction( w ) ); },
      e => { console.log( e ); }
    );
  }

  /*
   * take current state from store and send to server
   */
  private post( ownerid:string ) {
    this.waypointStore.select('waypoint' ).take( 1 ).subscribe(waypoint => {
      this.api.postWaypoint( ownerid,null, waypoint ).subscribe(
        w => { console.log( 'FROM SERVER ' + dumpWaypoint( w ) ); },
        e => { console.log( e ); }
      );
    } );
  }
}

