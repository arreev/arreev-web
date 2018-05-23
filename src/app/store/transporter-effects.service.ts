
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { dumpTransporter } from '../model/transporter';
import { TransporterState } from '../app.state';
import { Actions,Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Action,Store } from '@ngrx/store';
import { API } from '../api.service';

import {
  TRANSPORTER_DELETE,TRANSPORTER_FETCH,TRANSPORTER_POST,TRANSPORTER_DELETED,
  TransporterDeleteAction,TransporterFetchAction,TransporterPostAction,TransporterDeletedAction
} from './transporter.actions';
import * as TransporterActions from './transporter.actions';

import 'rxjs/add/operator/take';

@Injectable()
export class TransporterEffects
{
  private readonly _post = new BehaviorSubject<string>( '' );

  constructor( private transporterStore:Store<TransporterState>,private actions$:Actions,private api:API ) {
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
  transporterfetch$: Observable<Action> = this.actions$.ofType<TransporterFetchAction>( TRANSPORTER_FETCH ).do( action => { this.get( action.id ); } );

  /**
   * TODO: should dispatch an Action
   * @type {Observable<any>}
   */
  @Effect( { dispatch:false } )
  transporter$: Observable<Action> = this.actions$.ofType<TransporterPostAction>( TRANSPORTER_POST ).do( action => { this._post.next( action.ownerid ); } );

  /**
   * TODO: should dispatch an Action
   * @type {Observable<any>}
   */
  @Effect( { dispatch:false } )
  transporterdelete$: Observable<Action> = this.actions$.ofType<TransporterDeleteAction>( TRANSPORTER_DELETE ).do( action => { this.delete( action.ownerid,action.id ); } );

  /*
   *
   */
  private get( id:string ) {
    this.api.getTransporter( id ).subscribe(
      f => { this.transporterStore.dispatch( new TransporterActions.TransporterFetchedAction( f ) ); },
      e => { console.log( e ); }
    );
  }

  /*
   * take current state from store and send to server
   */
  private post( ownerid:string ) {
    this.transporterStore.select( 'transporter' ).take( 1 ).subscribe(transporter => {
      this.api.postTransporter( ownerid,null,transporter ).subscribe(
        f => { },
        e => { console.log( e ); }
      );
    } );
  }

  /*
   *
   */
  private delete( ownerid:string,id:string ) {
    this.api.deleteTransporter( ownerid,id ).subscribe(
      b => { this.transporterStore.dispatch( new TransporterActions.TransporterDeletedAction() ); },
      e => { console.log( e ); }
    );
  }
}

