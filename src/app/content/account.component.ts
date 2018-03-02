
import { Component,OnInit,AfterViewInit,OnDestroy,ViewEncapsulation,ViewChild } from '@angular/core';
import { Authentication } from '../authentication.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Account,dumpAccount } from '../model/account';
import { MenuItem,SelectItem } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { FileUpload } from 'primeng/primeng';
import { AccountState } from '../app.state';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import * as AccountActions from '../store/account.actions';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/debounceTime';

import * as firebase from 'firebase';
import { animate,query,state,style,transition,trigger } from '@angular/animations';

/*
 * MVVM Account View Model
 */
class AccountVM
{
  id?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  active?: boolean;
  imageURL?: string;
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  animations: [
    trigger('account-in',[
      state('in',style({ transform:'translateX(0)' } ) ),
      transition('void => *',[ style({ transform:'translateX(+100%)' } ),animate('150ms ease-in' ) ] ),
    ] ),
    trigger('account-fade-in',[
      state('here',style({ opacity:'0' } ) ),
      state('now',style({ opacity:'1' } ) ),
      transition('here => now',animate('750ms ease-in' ) )
    ] )
  ],
  encapsulation: ViewEncapsulation.None
})
export class AccountComponent implements OnInit,AfterViewInit,OnDestroy
{
  accountvm = { id:'',email:'',firstname:'',lastname:'',active:false,imageURL:'' };

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

  @ViewChild( 'inputFile' ) inputFile; // bit of a dom hack ?

  titlestate = 'here';

  constructor( private router:Router,private authentication:Authentication,
               private accountstore:Store<AccountState> ) {
    this.account$ = this.accountstore.select('account' );
    this.initialize();
  }

  ngOnInit(): void {
    this.accountStoreSubscription = this.account$.skip( 1 ).subscribe(account => this.fromAccountStore( account ) );
    this.accountstore.dispatch( new AccountActions.AccountFetchAction() );
    this.titlestate = 'here';
  }

  ngAfterViewInit(): void {
    this.subscribeUI();
    setTimeout(() => { this.titlestate = 'now'; } ); // RE: ExpressionChangedAfterItHasBeenCheckedError
  }

  update() {
    this._uichange.next(null );
  }

  onRefresh() {
    this.accountstore.dispatch( new AccountActions.AccountFetchAction() );
  }

  onImage() {
    this.inputFile.nativeElement.click(); // bit of a dom hack ?
  }

  onInputFile() {
    try {
      const file = this.inputFile.nativeElement.files[ 0 ];
      this.uploadImage( file );
    } catch ( x ) {
      console.log( x );
    }
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
      lastname:this.accountvm.lastname,
      imageURL:this.accountvm.imageURL
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

    this.accountvm.id = account.id;
    this.accountvm.email = account.email;
    this.accountvm.firstname = account.firstname;
    this.accountvm.lastname = account.lastname;
    this.accountvm.active = account.active;
    this.accountvm.imageURL = account.imageURL;
  }

  private uploadImage( file:File ) {
    const uploadtask = firebase.storage().ref().child( 'account/account.imageURL.'+this.accountvm.id ).put( file );
    uploadtask.on( firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {},
      e=>{ this.onError( e ); },
      ()=>{ this.assumeImageURL( uploadtask.snapshot.downloadURL ); }
    );
  }

  private assumeImageURL( imageURL:string ) {
    this.accountvm.imageURL = imageURL;
    this.toAccountStore();
  }

  private onError( e ) {
    console.log( e );
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
