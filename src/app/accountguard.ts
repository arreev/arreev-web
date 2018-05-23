
import { Router,CanActivate,ActivatedRouteSnapshot,RouterStateSnapshot } from '@angular/router';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { isNullOrUndefined } from 'util';

import * as firebase from 'firebase';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AccountGuard implements CanActivate
{
  /*
   * https://angular.io/guide/router#milestone-5-route-guards
   * https://medium.com/@ryanchenkie_40935/angular-authentication-using-route-guards-bf7a4ca13ae3
   *
   * https://firebase.google.com/docs/auth/web/password-auth
   * https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithEmailAndPassword
   */

  private _signedin = new BehaviorSubject<boolean>( false );
  readonly signedin = this._signedin.asObservable();

  private _signinerror = new BehaviorSubject<string>( null );
  readonly signinerror = this._signinerror.asObservable();

  constructor( private router:Router ) {
    firebase.initializeApp( environment.firebase );
    firebase.auth().onAuthStateChanged(user => this.onAuthStateChanged( user ) );
  }

  /**
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} snapshot
   * @returns {Observable<boolean> | Promise<boolean> | boolean}
   */
  canActivate( route:ActivatedRouteSnapshot,snapshot:RouterStateSnapshot ) : Observable<boolean> | Promise<boolean> | boolean {
    const user = firebase.auth().currentUser;
    if ( isNullOrUndefined( user ) ) {
      this.router.navigate([ 'sign-in' ],{ queryParams: { content: snapshot.url } } );
      return false;
    }
    return true;
  }

  /**
   *
   * @param {string} email
   * @param {string} password
   */
  signIn( email:string,password:string ) {
    firebase.auth().signInWithEmailAndPassword( email,password ).catch(error => this.onRejected( error ) );
  }

  getOwnerId() : string {
    const user = firebase.auth().currentUser;
    if ( isNullOrUndefined( user ) ) {
      return null;
    }
    return user.uid;
  }

  getEMail() : string {
    const user = firebase.auth().currentUser;
    if ( isNullOrUndefined( user ) ) {
      return null;
    }
    return user.email;
  }

  /**
   *
   */
  signOut() {
    firebase.auth().signOut().catch(error => this.onRejected( error ) );
  }

  /********************************************************************************************************************/

  private onAuthStateChanged( user ) {
    this._signedin.next( !isNullOrUndefined( user ) );
    this.router.navigate([ 'home' ] );
  }

  private onRejected( error ) {
    this._signinerror.next( error.code );
  }
}
