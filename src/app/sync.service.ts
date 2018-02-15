
import { Injectable } from '@angular/core';
import { AccountState } from './app.state';
import { Account } from './model/account';
import { Store } from '@ngrx/store';
import { API } from './api.service';

import * as AccountActions from './store/account.actions';

@Injectable()
export class Sync
{
  constructor( private api:API,private accountStore:Store<AccountState> ) {}

  getAccount() {
    console.log( 'SYNC:GET-ACCOUNT' );
    this.api.getAccount().subscribe(
      a => { this.toAccountStorage( a ); },
      e => { this.toError( e ); },
      () => {} );
  }

  putAccount( account:Account ) {
    console.log( 'SYNC:PUT-ACCOUNT' );
    this.api.putAccount( account ).subscribe(
      a => { this.toAccountStorage( a ); },
      e => { this.toError( e ); },
      () => {} );
  }

  private toAccountStorage( account:Account ) {
    console.log( 'SYNC:TO-ACCOUNTSTORAGE ' + account );
    this.accountStore.dispatch( new AccountActions.AccountAction( account ) );
  }

  private toError( error:Error ) {
    console.log( error );
    // TODO: logout ?
  }
}
