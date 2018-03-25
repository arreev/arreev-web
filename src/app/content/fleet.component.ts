
import { Component,OnInit,OnDestroy,ViewEncapsulation } from '@angular/core';
import * as AccountActions from '../store/account.actions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as FleetActions from '../store/fleet.actions';
import { AccountState,FleetState } from '../app.state';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Fleet } from '../model/fleet';
import { API } from '../api.service';
import { Store } from '@ngrx/store';
import { isBlank } from '../util';

import { trigger,stagger,transition,query,style,animate,state } from '@angular/animations';

interface FleetVM extends Fleet
{
  state?: string;
}

@Component({
  selector: 'app-fleet',
  templateUrl: './fleet.component.html',
  styleUrls: ['./fleet.component.css'],
  /*
   * https://angular.io/api/animations/stagger
   */
  animations: [
    trigger( 'grid-animation',[
      transition('* => *',[
        query(':enter',[
          style({ opacity:0 } ),stagger(100,animate('.75s',style({ opacity:.75 } ) ) )
        ],{ optional:true } )
      ] )
    ] ),
    trigger('fleet-state',[
      state('inactive',style({ opacity:'.75',transform:'scale(1)' } ) ),
      state('active',style({ opacity:'1',transform:'scale(1.025)' } ) ),
      transition('inactive => active',animate('100ms ease-in' ) ),
      transition('active => inactive',animate('100ms ease-out' ) )
    ] ),
    trigger('fleet-edit',[
      state('in',style({ transform:'scale(1)' } ) ),
      transition('void => *',[ style({ transform:'scale(0)' } ),animate('250ms ease-in' ) ] ),
    ] ),
    trigger('fleet-transporters',[
      state('in',style({ opacity:1 } ) ),
      transition('void => *',[ style({ opacity:0 } ),animate('750ms ease-in' ) ] ),
    ] )
  ],
  encapsulation: ViewEncapsulation.None
})
export class FleetComponent implements OnInit,OnDestroy
{
  fleets: FleetVM[] = [];
  selectedfleet?: FleetVM = null;
  showfleetnew = false;
  showfleettransporternew = false;

  private _refresher = new BehaviorSubject<void>( null );
  refresher: Observable<void> = this._refresher.asObservable();

  private fleetSubscription: Subscription;

  constructor( private api:API,private accountstore:Store<AccountState>,private fleetstore:Store<FleetState>,
               private confirmationService:ConfirmationService ) {}

  ngOnInit(): void {
    this.fetch();
    this.fleetSubscription = this.fleetstore.select( 'fleet' ).skip( 1 ).subscribe(f => { this.fromFleetStore( f ); } );
  }

  onAddFleet() {
    this.showfleetnew = true;
  }

  onDeleteFleet() {
    const name = this.selectedfleet.name;
    this.confirmationService.confirm({ message:`Are you sure you want to delete ${name} ?`,accept: () => { this.deleteFleet( this.selectedfleet ); } } );
  }

  onAddTransporter() {
    this.showfleettransporternew = true;
  }

  onRefresh() {
    this.selectedfleet = null;
    this.fetch();
  }

  onFleet( fleet:FleetVM ) {
    if ( this.selectedfleet === fleet ) {
      return;
    }
    if ( this.selectedfleet != null ) {
      this.selectedfleet.state = 'inactive';
    }
    this.selectedfleet = null;
    Observable.timer( 100 ).subscribe(
      n => {
        this.selectedfleet = fleet;
        this.selectedfleet.state = 'active';
      }
    );
  }

  onFinishedFleetNew() {
    this.showfleetnew = false;
    Observable.timer( 500 ).subscribe(
      n => { this.fetch(); }
    );
  }

  onFinishedFleetTransporterNew() {
    this.showfleettransporternew = false;
    this._refresher.next(null );
  }

  ngOnDestroy(): void {
    this.fleetSubscription.unsubscribe();
  }

  private fromFleetStore( fleet:Fleet ) {
    for ( const f of this.fleets ) {
      if ( f.id === fleet.id ) {
        f.name = fleet.name;
        f.type = fleet.type;
        f.category = fleet.category;
        f.description = fleet.description;
        f.imageURL = fleet.imageURL;
        break;
      }
    }
  }

  private fetch() {
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        if ( !isBlank( a.id ) ) {
          this.getFleets( a.id,0,100 );
        } else {
          let accountSubscription = null;
          accountSubscription = this.accountstore.select('account' ).subscribe(
            aa => { this.getFleets( aa.id,0,100 ); },
            e => { this.onError( e ); accountSubscription.unsubscribe(); },
            () => { accountSubscription.unsubscribe(); }
          );
          this.accountstore.dispatch( new AccountActions.AccountFetchAction() );
        }
      },
      e => { this.onError( e ); },
      () => {}
    );
  }

  /*
   * TODO: support paging
   * TODO: assert account is valid ? (logged in?)
   */
  private getFleets( ownerid:string, start:number,count:number ) {
    const _fleets: Fleet[] = [];
    this.api.getFleets( ownerid ).subscribe(
      f => { _fleets.push( this.asFleetVM( f ) ); },
      e => { this.onError( e ); },
      () => { this.fleets = _fleets; }
    );
  }

  private asFleetVM( fleet:Fleet ) : FleetVM {
    let fleetvm = null;

    if ( fleet != null ) {
      fleetvm = {};
      fleetvm.id = fleet.id;
      fleetvm.name = fleet.name;
      fleetvm.type = fleet.type;
      fleetvm.category = fleet.category;
      fleetvm.description = fleet.description;
      fleetvm.imageURL = fleet.imageURL;
      fleetvm.thumbnailURL = fleet.thumbnailURL;
      fleetvm.status = fleet.status;
      fleetvm.state = 'inactive';
    }

    return fleetvm;
  }

  private deleteFleet( fleet:Fleet ) {
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        this.selectedfleet = null;
        const _fleets: Fleet[] = this.fleets.filter(f => ( f.id !== fleet.id ) );
        this.fleets = _fleets;
        this.fleetstore.dispatch( new FleetActions.FleetDeleteAction( ownerid,fleet.id ) );
      }
    );
  }

  private onError( e )  {
    console.log( e );
  }
}

