
import * as followsActions from './follows.actions';
import { Actions,Effect } from '@ngrx/effects';
import * as fromFollow from './follows.reducer';
import { Observable } from 'rxjs/Observable';
import { Action,Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Follow } from '../model/follow';
import { API } from '../api.service';

import 'rxjs/add/operator/mergeMap';

@Injectable()
export class FollowsEffects
{
  constructor( private actions:Actions,private followstore:Store<fromFollow.State>,private api:API ) {}

  @Effect()
  query$: Observable<Action> = this.actions.ofType( followsActions.QUERY )
    .mergeMap( (action:followsActions.Query) => this.api.getFollowsArray( action.ownerid,action.fleetid ) )
    .map( (follows:Follow[]) => new followsActions.Queried( follows ) );

  @Effect()
  create$: Observable<Action> = this.actions.ofType( followsActions.CREATE )
    .mergeMap( (action:followsActions.Update) => this.api.postFollow( action.ownerid,action.fleetid,action.partial ) )
    .map( (follow:Follow) => new followsActions.Created( follow ) );

  @Effect()
  update$: Observable<Action> = this.actions.ofType( followsActions.UPDATE )
    .mergeMap( (action:followsActions.Update) => this.api.postFollow( action.ownerid,action.fleetid,action.partial ) )
    .map( (follow:Follow) => new followsActions.Updated( follow.id,follow ) );

  @Effect()
  delete$: Observable<Action> = this.actions.ofType( followsActions.DELETE )
    .mergeMap( (action:followsActions.Delete) => this.api.deleteFollow( action.ownerid,action.id ) )
    .map( (id:string) => new followsActions.Deleted( id ) );
}
