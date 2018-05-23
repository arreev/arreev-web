
import { Component,OnDestroy,OnInit } from '@angular/core';
import { AccountGuard } from './accountguard';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-signin',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit,OnDestroy
{
  email?: string = null;
  password?: string = null;
  message = '';

  private accountguardSubscription?: Subscription = null

  constructor( private accountguard:AccountGuard ) {}

  ngOnInit(): void { this._ngOnInit(); }
  onSignIn() { this._onSignIn(); }
  ngOnDestroy(): void { this._ngOnDestroy(); }

  /********************************************************************************************************************/

  private _ngOnInit(): void {
    this.accountguardSubscription = this.accountguard.signinerror.skip( 1 ).subscribe((m:string) => { this.setMessage( m ); } );
  }

  private _onSignIn() {
    this.message = '';
    this.accountguard.signIn( this.email,this.password );
  }

  private setMessage( m:string ) {
    this.message = m ? m.replace( 'auth/','' ) : '';
  }

  private _ngOnDestroy(): void {
    if ( this.accountguardSubscription ) { this.accountguardSubscription.unsubscribe(); }
  }
}
