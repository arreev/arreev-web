
import {
  Component,EventEmitter,Input,OnDestroy,OnInit,Output,ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as groupActions from '../../store/group.actions';
import * as fromGroup from '../../store/group.reducer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { Group } from '../../model/group';
import { Store } from '@ngrx/store';

import * as firebase from 'firebase';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.component.html',
  styleUrls: [ './group-edit.component.css' ],
  animations: [],
  encapsulation: ViewEncapsulation.Emulated
})
export class GroupEditComponent implements OnInit,OnDestroy
{
  @Input() ownerid?: string;
  @Input() group?: Group;

  @Output() working = new EventEmitter<boolean>( false );

  @ViewChild( 'inputFile' ) inputFile; // bit of a dom hack ?

  private readonly uisubject = new BehaviorSubject<void>( null );
  private uiSubscription: Subscription;

  private groupSubscription: Subscription;

  constructor( private groupstore:Store<fromGroup.State> ) {}

  ngOnInit(): void { this._ngOnInit(); }

  onImage() { this._onImage(); }
  onInputFile() { this._onInputFile(); }

  update() { this._update(); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.groupSubscription = this.groupstore.select( fromGroup.selectAll ).skip( 1 ).subscribe(
      (groups:Group[]) => { this.fromGroupStore( groups ); },
      (error:Error) => { this.onError( error ); },
      () => {}
    );

    this.subscribeUI();
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

  private _update() {
    this.uisubject.next(null );
  }

  private subscribeUI() {
    this.unSubscribeUI();
    this.uiSubscription = this.uisubject.asObservable().skip( 1 ).debounceTime( 1000 ).subscribe(() => { this.toGroupsStore( this.group ); } );
  }

  private unSubscribeUI() {
    if ( this.uiSubscription != null ) {
      this.uiSubscription.unsubscribe();
    }
  }

  private toGroupsStore( group:Group ) {
    this.groupstore.dispatch( new groupActions.Update( this.ownerid,group.id,group ) );
  }

  private fromGroupStore( groups:Group[] ) {
  }

  private uploadImage( file:File ) {
    this.working.emit(true );
    const groupid = this.group.id;
    const uploadtask = firebase.storage().ref().child('group/group.imageURL.'+groupid ).put( file );
    uploadtask.on( firebase.storage.TaskEvent.STATE_CHANGED,
      (snapshot) => {},
      e => { this.onError( e ); },
      () => {
        this.group.imageURL = uploadtask.snapshot.downloadURL;
        this.toGroupsStore( this.group );
        this.working.emit( false );
      }
    );
  }

  private onError( e ) {
    this.working.emit(false );
    console.log( e );
  }

  private _ngOnDestroy(): void {
    this.unSubscribeUI();

    if ( this.groupSubscription != null ) {
      this.groupSubscription.unsubscribe();
    }
  }
}
