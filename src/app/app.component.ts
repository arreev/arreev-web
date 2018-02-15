
import { Component,OnInit,OnDestroy } from '@angular/core';
import { Authentication } from './authentication.service';
import { SharedService } from './shared.service';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import 'rxjs/add/observable/of';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit,OnDestroy
{
  loggedin = false;
  avatarURL$?:Observable<string>;

  constructor( private router:Router,private shared:SharedService ,private authentication:Authentication ) {
    this.avatarURL$ = shared.avatarURL;
  }

  ngOnInit(): void {
    this.loggedin = ( this.authentication.isAuthorized() === true );
  }

  onArreev() {
    this.router.navigate( [ 'home' ] ).catch( error => console.log( error ) );
  }

  onAccount() {}

  onLogin() {
    this.authentication.logout();
    this.loggedin = ( this.authentication.isAuthorized() === true );
    this.router.navigate([ 'login' ] );
  }

  onLogout() {
    this.authentication.logout();
    this.loggedin = ( this.authentication.isAuthorized() === true );
    this.router.navigate([ 'login' ] );
  }

  hello() { console.log( 'hello' ); }

  ngOnDestroy(): void {}
}
