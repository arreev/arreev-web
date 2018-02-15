
import { RouterStateSnapshot } from '@angular/router';
import { SharedService } from './shared.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Login } from './login';

import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool, CognitoUserSession
} from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk/global';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { environment } from '../environments/environment';

@Injectable()
export class Authentication
{
  private pendingCognitoUser : CognitoUser;
  private pendingRequiredAttributes : any;

  private _accessToken = new BehaviorSubject<string>( '' );
  private _idToken = new BehaviorSubject<string>( '' );
  private _refreshToken = new BehaviorSubject<string>( '' );

  readonly accessToken:Observable<string> = this._accessToken.asObservable();
  readonly idToken:Observable<string> = this._idToken.asObservable();
  readonly refreshToken:Observable<string> = this._refreshToken.asObservable();

  /*
   * USE THIS AS GUIDE:
   * https://github.com/awslabs/aws-cognito-angular2-quickstart
   *
   * AND THIS:
   * http://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html
   *
   * https://github.com/aws/aws-sdk-js
   * https://github.com/aws/amazon-cognito-identity-js/
   *
   * http://docs.aws.amazon.com/cognito/latest/developerguide/setting-up-the-javascript-sdk.html
   * http://docs.aws.amazon.com/cognito/latest/developerguide/tutorial-integrating-user-pools-javascript.html
   * http://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html
   */

  constructor( private shared:SharedService ) {}

  login( email:string,password:string ) : Observable<Login> {
    AWS.config.region = environment.aws_region; // Authentication.AWS_REGION;

    this.logout();

    const poolData = {
      UserPoolId : environment.aws_userpool_id,
      ClientId : environment.aws_userpool_appclientid
    };
    const userPool = new CognitoUserPool( poolData );

    const userData = {
      Username : email,
      Pool : userPool
    };
    const cognitoUser = new CognitoUser( userData );
    this.pendingCognitoUser = cognitoUser;

    const authenticationData = {
      Username : email,
      Password : password
    };
    const authenticationDetails = new AuthenticationDetails( authenticationData );

    const me = this;

    return Observable.create( function( observer ) {
      const login = { email:email,new_password_requested:false };
      cognitoUser.authenticateUser(
        authenticationDetails,
        {
          newPasswordRequired: function ( userAttributes,requiredAttributes ) {
            login.new_password_requested = true;
            me.pendingRequiredAttributes = requiredAttributes;
            observer.next( login );
            observer.complete();
          },
          onSuccess: function ( result ) {
            me.updateTokens();
            observer.next( login );
            observer.complete();
          },
          onFailure: function ( error ) {
            switch ( error.message ) {
              case 'Password reset required for the user':
                // TODO: http://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-using-import-tool-password-reset.html
                break;
            }
            observer.error( error );
          }
        }
      );
    } );
  }

  /*
   * http://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-identity-user-pools-javascript-example-authenticating-admin-created-user.html
   */
  forcedChangePassword( email:string,oldpassword:string,newpassword:string ) : Observable<any> {
    let cognitoUser = this.pendingCognitoUser;
    if ( cognitoUser == null ) { cognitoUser = this.getCurrentUser(); }
    if ( cognitoUser == null ) { return Observable.throw( new Error( 'illegal state - no current user' ) ); }

    this.pendingCognitoUser = null;

    const user = { email:email,password_expired:false,token:null };

    const me = this;

    const observable = Observable.create(
      function( observer ) {
        cognitoUser.completeNewPasswordChallenge( newpassword,this.pendingRequiredAttributes,
          {
            onSuccess: function( session:CognitoUserSession ) {
              me.updateTokens();
              observer.next( '' );
              observer.complete();
            },
            onFailure: function( error:any ) {
              observer.error( error );
            }
          }
        );
      }
    );

    return observable;
  }

  /*
   * http://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-using-import-tool-password-reset.html
   */
  confirmForgotPassword( email:string,code:string,pass:string ) {
    const poolData = {
      UserPoolId : environment.aws_userpool_id,
      ClientId : environment.aws_userpool_appclientid
    };
    const userPool = new CognitoUserPool( poolData );

    const userData = {
      Username : email,
      Pool : userPool
    };
    const cognitoUser = new CognitoUser( userData );

    cognitoUser.confirmPassword( code,pass,{ onSuccess: () => { console.log( 'ok' ); },onFailure: () => { console.log( 'oops' ); } } );
  }

  isAuthorized( snapshot?:RouterStateSnapshot ) : Observable<boolean> | boolean {
    let authorized = false;

    const me = this;

    const cognitoUser = this.getCurrentUser();
    if ( cognitoUser != null ) {
      cognitoUser.getSession( function( error,session ) {
        if ( error ) {
          console.log( error );
        } else {
          authorized = session.isValid();
          me.updateTokens();
        }
      } );
    }

    return authorized;
  }

  logout() {
    const cognitoUser = this.getCurrentUser();
    if ( cognitoUser != null ) {
      cognitoUser.signOut();
    }
    this._accessToken.next( '' );
    this._idToken.next( '' );
    this._refreshToken.next( '' );

    this.shared.setAvatarURL( 'assets/avatar.png' );
  }

  private getCurrentUser() : CognitoUser {
    const poolData = {
      UserPoolId : environment.aws_userpool_id,
      ClientId : environment.aws_userpool_appclientid
    };
    const userPool = new CognitoUserPool( poolData );
    const cognitoUser = userPool.getCurrentUser();
    return cognitoUser;
  }

  private updateTokens() {
    const cognitoUser = this.getCurrentUser();

    const me = this;

    if ( cognitoUser != null ) {
      cognitoUser.getSession(
        function( error,session ) {
          if ( error ) {
            console.log( error );
          } else {
            const accessToken = session.getAccessToken();
            const idToken = session.getIdToken();
            const refreshToken = session.getRefreshToken();
            me._accessToken.next( accessToken != null ? accessToken.getJwtToken() : '' );
            me._idToken.next( idToken != null ? idToken.getJwtToken() : '' );
            me._refreshToken.next( refreshToken != null ? refreshToken.getToken() : '' );
          }
        }
      );
    }
  }
}
