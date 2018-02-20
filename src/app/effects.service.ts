
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Account,dumpAccount } from './model/account';
import { Actions,Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Action,Store } from '@ngrx/store';
import { AccountState } from './app.state';
import { API } from './api.service';

import { ACCOUNT_POST,ACCOUNT_FETCH,ACCOUNT_FETCHED,AccountPostAction,AccountFetchAction,AccountFetchedAction } from './store/account.actions';
import * as AccountActions from './store/account.actions';

import 'rxjs/add/operator/do';

@Injectable()
export class AccountEffects
{
  private readonly _post = new BehaviorSubject<void>( null );

  constructor( private accountStore:Store<AccountState>,private actions$:Actions,private api:API ) {
    /*
     * we will post from store to server no more than once a second
     */
    this._post.asObservable().skip( 1 ).debounceTime( 1000 ).subscribe(() => { this.post(); } );
  }

  /**
   * TODO: should dispatch an Action
   * @type {Observable<any>}
   */
  @Effect( { dispatch:false } )
  accountfetch$: Observable<Action> = this.actions$.ofType<AccountFetchAction>( ACCOUNT_FETCH )
    .do( action => {
      this.get();
    } );

  /**
   * TODO: should dispatch an Action
   * @type {Observable<any>}
   */
  @Effect( { dispatch:false } )
  account$: Observable<Action> = this.actions$.ofType<AccountPostAction>( ACCOUNT_POST )
    .do( action => {
      this._post.next(null ); // affect a future post
    } );

  /*
   *
   */
  private get() {
    this.api.getAccount().subscribe(
      a => { this.accountStore.dispatch( new AccountActions.AccountFetchedAction( a ) ); },
      e => { console.log( e ); }
    );
  }

  /*
   * take current state from store and send to server
   */
  private post() {
    this.accountStore.select('account' ).take( 1 ).subscribe(account => {
      this.api.putAccount( account ).subscribe(
        a => { console.log( 'FROM SERVER ' + dumpAccount( a ) ); },
        e => { console.log( e ); }
      );
    } );
  }
}
