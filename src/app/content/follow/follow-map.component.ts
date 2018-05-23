
import {
  Component,EventEmitter,Input,OnChanges,OnDestroy,OnInit,Output,SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { ToggleableInfoWindow } from '../../view/toggleableinfowindow';
import * as followsActions from '../../store/follows.actions';
import * as fromFollows from '../../store/follows.reducer';
import { Transporter } from '../../model/transporter';
import { Subscription } from 'rxjs/Subscription';
import { FollowState } from '../../app.state';
import { Follow } from '../../model/follow';
import { API } from '../../api.service';
import { Store } from '@ngrx/store';
import {} from '@types/googlemaps';

import * as firebase from 'firebase';

@Component({
  selector: 'app-follow-map',
  templateUrl: './follow-map.component.html',
  encapsulation: ViewEncapsulation.Emulated
})
export class FollowMapComponent implements OnInit,OnChanges,OnDestroy
{
  @Input() ownerid: string;
  @Input() fleetid: string;
  @Input() transporterid?: string;
  @Input() map: google.maps.Map;

  editfollow?: Follow = null;
  showfollowedit = false;

  private rootreference?: firebase.database.Reference;
  private followsSubscription: Subscription;
  private markers: TransporterMarker[] = [];
  private transporters: Transporter[] = [];
  private follows: Follow[] = [];

  constructor( private api:API,private followsstore:Store<FollowState> ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngOnChanges( changes: SimpleChanges ): void { this._ngOnChanges( changes ); }

  onZoomMapToFleet() { this._onZoomMapToFleet(); }
  onFinishedFollowEdit() { this._onFinishedFollowEdit(); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.clearMarkers();

    /*
     * TODO: not scalable - need to only listen to indiviudual references
     */
    this.rootreference = firebase.database().ref();
    this.rootreference.on('value',s => { this.updateFromSnapshot( s ); } );

    this.followsSubscription = this.followsstore.select( fromFollows.selectAll ).skip( 1 ).subscribe(
      (follows:Follow[]) => { this.fromFollowsStore( follows ); },
      (error:Error) => { this.onError( error ); },
      () => {}
    );
    this.followsstore.dispatch( new followsActions.Query( this.ownerid,this.fleetid ) );

    this.fetchTransporters();
  }

  private _ngOnChanges( changes: SimpleChanges ): void {
    for ( const change in changes ) {
      if ( change === 'transporterid' ) {
        const transporter = this.transporters.find((t:Transporter) => t.id === this.transporterid );
        this.centerTo( transporter );
      }
    }
  }

  private _onZoomMapToFleet() {
    this.rebounds();
  }

  private _onFinishedFollowEdit() {
    console.log( 'onFinishedFollowEdit' );
    this.editfollow = null;
    this.showfollowedit = false;
  }

  private centerTo( transporter?:Transporter ) {
    if ( !transporter ) { return; }

    this.markers.forEach(m => m.setMap( null ) ); // need to clear from map before center, else bad thangs happen
    {
      const marker = this.markers.find( ( m: TransporterMarker ) => (m.transporterid === transporter.id) );
      if ( marker ) {
        this.map.setCenter( marker.getPosition() );
        this.map.setZoom( 15 );
      }
    }
    this.markers.forEach(m => m.setMap( this.map ) );
  }

  private fetchTransporters() {
    const _transporters: Transporter[] = [];
    this.api.getTransporters( this.ownerid,this.fleetid ).subscribe(
      (t:Transporter) => { _transporters.push( t ); },
      (e:Error) => { this.onError( e ); },
      () => {
        this.transporters = _transporters;
        this.createMarkers();
        this.updateFromSnapshotAndRebounds();
      }
    );
  }

  private createMarkers() {
    this.clearMarkers();

    this.transporters.forEach((transporter:Transporter) => {
      const marker = new TransporterMarker( transporter );
      /*
       * https://developers.google.com/maps/documentation/javascript/events
       * https://developers.google.com/maps/documentation/javascript/examples/event-simple
       */
      marker.addListener('click',() => { this.onEditFollow( marker.transporterid ); } );
      marker.setMap( this.map );
      marker.infowindow.open( this.map,marker );

      this.markers.push( marker );
    } );
  }

  private updateFromSnapshotAndRebounds() {
    /*
     * TODO: not scalable - need to once individual references
     */
    this.rootreference.once('value',s => {
      this.updateFromSnapshot( s );
      this.rebounds();
    } );
  }

  private updateFromSnapshot( snapshot:firebase.database.DataSnapshot ) {
    this.transporters.forEach((transporter:Transporter) => {
        const ss = snapshot.child( transporter.id );
        if ( ss.val() != null ) {
          const marker = this.markers.find((m:TransporterMarker) => (m.transporterid === transporter.id) );
          if ( marker ) {
            const lat = ss.child('lat' ).val();
            const lng = ss.child('lng' ).val();
            marker.setPosition( { lat:lat,lng:lng } );
          }
        }
      }
    );
  }

  private rebounds() {
    const bounds = new google.maps.LatLngBounds();
    this.markers.forEach((m:TransporterMarker) => {
      const position = m.getPosition();
      const lat = position.lat();
      const lng = position.lng();
      if ( (lat !== 0) && (lng !== 0) ) {
        bounds.extend( position );
      }
    } );
    setTimeout(() => { this.map.fitBounds( bounds ); },250 );
  }

  private clearMarkers() {
    this.markers.forEach((m:TransporterMarker) => {
      m.infowindow.close();
      m.setMap( null );
    } );
    this.markers = [];
  }

  private fromFollowsStore( follows?:Follow[] ) {
    console.log( 'FollowMapComponent.fromFollowsStore ' + follows.length );
    this.follows = follows;
  }

  private onError( error:Error ) {
    console.log( error );
  }

  private onEditFollow( transporterid:string ) {
    const transporter = this.transporters.find((t:Transporter) => (t.id === transporterid) );
    const follow = this.follows.find((f:Follow) => (f.transporterid === transporterid) );
    this.editfollow  = {
      id: follow ? follow.id : null,
      name: follow ? follow.name : transporter.name,
      notifyWhenArrive: follow ? follow.notifyWhenArrive : false,
      notifyWhenDepart: follow ? follow.notifyWhenDepart : false,
      notifyWhenDelayed: follow ? follow.notifyWhenDelayed : false,
      subscribeToMessages: follow ? follow.subscribeToMessages : false,
      subscribeToWarnings: follow ? follow.subscribeToWarnings : false,
      transporterid: transporter.id,
      status: follow ? follow.status : ''
    };

    this.showfollowedit = true;
  }

  private _ngOnDestroy(): void {
    this.followsSubscription.unsubscribe();
    this.clearMarkers();
  }
}

/*
 *
 */
class TransporterMarker extends google.maps.Marker
{
  readonly infowindow = new google.maps.InfoWindow();
  readonly transporterid: string;
  readonly transportername?: string;
  readonly transporterimageurl?: string;

  constructor( transporter: Transporter ) {
    super();

    this.transporterid = transporter.id;
    this.transportername = transporter.name;
    this.transporterimageurl = transporter.imageURL;

    const html = infoHTML
      .replace('$image',transporter.imageURL )
      // .replace('$name',transporter.name )
    this.infowindow = new ToggleableInfoWindow();
    this.infowindow.setOptions( { disableAutoPan:true } );
    this.infowindow.setContent( html );
    this.infowindow.setZIndex( 1 );

    this.configure( transporter );
  }

  private configure( transporter: Transporter ) {
    this.setPosition( { lat:transporter.latitude,lng:transporter.longitude } );
    this.setAnimation( google.maps.Animation.DROP );
    this.setTitle( transporter.name );
    this.setClickable( true );
    this.setLabel( null );

    this.setLabel( {
      color:'#4466AA',
      fontSize:'10pt',
      fontWeight:'bold',
      text:transporter.name
    } );

    const offx = 16 - (transporter.name.length / 2);
    this.setIcon( {
      url:'/assets/transporter.gif',
      labelOrigin:new google.maps.Point( offx,-2 ),
      scaledSize: new google.maps.Size( 20,20 )
    } );
  }
}

const infoHTML = `
      <div style="display:flex;flex-direction:column;align-items:flex-start;">
        <img src="$image" width="64" alt="" border>
        <!-- <span style="font-size:1em;font-weight:bold;max-width:100px;text-overflow:ellipsis;overflow-x:hidden;white-space:nowrap;">$name</span> -->
      </div>
    `;

