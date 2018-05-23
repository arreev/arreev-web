
import { Component,OnInit,OnDestroy,ViewEncapsulation,Input,EventEmitter,Output } from '@angular/core';
import { Storage } from '@google-cloud/storage';
import { Person } from '../../model/person';
import { API } from '../../api.service';
import { isBlank } from '../../util';

import * as firebase from 'firebase';

@Component({
  selector: 'app-person-new',
  templateUrl: './person-new.component.html',
  styleUrls: ['./person-new.component.css'],
  animations: [],
  encapsulation: ViewEncapsulation.Emulated
})
export class PersonNewComponent implements OnInit,OnDestroy
{
  @Input() ownerid;
  @Input() groupid;

  @Output() finished = new EventEmitter<void>();

  person: Person = {};
  validated = false;
  working = false;

  private imagefile?: File = null;

  constructor( private api:API ) {}

  ngOnInit(): void { this._ngOnInit(); }

  validation() { this._validation(); }

  onSelectImage( e ) { this._onSelectImage( e ); }
  onUnSelectImage() { this._onUnSelectImage(); }
  onAdd() { this._onAdd(); }

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    const storageref = firebase.storage().ref();
  }

  private _validation() {
    this.validated =
      !isBlank( this.person.name ) &&
      !isBlank( this.person.description ) &&
      !isBlank( this.person.category ) &&
      ( this.imagefile != null );
  }

  private _onSelectImage( e ) {
    try {
      this.imagefile = e[0];
      this.validation();
    } catch ( x ) {
      console.log( x );
    }
  }

  private _onUnSelectImage() {
    this.imagefile = null;
    this.validation();
  }

  /*
   * https://firebase.google.com/docs/storage/web/upload-files?authuser=1
   * https://firebase.google.com/docs/storage/security/start?authuser=1
   */
  private _onAdd() {
    this.working = true;

    const partial: Person = {
      name: this.person.name,
      description: this.person.description,
      type: 'people',
      category: this.person.category
    };

    const file = this.imagefile;

    this.api.postPerson( this.ownerid,this.groupid,partial ).subscribe(
      p => {
        /*
         * 1. upload file to storage, with person.id in the name
         */
        const uploadtask = firebase.storage().ref().child('person/person.imageURL.'+p.id ).put( file );
        uploadtask.on( firebase.storage.TaskEvent.STATE_CHANGED,
          (snapshot) => {},
          e => { this.onError( e ); },
          () => {
            /*
             * 2. set person.imageURL,post to api with person.id != null (update)
             */
            p.imageURL = uploadtask.snapshot.downloadURL;
            this.api.postPerson( this.ownerid,this.groupid,p ).subscribe(
              ff => {},
              e => { this.onError( e ); },
              () => {
                this.working = false;
                this.finished.emit();
              }
            );
          }
        );
      },
      e => { this.onError( e ); },
      () => {}
    );
  }

  private onError( e ) {
    console.log( e );
    this.working = false;
  }

  private _ngOnDestroy(): void {}
}
