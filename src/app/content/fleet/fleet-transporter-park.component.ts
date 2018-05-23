
import { Component,EventEmitter,Input,OnDestroy,OnInit,Output,ViewEncapsulation } from '@angular/core';

import * as firebase from 'firebase';

@Component({
  selector: 'app-fleet-transporter-park',
  templateUrl: './fleet-transporter-park.component.html',
  styleUrls: ['./fleet-transporter-park.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class FleetTransporterParkComponent implements OnInit,OnDestroy
{
  @Input() ownerid?: string;
  @Input() fleetid?: string;
  @Input() transporterid?: string;
  @Input() transportername?: string;

  @Output() finished = new EventEmitter<void>();

  latitude = 0.0;
  longitude = 0.0;
  working = false;

  constructor() {}

  ngOnInit(): void { this._ngOnInit(); }
  onPark() { this._onPark(); }
  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    firebase.database().ref().once('value',s => {
      this.updateFromSnapshot( s );
    } );
  }

  private _onPark() {
    this.working = true;

    const entry = {
      lat: this.latitude,
      lng: this.longitude,
      name: this.transportername
    };

    firebase.database().ref( this.transporterid )
      .set( entry )
      .then(() => this.finished.emit() )
      .catch(e => this.onError( e ) );
  }

  private updateFromSnapshot( snapshot:firebase.database.DataSnapshot ) {
    const ss = snapshot.child( this.transporterid );
    if ( ss.val() != null ) {
      this.latitude  = ss.child('lat' ).val();
      this.longitude = ss.child('lng' ).val();
    }
  }

  private onError( e ) {
    this.working = false;
    console.log( e );
  }

  private _ngOnDestroy(): void {}
}
