
import {
  Component,OnInit,OnDestroy,ViewEncapsulation,Input,EventEmitter,Output,OnChanges,
  SimpleChanges,ViewChild
} from '@angular/core';
import * as personsActions from '../../store/persons.actions';
import * as fromPersons from '../../store/persons.reducer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Invitation } from '../../model/invitation';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs/Subscription';
import { Storage } from '@google-cloud/storage';
import { Person } from '../../model/person';
import { API } from '../../api.service';
import { isBlank } from '../../util';
import { Store } from '@ngrx/store';

import * as firebase from 'firebase';

@Component({
  selector: 'app-person-edit',
  templateUrl: './person-edit.component.html',
  styleUrls: ['./person-edit.component.css'],
  animations: [],
  encapsulation: ViewEncapsulation.Emulated
})
export class PersonEditComponent implements OnInit,OnChanges,OnDestroy
{
  @Input() ownerid: string;
  @Input() person: Person;

  @Output() finished = new EventEmitter<void>();

  @ViewChild( 'inputFile' ) inputFile; // bit of a dom hack ?

  working = false;

  private readonly uisubject = new BehaviorSubject<void>( null );
  private personsSubscription: Subscription;
  private uiSubscription: Subscription;

  constructor( private api:API,
               private personsstore:Store<fromPersons.State>,
               private confirmationService:ConfirmationService ) {}

  ngOnInit(): void { this._ngOnInit(); }
  ngOnChanges( changes: SimpleChanges ): void { this._ngOnChanges( changes ); }

  onModelChange() { this._onModelChange(); }
  onImage() { this._onImage(); }
  onInputFile() { this._onInputFile(); }
  onDelete() { this._onDelete(); }
  onInvite() { this._onInvite(); }
  onOK() { this._onOK(); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    const storageref = firebase.storage().ref();

    this.personsSubscription = this.personsstore.select( fromPersons.selectAll ).skip( 1 ).subscribe(
      (persons:Person[]) => { this.fromPersonsStore( persons.find(p => (p.id === this.person.id) ) ); },
      (error:Error) => { this.onError( error ); },
      () => {}
    );

    this.subscribeUI();
  }

  private _ngOnChanges( changes: SimpleChanges ): void {}

  private _onModelChange() {
    const validated =
      !isBlank( this.person.name ) &&
      !isBlank( this.person.category ) &&
      !isBlank( this.person.description );
    if ( validated ) {
      this.uisubject.next(null );
    }
  }

  private _onImage() {
    this.inputFile.nativeElement.click(); // bit of a dom hack ?
  }

  private _onInputFile() {
    try {
      const file = this.inputFile.nativeElement.files[ 0 ];
      this.uploadImage( file );
    } catch ( x ) {
      console.log( x );
    }
  }

  private _onDelete() {
    this.confirmationService.confirm({ header:this.person.name,message:`Are you sure you want to delete ?`,accept: () => { this.delete( this.person ); } } );
  }

  private _onInvite() {
    this.working = true;

    const path = 'invitations/'+this.ownerid+':'+this.person.id;

    const entry = {
      ownerid: this.ownerid,
      personid: this.person.id,
      email: this.person.email,
      status: 'pending'
    };

    firebase.database().ref( path )
      .set( entry )
      .then(() => { this.working = false; } );

    // this.api.postInvitation( this.ownerid,this.person ).subscribe(
    //   (invitation:Invitation) => console.log( invitation ),
    //   (error:Error) => this.onError( error ),
    //   () => { this.working = false; }
    // );
  }

  private _onOK() {
    this.finished.emit();
  }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uisubject.asObservable().skip( 1 ).debounceTime( 1500 ).subscribe(() => { this.toPersonsStore( this.person ); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription ) {
      this.uiSubscription.unsubscribe();
    }
  }

  private toPersonsStore( p:Person ) {
    this.personsstore.dispatch( new personsActions.Update( this.ownerid,p.id,p ) );
  }

  private fromPersonsStore( p:Person ) {
    this.unSubscribeUI();
      this.person = p;
    this.subscribeUI();
  }

  private uploadImage( file:File ) {
    this.working = true;
    const personid = this.person.id;
    const uploadtask = firebase.storage().ref().child('person/person.imageURL.'+personid ).put( file );
    uploadtask.on( firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {},
      e => { this.onError( e ); },
      () => {
        this.person.imageURL = uploadtask.snapshot.downloadURL;
        this.toPersonsStore( this.person );
        this.working = false;
      }
    );
  }

  private delete( p:Person ) {
    this.personsstore.dispatch( new personsActions.Delete( this.ownerid,p.id ) );
    this.finished.emit();
  }

  private onError( e ) {
    console.log( e );
    this.working = false;
  }

  private _ngOnDestroy(): void {
    this.unSubscribeUI();
    this.personsSubscription.unsubscribe();
  }
}
