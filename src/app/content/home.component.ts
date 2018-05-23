
import { Component,OnInit,OnDestroy,ViewEncapsulation } from '@angular/core';
import { activeStateAnimation,gridAnimation } from '../app.animations';
import { AccountGuard } from '../accountguard';
import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { API } from '../api.service';

class Claim
{
  name = '';
  imageURL?: string =  null;
  state = 'inactive';
  bookmarked = false;
  count = 0;
  route = '';

  constructor( name:string,imageURL:string,route:string ) {
    this.name = name;
    this.imageURL = imageURL;
    this.route = route;
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [ gridAnimation,activeStateAnimation ],
  encapsulation: ViewEncapsulation.Emulated
})
export class HomeComponent implements OnInit,OnDestroy
{
  selectedclaim?: Claim = null;
  claims: Claim[] = [];
  message = '';
  leaving = false;

  private readonly ridesclaim = new Claim( 'Ride','./assets/_rides.png','fleet' );
  private readonly routesclaim = new Claim( 'Route','./assets/_routes.png','routes' );
  private readonly groupsclaim = new Claim( 'Group','./assets/_people.png','people' );

  private ownerid?: string = null;

  constructor( private router:Router,private api:API,private accountguard:AccountGuard ) {}

  ngOnInit(): void { this._ngOnInit(); }

  cardBorder( claim:Claim ) : string { return this._cardBorder( claim ); }
  onClaim( claim:Claim ) { this._onClaim( claim ); }
  onBookmarkClaim( claim:Claim ) { this._onBookmarkClaim( claim ); }
  onUnBookmarkClaim( claim:Claim ) { this._onUnBookmarkClaim( claim ); }
  onSendMessage() {}

  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.claims.push( this.ridesclaim );
    this.claims.push( this.routesclaim );
    this.claims.push( this.groupsclaim );

    this.ownerid = this.accountguard.getOwnerId();

    if ( isNullOrUndefined( this.ownerid ) ) {
      this.accountguard.signedin.subscribe(
        b => {
          if ( b ) {
            this.ownerid = this.accountguard.getOwnerId();
            this.claimCounts();
          }
        }
      );
    } else {
      this.claimCounts();
    }
  }

  private _cardBorder( claim:Claim ) : string {
    return( this.selectedclaim === claim ? '2px solid #9090C0' : '' );
  }

  private _onClaim( claim:Claim ) {
    if ( this.leaving ) { return; }

    this.leaving = true;

    claim.state = 'active';

    this.selectedclaim = claim;
    setTimeout( () => {
      this.selectedclaim.state = 'inactive';
      this.selectedclaim = null;
      setTimeout( () => { this.router.navigate([ claim.route ] ); },100 );
    },100 );
  }

  private _onBookmarkClaim( claim:Claim ) {
    claim.bookmarked = true;
  }

  private _onUnBookmarkClaim( claim:Claim ) {
    claim.bookmarked = false;
  }

  private claimCounts() {
    if ( this.ownerid ) {
      this.api.getFleets( this.ownerid ).subscribe(f => {
        this.ridesclaim.count++;
        if ( f.imageURL ) { this.ridesclaim.imageURL = f.imageURL };
      } );

      this.api.getRoutes( this.ownerid ).subscribe(r => {
        this.routesclaim.count++;
        if ( r.imageURL )  { this.routesclaim.imageURL = r.imageURL; }
      } );

      this.api.getGroups( this.ownerid,'people' ).subscribe(g => {
        this.groupsclaim.count++;
        if ( g.imageURL ) { this.groupsclaim.imageURL = g.imageURL; }
      } );
    }
  }

  private _ngOnDestroy(): void {}
}
