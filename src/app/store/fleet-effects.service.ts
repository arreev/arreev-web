
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Actions,Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Action,Store } from '@ngrx/store';
import { dumpFleet } from '../model/fleet';
import { FleetState } from '../app.state';
import { API } from '../api.service';

import {
  FLEET_DELETE,FLEET_FETCH,FLEET_POST,FLEET_DELETED,
  FleetDeleteAction,FleetFetchAction,FleetPostAction,FleetDeletedAction } from './fleet.actions';
import * as FleetActions from './fleet.actions';

@Injectable()
export class FleetEffects
{
  private readonly _post = new BehaviorSubject<string>( '' );

  constructor( private fleetStore:Store<FleetState>,private actions$:Actions,private api:API ) {
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
  fleetfetch$: Observable<Action> = this.actions$.ofType<FleetFetchAction>( FLEET_FETCH ).do( action => { this.get( action.id ); } );

  /**
   * TODO: should dispatch an Action
   * @type {Observable<any>}
   */
  @Effect( { dispatch:false } )
  fleet$: Observable<Action> = this.actions$.ofType<FleetPostAction>( FLEET_POST ).do( action => { this._post.next( action.ownerid ); } );

  /**
   * TODO: should dispatch an Action
   * @type {Observable<any>}
   */
  @Effect( { dispatch:false } )
  fleetdelete$: Observable<Action> = this.actions$.ofType<FleetDeleteAction>( FLEET_DELETE ).do( action => { this.delete( action.ownerid,action.id ); } );

  /*
   *
   */
  private get( id:string ) {
    this.api.getFleet( id ).subscribe(
      f => { this.fleetStore.dispatch( new FleetActions.FleetFetchedAction( f ) ); },
      e => { console.log( e ); }
    );
  }

  /*
   * take current state from store and send to server
   */
  private post( ownerid:string ) {
    this.fleetStore.select( 'fleet' ).take( 1 ).subscribe( fleet => {
      this.api.postFleet( ownerid,fleet ).subscribe(
        f => { console.log( 'FROM SERVER ' + dumpFleet( f ) ); },
        e => { console.log( e ); }
      );
    } );
  }

  /*
   *
   */
  private delete( ownerid:string,id:string ) {
    this.api.deleteFleet( ownerid,id ).subscribe(
      b => { this.fleetStore.dispatch( new FleetActions.FleetDeletedAction() ); },
      e => { console.log( e ); }
    );
  }
}

