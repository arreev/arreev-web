
import { Component,OnInit,OnDestroy } from '@angular/core';
import { NavigationEnd,Router,RouterEvent } from '@angular/router';

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

  constructor( private router:Router ) {
    router.events.subscribe(e => { this.routerEvent( e as RouterEvent ); } );
    this.currentroute = router.routerState.snapshot.url.replace('/','' );
  }

  ngOnInit(): void {}

  onContent( content:string ) {
    this.router.navigate( [ content ] ).catch( error => console.log( error ) );
  }

  ngOnDestroy(): void {}

  private routerEvent( event:RouterEvent ) {
    if ( event instanceof NavigationEnd ) {
      this.currentroute = event.url.replace('/','' );
    }
  }
}
