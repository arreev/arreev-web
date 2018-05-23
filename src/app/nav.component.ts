
import { Component,OnInit,OnDestroy } from '@angular/core';
import { NavigationEnd,Router,RouterEvent } from '@angular/router';
import { AccountGuard } from './accountguard';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit,OnDestroy
{
  navbutton = 'nav-button';
  navbuttonselected = 'nav-button-selected';
  currentroute = '';
  email = '...';

  private accountguardSubscription?: Subscription = null;

  constructor( private router:Router,private accountguard:AccountGuard ) {
    router.events.subscribe(e => { this.routerEvent( e as RouterEvent ); } );
    this.currentroute = router.routerState.snapshot.url.replace('/','' );
  }

  ngOnInit(): void {
    this.accountguardSubscription = this.accountguard.signedin.subscribe(() => {
      this.email = this.accountguard.getEMail();
      if ( isNullOrUndefined( this.email ) ) {
        this.email = '...';
      } else {
        const indexof = this.email.lastIndexOf( '@' );
        if ( indexof > 0 ) {
          this.email = this.email.slice( 0,indexof+1 );
          this.email += '...';
        }
      }
    } );
  }

  onContent( content:string ) {
    this.router.navigate( [ content ] ).catch( error => console.log( error ) );
  }

  ngOnDestroy(): void {
    if ( this.accountguardSubscription ) { this.accountguardSubscription.unsubscribe(); }
  }

  private routerEvent( event:RouterEvent ) {
    if ( event instanceof NavigationEnd ) {
      this.currentroute = event.url.replace('/','' );
    }
  }
}
