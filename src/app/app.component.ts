
import { Component,OnInit,OnDestroy } from '@angular/core';
import { Authentication } from './authentication.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { AccountState } from './app.state';
import { Account } from './model/account';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import * as AccountActions from './store/account.actions';

import { animate,state,style,transition,trigger } from '@angular/animations';
import { appFade } from './app.animations';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/skip';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    appFade,
    trigger('app-component-yellow',[
      state('void',style({ color:'yellow' }) ),
      transition('void <=> *',animate(2500 ) ) // or can use aliases ':enter,:leave'
    ] )
  ]
})
export class AppComponent implements OnInit,OnDestroy
{
  loggedin = false;
  avataravailable = false;
  avatarURL$?:Observable<string>;

  private accountStoreSubscription: Subscription;
  private account$: Observable<Account>;

  constructor( private router:Router,private authentication:Authentication,
               private accountstore:Store<AccountState> ) {
    this.account$ = this.accountstore.select('account' );
  }

  ngOnInit(): void {
    this.accountStoreSubscription = this.account$.skip( 1 ).subscribe(account => this.fromAccountStore( account ) );
    this.loggedin = ( this.authentication.isAuthorized() === true );

    this.avataravailable = false;

    if ( this.loggedin ) {
      this.accountstore.dispatch( new AccountActions.AccountFetchAction() );
    }
  }

  onArreev() {
    this.router.navigate( [ 'home' ] ).catch( error => console.log( error ) );
  }

  onAccount() {
    this.router.navigate([ 'account' ] );
  }

  onLogin() {
    this.authentication.logout();
    this.loggedin = ( this.authentication.isAuthorized() === true );
    this.avataravailable = false;
    this.router.navigate([ 'login' ] );
  }

  onLogout() {
    this.authentication.logout();
    this.loggedin = ( this.authentication.isAuthorized() === true );
    this.avataravailable = false;
    this.router.navigate([ 'login' ] );
  }

  hello() { console.log( 'hello' ); }

  ngOnDestroy(): void {
    this.accountStoreSubscription.unsubscribe();
  }

  private fromAccountStore( account?:Account ) {
    if ( account === null ) { return; }
    this.avataravailable = ( account.avatarURL != null );
    this.avatarURL$ = Observable.of( account.avatarURL );
  }
}
