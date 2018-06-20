
import { Component,OnInit,OnDestroy,ViewEncapsulation,ViewChild,ChangeDetectorRef } from '@angular/core';
import * as fromFollowers from '../../store/followers.reducer';
import { FollowMapComponent } from './follow-map.component';
import { RouterStateUrl } from '../../store/router.reducer';
import * as fromRouter from '../../store/router.reducer';
import { RouterReducerState } from '@ngrx/router-store';
import { capitalizeFirstLetter } from '../../util';
import { AccountGuard } from '../../accountguard';
import { Subscription } from 'rxjs/Subscription';
import { FollowerState } from '../../app.state';
import { Follower } from '../../model/follower';
import { Fleet } from '../../model/fleet';
import { Router } from '@angular/router';
import { API } from '../../api.service';
import { User } from '../../model/user';
import { Store } from '@ngrx/store';

import {
  activeStateAnimation,fadeInAnimation,gridAnimation,hideShowAnimation,
  scaleInAnimation
} from '../../app.animations';

import * as firebase from 'firebase';

@Component({
  selector: 'app-follow',
  templateUrl: './follow.component.html',
  styleUrls: ['./follow.component.css'],
  animations: [ gridAnimation,scaleInAnimation,fadeInAnimation,activeStateAnimation,hideShowAnimation ],
  encapsulation: ViewEncapsulation.Emulated
})
export class FollowComponent implements OnInit,OnDestroy
{
  selectedtransporterid?: string = null;
  selectedfleet?: Fleet = null;
  ownerid?: string = null;
  fleets: Fleet[] = [];
  working = false;
  options: any;
  overlays: any[] = [];
  map: google.maps.Map;
  followmaphideshow = false;
  followingnote = '';

  @ViewChild( FollowMapComponent )
  private followMapComponent: FollowMapComponent;

  private followersSubscription?: Subscription = null;

  constructor( private api:API,
               private router:Router,
               private accountguard:AccountGuard,
               private routerstore:Store<RouterStateUrl>,
               private followersstore:Store<FollowerState> ) {}

  ngOnInit(): void { this._ngOnInit(); }

  isShared( fleet:Fleet ) : boolean { return this._isShared( fleet ); }

  onFleet( fleet:Fleet ) { this._onFleet( fleet ); }
  onTransporterSelection( transporterid:string ) { this._onTransporterSelection( transporterid ); }
  onMapReady( event ) { this._onMapReady( event ); }
  onFindARide() {}
  onZoomMapToFleet() { this._onZoomMapToFleet(); }
  onRefresh() { this._onRefresh(); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.ownerid = this.accountguard.getOwnerId();

    this.options = {
      center: { lat:42.901688,lng:-78.492067 },
      zoom: 12,

      disableDoubleClickZoom: true,
      draggableCursor: 'crosshair',
      draggingCursor: 'hand',
      clickableIcons: false,

      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true
    };

    this.working = true;

    this.followersSubscription = this.followersstore.select( fromFollowers.selectAll ).subscribe(
      (followers:Follower[]) => { this.fromFollowersStore( followers ); },
      (error:Error) => { this.onError( error ); },
      () => {}
    );

    this.fetchFleets();
  }

  private _isShared( fleet:Fleet ) :boolean {
    if ( fleet.ownerid ) {
      return ( fleet.ownerid !== this.ownerid );
    }
    return false;
  }

  private _onFleet( fleet:Fleet ) {
    if ( this.selectedfleet === fleet ) {
      return;
    }
    if ( this.selectedfleet != null ) {
      this.followingnote = '';
      this.selectedfleet.state = 'inactive';
    }

    this.selectedfleet = null;
    this.followmaphideshow = false;

    setTimeout(() => {
      this.selectedfleet = fleet;
      this.selectedfleet.state = 'active';
      this.setFollowingNote();
      this.router.navigate([ 'follow' ],{ queryParams:{ fleetid:this.selectedfleet.id } } );
    },50 );

    setTimeout(() => { this.followmaphideshow = true; },500 );
  }

  private setFollowingNote() {
    this.followingnote = '';
    if ( !this.selectedfleet ) { return; }

    const me = this;

    if ( this.selectedfleet.ownerid !== this.ownerid ) {
      firebase.database().ref('users' )
        .child( this.selectedfleet.ownerid )
        .once( 'value' )
        .then( function( snapshot ) {
          const user = snapshot.val() as User;
          me.followingnote = 'Following: ' + capitalizeFirstLetter( user.firstname ) + ' ' + capitalizeFirstLetter( user.lastname );
        } );
    }
  }

  private _onTransporterSelection( transporterid:string ) {
    this.selectedtransporterid = null;
    setTimeout(() => { this.selectedtransporterid = transporterid; },100 );
  }

  private _onMapReady( event ) {
    this.map = event.map;
  }

  private _onZoomMapToFleet() {
    this.followMapComponent.onZoomMapToFleet();
  }

  private _onRefresh() {
    this.selectedfleet = null;
    this.selectedtransporterid = null;
    this.followmaphideshow = false;
    this.followingnote = '';
    this.fetchFleets();
  }

  private fromFollowersStore( followers:Follower[] ) {
    if ( !followers ) { return; }
    followers.forEach(follower => {
      this.api.getTransporter( follower.transporterid ).subscribe(transporter => {
        this.api.getFleet( transporter.fleetid ).subscribe(fleet => {
          this.append( fleet );
        } );
      } );
    } );
  }

  private fetchFleets() {
    this.working = true;

    this.fleets = [];

    this.api.getFleets( this.ownerid ).subscribe(
      ( fleet:Fleet ) => { this.append( fleet ); },
      (e:Error) => this.onError( e ),
      () => {
        this.working = false;
        this.assumeSelectedFleetFromRouterState();
      }
    );
  }

  private append( fleet:Fleet ) {
    const found: Fleet = this.fleets.find( f => (f.id === fleet.id) );
    if ( found ) {
      const indexOf = this.fleets.indexOf( found );
      this.fleets[ indexOf ] = fleet;
    } else {
      this.fleets.push( fleet );
    }
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

  private onError( error:Error ) {
    this.working = false;
    console.log( error );
  }

  private _ngOnDestroy(): void {
    this.followersSubscription.unsubscribe();
  }
}
