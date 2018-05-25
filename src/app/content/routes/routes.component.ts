
import { AfterViewInit,ChangeDetectorRef,Component,OnDestroy,OnInit,ViewChild,ViewEncapsulation } from '@angular/core';
import { capitalizeFirstLetter,distanceBetween,isBlank } from '../../util';
import { RouteWaypointsComponent } from './route-waypoints.component';
import { RouterStateUrl } from '../../store/router.reducer';
import { RouteMapComponent } from './route-map.component';
import * as RouteActions from '../../store/route.actions';
import * as fromRouter from '../../store/router.reducer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AccountGuard } from '../../accountguard';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { MapService } from '../../map.service';
import { RouteState } from '../../app.state';
import { Route } from '../../model/route';
import { Router } from '@angular/router';
import { API } from '../../api.service';
import { Store } from '@ngrx/store';

import {
  activeStateAnimation,fadeInAnimation,gridAnimation,hideShowAnimation,
  scaleInAnimation
} from '../../app.animations';
import { RouterReducerState } from '@ngrx/router-store';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.css'],
  animations: [ gridAnimation,scaleInAnimation,fadeInAnimation,activeStateAnimation,hideShowAnimation ],
  encapsulation: ViewEncapsulation.Emulated
})
export class RoutesComponent implements OnInit,AfterViewInit,OnDestroy
{
  selectedroute?: Route = null;
  editroute?: Route = null;
  routes: Route[] = [];
  working = false;
  workingassignments = false;
  ownerid?: string;
  showroutenew = false;
  showassignmentnew = false;
  refreshassignments = false;
  options: any;
  overlays: any[] = [];
  map: google.maps.Map;
  places: google.maps.places.PlacesService;
  maphideshow = false;

  private readonly uisubject = new BehaviorSubject<void>( null );
  private uiSubscription: Subscription;

  private routeSubscription?: Subscription;

  @ViewChild( RouteWaypointsComponent )
  private routeWaypointsComponent: RouteWaypointsComponent;

  @ViewChild( RouteMapComponent )
  private routeMapComponent: RouteMapComponent;

  private markersSubsciption: Subscription;

  constructor( private api:API,
               private router:Router,
               private mapservice:MapService,
               private accountguard:AccountGuard,
               private routestore:Store<RouteState>,
               private routerstore:Store<RouterStateUrl>,
               private changedetector:ChangeDetectorRef,private confirmationService:ConfirmationService ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngAfterViewInit(): void { this._ngAfterViewInit(); }

  onSearch( search:string ) { this._onSearch( search ); }
  onAddRoute() { this._onAddRoute(); }
  onAddWaypoint() { this._onAddWaypoint(); }
  onAddAssignment() { this._onAddAssignment(); }
  onZoomMapToRoute() { this._onZoomMapToRoute(); }
  onToggleAllInfoWindows() { this._onToggleAllInfoWindows(); }
  onRefresh() { this._onRefresh(); }

  onRoute( route:Route ) { this._onRoute( route ); }
  onDeleteRoute( route:Route ) { this._onDeleteRoute( route ); }

  onWorkingAssignments( w:boolean ) { this._onWorkingAssignments( w ); }
  onFinishedRouteNew() { this._onFinishedRouteNew(); }
  onFinishedAssignmentNew() { this._onFinishedAssignmentNew(); }

  onMapReady( event ) { this._onMapReady( event ); }
  onOverlayClick( event ) { this._onOverlayClick( event ); }

  cardBorder( route:Route ) : string { return this._cardBorder( route ); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.ownerid = this.accountguard.getOwnerId();

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
    this.markersSubsciption = this.mapservice.markers$.subscribe( (markers:any[]) => {
      this.overlays = markers;
      this.changedetector.detectChanges();
    } );

    this.routeSubscription = this.routestore.select('route' ).skip( 1 ).subscribe(
      (route:Route) => { this.fromRouteStore( route ); },
      (error:Error) => { this.onError( error ); },
      () => { this.working = false; }
    );

    this.fetchRoutes();
  }

  private _ngAfterViewInit(): void {}

  private _onSearch( search:string ) {
    this.working = true;

    const request:google.maps.places.TextSearchRequest = {
      query: search
    };
    this.places.textSearch( request,( results,status ) => {
      if ( status === google.maps.places.PlacesServiceStatus.OK ) {
        for ( const r of results ) {
          this.working = false;
          this.map.setCenter( r.geometry.location );
          this.map.setZoom( 15 );
        }
      }
    } );
  }

  private _onAddRoute() {
    this.showroutenew = true;
  }

  private _onAddWaypoint() {
    this.routeWaypointsComponent.doAddWaypoint();
  }

  private _onAddAssignment() {
    this.showassignmentnew = true;
  }

  private _onZoomMapToRoute() {
    this.routeMapComponent.zoomToRoute();
  }

  private _onToggleAllInfoWindows() {
    this.routeMapComponent.toggleAllInfoWindows();
  }

  private _onRefresh() {
    this.editroute = null;
    this.selectedroute = null;
    this.routes = [];
    setTimeout(() => this.fetchRoutes(),100 );
  }

  private _onRoute( route:Route ) {
    if ( this.selectedroute === route ) {
      return;
    }
    if ( this.selectedroute != null ) {
      this.selectedroute.state = 'inactive';
    }
    this.selectedroute = route;
    this.selectedroute.state = 'active';
    this.working = true;
    this.routestore.dispatch( new RouteActions.RouteFetchAction( this.selectedroute.id ) );
    this.router.navigate( [ 'routes' ],{ queryParams:{ routeid:this.selectedroute.id } } );

    this.maphideshow = false;
    this.editroute = null;
    setTimeout(() => { this.editroute = this.selectedroute; },100 );
    setTimeout(() => { this.maphideshow = true; },250 );
  }

  private _onDeleteRoute( route:Route ) {
    this.confirmationService.confirm({
      header:route.name,
      message:'Are you sure you want to delete ?',
      accept: () => {
        this.working = true;
        this.editroute = null;
        this.selectedroute = null;
        this.routes = this.routes.filter(r => (r.id !== route.id) );
        this.routestore.dispatch( new RouteActions.RouteDeleteAction( this.ownerid,route.id ) );
      }
    } );
  }

  private _onWorkingAssignments( w:boolean ) { this.workingassignments = w; }

  private _onFinishedRouteNew() {
    this.showroutenew = false;
    this._onRefresh();
  }

  private _onFinishedAssignmentNew() {
    this.showassignmentnew = false;
    this.refreshassignments = false;
    setTimeout(() => { this.refreshassignments = true; },100 );
  }

  private _onMapReady( event ) {
    this.map = event.map;
    this.places = new google.maps.places.PlacesService( this.map );

    /*
     * https://developers.google.com/maps/documentation/javascript/events
     */
    this.map.addListener('dblclick',(e) => { this.dblclick( e ); } );
    this.map.addListener('rightclick',(e) => { this.rightclick( e ); } );
  }

  private dblclick( e ) {
    this.showNewFromPlace( e.latLng.lat(),e.latLng.lng() );
  }

  /*
   * https://developers.google.com/maps/documentation/javascript/places#place_search_requests
   */
  private showNewFromPlace( latitude:number,longitude:number ) {
    this.working = true;

    const request = {
      location: { lat:latitude,lng:longitude },
      radius: 25,
    };

    const origin = new google.maps.LatLng( latitude,longitude,false );
    const me = this;

    const where = {
      name: '',
      address: '',
      latitude: 0.0,
      longitude: 0.0
    };

    this.places.nearbySearch( request,( results,status ) => {
      if ( status === google.maps.places.PlacesServiceStatus.OK ) {
        let distance = 6371005;
        for ( const r of results ) {
          const d = distanceBetween( origin,r.geometry.location );
          if ( d < distance ) {
            where.name = r.name;
            where.address = r.vicinity;
            where.latitude = r.geometry.location.lat();
            where.longitude = r.geometry.location.lng();
            distance = d;
          }
        }
        this.working = false;
        this.routeWaypointsComponent.doAddWaypointFor( where.name,where.address,where.latitude,where.longitude );
      }
    } );
  }

  private rightclick( e ) {}

  private _onOverlayClick( event ) {
    this.routeMapComponent.overlayClick( event );
  }

  private _cardBorder( route:Route ) : string { return( this.selectedroute === route ? '2px solid #9090C0' : '' ); }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uisubject.asObservable().skip( 1 ).debounceTime( 1500 ).subscribe(() => { this.toRouteStore( this.selectedroute ); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription ) {
      this.uiSubscription.unsubscribe();
    }
  }

  private fetchRoutes() {
    this.working = true;

    const _routes: Route[] = [];
    this.api.getRoutes( this.ownerid ).subscribe(
      (route:Route) => { _routes.push( route ); },
      (error:Error) => { this.onError( error ); },
      () => {
        this.working = false;
        this.routes = _routes;
        this.assumeSelectedRouteFromRouterState();
      }
    );
  }

  private assumeSelectedRouteFromRouterState() {
    this.routerstore.select( fromRouter.getRouterState ).take( 1 ).subscribe(
      (rs:RouterReducerState<RouterStateUrl>) => {
        const routeid = rs.state.queryParams[ 'routeid' ];
        if ( routeid ) {
          const route:Route = this.routes.find( (r:Route) => (r.id === routeid) );
          if ( route ) {
            this.onRoute( route );
          }
        }
      }
    );
  }

  private toRouteStore( route:Route ) {
    // console.log( 'RoutesComponent.toRouteStore ' + route.id );

    const partial:Route = {
      name: route.name,
      type: route.type,
      category: route.category,
      description: route.description
    };
    this.routestore.dispatch( new RouteActions.RoutePostAction( this.ownerid,partial ) );
  }

  private fromRouteStore( route:Route ) {
    // console.log( 'RoutesComponent.fromRouteStore ' + route.id );

    this.unSubscribeUI();
      const found = this.routes.find((r:Route) => (r.id === route.id) );
      if ( found ) {
        found.id = route.id;
        found.name = route.name;
        found.type = route.type;
        found.category = route.category;
        found.description = route.description;
        found.imageURL = route.imageURL;
        found.thumbnailURL = route.thumbnailURL;
        found.begAddress = route.begAddress;
        found.endAddress = route.endAddress;
        found.status = route.status;
      }
      this.working = false;
    this.subscribeUI();
  }

  private onError( error:Error ) {
    this.working = false;
    console.log( error );
  }

  private _ngOnDestroy(): void {
    this.unSubscribeUI();

    if ( this.markersSubsciption != null ) {
      this.markersSubsciption.unsubscribe();
    }

    if ( this.routeSubscription != null ) {
      this.routeSubscription.unsubscribe();
    }
  }
}

