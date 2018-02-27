
import { Component,OnInit,OnDestroy,ViewEncapsulation,Input,EventEmitter,Output } from '@angular/core';
import { Storage } from '@google-cloud/storage';
import { AccountState } from '../app.state';
import { API } from '../api.service';
import { Fleet } from '../model/fleet';
import { Store } from '@ngrx/store';
import { isBlank } from '../util';

import * as firebase from 'firebase';

/*
 * MVVM Fleeet View Model
 */
class FleetVM
{
  name?: string;
  description?: string;
  type?: string;
  category?: string;
}

@Component({
  selector: 'app-fleet-new',
  templateUrl: './fleet-new.component.html',
  styleUrls: ['./fleet-new.component.css'],
  encapsulation: ViewEncapsulation.None

})
export class FleetNewComponent implements OnInit,OnDestroy
{
  @Output() finished = new EventEmitter<void>();

  fleetvm = { name:'',description:'',type:'',category:'' };
  validated = false;
  working = false;

  private imagefile?: File = null;

  constructor( private api:API,private accountstore:Store<AccountState> ) {}

  ngOnInit(): void {
    const storageref = firebase.storage().ref();
    console.log( storageref );
  }

  validation() {
    let v = false;

    v = !isBlank( this.fleetvm.name ) &&
      !isBlank( this.fleetvm.description ) &&
      !isBlank( this.fleetvm.type ) &&
      !isBlank( this.fleetvm.category ) &&
      ( this.imagefile != null );

    this.validated = v;
  }

  onSelect( e ) {
    try {
      this.imagefile = e[0];
      this.validation();
    } catch ( x ) {
      console.log( x );
    }
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
      name: this.fleetvm.name,
      description: this.fleetvm.description,
      type: this.fleetvm.type,
      category: this.fleetvm.category
    };

    const file = this.imagefile;

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        /*
         * 1. post to api with fleet.id == null (create)
         */
        const ownerid = a.id;
        this.api.postFleet( ownerid,fleet ).subscribe(
          f => {
            /*
             * 2. upload file to storage, with fleet.id in the name
             */
            const uploadtask = firebase.storage().ref().child( 'fleet/fleet.imageURL.'+f.id ).put( file );
            uploadtask.on( firebase.storage.TaskEvent.STATE_CHANGED,
              (snapshot) => {},
              e => { this.onError( e ); },
              () => {
                /*
                 * 3. set fleet.imageURL,post to api with fleet.id != null (update)
                 */
                f.imageURL = uploadtask.snapshot.downloadURL;
                this.api.postFleet( ownerid,f ).subscribe(
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
    );
  }

  private onError( e ) {
    console.log( e );
    this.working = false;
  }
}
