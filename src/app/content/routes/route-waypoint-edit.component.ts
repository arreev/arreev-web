
import { Component,EventEmitter,Input,OnDestroy,OnInit,Output } from '@angular/core';
import * as waypointsActions from '../../store/waypoints.actions';
import * as fromWaypoints from '../../store/waypoints.reducer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { WaypointState } from '../../app.state';
import { Waypoint } from '../../model/waypoint';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-route-waypoint-edit',
  templateUrl: './route-waypoint-edit.component.html',
  styleUrls: ['./route-waypoint-edit.component.css'],
})
export class RouteWaypointEditComponent implements OnInit,OnDestroy
{
  @Input() ownerid: string;
  @Input() routeid: string;
  @Input() waypoint: Waypoint;
  @Input() places: google.maps.places.PlacesService;

  @Output() finished = new EventEmitter<void>();

  working = false;
  validated = true;

  private readonly uisubject = new BehaviorSubject<void>( null );
  private uiSubscription: Subscription;

  private waypointsSubscription: Subscription;

  constructor( private waypointstore:Store<WaypointState>,
               private waypointsstore:Store<fromWaypoints.State> ) {}

  ngOnInit(): void { this._ngOnInit(); }

  onSearchAddress() { this._onSearchAddress(); }
  onOK() { this._onOK(); }

  modelChanged() { this._modelChanged(); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.waypointsSubscription = this.waypointsstore.select( fromWaypoints.selectAll ).skip( 1 ).subscribe(
      (waypoints:Waypoint[]) => { this.fromWaypointsStore( waypoints ); },
      (error:Error) => { this.onError( error ); },
      () => {}
    );

    this.subscribeUI();
  }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uisubject.asObservable().skip( 1 ).debounceTime( 1500 ).subscribe(() => { this.toWaypointsStore( this.waypoint ); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription ) {
      this.uiSubscription.unsubscribe();
    }
  }

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
          this.toWaypointsStore( this.waypoint );
          break;
        }
      }
    } );
  }

  private _onOK() {
    this.finished.emit();
  }

  private _modelChanged() {
    this.uisubject.next(null );
  }

  private toWaypointsStore( waypoint:Waypoint ) {
    console.log( 'RouteWaypointEdit.toWaypointsStore ' + waypoint.id );

    this.waypointsstore.dispatch( new waypointsActions.Update( this.ownerid,waypoint.id,waypoint ) );
  }

  private fromWaypointsStore( waypoints:Waypoint[] ) {
  }

  private onError( error:Error ) {
    console.log( error );
  }

  private _ngOnDestroy(): void {
    this.unSubscribeUI();

    if ( this.waypointsSubscription != null ) {
      this.waypointsSubscription.unsubscribe();
    }
  }
}


