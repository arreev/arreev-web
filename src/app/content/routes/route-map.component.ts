
import { ToggleableInfoWindow } from '../../view/toggleableinfowindow';
import { Component,Input,OnDestroy,OnInit } from '@angular/core';
import * as fromWaypoints from '../../store/waypoints.reducer';
import { Subscription } from 'rxjs/Subscription';
import { WaypointState } from '../../app.state';
import { Waypoint } from '../../model/waypoint';
import { MapService } from '../../map.service';
import { Route } from '../../model/route';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-route-map',
  templateUrl: './route-map.component.html',
  styleUrls: ['./route-map.component.css'],
})
export class RouteMapComponent implements OnInit,OnDestroy
{
  @Input() ownerid: string;
  @Input() route: Route;
  @Input() map: google.maps.Map;
  @Input() places: google.maps.places.PlacesService;

  selectedwaypoint?: Waypoint = null;
  showwaypointedit = false;

  private waypointAllSubscription: Subscription;
  private waypointSubscription: Subscription;
  private waypoints: Waypoint [] = [];

  private infoHTML = `
      <div>
        <p style="font-size:1em;font-weight:bold;">$name</p>
        <p style="font-size:.9em;color:cornflowerblue;max-width:100px;text-overflow:ellipsis;overflow-x:hidden;white-space:nowrap;">$description</p>
      </div>
    `;

  constructor( private mapservice:MapService,
               private waypointstore:Store<WaypointState>,
               private waypointsstore:Store<fromWaypoints.State> ) {}

  ngOnInit(): void { this._ngOnInit(); }

  zoomToRoute() { this._zoomToRoute(); }
  toggleAllInfoWindows() { this._toggleAllInfoWindows(); }
  overlayClick( event ) { this._overlayClick( event ); }

  onFinishedWaypointEdit() { this._onFinishedWaypointEdit(); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.waypointSubscription = this.waypointstore.select('waypoint' ).subscribe( (waypoint:Waypoint) => { this.fromWaypointStore( waypoint ); } );

    this.waypointAllSubscription = this.waypointsstore.select( fromWaypoints.selectAll ).subscribe(
      (waypoints:Waypoint[]) => { this.fromWaypointsStore( waypoints ); }
    );
  }

  private _zoomToRoute() {
    this.zoomMapToRoute( this.route );
  }

  private _toggleAllInfoWindows() {
    let someopened = false;

    const markers = this.mapservice.getMarkers();

    markers.filter(( o ) => (o instanceof google.maps.Marker) ).forEach(m => {
      const tiw : ToggleableInfoWindow = m.get( 'infowindow' );
      if ( tiw.opened ) {
        someopened = true;
      }
    } );

    markers.filter(( o ) => (o instanceof google.maps.Marker) ).forEach( m => {
      const tiw : ToggleableInfoWindow = m.get( 'infowindow' );
      if ( !someopened ) {
        tiw.open( this.map,m );
      } else {
        tiw.close();
      }
    } );
  }

  private _overlayClick( event ) {
    const waypointid = event.overlay.get( 'waypointid' );
    this.selectedwaypoint = this.waypoints.find((w:Waypoint) => (w.id === waypointid) );
    this.showwaypointedit = true;
  }

  private _onFinishedWaypointEdit() {
    this.showwaypointedit = false;
  }

  private fromWaypointsStore( waypoints:Waypoint[] ) {
    this.waypoints = waypoints;
    this.markers();
    setTimeout(() => { this.zoomMapToRoute( this.route ); },250 );
  }

  private fromWaypointStore( waypoint:Waypoint ) {
    this.focusWaypoint( waypoint );
  }

  private focusWaypoint( waypoint:Waypoint ) {
    const location = { lat:waypoint.latitude,lng:waypoint.longitude };
    const me = this;
    setTimeout(() => {
      me.map.setCenter( location );
      me.map.setZoom( 17 );
    },100 );
  }

  /*
   * https://developers.google.com/maps/documentation/javascript/markers
   * https://developers.google.com/maps/documentation/javascript/examples/overlay-popup
   */
  private markers() {
    this.mapservice.clearAll();

    let prev: google.maps.Marker = null;
    for ( const w of this.waypoints ) {
      const marker = new google.maps.Marker();
      marker.setPosition( { lat:w.latitude,lng:w.longitude } );
      marker.setAnimation( google.maps.Animation.DROP );
      marker.setIcon( { url:'/assets/marker.png' } );
      marker.setClickable( true );
      marker.set( 'name',w.name );

      const c = this.infoHTML
        .replace('$name',w.name )
        .replace('$description',w.description );
      const infowindow = new ToggleableInfoWindow();
      infowindow.setContent( c );
      infowindow.setZIndex( 1 );
      infowindow.setOptions( { disableAutoPan:true } );
      infowindow.open( this.map,marker );
      marker.setValues( { 'waypointid':w.id,'infowindow':infowindow } );

      this.mapservice.addMarker( marker,this.map );

      if ( prev != null ) {
        const line = new google.maps.Polyline( { path: [ prev.getPosition(),marker.getPosition() ], geodesic: true, strokeColor: '#0088CC', strokeOpacity: 0.5, strokeWeight: 2 } );
        line.set( 'name',w.name );
        this.mapservice.addMarker( line,this.map );
      }
      prev = marker;
    }
  }

  private zoomMapToRoute( route:Route ) {
    const bounds = new google.maps.LatLngBounds();
    this.waypoints.forEach(w => {
      if ( (w.latitude !== 0) && (w.longitude !== 0) ) {
        bounds.extend({ lat:w.latitude,lng:w.longitude } );
      }
    } );
    this.map.fitBounds( bounds );
  }


  private _ngOnDestroy(): void {
    this.waypointAllSubscription.unsubscribe();
    this.mapservice.clearAll();
  }
}
