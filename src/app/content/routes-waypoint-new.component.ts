
import { Component,OnInit,AfterViewInit,OnDestroy,ViewEncapsulation,Input,Output,EventEmitter } from '@angular/core';
import { Waypoint } from '../model/waypoint';
import { AccountState } from '../app.state';
import { API } from '../api.service';
import { Store } from '@ngrx/store';
import { isBlank } from '../util';

interface WaypointVM extends Waypoint
{
}

@Component({
  selector: 'app-routes-waypoint-new',
  templateUrl: './routes-waypoint-new.component.html',
  styleUrls: ['./routes-waypoint-new.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RoutesWaypointNewComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() index: number;
  @Input() routeid: string;
  @Input() name?: string = null;
  @Input() type?: string = null;
  @Input() address?: string = null;
  @Input() lat?: number = null;
  @Input() lng?: number = null;
  @Input() places: google.maps.places.PlacesService;

  @Output() finished = new EventEmitter<Waypoint>();

  waypointvm?: WaypointVM = { name:'',description:'',type:'',category:'',latitude:0,longitude:0 };
  validated = false;
  working = false;

  constructor( private api:API,private accountstore:Store<AccountState> ) {}

  ngOnInit(): void {
    this.waypointvm.name = ( this.name != null ? this.name : '' );
    this.waypointvm.type = ( this.type != null ? this.type : '' );
    this.waypointvm.address = ( this.address != null ? this.address : '' );
    this.waypointvm.latitude = ( this.lat != null ? this.lat : 0.0 );
    this.waypointvm.longitude = ( this.lng != null ? this.lng : 0.0 );
  }

  ngAfterViewInit(): void {}

  validation() {
    let v = false;

    v = !isBlank( this.waypointvm.name ) &&
      !isBlank( this.waypointvm.description ) &&
      !isBlank( this.waypointvm.type ) &&
      !isBlank( this.waypointvm.category ) &&
      !isBlank( this.waypointvm.address ) &&
      !Number.isNaN( this.waypointvm.latitude ) &&
      !Number.isNaN( this.waypointvm.longitude ) &&
      ( this.waypointvm.latitude !== 0.0 ) &&
      ( this.waypointvm.longitude !== 0.0 );

    this.validated = v;
  }

  onSearchAddress() {
    this.search( this.waypointvm.address );
  }

  onAdd() {
    this.addNewWaypointWithoutImage();
  }

  ngOnDestroy(): void {}

  private addNewWaypointWithoutImage() {
    if ( !this.routeid ) {
      console.log( 'addNewWaypointWithoutImage routeid=' + this.routeid );
      return;
    }

    this.working = true;

    const waypoint: Waypoint = {
      name: this.waypointvm.name,
      description: this.waypointvm.description,
      type: this.waypointvm.type,
      category: this.waypointvm.category,
      address: this.waypointvm.address,
      latitude: this.waypointvm.latitude,
      longitude: this.waypointvm.longitude,
      index: this.index
    };

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        const routeid = this.routeid;
        this.api.postWaypoint( ownerid,routeid,waypoint ).subscribe(
          w => {
            this.working = false;
            this.finished.emit( w );
          },
          e => { this.onError( e ); },
          () => {}
        );
      }
    );
  }

  private search( q:string ) {
    this.working = true;

    const request = {
      query: q
    };

    this.places.textSearch( request,( results,status ) => {
      if ( status === google.maps.places.PlacesServiceStatus.OK ) {
        for ( const r of results ) {
          this.working = false;
          this.waypointvm.latitude = r.geometry.location.lat();
          this.waypointvm.longitude = r.geometry.location.lng();
          console.log( r );
          break;
        }
      }
    } );
  }

  private onError( e ) {
    console.log( e );
    this.working = false;
  }
}

