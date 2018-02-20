
import { Component,OnInit,AfterViewInit,OnDestroy,ViewEncapsulation } from '@angular/core';
import { Authentication } from '../authentication.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Account,dumpAccount } from '../model/account';
import { MenuItem,SelectItem } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { AccountState } from '../app.state';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import * as AccountActions from '../store/account.actions';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/debounceTime';

/*
 * MVVM Account View Model
 */
class AccountVM
{
  email?: string;
  firstname?: string;
  lastname?: string;
  active?: boolean;
  avatarurl?: string;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AccountComponent implements OnInit,AfterViewInit,OnDestroy
{
  accountvm = { email:'',firstname:'',lastname:'',active:false,avatarurl:'' };

  private readonly _uichange = new BehaviorSubject<void>( null );
  private readonly uichange:Observable<void> = this._uichange.asObservable();
  private uiSubscription: Subscription;

  private accountStoreSubscription: Subscription;
  account$: Observable<Account>;

  roles: SelectItem[];
  groups: SelectItem[];
  permissions: SelectItem[];
  selectedroles: string[] = [];
  selectedgroups: string[] = [];
  selectedpermissions: string[] = [];

  rankitems: MenuItem[];

  constructor( private router:Router,private authentication:Authentication,
               private accountstore:Store<AccountState> ) {
    this.account$ = this.accountstore.select('account' );
    this.initialize();
  }

  ngOnInit(): void {
    this.accountStoreSubscription = this.account$.skip( 1 ).subscribe(account => this.fromAccountStore( account ) );
    this.accountstore.dispatch( new AccountActions.AccountFetchAction() );
  }

  ngAfterViewInit(): void {
    this.subscribeUI();
  }

  update() {
    this._uichange.next(null );
  }

  onAvatar() {
    console.log( 'onAvatar' );
  }

  ngOnDestroy(): void {
    /*
     * TODO: how to determine if edited, but not dispatched ?
     */
    this.unSubscribeUI();
    this.accountStoreSubscription.unsubscribe();
  }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uichange.skip( 1 ).debounceTime( 250 ).subscribe(() => { this.toAccountStore(); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription != null ) {
      this.uiSubscription.unsubscribe();
    }
  }

  private toAccountStore() {
    console.log( 'AccountComponent.toAccountStore' );
    const account = {
      firstname:this.accountvm.firstname,
      lastname:this.accountvm.lastname
    };
    this.accountstore.dispatch( new AccountActions.AccountPostAction( account ) );
  }

  private fromAccountStore( account?:Account ) {
    console.log( 'AccountComponent.fromAccountStore ' + dumpAccount( account ) );
    this.unSubscribeUI();
      this.assume( account );
    this.subscribeUI();
  }

  private assume( account?:Account ) {
    if ( account == null ) { return; }

    this.accountvm.email = account.email;
    this.accountvm.firstname = account.firstname;
    this.accountvm.lastname = account.lastname;
    this.accountvm.active = account.active;
    this.accountvm.avatarurl = account.avatarURL;
  }

  private initialize() {
    this.roles = [
      { label:'driver',value:'driver' },
      { label:'pilot',value:'pilot' },
      { label:'navigator',value:'navigator' },
      { label:'passenger',value:'passenger' },
      { label:'monitor',value:'monitor' },
      { label:'observer',value:'observer' }
    ];

    this.groups = [
      { label:'owner',value:'owner' },
      { label:'admin',value:'admin' },
      { label:'person',value:'person' },
      { label:'guest',value:'guest' },
    ];

    this.permissions = [
      { label:'create',value:'create' },
      { label:'read',value:'read' },
      { label:'update',value:'update' },
      { label:'delete',value:'delete' },
    ];

    this.rankitems = [
      { label:'Copper' },
      { label:'Bronze' },
      { label:'Silver' },
      { label:'Gold' },
      { label:'Platinum' }
    ];

    this.account$.take( 1 ).subscribe(
      a => { this.assume( a ); }
    );
  }
}