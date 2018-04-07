
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { dumpAssignment } from '../model/assignment';
import { Actions,Effect } from '@ngrx/effects';
import { AssignmentState } from '../app.state';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Action,Store } from '@ngrx/store';
import { API } from '../api.service';

import { ASSIGNMENT_FETCH,ASSIGNMENT_POST,AssignmentFetchAction,AssignmentPostAction } from './assignment.actions';
import * as AssignmentActions from './assignment.actions';

@Injectable()
export class AssignmentEffects
{
  private readonly _post = new BehaviorSubject<string>( '' );

  constructor( private assignmentStore:Store<AssignmentState>,private actions$:Actions,private api:API ) {
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
  assignmentfetch$: Observable<Action> = this.actions$.ofType<AssignmentFetchAction>( ASSIGNMENT_FETCH ).do( action => { this.get( action.id ); } );

  /**
   * TODO: should dispatch an Action
   * @type {Observable<any>}
   */
  @Effect( { dispatch:false } )
  assignment$: Observable<Action> = this.actions$.ofType<AssignmentPostAction>( ASSIGNMENT_POST ).do( action => { this._post.next( action.ownerid ); } );

  /*
   *
   */
  private get( id:string ) {
    this.api.getAssignment( id ).subscribe(
      w => { this.assignmentStore.dispatch( new AssignmentActions.AssignmentFetchedAction( w ) ); },
      e => { console.log( e ); }
    );
  }

  /*
   * take current state from store and send to server
   */
  private post( ownerid:string ) {
    this.assignmentStore.select('assignment' ).take( 1 ).subscribe(assignment => {
      this.api.postAssignment( ownerid,assignment ).subscribe(
        w => { console.log( 'FROM SERVER ' + dumpAssignment( w ) ); },
        e => { console.log( e ); }
      );
    } );
  }
}

