
import { Component,OnInit,OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { UserService } from './user.service';

import 'rxjs/add/observable/of';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit,OnDestroy
{
  avatarURL$?:Observable<string>;

  constructor( private userService:UserService ) {
    this.avatarURL$ = Observable.of( '/assets/avatar.png' );
  }

  ngOnInit(): void {}

  onArreev() {}
  onAccount() {}

  hello() { console.log( 'hello' ); }

  ngOnDestroy(): void {}
}
