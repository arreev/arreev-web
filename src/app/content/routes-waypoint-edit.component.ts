
import {
  Component,OnInit,AfterViewInit,OnDestroy,ViewEncapsulation,Input,Output,EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import * as WaypointActions from '../store/waypoint.actions';
import { AccountState,WaypointState } from '../app.state';
import { dumpWaypoint,Waypoint } from '../model/waypoint';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-routes-waypoint-edit',
  templateUrl: './routes-waypoint-edit.component.html',
  styleUrls: ['./routes-waypoint-edit.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RoutesWaypointEditComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() id: string;

  @Output() finished = new EventEmitter<void>();

  waypoint: Waypoint = {};

  private readonly _uichange = new BehaviorSubject<void>( null );
  private readonly uichange:Observable<void> = this._uichange.asObservable();
  private uiSubscription: Subscription;

  private waypointStoreSubscription: Subscription;
  private waypoint$: Observable<Waypoint>;

  constructor( private waypointstore:Store<WaypointState>,private accountstore:Store<AccountState>,
               private changedetector:ChangeDetectorRef ) {
    this.waypoint$ = this.waypointstore.select('waypoint' );
  }

  ngOnInit(): void {
    this.waypointStoreSubscription = this.waypoint$.skip( 1 ).subscribe(waypoint => this.fromWaypointStore( waypoint ) );
    this.waypointstore.dispatch( new WaypointActions.WaypointFetchAction( this.id ) );
  }

  ngAfterViewInit(): void {}

  modelChange() {
    this._uichange.next(null );
  }

  onDone() {
    this.finished.emit(null );
  }

  ngOnDestroy(): void {
    this.unSubscribeUI();
    this.waypointStoreSubscription.unsubscribe();
  }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uichange.skip( 1 ).debounceTime( 750 ).subscribe(() => { this.toWaypointStore(); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription != null ) {
      this.uiSubscription.unsubscribe();
    }
  }

  private toWaypointStore() {
    console.log( 'RoutesWaypointEditComponent.toWaypointStore ' + dumpWaypoint( this.waypoint ) );

    const waypoint = {
      id: this.waypoint.id,

      name: this.waypoint.name,
      type: this.waypoint.type,
      category: this.waypoint.category,
      description: this.waypoint.description,
      imageURL: this.waypoint.imageURL,
      thumbnailURL: this.waypoint.thumbnailURL,

      address: this.waypoint.address,
      latitude: this.waypoint.latitude,
      longitude: this.waypoint.longitude,
      index: this.waypoint.index,

      status: this.waypoint.status
    };

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        this.waypointstore.dispatch( new WaypointActions.WaypointPostAction( a.id,waypoint ) );
      }
    );
  }

  private fromWaypointStore( waypoint:Waypoint ) {
    console.log( 'RoutesWaypointEditComponent.fromWaypointStore ' + dumpWaypoint( this.waypoint ) );

    this.unSubscribeUI();

      this.waypoint.id = waypoint.id;
      this.waypoint.name = waypoint.name;
      this.waypoint.type = waypoint.type;
      this.waypoint.category = waypoint.category;
      this.waypoint.description = waypoint.description;
      this.waypoint.imageURL = waypoint.imageURL;
      this.waypoint.thumbnailURL = waypoint.thumbnailURL;

      this.waypoint.address = waypoint.address;
      this.waypoint.latitude = waypoint.latitude;
      this.waypoint.longitude = waypoint.longitude;
      this.waypoint.index = waypoint.index;

      this.waypoint.status = waypoint.status;

      this.changedetector.detectChanges();
    this.subscribeUI();

  }
}

