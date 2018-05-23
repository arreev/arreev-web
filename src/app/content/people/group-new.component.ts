
import { Component,OnInit,OnDestroy,ViewEncapsulation,Input,EventEmitter,Output } from '@angular/core';
import { Storage } from '@google-cloud/storage';
import { Group } from '../../model/group';
import { API } from '../../api.service';
import { isBlank } from '../../util';

import * as firebase from 'firebase';

@Component({
  selector: 'app-group-new',
  templateUrl: './group-new.component.html',
  styleUrls: ['./group-new.component.css'],
  animations: [],
  encapsulation: ViewEncapsulation.Emulated
})
export class GroupNewComponent implements OnInit,OnDestroy
{
  @Input() ownerid;

  @Output() finished = new EventEmitter<void>();

  group: Group = {};
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
      !isBlank( this.group.name ) &&
      !isBlank( this.group.description ) &&
      !isBlank( this.group.category ) &&
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

    const partial: Group = {
      name: this.group.name,
      description: this.group.description,
      type: 'people',
      category: this.group.category
    };

    const file = this.imagefile;

    this.api.postGroup( this.ownerid,partial ).subscribe(
      f => {
        /*
         * 1. upload file to storage, with group.id in the name
         */
        const uploadtask = firebase.storage().ref().child('group/group.imageURL.'+f.id ).put( file );
        uploadtask.on( firebase.storage.TaskEvent.STATE_CHANGED,
          (snapshot) => {},
          e => { this.onError( e ); },
          () => {
            /*
             * 2. set group.imageURL,post to api with group.id != null (update)
             */
            f.imageURL = uploadtask.snapshot.downloadURL;
            this.api.postGroup( this.ownerid,f ).subscribe(
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
