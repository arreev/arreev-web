
import { AfterViewInit,Component,EventEmitter,Input,OnDestroy,OnInit,Output,ViewEncapsulation } from '@angular/core';
import { Waypoint } from '../../model/waypoint';
import { API } from '../../api.service';
import { isBlank } from '../../util';

@Component({
  selector: 'app-route-waypoint-new',
  templateUrl: './route-waypoint-new.component.html',
  styleUrls: ['./route-waypoint-new.component.css'],
  animations: [],
  encapsulation: ViewEncapsulation.Emulated
})
export class RouteWaypointNewComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() ownerid: string;
  @Input() routeid: string;
  @Input() waypoint: Waypoint;
  @Input() places: google.maps.places.PlacesService;

  @Output() finished = new EventEmitter<void>();

  validated = false;
  working = false;

  constructor( private api:API ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngAfterViewInit(): void { this._ngAfterViewInit(); }

  onSearchAddress() { this._onSearchAddress(); }
  onAdd() { this._onAdd(); }

  validation() { this._validation(); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {}
  private _ngAfterViewInit(): void {}

  private _onSearchAddress() {
    this.working = true;

    const request = {
      query: this.waypoint.address
    };

    this.places.textSearch( request,( results,status ) => {
      if ( status === google.maps.places.PlacesServiceStatus.OK ) {
        for ( const r of results ) {
          this.working = false;
          this.waypoint.latitude = r.geometry.location.lat();
          this.waypoint.longitude = r.geometry.location.lng();
          break;
        }
      }
    } );
  }

  private _onAdd() {
    this.working = true;

    const partial:Waypoint = {
      index: this.waypoint.index,
      name: this.waypoint.name,
      type: this.waypoint.type,
      category: this.waypoint.category,
      description: this.waypoint.description,
      address: this.waypoint.address,
      latitude: this.waypoint.latitude,
      longitude: this.waypoint.longitude
    };

    this.api.postWaypoint( this.ownerid,this.routeid,partial ).subscribe(
      (waypoint:Waypoint) => {},
      (error:Error) => { this.onError( error ); },
      () => {
        this.finished.emit();
        this.working = false;
      }
    );
  }

  private _validation() {
    this.validated =
      !isBlank( this.waypoint.name ) &&
      !isBlank( this.waypoint.description ) &&
      !isBlank( this.waypoint.type ) &&
      !isBlank( this.waypoint.category ) &&
      !isBlank( this.waypoint.address ) &&
      !Number.isNaN( this.waypoint.latitude ) &&
      !Number.isNaN( this.waypoint.longitude ) &&
      ( this.waypoint.latitude !== 0.0 ) &&
      ( this.waypoint.longitude !== 0.0 );
  }

  private onError( error:Error ) {
    console.log( error );
    this.working = false;
  }

  private _ngOnDestroy(): void {}
}

