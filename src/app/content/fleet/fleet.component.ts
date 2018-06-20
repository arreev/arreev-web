
import { activeStateAnimation,fadeInAnimation,gridAnimation,scaleInAnimation } from '../../app.animations';
import { Component,OnInit,OnDestroy,ViewEncapsulation } from '@angular/core';
import { RouterStateUrl } from '../../store/router.reducer';
import * as FleetActions from '../../store/fleet.actions';
import * as fromRouter from '../../store/router.reducer';
import { RouterReducerState } from '@ngrx/router-store';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AccountGuard } from '../../accountguard';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { FleetState } from '../../app.state';
import { Fleet } from '../../model/fleet';
import { Router } from '@angular/router';
import { API } from '../../api.service';
import { Store } from '@ngrx/store';

import { Consoler } from '../../util';

@Component({
  selector: 'app-fleet',
  templateUrl: './fleet.component.html',
  styleUrls: [ './fleet.component.css' ],
  /*
   * https://angular.io/api/animations/stagger
   */
  animations: [ gridAnimation,scaleInAnimation,fadeInAnimation,activeStateAnimation ],
  encapsulation: ViewEncapsulation.Emulated
})
// @Consoler( 'FleetComponent' )
export class FleetComponent implements OnInit,OnDestroy
{
  fleets: Fleet[] = [];
  selectedfleet?: Fleet = null;
  showfleetnew = false;
  showfleettransporternew = false;
  working = false;

  private _refresher = new BehaviorSubject<void>( null );
  refresher: Observable<void> = this._refresher.asObservable();
  private fleetSubscription: Subscription;
  private ownerid?: string = null;

  constructor( private api:API,
               private router:Router,
               private accountguard:AccountGuard,
               private fleetstore:Store<FleetState>,
               private routerstore:Store<RouterStateUrl>,
               private confirmationService:ConfirmationService ) {}

  ngOnInit(): void {
    this.ownerid = this.accountguard.getOwnerId();

    this.fleetSubscription = this.fleetstore.select( 'fleet' ).skip( 1 ).subscribe(f => { this.fromFleetStore( f ); } );
    this.fetch();
  }

  onAddFleet() {
    this.showfleetnew = true;
  }

  onDeleteFleet( fleet:Fleet ) {
    this.confirmationService.confirm({ header:fleet.name,message:`Are you sure you want to delete ?`,accept: () => { this.deleteFleet( fleet ); } } );
  }

  onAddTransporter() {
    this.showfleettransporternew = true;
  }

  onRefresh() {
    this.selectedfleet = null;
    this.fetch();
  }

  onFleet( fleet:Fleet ) {
    if ( this.selectedfleet === fleet ) {
      return;
    }
    if ( this.selectedfleet != null ) {
      this.selectedfleet.state = 'inactive';
    }
    this.selectedfleet = null;
    setTimeout(() => {
      this.selectedfleet = fleet;
      this.selectedfleet.state = 'active';
      this.router.navigate([ 'rides' ],{ queryParams: { fleetid:this.selectedfleet.id } } );
    },100 );
  }

  onFinishedFleetNew() {
    this.showfleetnew = false;
    setTimeout(() => { this.fetch(); },500 );
  }

  onFinishedFleetTransporterNew() {
    this.showfleettransporternew = false;
    this._refresher.next(null );
  }

  onEditWorking( w:boolean ) {
    this.working = w;
  }

  cardBorder( fleet:Fleet ) : string { return ( this.selectedfleet === fleet ? '2px solid #9090C0' : '' ); }

  ngOnDestroy(): void {
    this.fleetSubscription.unsubscribe();
  }

  private fromFleetStore( fleet:Fleet ) {
    this.working = false;
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
    this.working = true;
    this.getFleets( this.ownerid,0,100 );
  }

  /*
   * TODO: support paging
   * TODO: assert account is valid ? (logged in?)
   */
  private getFleets( ownerid:string, start:number,count:number ) {
    const _fleets: Fleet[] = [];
    this.api.getFleets( ownerid ).subscribe(
      f => { _fleets.push( f ); },
      e => { this.onError( e ); },
      () => {
        this.working = false;
        this.fleets = _fleets;
        this.assumeSelectedFleetFromRouterState();
      }
    );
  }

  private assumeSelectedFleetFromRouterState() {
    this.routerstore.select( fromRouter.getRouterState ).take( 1 ).subscribe(
     (rs:RouterReducerState<RouterStateUrl>) => {
        const fleetid = rs.state.queryParams[ 'fleetid' ];
        if ( fleetid ) {
          const fleet:Fleet = this.fleets.find( (f:Fleet) => (f.id === fleetid) );
          if ( fleet ) {
            this.onFleet( fleet );
          }
        }
      }
    );
  }

  private deleteFleet( fleet:Fleet ) {
    if ( this.selectedfleet === fleet ) {
      this.selectedfleet = null;
    }
    const _fleets: Fleet[] = this.fleets.filter(f => ( f.id !== fleet.id ) );
    this.fleets = _fleets;
    this.fleetstore.dispatch( new FleetActions.FleetDeleteAction( this.ownerid,fleet.id ) );
  }

  private onError( e )  {
    console.log( e );
  }
}

