
import {
  AfterViewInit,ChangeDetectorRef,Component,Input,OnChanges,OnDestroy,OnInit,SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import * as waypointsActions from '../../store/waypoints.actions';
import * as waypointActions from '../../store/waypoint.actions';
import * as fromWaypoints from '../../store/waypoints.reducer';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { WaypointState } from '../../app.state';
import { Waypoint } from '../../model/waypoint';
import { Route } from '../../model/route';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-route-waypoints',
  templateUrl: './route-waypoints.component.html',
  styleUrls: ['./route-waypoints.component.css'],
  animations: [],
  encapsulation: ViewEncapsulation.Emulated
})
/**
 * NOTE: in /node_modules/primeng/components/chips/chips.js - comment out backspace delete code:
 *     Chips.prototype.onKeydown
 *     case 8:
 */
export class RouteWaypointsComponent implements OnInit,AfterViewInit,OnChanges,OnDestroy
{
  @Input() ownerid: string;
  @Input() route: Route;
  @Input() places: google.maps.places.PlacesService;

  waypoints: Waypoint[] = [];
  selectedwaypoint?: Waypoint = null;
  showwaypointnew = false;
  waypointnew: Waypoint = {};

  private waypointAllSubscription: Subscription;
  private waypointSubscription: Subscription;
  private dragwaypoint?: Waypoint = null;

  constructor( private waypointstore:Store<WaypointState>,private waypointsstore:Store<fromWaypoints.State>,
               private changedetector:ChangeDetectorRef,private confirmationService:ConfirmationService ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngAfterViewInit(): void { this._ngAfterViewInit(); }
  ngOnChanges( changes:SimpleChanges ): void { this._ngOnChanges( changes ); }

  onDragStart( event,waypoint:Waypoint ) { this._onDragStart( event,waypoint ); }
  onDrag( event,waypoint:Waypoint ) { this._onDrag( event,waypoint ); }
  onDragEnd( event,waypoint:Waypoint ) { this._onDragEnd( event,waypoint ); }

  onDragEnter( event,waypoint:Waypoint ) { this._onDragEnter( event,waypoint ); }
  onDrop( event,waypoint:Waypoint ) { this._onDrop( event,waypoint ); }
  onDragLeave( event,waypoint:Waypoint ) { this._onDragLeave( event,waypoint ); }

  onAppendWaypoint( name:string ) { this._onAppendWaypoint( name ); }
  onWaypoint( waypoint:Waypoint ) { this._onWaypoint( waypoint ); }
  onEditWaypoint( waypoint:Waypoint ) { this._onEditWaypoint( waypoint ); }
  onRemoveWaypoint( waypoint:Waypoint ) { this._onRemoveWaypoint( waypoint ); }
  onFinishedWaypointNew() { this._onFinishedWaypointNew(); }

  isBeg( waypoint:Waypoint ) : boolean { return this._isBeg( waypoint ); }
  isEnd( waypoint:Waypoint ) : boolean { return this._isEnd( waypoint ); }

  doAddWaypoint() { this._doAddWaypoint(); }
  doAddWaypointFor( name:string,address:string,lat:number,lng:number ) { this._doAddWaypointFor( name,address,lat,lng ); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.waypointSubscription = this.waypointstore.select('waypoint' ).subscribe((waypoint:Waypoint) => { this.fromWaypointStore( waypoint ); } );

    this.waypointAllSubscription = this.waypointsstore.select( fromWaypoints.selectAll ).skip( 1 ).subscribe(
      (waypoints:Waypoint[]) => { this.fromWaypointsStore( waypoints ); },
      (error:Error) => { this.onError( error ); },
      () => {}
    );
  }

  private _ngAfterViewInit(): void {}

  private _ngOnChanges( changes: SimpleChanges ): void {
    for ( const change in changes ) {
      if ( change === 'route' ) {
        this.waypointsstore.dispatch( new waypointsActions.Query( this.ownerid,this.route.id ) );
      }
    }
  }

  private _onDragStart( event,waypoint:Waypoint ) {
    this.dragwaypoint = waypoint;
  }

  private _onDrag( event,waypoint:Waypoint ) {}

  private _onDragEnd( event,waypoint:Waypoint ) {
    this.dragwaypoint = null;
  }

  private _onDragEnter( event,waypoint:Waypoint ) {
    if ( waypoint === this.dragwaypoint ) {
    }
  }

  private _onDrop( event,waypoint:Waypoint ) {
    const w1:Waypoint = waypoint;
    const w2:Waypoint = this.dragwaypoint;
    if ( w1 !== w2 ) {
      const index = w1.index;
      w1.index = w2.index;
      w2.index = index;

      this.waypointsstore.dispatch( new waypointsActions.Update( this.ownerid,w1.id,w1 ) );
      this.waypointsstore.dispatch( new waypointsActions.Update( this.ownerid,w2.id,w2 ) );
    }
  }

  private _onDragLeave( event,waypoint:Waypoint ) {}

  private _onAppendWaypoint( name:string ) {
    this.waypoints = this.waypoints.slice( 0,this.waypoints.length-1 ); // discard what was just added by the p-chips component
    this.waypointnew = {
      index: this.nextWaypointIndex(),
      name: name
    };
    this.showwaypointnew = true;
    this.changedetector.detectChanges();
  }

  private _onWaypoint( waypoint:Waypoint ) {
    if ( this.selectedwaypoint != null ) {
      this.selectedwaypoint.state = 'inactive';
    }
    this.selectedwaypoint = waypoint;
    this.selectedwaypoint.state = 'active';
    this.waypointstore.dispatch( new waypointActions.Edit( this.selectedwaypoint ) );
  }

  private _onEditWaypoint( waypoint:Waypoint ) {}

  private _onRemoveWaypoint( waypoint:Waypoint ) {
    this.confirmationService.confirm({
      header:waypoint.name,
      message:'Are you sure you want to delete ?',
      accept: () => {
        this.waypointsstore.dispatch( new waypointsActions.Delete( this.ownerid,waypoint.id ) );
      }
    } );
  }

  private _onFinishedWaypointNew() {
    this.showwaypointnew = false;
    setTimeout(() => {
      this.waypointsstore.dispatch( new waypointsActions.Query( this.ownerid,this.route.id ) );
    },100 );
  }

  private _isBeg( waypoint:Waypoint ) : boolean {
    return ( this.waypoints[ 0 ] === waypoint );
  }

  private _isEnd( waypoint:Waypoint ) : boolean {
    return ( this.waypoints[ this.waypoints.length-1 ] === waypoint );
  }

  private _doAddWaypoint() {
    this.waypointnew = {
      index: this.nextWaypointIndex()
    };
    this.showwaypointnew = true;
    this.changedetector.detectChanges();
  }

  private _doAddWaypointFor( name:string,address:string,lat:number,lng:number ) {
    this.waypointnew = {
      index: this.nextWaypointIndex(),
      name: name,
      address: address,
      latitude: lat,
      longitude: lng
    };
    this.showwaypointnew = true;
    this.changedetector.detectChanges();
  }

  private fromWaypointsStore( waypoints:Waypoint[] ) {
    waypoints.sort((w1,w2) => (w1.index - w2.index) );
    this.waypoints = waypoints;
  }

  private fromWaypointStore( waypoint:Waypoint ) {
  }

  private nextWaypointIndex() : number {
    let max = 0;
    for ( const w of this.waypoints ) {
      if ( w.index > max ) {
        max = w.index;
      }
    }
    return max+1;
  }

  private onError( error:Error ) {
    console.log( error );
  }

  private _ngOnDestroy(): void {
    this.waypointSubscription.unsubscribe();
    this.waypointAllSubscription.unsubscribe();
  }
}

