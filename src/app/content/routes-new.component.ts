
import { Component,OnInit,OnDestroy,ViewEncapsulation,Input,EventEmitter,Output } from '@angular/core';
import { Storage } from '@google-cloud/storage';
import { AccountState } from '../app.state';
import { Route } from '../model/route';
import { API } from '../api.service';
import { Store } from '@ngrx/store';
import { isBlank } from '../util';

import * as firebase from 'firebase';

interface RouteVM extends Route
{
}

@Component({
  selector: 'app-routes-new',
  templateUrl: './routes-new.component.html',
  styleUrls: ['./routes-new.component.css'],
  encapsulation: ViewEncapsulation.None

})
export class RoutesNewComponent implements OnInit,OnDestroy
{
  @Output() finished = new EventEmitter<void>();

  routevm = { name:'',description:'',type:'',category:'' };
  validated = false;
  working = false;

  private imagefile?: File = null;

  constructor( private api:API,private accountstore:Store<AccountState> ) {}

  ngOnInit(): void {
    const storageref = firebase.storage().ref();
  }

  validation() {
    let v = false;

    v = !isBlank( this.routevm.name ) &&
      !isBlank( this.routevm.description ) &&
      !isBlank( this.routevm.type ) &&
      !isBlank( this.routevm.category );
      // ( this.imagefile != null );

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
    this.addNewRouteWithoutImage();
  }

  ngOnDestroy(): void {}

  private addNewRouteWithoutImage() {
    this.working = true;

    const route: Route = {
      name: this.routevm.name,
      description: this.routevm.description,
      type: this.routevm.type,
      category: this.routevm.category
    };

    const file = this.imagefile;

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        const ownerid = a.id;
        this.api.postRoute( ownerid,route ).subscribe(
          r => {
            this.working = false;
            this.finished.emit();
          },
          e => { this.onError( e ); },
          () => {}
        );
      }
    );
  }

  /*
   * https://firebase.google.com/docs/storage/web/upload-files?authuser=1
   * https://firebase.google.com/docs/storage/security/start?authuser=1
   */
  private addNewRouteWithImage() {
    this.working = true;

    const route: Route = {
      name: this.routevm.name,
      description: this.routevm.description,
      type: this.routevm.type,
      category: this.routevm.category
    };

    const file = this.imagefile;

    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        /*
         * 1. post to api with route.id == null (create)
         */
        const ownerid = a.id;
        this.api.postRoute( ownerid,route ).subscribe(
          r => {
            /*
             * 2. upload file to storage, with route.id in the name
             */
            const uploadtask = firebase.storage().ref().child('route/route.imageURL.'+r.id ).put( file );
            uploadtask.on( firebase.storage.TaskEvent.STATE_CHANGED,
              (snapshot) => {},
              e => { this.onError( e ); },
              () => {
                /*
                 * 3. set route.imageURL,post to api with route.id != null (update)
                 */
                r.imageURL = uploadtask.snapshot.downloadURL;
                this.api.postRoute( ownerid,r ).subscribe(
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
