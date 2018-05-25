
import { Component,OnInit,OnDestroy } from '@angular/core';
import { Router,RouterStateSnapshot } from '@angular/router';
import { RouterStateUrl } from './store/router.reducer';
import { RouterReducerState } from '@ngrx/router-store';
import * as fromRouter from './store/router.reducer';
import { Subscription } from 'rxjs/Subscription';
import { AccountGuard } from './accountguard';
import { Store } from '@ngrx/store';

import { animate,state,style,transition,trigger } from '@angular/animations';
import { appFade } from './app.animations';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/skip';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    appFade,
    /*
     * https://angular.io/guide/animations
     * https://angular.io/api/animations/state
     */
    trigger('sidenav-animation',[
      state('open', style({ transform:'rotate( 0deg)' } ) ),
      state('close',style({ transform:'rotate(180deg)' } ) ),
      transition('* => *',animate('200ms' ) )
    ]),
    trigger('sidebar-animation',[
      state('open', style({ transform:'rotate(180deg)' } ) ),
      state('close',style({ transform:'rotate(  0deg)' } ) ),
      transition('* => *',animate('200ms' ) )
    ])
  ]
})
export class AppComponent implements OnInit,OnDestroy
{
  letters: string[] = [ 'a','r','r','e','e','v' ];
  showinfo?: boolean;
  sidenavstate = 'open';
  sidebarstate = 'close';
  signedin = false;
  myaccounttooltip = 'sign-in';

  private accountguardSubscription?: Subscription = null;

  constructor( private router:Router,
               private accountguard:AccountGuard,
               private routerstore:Store<RouterStateUrl> ) {}

  ngOnInit(): void {
    this.accountguardSubscription = this.accountguard.signedin.subscribe((b:boolean) => {
      this.myaccounttooltip = b ? 'sign-out' : 'sign-in';
      this.signedin = b;
    } );

    this.routerstore.select( fromRouter.getRouterState ).subscribe( (rs:RouterReducerState<RouterStateUrl>) => {
      if ( rs ) {
        // console.log( rs.state.url  );
      }
    } );
  }

  onMyAccount() {
    if ( this.signedin ) {
      this.accountguard.signOut();
    }
    this.router.navigate([ 'sign-in' ],{ queryParams:{ forced:true } } ).catch( error => console.log( error ) );
  }

  openedSidenavStart() { this.sidenavstate = 'open'; }
  closedSidenavStart() { this.sidenavstate = 'close'; }

  openedSidebarStart() { this.sidebarstate = 'open'; }
  closedSidebarStart() { this.sidebarstate = 'close'; }

  onHome() {
    this.router.navigate([ 'home' ] ).catch( error => console.log( error ) );
  }

  onArreev() {}

  onAccount() {
    this.router.navigate([ 'account' ] );
  }

  onInfo() {
    this.showinfo = true;
  }

  ngOnDestroy(): void {
    if ( this.accountguardSubscription ) { this.accountguardSubscription.unsubscribe(); }
  }
}
