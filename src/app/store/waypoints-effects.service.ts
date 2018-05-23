
import * as waypointsActions from './waypoints.actions';
import { Actions,Effect } from '@ngrx/effects';
import * as fromWaypoint from './waypoints.reducer';
import { Observable } from 'rxjs/Observable';
import { Action,Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Waypoint } from '../model/waypoint';
import { API } from '../api.service';

import 'rxjs/add/operator/mergeMap';

import { v4 as uuid } from 'uuid';
import * as firebase from 'firebase';

class PendingWaypointImageFile
{
  constructor( public ownerid:string,public imagefile:File ) {}
}

@Injectable()
export class WaypointsEffects
{
  /*
   * https://angularfirebase.com/tag/ngrx/
   * https://angularfirebase.com/lessons/firebase-with-angular-ngrx-redux/
   * https://www.concretepage.com/angular-2/ngrx/ngrx-entity-example
   */

  private pending:Map<any,any> = new Map();

  constructor( private actions:Actions,private waypointstore:Store<fromWaypoint.State>,private api:API ) {}

  @Effect()
  query$: Observable<Action> = this.actions.ofType( waypointsActions.QUERY )
    .mergeMap( (action:waypointsActions.Query) => this.api.getWaypointsArray( action.ownerid,action.routeid ) )
    .map( (waypoints:Waypoint[]) => new waypointsActions.Queried( waypoints ) );

  @Effect()
  create$: Observable<Action> = this.actions.ofType( waypointsActions.CREATE )
    .mergeMap( (action:waypointsActions.Create) => {
      action.partial.imageURL = uuid();
      this.pending.set( action.partial.imageURL,new PendingWaypointImageFile( action.ownerid,action.imagefile ) );
      return this.api.postWaypoint( action.ownerid,action.routeid,action.partial );
    } )
    .map( (waypoint:Waypoint) => {
      const pending = this.pending.get( waypoint.imageURL );
      this.pending.delete( pending );
      this.uploadAndCreated( waypoint,pending );
      return new waypointsActions.Pending();
    } );

  @Effect()
  delete$: Observable<Action> = this.actions.ofType( waypointsActions.DELETE )
    .mergeMap( (action:waypointsActions.Delete) => this.api.deleteWaypoint( action.ownerid,action.id ) )
    .map( (id:string) => new waypointsActions.Deleted( id ) );

  @Effect()
  update$: Observable<Action> = this.actions.ofType( waypointsActions.UPDATE )
    .mergeMap( (action:waypointsActions.Update) => this.api.postWaypoint( action.ownerid,action.routeid,action.partial ) )
    .map( (waypoint:Waypoint) => new waypointsActions.Updated( waypoint.id,waypoint ) );

  @Effect()
  imagine$: Observable<Action> = this.actions.ofType( waypointsActions.IMAGINE )
    .map( (action:waypointsActions.Imagine) => {
      this.uploadAndImagined( action.ownerid,action.partial,action.imagefile );
      return new waypointsActions.Pending();
    } );

  /********************************************************************************************************************/

  private uploadAndCreated( waypoint:Waypoint,pending:PendingWaypointImageFile ) {
    Observable.from( firebase.storage().ref().child('waypoints/waypoint.imageURL.'+waypoint.id ).put( pending.imagefile ) )
      .mergeMap( snapshot => {
        waypoint.imageURL = snapshot.downloadURL;
        return this.api.postWaypoint( pending.ownerid,null,waypoint );
      } )
      .subscribe(
        g => { this.waypointstore.dispatch( new waypointsActions.Created( g ) ); },
        e => { console.log( e ); }
      );
  }

  private uploadAndImagined( ownerid:string,waypoint:Waypoint,imagefile:File ) {
    if ( waypoint.id == null ) { console.log( 'uploadAndImagined: ERROR - WAYPOINT.ID IS NULL' ); return; }
    Observable.from( firebase.storage().ref().child('waypoints/waypoint.imageURL.'+waypoint.id ).put( imagefile ) )
      .mergeMap( snapshot => {
        waypoint.imageURL = snapshot.downloadURL;
        return this.api.postWaypoint( ownerid,null,waypoint );
      } )
      .subscribe(
        g => { this.waypointstore.dispatch( new waypointsActions.Imagined( g.id,g ) ); },
        e => { console.log( e ); }
      );
  }
}
