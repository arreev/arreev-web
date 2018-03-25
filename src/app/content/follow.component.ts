
import { Component,OnInit,OnDestroy,ViewEncapsulation,AfterViewInit } from '@angular/core';
import { AccountState,FleetState,FollowState } from '../app.state';
import * as AccountActions from '../store/account.actions';
import * as FollowActions from '../store/follow.actions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Transporter } from '../model/transporter';
import { Observable } from 'rxjs/Observable';
import { dumpFollow,Follow } from '../model/follow';
import { Fleet } from '../model/fleet';
import { API } from '../api.service';
import { Store } from '@ngrx/store';
import { isBlank } from '../util';

import { animate,state,style,transition,trigger } from '@angular/animations';

import * as firebase from 'firebase';

import {} from '@types/googlemaps';
declare var google: any;

interface FleetVM extends Fleet
{
  state?: string;
}

interface TransporterVM extends Transporter
{
  marker?: google.maps.Marker;
  state?: string;
}

interface FollowVM extends Follow
{
  imageURL?: string;
  title?: string;
}

@Component({
  selector: 'app-follow',
  templateUrl: './follow.component.html',
  styleUrls: ['./follow.component.css'],
  animations: [
    trigger('fleet-state',[
      state('inactive',style({ opacity:'.5',transform:'scale(1)' } ) ),
      state('active',style({ opacity:'1',transform:'scale(1.025)' } ) ),
      transition('inactive => active',animate('100ms ease-in' ) ),
      transition('active => inactive',animate('100ms ease-out' ) )
    ] ),
    trigger('transporter-state',[
      state('inactive',style({ background:'#F0F0F0' } ) ),
      state('active',style({ background:'#F0FDFF' } ) ),
      transition('inactive => active',animate('100ms ease-in' ) ),
      transition('active => inactive',animate('100ms ease-out' ) )
    ] ),
    trigger('follower',[
      transition(':enter',[ style({ width:0 } ),animate( 200,style({ width:'200px' } ) ) ] ),
      transition(':leave',[ style({ width:'*' } ),animate( 200,style({ width:0 } ) ) ] )
    ] )
  ],
  encapsulation: ViewEncapsulation.None
})
export class FollowComponent implements OnInit,AfterViewInit,OnDestroy
{
  fleets: FleetVM[] = [];
  selectedfleet?: FleetVM = null;
  transporters: TransporterVM[] = [];
  map: google.maps.Map;
  options: any;
  overlays: any[];
  showfollow = false;
  follow?: Follow;
  showall = true;

  // lat = 34.052234;
  // lng = -118.243685;

  private readonly _uichange = new BehaviorSubject<void>( null );
  private readonly uichange:Observable<void> = this._uichange.asObservable();
  private uiSubscription: Subscription;

  private followStoreSubscription: Subscription;
  follow$: Observable<Follow>;

  private infowindow = new google.maps.InfoWindow();
  private selectedtransporter?:TransporterVM;
  private rootreference?: firebase.database.Reference;

  constructor( private api:API,
               private accountstore:Store<AccountState>,
               private fleetstore:Store<FleetState>,
               private followstore:Store<FollowState> ) {
    this.follow$ = this.followstore.select( 'follow' );
  }

  ngOnInit(): void {
    this.options = {
      center: { lat:42.901688,lng:-78.492067 },
      zoom: 12
    };

    this.overlays = [];

    this.followStoreSubscription = this.follow$.skip( 1 ).subscribe( f => this.fromFollowStore( f ) );

    this.rootreference = firebase.database().ref();
    this.rootreference.on('value',s => { this.updateFromSnapshot( s ); } );

    this.fetchFleet();
  }

  ngAfterViewInit(): void {
    this.subscribeUI();
  }

  onRefresh() {}

  onMapReady( event ) {
    this.map = event.map;
  }

  onMapClick( event ) {
    this.infowindow.close();
    this.showfollow = false;
  }

  onOverlayClick( event ) {
    if ( event.overlay instanceof google.maps.Marker ) {
      // this.onInfo( event.map,event.overlay );
      this.onOptions( event.map,event.overlay );
    }
  }

  onTransporter( transportervm:TransporterVM,center:boolean ) {
    if ( this.selectedtransporter != null ) {
      this.selectedtransporter.state = 'inactive';
    }
    this.selectedtransporter = transportervm;
    this.selectedtransporter.state = 'active';

    if ( center ) {
      const marker = this.selectedtransporter.marker;
      this.map.setCenter( marker.getPosition() );
    }

    this.follow = {};
    this.infowindow.close();
    this.showfollow = false;
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
        this.fetchTransporters();
      }
    );

    this.follow = {};
    this.infowindow.close();
    this.showfollow = false;
  }

  update() {
    this._uichange.next(null );
  }

  onHideFollow() {
    this.follow = {};
    this.infowindow.close();
    this.showfollow = false;
  }

  ngOnDestroy(): void {
    this.rootreference.off('value' );

    this.unsubscribeUI();
    this.followStoreSubscription.unsubscribe();
  }

  private subscribeUI() {
    this.unsubscribeUI();
    this.uiSubscription = this.uichange.skip( 1 ).debounceTime( 750 ).subscribe(() => { this.toFolllowStoreCreateIfNecessary(); } );
  }

  private unsubscribeUI() {
    if ( this.uiSubscription != null ) {
      this.uiSubscription.unsubscribe();
    }
  }

  private onInfo( map:google.maps.Map,marker:google.maps.Marker ) {
    this.transporters.forEach(transporter => {
      if ( transporter.marker === marker ) {
        this.onTransporter( transporter,false );
      }
    } );

    const title = this.selectedtransporter.name + ' ' + this.selectedtransporter.status;
    this.infowindow.setContent( title );
    this.infowindow.open( map,marker );
  }

  private onOptions( map:google.maps.Map,marker:google.maps.Marker ) {
    this.transporters.forEach(transporter => {
      if ( transporter.marker === marker ) {
        this.onTransporter( transporter,false );
      }
    } );

    this.accountstore.select( 'account' ).take( 1 ).subscribe(
      a => {
        if ( a != null ) {
          const ownerid = a.id;
          this.fetchFollow( ownerid );
        }
      }
    );
  }

  /*
   * TODO: support multiple follows for same fleet,transporter
   */
  private fetchFollow( ownerid:string ) {
    this.follow = {};
    this.showfollow = true;

    const fleetid = this.selectedfleet.id;
    const transporterid = this.selectedtransporter.id;
    this.api.getFollows( ownerid,fleetid,transporterid ).subscribe(
      f => {
        this.follow = f;
      }
    );
  }

  private toFolllowStoreCreateIfNecessary() {
    if ( this.follow.id == null ) {
      const f: Follow = {
        name: '',
        notifyWhenArrive: this.follow.notifyWhenArrive,
        notifyWhenDepart: this.follow.notifyWhenDepart,
        notifyWhenDelayed: this.follow.notifyWhenDelayed,
        subscribeToMessages: this.follow.subscribeToMessages,
        subscribeToWarnings: this.follow.subscribeToWarnings,
        status: 'active'
      };
      const fleetid = this.selectedfleet.id;
      const transporterid = this.selectedtransporter.id;
      this.accountstore.select( 'account' ).take( 1 ).subscribe(
        a => {
          const ownerid = a.id;
          this.api.postFollow( ownerid,fleetid,transporterid,f ).subscribe(
            ff => { this.assume( ff ); }
          );
        }
      );
    } else {
      this.toFollowStore();
    }
  }

  private toFollowStore() {
    console.log( 'FollowComponent.toFollowStore' );

    const follow = {
      id: this.follow.id,
      name: this.follow.name,
      notifyWhenArrive: this.follow.notifyWhenArrive,
      notifyWhenDepart: this.follow.notifyWhenDepart,
      notifyWhenDelayed: this.follow.notifyWhenDelayed,
      subscribeToMessages: this.follow.subscribeToMessages,
      subscribeToWarnings: this.follow.subscribeToWarnings,
      status: this.follow.status
    };

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        this.followstore.dispatch( new FollowActions.FollowPostAction( a.id,follow ) );
      }
    );
  }

  private fromFollowStore( f:Follow ) {
    console.log( 'FollowComponent.fromFollowStore ' + dumpFollow( f ) );
    this.unsubscribeUI();
      this.assume( f );
    this.subscribeUI();
  }

  private assume( f:Follow ) {
    this.follow.id = f.id;
    this.follow.name = f.name;
    this.follow.notifyWhenArrive = f.notifyWhenArrive;
    this.follow.notifyWhenDepart = f.notifyWhenDepart;
    this.follow.notifyWhenDelayed = f.notifyWhenDelayed;
    this.follow.subscribeToMessages = f.subscribeToMessages;
    this.follow.subscribeToWarnings = f.subscribeToWarnings;
    this.follow.status = f.status;
  }

  private fetchFleet() {
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

  private getFleets( ownerid:string, start:number,count:number ) {
    const _fleets: Fleet[] = [];
    this.api.getFleets( ownerid ).subscribe(
      f => { _fleets.push( this.asFleetVM( f ) ); },
      e => { this.onError( e ); },
      () => {
        _fleets.sort((a,b) => {
          if ( (a != null) && (b != null) && (a.name != null) && (b.name != null) ) {
            if ( a.name < b.name ) { return -1; }
            if ( a.name > b.name ) { return +1; }
          }
          return 0;
        } );
        this.fleets = _fleets;
        if ( this.fleets.length > 0 ) {
          this.onFleet( this.fleets[ 0 ] );
        }
      }
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

  private fetchTransporters() {
    const fleetid = this.selectedfleet.id;

    const _transporters: TransporterVM[] = [];
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        this.api.getTransporters( ownerid,fleetid ).subscribe(
          t => { _transporters.push( this.asTransporterVM( t ) ); },
          e => { this.onError( e ); },
          () => { this.transporters = _transporters; this.updatePositions(); }
        );
      }
    );
  }

  private asTransporterVM( transporter:Transporter ) : TransporterVM {
    let transportervm:TransporterVM = null;

    if ( transporter != null ) {
      transportervm = {};
      transportervm.id = transporter.id;
      transportervm.name = transporter.name;
      transportervm.type = transporter.type;
      transportervm.category = transporter.category;
      transportervm.description = transporter.description;
      transportervm.imageURL = transporter.imageURL;
      transportervm.thumbnailURL = transporter.thumbnailURL;
      transportervm.number = transporter.number;
      transportervm.marquee = transporter.marquee;
      transportervm.latitude = transporter.latitude;
      transportervm.longitude = transporter.longitude;
      transportervm.diatribe = transporter.diatribe;
      transportervm.inservice = transporter.inservice;
      transportervm.status = transporter.status;

      transportervm.marker = new google.maps.Marker();
      transportervm.marker.setPosition( { lat:transporter.latitude,lng:transporter.longitude } );
      transportervm.marker.setTitle( transporter.name );
      transportervm.marker.setClickable( true );
      transportervm.marker.setIcon( { url:'/assets/marker.png' } );

      transportervm.state = 'inactive';
    }

    return transportervm;
  }

  private updatePositions() {
    this.rootreference.once('value',s => {
      this.updateFromSnapshot( s );
      this.rebounds();
    } );
  }

  private onError( e ) {
    console.log( e );
  }

  private updateFromSnapshot( snapshot:firebase.database.DataSnapshot ) {
    // snapshot.forEach( function( s:firebase.database.DataSnapshot ) {
    //   console.log( 'child: ' + s.key ); // + ' ' + s.child( 'lat' ).val() );
    //   return false;
    // } );

    for ( const transporter of this.transporters ) {
      const ss = snapshot.child( transporter.id );
      if ( ss.val() != null ) {
        console.log( 'updateFromSnapshot ' + ss.key + ' ' + ss.child( 'lat' ).val() + ',' + ss.child( 'lng' ).val()  );
        transporter.latitude = ss.child( 'lat' ).val();
        transporter.longitude = ss.child( 'lng' ).val();
        transporter.marker.setPosition( { lat:transporter.latitude,lng:transporter.longitude } );
      }
    }
  }

  private rebounds() {
    const bounds = new google.maps.LatLngBounds();

    const _overlays: any[] = [];
    for ( const transporter of this.transporters ) {
      _overlays.push( transporter.marker );
    }
    _overlays.forEach(marker => {
      const position = marker.getPosition()
      const lat = position.lat();
      const lng = position.lng();
      if ( (lat !== 0) && (lng !== 0) ) {
        bounds.extend( position );
      }
    } );

    this.overlays = _overlays;
    setTimeout(() => { this.map.fitBounds( bounds ); },250 );
  }
}
