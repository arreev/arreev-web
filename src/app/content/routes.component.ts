
import { Component,OnInit,AfterViewInit,OnDestroy,ViewEncapsulation } from '@angular/core';
import * as AccountActions from '../store/account.actions';
import * as RouteActions from '../store/route.actions';
import { AccountState,RouteState } from '../app.state';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Route } from '../model/route';
import { API } from '../api.service';
import { Store } from '@ngrx/store';
import { isBlank } from '../util';

import { trigger,stagger,transition,query,style,animate,state } from '@angular/animations';

interface RouteVM extends Route
{
  state?: string;
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
    ] )
  ],
  encapsulation: ViewEncapsulation.None
})
export class RoutesComponent implements OnInit,AfterViewInit,OnDestroy
{
  selectedroute?: RouteVM = null;
  routes: RouteVM[] = [];
  showroutesnew = false;
  map: google.maps.Map;
  places: google.maps.places.PlacesService;
  options: any;
  overlays: any[];

  private routeSubscription: Subscription;
  private viewready = false;

  constructor( private api:API,private accountstore:Store<AccountState>,private routestore:Store<RouteState>,
      private confirmationService:ConfirmationService ) {}

  ngOnInit(): void {
    this.options = {
      center: { lat:42.901688,lng:-78.492067 },
      zoom: 12
    };

    this.overlays = [];

    this.selectedroute = null;
    this.viewready = false;

    this.fetch();
    this.routeSubscription = this.routestore.select('route' ).skip( 1 ).subscribe(r => { this.fromRouteStore( r ); } );
  }

  ngAfterViewInit(): void {
    this.viewready = true;
    this.defaultRoute();
  }

  onSearch( q ) {
    this.search( q );
  }

  onAddRoute() {
    this.showroutesnew = true;
  }

  onDeleteRoute() {
    const name = this.selectedroute.name;
    this.confirmationService.confirm({ message:`Are you sure you want to delete ${name} ?`,accept: () => { this.deleteRoute( this.selectedroute ); } } );
  }

  onAddWaypoint() {}

  onRefresh() {
    this.selectedroute = null;
    this.fetch();
  }

  onRoute( route:RouteVM ) {
    if ( this.selectedroute === route ) {
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
      }
    );
  }

  onFinishedRoutesNew() {
    this.showroutesnew = false;
    Observable.timer( 500 ).subscribe(
      n => { this.fetch(); }
    );
  }

  onMapReady( event ) {
    this.map = event.map;
    this.places = new google.maps.places.PlacesService( this.map );
  }

  onMapClick( event ) {}
  onOverlayClick( event ) {}

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  private fetch() {
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
      routevm.status = route.status;
      routevm.state = 'inactive';
    }

    return routevm;
  }

  private fromRouteStore( route:Route ) {
    for ( const r of this.routes ) {
      if ( r.id === route.id ) {
        r.name = route.name;
        r.type = route.type;
        r.category = route.category;
        r.description = route.description;
        r.imageURL = route.imageURL;
        break;
      }
    }
  }

  private deleteRoute( route:Route ) {
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        this.selectedroute = null;
        const _routes: Route[] = this.routes.filter( r => ( r.id !== route.id ) );
        this.routes = _routes;
        this.routestore.dispatch( new RouteActions.RouteDeleteAction( ownerid,route.id ) );
      }
    );
  }

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

  private onError( e ) { console.log(e ); }
}
