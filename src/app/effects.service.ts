
import { Actions,Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Sync } from './sync.service';
import { Action } from '@ngrx/store';

import { PENDINGACCOUNT,PendingAccountAction } from './store/account.actions';

import 'rxjs/add/operator/do';

@Injectable()
export class AccountEffects
{
  constructor( private actions$:Actions,private sync:Sync ) {}

  @Effect( { dispatch:false } )
  account$: Observable<Action> = this.actions$.ofType<PendingAccountAction>( PENDINGACCOUNT )
    .do( action => {
      const account = action.pending;
      console.log( 'PENDING-ACCOUNT-ACTION-EFFECT '+account );
      this.sync.putAccount( account );
    } );
}
