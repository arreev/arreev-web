
import {
  Component,OnInit,AfterViewInit,OnDestroy,ViewEncapsulation,AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
import * as AccountActions from '../store/account.actions';
import * as RouteActions from '../store/route.actions';
import { AccountState,RouteState } from '../app.state';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { dumpRoute,Route } from '../model/route';
import { Observable } from 'rxjs/Observable';
import { Waypoint } from '../model/waypoint';
import { API } from '../api.service';
import { Store } from '@ngrx/store';

import { capitalizeFirstLetter,distanceBetween,isBlank,isEmpty } from '../util';

import { trigger,stagger,transition,query,style,animate,state } from '@angular/animations';

interface RouteVM extends Route
{
  state?: string;
  begAddressMarker?: google.maps.Marker;
  endAddressMarker?: google.maps.Marker;
}

class ToggleableInfoWindow extends google.maps.InfoWindow
{
  private _opened = false;

  open( map?:google.maps.Map|google.maps.StreetViewPanorama, anchor?:google.maps.MVCObject ) : void {
    super.open( map,anchor );
    this._opened = true;
  }

  get opened() { return this._opened; }

  close() {
    super.close();
    this._opened = false;
  }
}

class WaypointTemplate
{
  routeid?: string;
  index?: number;
  name?: string = null;
  type?: string = null;
  address?: string = null;
  latitude?: number = null;
  longitude?: number = null;

  constructor( routeid:string,index:number ) {
    if ( !routeid || !index ) {
      throw new Error( 'bad template: ' + routeid + ' ' + index );
    }
    this.routeid = routeid;
    this.index = index;
  }
}

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.css'],
  animations: [
    trigger('grid-animation',[
      transition('* => *',[
        query(':enter',[
          style({ opacity:0 } ),stagger(100,animate('.5s',style({ opacity:.75 } ) ) )
        ],{ optional:true } )
      ] )
    ] ),
    trigger('route-state',[
      state('inactive',style({ opacity:'.75',transform:'scale(1)' } ) ),
      state('active',style({ opacity:'1',transform:'scale(1.025)' } ) ),
      transition('inactive => active',animate('100ms ease-in' ) ),
      transition('active => inactive',animate('100ms ease-out' ) )
    ] ),
    trigger('route-edit',[
      state('in',style({ transform:'scale(1)' } ) ),
      transition('void => *',[ style({ transform:'scale(0)' } ),animate('250ms ease-in' ) ] ),
    ] ),
    trigger('route-map',[
      state('in',style({ opacity:1 } ) ),
      transition('void => *',[ style({ opacity:0 } ),animate('1250ms ease-in' ) ] ),
    ] )
  ],
  encapsulation: ViewEncapsulation.None
})
/**
 * NOTE: in /node_modules/primeng/components/chips/chips.js - comment out backspace delete code:
 *     Chips.prototype.onKeydown
 *     case 8:
 */
export class RoutesComponent implements OnInit,AfterViewInit,AfterViewChecked,OnDestroy
{
  selectedroute?: RouteVM = null;
  routes: RouteVM[] = [];
  waypoints: Waypoint[] = [];

  map: google.maps.Map;
  places: google.maps.places.PlacesService;
  options: any;
  overlays: any[];

  waypointTemplate?: WaypointTemplate = null;
  showroutesnew = false;
  showwaypointnew = false;

  showwaypointeditid?: string = null;
  showwaypointedit = false;

  private readonly _uichange = new BehaviorSubject<void>( null );
  private readonly uichange:Observable<void> = this._uichange.asObservable();
  private uiSubscription: Subscription;

  private routeSubscription: Subscription;
  private viewready = false;

  private chipDraggedWaypoint?: Waypoint = null;

  private infoHTML = `
      <div>
        <p style="font-size:1em;font-weight:bold;">$name</p>
        <p style="font-size:.9em;color:cornflowerblue;">$description</p>
      </div>
    `;

  constructor( private changedetector:ChangeDetectorRef,private api:API,private accountstore:Store<AccountState>,private routestore:Store<RouteState>,
      private confirmationService:ConfirmationService ) {}

  ngOnInit(): void {
    /*
     * https://developers.google.com/maps/documentation/javascript/controls#Adding_Controls_to_the_Map
     * https://developers.google.com/maps/documentation/javascript/reference/3.exp/
     * https://developers.google.com/maps/documentation/javascript/reference/3.exp/map#MapOptions.draggableCursor
     */
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

    this.overlays = [];
    this.waypoints = [];

    this.selectedroute = null;
    this.viewready = false;

    this.fetchRoutes();
    this.routeSubscription = this.routestore.select('route' ).skip( 1 ).subscribe(r => { this.fromRouteStore( r ); } );
  }

  ngAfterViewInit(): void {
    this.viewready = true;
    this.defaultRoute();
    this.subscribeUI();
  }

  ngAfterViewChecked(): void {}

  onSearch( q ) {
    this.search( q );
  }

  isEndpoint( w:Waypoint ) : boolean {
    return ( this.waypoints.indexOf( w ) === (this.waypoints.length - 1) );
  }

  onRouteFieldsChanged() {
    this._uichange.next(null );
  }

  onAddWaypoint() {
    this.waypointTemplate = new WaypointTemplate( this.selectedroute.id,this.waypoints.length );
    this.showwaypointnew = true;
    this.changedetector.detectChanges();
  }

  onAddWaypointFromChips( name:string ) {
    this.waypoints = this.waypoints.slice( 0,this.waypoints.length-1 ); // discard what was just added by the p-chips component
    this.waypointTemplate = new WaypointTemplate( this.selectedroute.id,this.waypoints.length );
    this.waypointTemplate.name = name;
    this.showwaypointnew = true;
    this.changedetector.detectChanges();
  }

  onRemoveWaypointFromChips( waypoint:Waypoint ) {
    this.confirmationService.confirm({ message:`Are you sure you want to delete ${name} ?`,accept: () => { this.deleteWaypoint( waypoint ); } } );
  }

  onWaypoint( waypoint:Waypoint ) {
    this.focusWaypoint( waypoint );
  }

  onEditWaypoint( waypoint:Waypoint ) {
    this.showwaypointeditid = waypoint.id;
    this.showwaypointedit = true;
    this.changedetector.detectChanges();
  }

  onFinishedWaypointNew( w:Waypoint ) {
    this.waypointTemplate = null;
    this.showwaypointnew = false;

    this.waypoints.push( w );
    this.reindex( this.waypoints );
    this.markers();
  }

  onFinishedWaypointEdit() {
    this.showwaypointedit = false;
    this.showwaypointeditid = null;
  }

  onBegAddress( address:string ) {}
  onEndAddress( address:string ) {}

  onBlur() { this._uichange.next(null ); }
  update() { this._uichange.next(null ); }

  onAddRoute() {
    this.showroutesnew = true;
  }

  onDeleteRoute() {
    const name = this.selectedroute.name;
    this.confirmationService.confirm({ message:`Are you sure you want to delete ${name} ?`,accept: () => { this.deleteRoute( this.selectedroute ); } } );
  }

  onRefresh() {
    this.selectedroute = null;
    this.fetchRoutes();
  }

  onRoute( route:RouteVM ) {
    if ( this.selectedroute === route ) {
      this.zoomMapToRoute( route );
      return;
    }
    if ( this.selectedroute != null ) {
      this.selectedroute.state = 'inactive';
    }
    this.selectedroute = null;
    Observable.timer( 100 ).subscribe(
      n => {
        this.selectedroute = route;
        this.selectedroute.state = 'active';
        this.waypoints = [];
        this.routestore.dispatch( new RouteActions.RouteFetchAction( this.selectedroute.id ) );
      }
    );
  }

  onFinishedRoutesNew() {
    this.showroutesnew = false;
    Observable.timer( 500 ).subscribe(
      n => { this.fetchRoutes(); }
    );
  }

  /*
   * https://developers.google.com/maps/documentation/javascript/events
   */
  mapReady( event ) {
    this.map = event.map;
    this.map.addListener('dblclick',(e) => { this.mapDblClick( e ); } );
    this.map.addListener('rightclick',(e) => { this.mapRightClick( e ); } );
    this.places = new google.maps.places.PlacesService( this.map );
  }

  mapClick( event ) {}

  mapDblClick( event ) {
    this.showNewFromPlace( event.latLng.lat(),event.latLng.lng() );
  }

  mapRightClick( event ) {
    this.waypointTemplate = new WaypointTemplate( this.selectedroute.id,this.waypoints.length );
    this.waypointTemplate.latitude = event.latLng.lat();
    this.waypointTemplate.longitude = event.latLng.lng();
    console.log( this.waypointTemplate );
    this.showwaypointnew = true;
    this.changedetector.detectChanges();
  }

  overlayClick( event ) {
    const marker: google.maps.Marker = event.overlay;
    this.toggleInfoWindow( marker );
  }

  overlayDragEnd( event ) {}

  chipDragStart( event,waypoint:Waypoint ) {
    this.chipDraggedWaypoint = waypoint;
  }
  chipDrag( event,waypoint:Waypoint ) {}
  chipDragEnd( event,waypoint:Waypoint ) {
    event.target.style.border = '1px solid #7788CC';
    this.chipDraggedWaypoint = null;
  }

  chipDragEnter( event,waypoint:Waypoint ) {
    if ( waypoint === this.chipDraggedWaypoint ) {
      event.target.style.border = '1px solid #FF5588';
      if ( event instanceof DragEvent ) {
        // TODO: can i disallow ?
      }
    }
  }
  chipDragLeave( event,waypoint:Waypoint ) {
    event.target.style.border = '1px solid #7788CC';
  }
  chipDrop( event,waypoint:Waypoint ) {
    if ( waypoint !== this.chipDraggedWaypoint ) {
      const w1 = waypoint;
      const w2 = this.chipDraggedWaypoint;

      const index = w1.index;
      w1.index = w2.index;
      w2.index = index;

      this.updateWaypoint( w1 );
      this.updateWaypoint( w2 );

      const _waypoints = this.waypoints.filter(w => true );
      _waypoints.sort((wA,wB) => (wA.index - wB.index) );
      setTimeout(() => {
        this.waypoints = _waypoints;
        this.reconnect();
        },100 );
    }
  }

  ngOnDestroy(): void {
    this.map = null;

    this.unSubscribeUI();
    this.routeSubscription.unsubscribe();
  }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uichange.skip( 1 ).debounceTime( 1500 ).subscribe(() => { this.toRouteStore(); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription != null ) {
      this.uiSubscription.unsubscribe();
    }
  }

  private fetchRoutes() {
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        if ( !isBlank( a.id ) ) {
          this.getRoutes( a.id,0,100 );
        } else {
          let accountSubscription = null;
          accountSubscription = this.accountstore.select('account' ).subscribe(
            aa => { this.getRoutes( aa.id,0,100 ); },
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
  private getRoutes( ownerid:string,start:number,count:number ) {
    const _routes: Route[] = [];
    this.api.getRoutes( ownerid ).subscribe(
      r => { _routes.push( this.asRouteVM( r ) ); },
      e => { this.onError( e ); },
      () => {
        this.routes = _routes;
        this.defaultRoute();
      }
    );
  }

  private defaultRoute() {
    if ( !this.viewready || (this.selectedroute != null) ) { return; }

    const me = this;
    setTimeout(() => {
      if ( me.routes.length > 0 ) { me.onRoute( me.routes[0] ); }
      },500 );
  }

  private asRouteVM( route:Route ) {
    let routevm = null;

    if ( route != null ) {
      routevm = {};
      routevm.id = route.id;
      routevm.name = route.name;
      routevm.type = route.type;
      routevm.category = route.category;
      routevm.description = route.description;
      routevm.imageURL = route.imageURL;
      routevm.thumbnailURL = route.thumbnailURL;
      routevm.begAddress = route.begAddress;
      routevm.endAddress = route.endAddress;
      routevm.status = route.status;
      routevm.state = 'inactive';
    }

    return routevm;
  }

  private toRouteStore() {
    console.log( 'RoutesComponent.toRouteStore' );

    const route = {
      id: this.selectedroute.id,
      name: this.selectedroute.name,
      type: this.selectedroute.type,
      category: this.selectedroute.category,
      description: this.selectedroute.description,
      imageURL: this.selectedroute.imageURL,
      thumbnailURL: this.selectedroute.thumbnailURL,
      begAddress: this.selectedroute.begAddress,
      endAddress: this.selectedroute.endAddress,
      status: this.selectedroute.status
    };

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        this.routestore.dispatch( new RouteActions.RoutePostAction( a.id,route ) );
      }
    );
  }

  private fromRouteStore( route:Route ) {
    console.log( 'RoutesComponent.fromRouteStore ' + dumpRoute( route ) );

    this.unSubscribeUI();

    for ( const r of this.routes ) {
      if ( r.id === route.id ) {
        r.name = route.name;
        r.type = route.type;
        r.category = route.category;
        r.description = route.description;
        r.imageURL = route.imageURL;
        r.begAddress = route.begAddress;
        r.endAddress = route.endAddress;
        break;
      }
    }

    if ( (this.selectedroute !== null) && (this.selectedroute.id === route.id) ) {
      this.fetchWaypoints( this.selectedroute );
    }

    this.subscribeUI();
  }

  private deleteRoute( route:Route ) {
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        this.selectedroute = null;
        const _routes: Route[] = this.routes.filter(r => ( r.id !== route.id ) );
        this.routes = _routes;
        this.routestore.dispatch( new RouteActions.RouteDeleteAction( ownerid,route.id ) );
      }
    );
  }

  private fetchWaypoints( route:Route ) {
    const _waypoints: Waypoint [] = [];

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        const routeid = route.id;
        this.api.getWaypoints( ownerid,routeid ).subscribe(
          w => { _waypoints.push( w ); },
          e => { this.onError( e ); },
          () => {
            _waypoints.sort(( w1,w2 ) => {
              return w1.index - ( w2.index );
            } );
            this.reindex( _waypoints );
            this.waypoints = _waypoints;
            this.markers();
            this.zoomMapToRoute( route );
          }
        );
      }
    );
  }

  private reindex( waypoints:Waypoint [] ) {
    let index = 0;
    for ( const wp of waypoints ) {
      if ( wp.index !== index ) {
        wp.index =  index;
        this.updateWaypoint( wp );
      }
      index++;
    }
  }

  /*
   * https://developers.google.com/maps/documentation/javascript/markers
   * https://developers.google.com/maps/documentation/javascript/examples/overlay-popup
   */
  private markers() {
    const _overlays: any[] = [];

    let prev: google.maps.Marker = null;
    for ( const w of this.waypoints ) {
      const marker = new google.maps.Marker();
      marker.setPosition( { lat:w.latitude,lng:w.longitude } );
      marker.setAnimation( google.maps.Animation.DROP );
      marker.setIcon( { url:'/assets/marker.png' } );
      marker.setClickable( true );
      // marker.setTitle( w.name );
      // marker.setLabel( w.description );

      const c = this.infoHTML
        .replace('$name',w.name )
        .replace('$description',w.description );
      const infowindow = new ToggleableInfoWindow();
      infowindow.setContent( c );
      infowindow.setZIndex( 1 );
      infowindow.open( this.map,marker );
      marker.setValues( { 'infowindow':infowindow } );

      _overlays.push( marker );

      if ( prev != null ) {
        const line = new google.maps.Polyline( { path: [ prev.getPosition(),marker.getPosition() ], geodesic: true, strokeColor: '#0088CC', strokeOpacity: 0.5, strokeWeight: 2 } );
        _overlays.push( line );
      }
      prev = marker;
    }

    this.overlays = _overlays;
  }

  private reconnect() {
    const _overlays = this.overlays.filter(o => !(o instanceof google.maps.Polyline) );
    let prev: Waypoint = null;
    for ( const w of this.waypoints ) {
      if ( prev != null ) {
        const p1 = { lat:prev.latitude,lng:prev.longitude };
        const p2 = { lat:w.latitude,lng:w.longitude };
        const line = new google.maps.Polyline( { path: [ p1,p2 ], geodesic: true, strokeColor: '#0088CC', strokeOpacity: 0.5, strokeWeight: 2 } );
        _overlays.push( line );
      }
      prev = w;
    }
    this.overlays = _overlays;
  }

  private zoomMapToRoute( route:Route ) {
    setTimeout(() => { this.zoomMapToRouteActual( route ); },250 );
  }

  private zoomMapToRouteActual( route:Route ) {
    const bounds = new google.maps.LatLngBounds();
    this.waypoints.forEach(w => {
      bounds.extend( { lat:w.latitude,lng:w.longitude } );
    } );
    setTimeout(() => { this.map.fitBounds( bounds ); },250 );
  }

  private updateWaypoint( waypoint:Waypoint ) {
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        this.api.postWaypoint( ownerid,waypoint.routeid,waypoint ).subscribe(
          w => {
            // console.log( 'updated waypoint ' + waypoint.name + ' ' + waypoint.index );
            },
          e => { this.onError( e ); },
          () => {}
        );
      }
    );
  }

  private deleteWaypoint( waypoint:Waypoint ) {
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        this.api.deleteWaypoint( ownerid,waypoint.id ).subscribe(
          b => {
            if ( b === true ) {
              const _waypoints: Waypoint[] = this.waypoints.filter(w => ( w.id !== waypoint.id ) );
              this.reindex( _waypoints );
              this.waypoints = _waypoints;
              this.markers();
            }
          },
          e => { this.onError( e ); },
          () => {}
        );
      }
    );
  }

  /*
   * https://developers.google.com/maps/documentation/javascript/places#place_search_requests
   */
  private search( q:string ) {
    const request = {
      query: q
    };

    this.places.textSearch( request,( results,status ) => {
      if ( status === google.maps.places.PlacesServiceStatus.OK ) {
        const bounds = new google.maps.LatLngBounds();
        const me = this;
        for ( const r of results ) {
          bounds.extend( r.geometry.location );
        }
        setTimeout(() => { me.map.fitBounds( bounds ); me.map.setZoom( 12 ); },100 );
      }
    } );
  }

  /*
   * https://developers.google.com/maps/documentation/javascript/places#place_search_requests
   */
  private showNewFromPlace( latitude:number,longitude:number ) {
    const request = {
      location: { lat:latitude,lng:longitude },
      radius: 25,
    };

    const origin = new google.maps.LatLng( latitude,longitude,false );
    const me = this;

    this.places.nearbySearch( request,( results,status ) => {
      this.waypointTemplate = new WaypointTemplate( this.selectedroute.id,this.waypoints.length );
      me.waypointTemplate.latitude = latitude;
      me.waypointTemplate.longitude = longitude;

      if ( status === google.maps.places.PlacesServiceStatus.OK ) {
        let distance = 6371005;
        for ( const r of results ) {
          const d = distanceBetween( origin,r.geometry.location );
          if ( d < distance ) {
            me.waypointTemplate.name = r.name;
            for ( const t of r.types ) { me.waypointTemplate.type = capitalizeFirstLetter( t ); }
            me.waypointTemplate.address = r.vicinity;
            me.waypointTemplate.latitude = r.geometry.location.lat();
            me.waypointTemplate.longitude = r.geometry.location.lng();
            distance = d;
          }
        }
      }

      me.showwaypointnew = true;
      me.changedetector.detectChanges();
    } );
  }

  private focusWaypoint( waypoint:Waypoint ) {
    const bounds = new google.maps.LatLngBounds();
    bounds.extend( { lat:waypoint.latitude,lng:waypoint.longitude } );
    const me = this;
    setTimeout(() => { me.map.fitBounds( bounds ); me.map.setZoom( 17 ); },100 );
  }

  private toggleInfoWindow( marker:google.maps.Marker ) {
    const infowindow: ToggleableInfoWindow = marker.get( 'infowindow' );

    if ( infowindow.opened ) {
      if ( infowindow.getZIndex() === 1 ) {
        this.flattenInfoWindows();
        infowindow.setZIndex( 100 );
      } else {
        infowindow.close();
      }
    } else {
      infowindow.open( this.map,marker );
    }
  }

  private flattenInfoWindows() {
    this.overlays.forEach(o => {
      if ( o instanceof google.maps.Marker ) {
        o.get( 'infowindow' ).setZIndex( 1 );
      }
    } );
  }

  private onError( e ) { console.log(e ); }
}
