
import { Component,OnDestroy,OnInit } from '@angular/core';
import { environment } from '../environments/environment';

import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  template: '<div><app-app *ngIf="ready"></app-app></div>'
})
/**
 *
 */
export class AppRootComponent implements OnInit,OnDestroy
{
  ready = false;

  private unsubscribe = null;

  constructor() {
    console.log( 'AppRootComponent' );
    firebase.initializeApp( environment.firebase );
  }

  ngOnInit(): void {
    setTimeout( () => { this.ready = true; },50 );
  }

  ngOnDestroy(): void {}
}
