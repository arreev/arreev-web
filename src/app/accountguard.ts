
import { Router,CanActivate,ActivatedRouteSnapshot,RouterStateSnapshot,Params } from '@angular/router';
import { environment } from '../environments/environment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { isNullOrUndefined } from 'util';

import * as firebase from 'firebase';

/**
 *
 */
@Injectable()
export class AccountGuard implements CanActivate
{
  /*
   * https://angular.io/guide/router#milestone-5-route-guards
   * https://medium.com/@ryanchenkie_40935/angular-authentication-using-route-guards-bf7a4ca13ae3
   *
   * https://firebase.google.com/docs/auth/web/password-auth
   * https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithEmailAndPassword
   *
   * https://firebase.google.com/docs/auth/web/auth-state-persistence
   */

  private _signedin = new BehaviorSubject<boolean>( false );
  readonly signedin = this._signedin.asObservable();

  private _signinerror = new BehaviorSubject<string>( null );
  readonly signinerror = this._signinerror.asObservable();

  private accountguardunsubscribe = null;
  private virgin = true;

  constructor( private router:Router ) {
    firebase.initializeApp( environment.firebase );
    this.subscribe();
  }

  /**
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} snapshot
   * @returns {Observable<boolean> | Promise<boolean> | boolean}
   */
  canActivate( route:ActivatedRouteSnapshot,snapshot:RouterStateSnapshot ) : Observable<boolean> | Promise<boolean> | boolean {
    // console.log( 'AccountGuard.canActivate ' + (this.virgin ? 'VIRGIN ' : '' ) + snapshot.url );

    if ( this.virgin === true ) {
      this.virgin = false;
      this.unsubscribe();
      let localunsubscribe = null;
      return new Promise( resolve => {
        localunsubscribe = firebase.auth().onAuthStateChanged(u => {
          localunsubscribe();
          const _validuser = !isNullOrUndefined( firebase.auth().currentUser );
          if ( !_validuser ) {
            this.reRouteToSignIn( route );
          }
          this.subscribe();
          resolve( _validuser );
        } );
      } );
    }

    const validuser = !isNullOrUndefined( firebase.auth().currentUser );
    if ( !validuser ) {
      this.reRouteToSignIn( route );
    }
    return validuser;
  }

  /**
   *
   * @param {string} email
   * @param {string} password
   */
  signIn( email:string,password:string ) {
    firebase.auth().signInWithEmailAndPassword( email,password ).catch(error => this.onRejected( error ) );
  }

  /**
   *
   * @returns {string}
   */
  getOwnerId() : string {
    const user = firebase.auth().currentUser;
    if ( isNullOrUndefined( user ) ) {
      return null;
    }
    return user.uid;
  }

  /**
   *
   * @returns {string}
   */
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

  /*
   * re-route to sign-in, which routing.module does NOT call on AccountGuard
   */
  private reRouteToSignIn( route:ActivatedRouteSnapshot ) {
    const map = this.paramsAsMap( route.queryParams );
    map[ 'destination' ] = route.url[0].path;
    this.router.navigate([ 'sign-in' ],{ queryParams:map } );
  }

  private subscribe() {
    this.accountguardunsubscribe = firebase.auth().onAuthStateChanged(user => this.onAuthStateChanged( user ) );
  }

  private unsubscribe() {
    if ( this.accountguardunsubscribe ) { this.accountguardunsubscribe(); }
  }

  private onAuthStateChanged( user ) {
    if ( user && !user.emailVerified ) {
      this._signinerror.next( 'email has not been verified' );
      firebase.auth().currentUser.sendEmailVerification().catch(r => console.log( r ) );
      this.signOut();
      return;
    }

    const validuser = !isNullOrUndefined( user );
    this._signedin.next( validuser );
    if ( validuser ) {
      this.destination();
    } else {
      this.checkforcedout();
    }
  }

  private destination() {
    const url = new URL( 'me:'+this.router.url );
    if ( url.pathname.startsWith( '/sign-in' ) ) {
      // console.log( 'destination ' + url );
      const destination = url.searchParams.get( 'destination' );
      if ( destination ) {
        const map =this.urlsearchparamsAsMap( url.searchParams );
        map[ 'destination' ] = null;
        this.router.navigate([ destination ],{ queryParams:map } );
      } else {
        this.router.navigate([ 'home' ] );
      }
    }
  }

  private checkforcedout() {
    const forced = (this.router.url !== '/') && !this.router.url.startsWith( '/sign-in' );
    if ( forced ) {
      this.router.navigate([ 'sign-in' ] );
    }
  }

  private onRejected( error ) {
    this._signinerror.next( error.code );
  }

  private paramsAsMap( params:Params ) : { [key:string]:any } {
    const map : { [key:string]:any } = {};
    for ( const key in params ) { // tslint:disable-line
      map[ key ] = params[ key ];
    }
    return map;
  }

  private urlsearchparamsAsMap( searchparams:URLSearchParams ) : { [key:string]:any } {
    const map : { [key:string]:any } = {};
    const query = ''+searchparams as string;
    query.split('&' ).forEach((pair) => {
      const name = pair.split( '=' )[ 0 ];
      const value = pair.split( '=' )[ 1 ];
      map[ name ] = value;
    } );
    return map;
  }
}

