
import * as personsActions from './persons.actions';
import { Actions,Effect } from '@ngrx/effects';
import * as fromPerson from './persons.reducer';
import { Observable } from 'rxjs/Observable';
import { Action,Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Person } from '../model/person';
import { API } from '../api.service';

import 'rxjs/add/operator/mergeMap';

import { v4 as uuid } from 'uuid';
import * as firebase from 'firebase';

class PendingPersonImageFile
{
  constructor( public ownerid:string,public imagefile:File ) {}
}

@Injectable()
export class PersonsEffects
{
  /*
   * https://angularfirebase.com/tag/ngrx/
   * https://angularfirebase.com/lessons/firebase-with-angular-ngrx-redux/
   * https://www.concretepage.com/angular-2/ngrx/ngrx-entity-example
   */

  private pending:Map<any,any> = new Map();

  constructor( private actions:Actions,private personstore:Store<fromPerson.State>,private api:API ) {}

  @Effect()
  query$: Observable<Action> = this.actions.ofType( personsActions.QUERY )
    .mergeMap( (action:personsActions.Query) => this.api.getPersonsArray( action.ownerid,action.groupid ) )
    .map( (persons:Person[]) => new personsActions.Queried( persons ) );

  @Effect()
  create$: Observable<Action> = this.actions.ofType( personsActions.CREATE )
    .mergeMap( (action:personsActions.Create) => {
      action.partial.imageURL = uuid();
      this.pending.set( action.partial.imageURL,new PendingPersonImageFile( action.ownerid,action.imagefile ) );
      return this.api.postPerson( action.ownerid,action.groupid,action.partial );
    } )
    .map( (person:Person) => {
      const pending = this.pending.get( person.imageURL );
      this.pending.delete( pending );
      this.uploadAndCreated( person,pending );
      return new personsActions.Pending();
    } );

  @Effect()
  delete$: Observable<Action> = this.actions.ofType( personsActions.DELETE )
    .mergeMap( (action:personsActions.Delete) => this.api.deletePerson( action.ownerid,action.id ) )
    .map( (id:string) => new personsActions.Deleted( id ) );

  @Effect()
  update$: Observable<Action> = this.actions.ofType( personsActions.UPDATE )
    .mergeMap( (action:personsActions.Update) => this.api.postPerson( action.ownerid,action.groupid,action.partial ) )
    .map( (person:Person) => new personsActions.Updated( person.id,person ) );

  @Effect()
  imagine$: Observable<Action> = this.actions.ofType( personsActions.IMAGINE )
    .map( (action:personsActions.Imagine) => {
      this.uploadAndImagined( action.ownerid,action.partial,action.imagefile );
      return new personsActions.Pending();
    } );

  /********************************************************************************************************************/

  private uploadAndCreated( person:Person,pending:PendingPersonImageFile ) {
    Observable.from( firebase.storage().ref().child('persons/person.imageURL.'+person.id ).put( pending.imagefile ) )
      .mergeMap( snapshot => {
        person.imageURL = snapshot.downloadURL;
        return this.api.postPerson( pending.ownerid,null,person );
      } )
      .subscribe(
        g => { this.personstore.dispatch( new personsActions.Created( g ) ); },
        e => { console.log( e ); }
      );
  }

  private uploadAndImagined( ownerid:string,person:Person,imagefile:File ) {
    if ( person.id == null ) { console.log( 'uploadAndImagined: ERROR - PERSON.ID IS NULL' ); return; }
    Observable.from( firebase.storage().ref().child('persons/person.imageURL.'+person.id ).put( imagefile ) )
      .mergeMap( snapshot => {
        person.imageURL = snapshot.downloadURL;
        return this.api.postPerson( ownerid,null,person );
      } )
      .subscribe(
        g => { this.personstore.dispatch( new personsActions.Imagined( g.id,g ) ); },
        e => { console.log( e ); }
      );
  }
}
