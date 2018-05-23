
import { Component,OnInit,OnDestroy,ViewEncapsulation,ViewChild,ChangeDetectorRef } from '@angular/core';
import { FollowMapComponent } from './follow-map.component';
import { AccountGuard } from '../../accountguard';
import { Fleet } from '../../model/fleet';
import { API } from '../../api.service';

import {
  activeStateAnimation,fadeInAnimation,gridAnimation,hideShowAnimation,
  scaleInAnimation
} from '../../app.animations';

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

  @ViewChild( FollowMapComponent )
  private followMapComponent: FollowMapComponent;

  constructor( private api:API,
               private accountguard:AccountGuard,
               private changedetector:ChangeDetectorRef) {}

  ngOnInit(): void { this._ngOnInit(); }

  cardBorder( fleet:Fleet ) { this._cardBorder( fleet ); }
  onFleet( fleet:Fleet ) { this._onFleet( fleet ); }
  onTransporterSelection( transporterid:string ) { this._onTransporterSelection( transporterid ); }
  onMapReady( event ) { this._onMapReady( event ); }
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

    this.fetchFleets();
  }

  private _cardBorder( fleet:Fleet ) : string { return( this.selectedfleet === fleet ? '2px solid #9090C0' : '' ); }

  private _onFleet( fleet:Fleet ) {
    if ( this.selectedfleet === fleet ) {
      return;
    }
    if ( this.selectedfleet != null ) {
      this.selectedfleet.state = 'inactive';
    }

    this.selectedfleet = null;
    this.followmaphideshow = false;

    setTimeout(() => {
      this.selectedfleet = fleet;
      this.selectedfleet.state = 'active';
    },50 );

    setTimeout(() => { this.followmaphideshow = true; },500 );
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
    this.fetchFleets();
  }

  private fetchFleets() {
    this.working = true;

    const _fleets: Fleet[] = [];
    this.api.getFleets( this.ownerid ).subscribe(
      (f:Fleet) => { _fleets.push( f ); },
      (e:Error) => this.onError( e ),
      () => {
        this.working = false;
        this.fleets = _fleets;
      }
    );
  }

  private onError( error:Error ) {
    this.working = false;
    console.log( error );
  }

  private _ngOnDestroy(): void {}
}
