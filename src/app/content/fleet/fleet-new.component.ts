
import { Component,OnInit,OnDestroy,ViewEncapsulation,Input,EventEmitter,Output } from '@angular/core';
import { AccountGuard } from '../../accountguard';
import { Storage } from '@google-cloud/storage';
import { API } from '../../api.service';
import { Fleet } from '../../model/fleet';
import { isBlank } from '../../util';

import * as firebase from 'firebase';

@Component({
  selector: 'app-fleet-new',
  templateUrl: './fleet-new.component.html',
  styleUrls: ['./fleet-new.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class FleetNewComponent implements OnInit,OnDestroy
{
  @Output() finished = new EventEmitter<void>();

  fleet = { name:'',description:'',type:'',category:'' };
  validated = false;
  working = false;

  private ownerid?: string = null;
  private imagefile?: File = null;

  constructor( private api:API,private accountguard:AccountGuard ) {}

  ngOnInit(): void {
    this.ownerid = this.accountguard.getOwnerId();

    const storageref = firebase.storage().ref();
  }

  validation() {
    let v = false;

    v = !isBlank( this.fleet.name ) &&
      !isBlank( this.fleet.description ) &&
      !isBlank( this.fleet.type ) &&
      !isBlank( this.fleet.category ) &&
      ( this.imagefile != null );

    this.validated = v;
  }

  onSelectImage( e ) {
    try {
      this.imagefile = e[0];
      this.validation();
    } catch ( x ) {
      console.log( x );
    }
  }

  onUnSelectImage() {
    this.imagefile = null;
    this.validation();
  }

  onAdd() {
    this.addNewFleet();
  }

  ngOnDestroy(): void {
  }

  /*
   * https://firebase.google.com/docs/storage/web/upload-files?authuser=1
   * https://firebase.google.com/docs/storage/security/start?authuser=1
   */
  private addNewFleet() {
    this.working = true;

    const fleet: Fleet = {
      name: this.fleet.name,
      description: this.fleet.description,
      type: this.fleet.type,
      category: this.fleet.category
    };

    const file = this.imagefile;

    this.api.postFleet( this.ownerid,fleet ).subscribe(
      f => {
        /*
         * 2. upload file to storage, with fleet.id in the name
         */
        const uploadtask = firebase.storage().ref().child('fleet/fleet.imageURL.'+f.id ).put( file );
        uploadtask.on( firebase.storage.TaskEvent.STATE_CHANGED,
          (snapshot) => {},
          e => { this.onError( e ); },
          () => {
            /*
             * 3. set fleet.imageURL,post to api with fleet.id != null (update)
             */
            f.imageURL = uploadtask.snapshot.downloadURL;
            this.api.postFleet( this.ownerid,f ).subscribe(
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
}
