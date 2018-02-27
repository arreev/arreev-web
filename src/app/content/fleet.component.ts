
import { Component,OnInit,OnDestroy,ViewEncapsulation } from '@angular/core';
import { Transporter } from '../model/transporter';
import { Observable } from 'rxjs/Observable';
import { AccountState } from '../app.state';
import { Fleet } from '../model/fleet';
import { MenuItem } from 'primeng/api';
import { API } from '../api.service';
import { Store } from '@ngrx/store';

import { trigger,stagger,transition,query,style,animate } from '@angular/animations';

@Component({
  selector: 'app-fleet',
  templateUrl: './fleet.component.html',
  styleUrls: ['./fleet.component.css'],
  /*
   * https://angular.io/api/animations/stagger
   */
  animations: [
    trigger( 'grid-animation',[
      transition('* => *',[
        query(':enter',[
          style({ opacity:0 } ),stagger(100,animate('.5s',style({ opacity:1 } ) ) )
        ],{ optional:true } )
      ] )
    ] )
  ],
  encapsulation: ViewEncapsulation.None

})
export class FleetComponent implements OnInit,OnDestroy
{
  fleets: Fleet[] = [];
  selectedfleet?: Fleet = null;
  showfleetnew = false;

  constructor( private api:API,private accountstore:Store<AccountState> ) {}

  ngOnInit(): void {
    this.fetch();
  }

  onAddFleet() {
    this.showfleetnew = true;
  }

  onAddTransporter() {

  }

  onRefresh() {
    this.selectedfleet = null;
    this.fetch();
  }

  onFleet( fleet:Fleet ) {
    this.selectedfleet = null;
    Observable.timer( 100 ).subscribe(
      n => {
        this.selectedfleet = fleet;
      }
    );
  }

  onFinishedFleetNew() {
    console.log( 'onFinishedFleetNew' );
    this.showfleetnew = false;
    Observable.timer( 500 ).subscribe(
      n => { this.fetch(); }
    );
  }

  ngOnDestroy(): void {}

  private fetch() {
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        if ( a.id == null ) {
          this.api.getAccount().subscribe(
            aa => { this.getFleets(0,100 ); }
          );
        } else {
          this.getFleets(0,100 );
        }
      }
    );
  }

  /*
   * TODO: support paging
   * TODO: assert account is valid ? (logged in?)
   */
  private getFleets( start:number,count:number ) {
    const _fleets: Fleet[] = [];
    this.accountstore.select('account' ).take( 1 ).subscribe(
      a => {
        this.api.getFleets( a.id ).subscribe(
          f => { _fleets.push( f ); },
          e => {},
          () => { this.fleets = _fleets; }
        );
      }
    );
  }
}

