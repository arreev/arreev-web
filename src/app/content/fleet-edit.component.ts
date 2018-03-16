
import { AfterViewInit,Component,Input,OnDestroy,OnInit,ViewChild,ViewEncapsulation } from '@angular/core';
import { AccountState,FleetState } from '../app.state';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { dumpFleet,Fleet } from '../model/fleet';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import * as FleetActions from '../store/fleet.actions';

import * as firebase from 'firebase';

class FleetVM
{
  id?: string;
  name?: string;
  type?: string;
  category?: string;
  description?: string;
  imageURL?: string;
  thumbnailURL?: string;
  status?: string;
}

@Component({
  selector: 'app-fleet-edit',
  templateUrl: './fleet-edit.component.html',
  styleUrls: ['./fleet-edit.component.css'],
  animations: [],
  encapsulation: ViewEncapsulation.None
})
export class FleetEditComponent implements OnInit,AfterViewInit,OnDestroy
{
  @Input() fleetid?: string;

  fleetvm: FleetVM = new FleetVM();

  @ViewChild( 'inputFile' ) inputFile; // bit of a dom hack ?

  private readonly _uichange = new BehaviorSubject<void>( null );
  private readonly uichange:Observable<void> = this._uichange.asObservable();
  private uiSubscription: Subscription;

  private fleetStoreSubscription: Subscription;
  fleet$: Observable<Fleet>;

  constructor( private fleetstore:Store<FleetState>,private accountstore:Store<AccountState> ) {
    this.fleet$ = this.fleetstore.select('fleet' );
  }

  ngOnInit(): void {
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

    const fleet = {
      id: this.fleetvm.id,
      name: this.fleetvm.name,
      type: this.fleetvm.type,
      category: this.fleetvm.category,
      description: this.fleetvm.description,
      imageURL: this.fleetvm.imageURL,
      thumbnailURL: this.fleetvm.thumbnailURL,
      status: this.fleetvm.status
    };

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        this.fleetstore.dispatch( new FleetActions.FleetPostAction( a.id,fleet ) );
      }
    );
  }

  private fromFleetStore( fleet:Fleet ) {
    console.log( 'FleetEditComponent.fromFleetStore ' + dumpFleet( fleet ) );
    this.unSubscribeUI();
      this.assume( fleet );
    this.subscribeUI();
  }

  private assume( fleet:Fleet ) {
    this.fleetvm.id = fleet.id;
    this.fleetvm.name = fleet.name;
    this.fleetvm.type = fleet.type;
    this.fleetvm.category = fleet.category;
    this.fleetvm.description = fleet.description;
    this.fleetvm.imageURL = fleet.imageURL;
    this.fleetvm.thumbnailURL = fleet.thumbnailURL;
    this.fleetvm.status = fleet.status;
  }

  private uploadImage( file:File ) {
    const fleetid = this.fleetid;
    const uploadtask = firebase.storage().ref().child('fleet/fleet.imageURL.'+fleetid ).put( file );
    uploadtask.on( firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {},
      e => { this.onError( e ); },
      () => {
        this.fleetvm.imageURL = uploadtask.snapshot.downloadURL;
        this.toFleetStore();
      }
    );
  }

  private onError( e ) {
    console.log( e );
  }
}
