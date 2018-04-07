
import * as groupActions from './group.actions';
import { Actions,Effect } from '@ngrx/effects';
import * as fromGroup from './group.reducer';
import { Observable } from 'rxjs/Observable';
import { Action,Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Group } from '../model/group';
import { API } from '../api.service';

import 'rxjs/add/operator/mergeMap';

import { v4 as uuid } from 'uuid';
import * as firebase from 'firebase';

class PendingGroupImageFile
{
  constructor( public ownerid:string,public imagefile:File ) {}
}

@Injectable()
export class GroupEffects
{
  /*
   * https://angularfirebase.com/tag/ngrx/
   * https://angularfirebase.com/lessons/firebase-with-angular-ngrx-redux/
   * https://www.concretepage.com/angular-2/ngrx/ngrx-entity-example
   */

  private pending:Map<any,any> = new Map();

  constructor( private actions:Actions,private groupstore:Store<fromGroup.State>,private api:API ) {}

  @Effect()
  query$: Observable<Action> = this.actions.ofType( groupActions.QUERY )
    .mergeMap( (action:groupActions.Query) => this.api.getGroupsArray( action.ownerid,action._type ) )
    .map( (groups:Group[]) => new groupActions.Queried( groups ) );

  @Effect()
  create$: Observable<Action> = this.actions.ofType( groupActions.CREATE )
    .mergeMap( (action:groupActions.Create) => {
      action.partial.imageURL = uuid();
      this.pending.set( action.partial.imageURL,new PendingGroupImageFile( action.ownerid,action.imagefile ) );
      return this.api.postGroup( action.ownerid,action.partial );
    } )
    .map( (group:Group) => {
      const pending = this.pending.get( group.imageURL );
      this.pending.delete( pending );
      this.uploadAndCreated( group,pending );
      return new groupActions.Pending();
    } );

  @Effect()
  delete$: Observable<Action> = this.actions.ofType( groupActions.DELETE )
    .mergeMap( (action:groupActions.Delete) => this.api.deleteGroup( action.ownerid,action.id ) )
    .map( (id:string) => new groupActions.Deleted( id ) );

  @Effect()
  update$: Observable<Action> = this.actions.ofType( groupActions.UPDATE )
    .mergeMap( (action:groupActions.Update) => this.api.postGroup( action.ownerid,action.partial ) )
    .map( (group:Group) => new groupActions.Updated( group.id,group ) );

  @Effect()
  imagine$: Observable<Action> = this.actions.ofType( groupActions.IMAGINE )
    .map( (action:groupActions.Imagine) => {
      this.uploadAndImagined( action.ownerid,action.partial,action.imagefile );
      return new groupActions.Pending();
    } );

  /********************************************************************************************************************/

  private uploadAndCreated( group:Group,pending:PendingGroupImageFile ) {
    Observable.from( firebase.storage().ref().child('groups/group.imageURL.'+group.id ).put( pending.imagefile ) )
      .mergeMap( snapshot => {
        group.imageURL = snapshot.downloadURL;
        return this.api.postGroup( pending.ownerid,group );
      } )
      .subscribe(
        g => { this.groupstore.dispatch( new groupActions.Created( g ) ); },
        e => { console.log( e ); }
      );
  }

  private uploadAndImagined( ownerid:string,group:Group,imagefile:File ) {
    if ( group.id == null ) { console.log( 'uploadAndImagined: ERROR - GROUP.ID IS NULL' ); return; }
    Observable.from( firebase.storage().ref().child('groups/group.imageURL.'+group.id ).put( imagefile ) )
      .mergeMap( snapshot => {
        group.imageURL = snapshot.downloadURL;
        return this.api.postGroup( ownerid,group );
      } )
      .subscribe(
        g => { this.groupstore.dispatch( new groupActions.Imagined( g.id,g ) ); },
        e => { console.log( e ); }
      );
  }
}
