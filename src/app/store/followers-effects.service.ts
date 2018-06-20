
import * as followersActions from './followers.actions';
import { Actions,Effect } from '@ngrx/effects';
import * as fromFollower from './followers.reducer';
import { Observable } from 'rxjs/Observable';
import { Action,Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { API } from '../api.service';

import 'rxjs/add/operator/mergeMap';

@Injectable()
export class FollowersEffects
{
  constructor( private actions:Actions,private followerstore:Store<fromFollower.State>,private api:API ) {}

  @Effect()
  query$: Observable<Action> = this.actions.ofType( followersActions.QUERY )
    .map( () => new followersActions.Queried() );

  @Effect()
  create$: Observable<Action> = this.actions.ofType( followersActions.CREATE )
    .map( (action:followersActions.Create) => new followersActions.Created( action.partial ) );

  @Effect()
  update$: Observable<Action> = this.actions.ofType( followersActions.UPDATE )
    .map( (action:followersActions.Update) => new followersActions.Updated( action.partial.id,action.partial ) );

  @Effect()
  delete$: Observable<Action> = this.actions.ofType( followersActions.DELETE )
    .map( (action:followersActions.Delete) => new followersActions.Deleted( action.id ) );
}
