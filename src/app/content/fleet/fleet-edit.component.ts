
import {
  AfterViewInit,Component,EventEmitter,Input,OnDestroy,OnInit,Output,ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as FleetActions from '../../store/fleet.actions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { dumpFleet,Fleet } from '../../model/fleet';
import { AccountGuard } from '../../accountguard';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { FleetState } from '../../app.state';
import { Store } from '@ngrx/store';

import 'rxjs/add/operator/debounceTime';

import * as firebase from 'firebase';

@Component({
  selector: 'app-fleet-edit',
  templateUrl: './fleet-edit.component.html',
  styleUrls: [ './fleet-edit.component.css' ],
  animations: [],
  encapsulation: ViewEncapsulation.Emulated
})
export class FleetEditComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() fleetid?: string;

  @Output() working = new EventEmitter<boolean>( false );

  fleet: Fleet = {};

  @ViewChild( 'inputFile' ) inputFile; // bit of a dom hack ?

  private readonly _uichange = new BehaviorSubject<void>( null );
  private readonly uichange:Observable<void> = this._uichange.asObservable();
  private uiSubscription: Subscription;

  private fleetStoreSubscription: Subscription;
  private ownerid?: string = null;
  fleet$: Observable<Fleet>;

  constructor( private fleetstore:Store<FleetState>,private accountguard:AccountGuard ) {
    this.fleet$ = this.fleetstore.select('fleet' );
  }

  ngOnInit(): void {
    this.ownerid = this.accountguard.getOwnerId();

    this.fleetStoreSubscription = this.fleet$.skip( 1 ).subscribe(fleet => this.fromFleetStore( fleet ) );
    this.fleetstore.dispatch( new FleetActions.FleetFetchAction( this.fleetid ) );
  }

  ngAfterViewInit(): void {
    this.subscribeUI();
  }

  onImage() {
    this.inputFile.nativeElement.click(); // bit of a dom hack ?
  }

  onInputFile() {
    try {
      const file = this.inputFile.nativeElement.files[ 0 ];
      this.uploadImage( file );
    } catch ( x ) {
      console.log( x );
    }
  }

  update() {
    this._uichange.next(null );
  }

  ngOnDestroy(): void {
    /*
     * TODO: how to determine if edited, but not dispatched ?
     */
    this.unSubscribeUI();
    this.fleetStoreSubscription.unsubscribe();
  }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uichange.skip( 1 ).debounceTime( 750 ).subscribe(() => { this.toFleetStore(); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription != null ) {
      this.uiSubscription.unsubscribe();
    }
  }

  private toFleetStore() {
    console.log( 'FleetComponent.toFleetStore' );

    const f = {
      id: this.fleet.id,
      name: this.fleet.name,
      type: this.fleet.type,
      category: this.fleet.category,
      description: this.fleet.description,
      imageURL: this.fleet.imageURL,
      thumbnailURL: this.fleet.thumbnailURL,
      status: this.fleet.status
    };

    this.fleetstore.dispatch( new FleetActions.FleetPostAction( this.ownerid,f ) );
  }

  private fromFleetStore( fleet:Fleet ) {
    this.unSubscribeUI();
      this.assume( fleet );
    this.subscribeUI();
  }

  private assume( fleet:Fleet ) {
    this.fleet.id = fleet.id;
    this.fleet.name = fleet.name;
    this.fleet.type = fleet.type;
    this.fleet.category = fleet.category;
    this.fleet.description = fleet.description;
    this.fleet.imageURL = fleet.imageURL;
    this.fleet.thumbnailURL = fleet.thumbnailURL;
    this.fleet.status = fleet.status;
  }

  private uploadImage( file:File ) {
    this.working.emit( true );
    const fleetid = this.fleetid;
    const uploadtask = firebase.storage().ref().child('fleet/fleet.imageURL.'+fleetid ).put( file );
    uploadtask.on( firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {},
      e => { this.onError( e ); },
      () => {
        this.fleet.imageURL = uploadtask.snapshot.downloadURL;
        this.toFleetStore();
        this.working.emit( false );
      }
    );
  }

  private onError( e ) {
    this.working.emit(false );
    console.log( e );
  }
}
