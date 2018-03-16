
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Actions,Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Action,Store } from '@ngrx/store';
import { dumpFollow } from '../model/follow';
import { FollowState } from '../app.state';
import { API } from '../api.service';

import { FOLLOW_FETCH,FOLLOW_POST,FollowFetchAction,FollowPostAction } from './follow.actions';
import * as FollowActions from './follow.actions';

@Injectable()
export class FollowEffects
{
  private readonly _post = new BehaviorSubject<string>( '' );

  constructor( private followStore:Store<FollowState>,private actions$:Actions,private api:API ) {
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
  followfetch$: Observable<Action> = this.actions$.ofType<FollowFetchAction>( FOLLOW_FETCH ).do( action => { this.get( action.id ); } );

  /**
   * TODO: should dispatch an Action
   * @type {Observable<any>}
   */
  @Effect( { dispatch:false } )
  follow$: Observable<Action> = this.actions$.ofType<FollowPostAction>( FOLLOW_POST ).do( action => { this._post.next( action.ownerid ); } );

  /*
   *
   */
  private get( id:string ) {
    this.api.getFollow( id ).subscribe(
      f => { this.followStore.dispatch( new FollowActions.FollowFetchedAction( f ) ); },
      e => { console.log( e ); }
    );
  }

  /*
   * take current state from store and send to server
   */
  private post( ownerid:string ) {
    this.followStore.select('follow' ).take( 1 ).subscribe( follow => {
      this.api.postFollow( ownerid,null,null,follow ).subscribe(
        f => { console.log( 'FROM SERVER ' + dumpFollow( f ) ); },
        e => { console.log( e ); }
      );
    } );
  }
}

