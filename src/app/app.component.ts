
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

import * as firebase from 'firebase';

import { environment } from '../environments/environment';
import { isUndefined } from 'util';
import { isBlank } from './util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    appFade,
    /*
     * https://angular.io/guide/animations
     * https://angular.io/api/animations/state
     */
    trigger('sidenav-animation',[
      state('open', style({ transform:'rotate( 0deg)' } ) ),
      state('close',style({ transform:'rotate(180deg)' } ) ),
      transition('* => *',animate('200ms' ) )
    ]),
    trigger('sidebar-animation',[
      state('open', style({ transform:'rotate(180deg)' } ) ),
      state('close',style({ transform:'rotate(  0deg)' } ) ),
      transition('* => *',animate('200ms' ) )
    ])
  ]
})
export class AppComponent implements OnInit,OnDestroy
{
  letters: string[] = [ 'a','r','r','e','e','v' ];
  loggedin = false;
  avataravailable = false;
  avatarURL$?:Observable<string>;
  showinfo?: boolean;
  sidenavstate = 'open';
  sidebarstate = 'close';

  private accountStoreSubscription: Subscription;
  private account$: Observable<Account>;

  constructor( private router:Router,private authentication:Authentication,
               private accountstore:Store<AccountState> ) {
    this.account$ = this.accountstore.select('account' );
  }

  ngOnInit(): void {
    this.accountStoreSubscription = this.account$.skip( 1 ).subscribe(account => this.fromAccountStore( account ) );
    this.loggedin = ( this.authentication.isAuthorized() === true );

    /*
     * because AngularFireModule.initializeApp( environment.firebase ) in app.module not work
     */
    firebase.initializeApp( environment.firebase );

    this.avataravailable = false;

    if ( this.loggedin ) {
      this.accountstore.dispatch( new AccountActions.AccountFetchAction() );
    }
  }

  openedSidenavStart() { this.sidenavstate = 'open'; }
  closedSidenavStart() { this.sidenavstate = 'close'; }

  openedSidebarStart() { this.sidebarstate = 'open'; }
  closedSidebarStart() { this.sidebarstate = 'close'; }

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
    this.accountstore.dispatch( new AccountActions.AccountResetAction() );
    this.loggedin = ( this.authentication.isAuthorized() === true );
    this.avataravailable = false;
    this.router.navigate([ 'login' ] );
  }

  onInfo() {
    this.showinfo = true;
  }

  hello() { console.log( 'hello' ); }

  ngOnDestroy(): void {
    this.accountStoreSubscription.unsubscribe();
  }

  private fromAccountStore( account?:Account ) {
    this.avataravailable = false;

    if ( account === null ) { return; }

    if ( isUndefined( account.id ) ) {
      console.log( 'bad account' );
      this.authentication.logout();
      this.router.navigate([ 'login' ] );
      return;
    }

    console.log( 'account: ' + account.id + ' ' + account.email );
    this.avataravailable = !isBlank( account.imageURL  );
    this.avatarURL$ = Observable.of( account.imageURL );
  }
}
