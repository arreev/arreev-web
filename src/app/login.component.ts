
import { Validators,FormControl,FormGroup,FormBuilder } from '@angular/forms';
import { Component,OnInit,OnDestroy } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { Authentication } from './authentication.service';
import { Subscription } from 'rxjs/Subscription';
import { Message } from 'primeng/primeng';
import { Sync } from './sync.service';
import { Login } from './login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit,OnDestroy
{
  private subscription:Subscription;
  private content:string;

  messages: Message[] = [];
  loginform: FormGroup;
  submitted: boolean;
  blocked: boolean;
  oldpassword: string;
  new_password_required: boolean;
  resetcode: string;
  isadmin = true;

  constructor( private router:Router,private route:ActivatedRoute,private authentication:Authentication,private sync:Sync,private formbuilder:FormBuilder ) {}

  ngOnInit(): void {
    this.loginform = this.formbuilder.group({
      'email': new FormControl( '',Validators.required ),
      'password': new FormControl( '',Validators.compose([ Validators.required,Validators.minLength(8 ) ] ) )
    });

    this.authentication.logout();
    this.content = this.route.snapshot.queryParams[ 'content' ] || '/';
    this.clear();
  }

  onSubmit( value ) {
    this.submitted = true;
    this.messages = [];
    const email = this.loginform.get( 'email' ).value;
    const password = this.loginform.get( 'password' ).value;
    if ( this.new_password_required ) {
      this.forcedChangePassword( email,password );
    } else {
      this.login( email,password );
    }
  }

  onResetPassword() {
    const email = this.loginform.get( 'email' ).value;
    const password = this.loginform.get( 'password' ).value;
    this.authentication.confirmForgotPassword( email,this.resetcode,password );
  }

  private login( email:string,password:string ) {
    if ( this.subscription ) {
      this.subscription.unsubscribe();
    }

    this.blocked = true;

    this.subscription = this.authentication.login( email,password )
      .subscribe(
        login => { this.onNext( login ); },
        error => { this.onError( error ); }
      );
  }

  private forcedChangePassword( email:string,password:string ) {
    if ( this.subscription ) {
      this.subscription.unsubscribe();
    }

    this.blocked = true;

    this.subscription = this.authentication.forcedChangePassword( email,this.oldpassword,password )
      .subscribe(
        user => { this.login( email,password ); },
        error => { this.onChangeError( error ); }
      );
  }

  private onNext( login:Login ) {
    this.blocked = false;

    if ( login.new_password_requested === true ) {
      this.passwordExpired( true );
      this.messages.push( { severity:'warn',summary:'Password expired.',detail:'Please enter new password.' } );
    } else {
      this.passwordExpired( false );
      let goto = this.content;
      if ( !goto ) { goto = 'project'; }
      this.router.navigate( [ goto ] ).catch( error => { console.log( 'bad route '+this.content ); } );
      this.sync.getAccount();
    }
  }

  private onError( error:Error ) {
    this.blocked = false;
    this.messages.push( { severity:'warn',summary:'User not found.',detail:'Invalid email or password.' } );
  }

  private onChangeError( error:Error ) {
    this.blocked = false;
    this.messages.push( { severity:'warn',summary:'Failed.',detail:'Change password failed.' } );
  }

  private passwordExpired( expired:boolean ) {
    this.new_password_required = expired;
    this.oldpassword = this.loginform.get( 'password' ).value;
    if ( expired ) {
      const email = this.loginform.get( 'email' ).value;
      this.loginform.setValue( { 'email':email,'password':'' } );
    }
  }

  private clear() {
    this.new_password_required = false;
    this.oldpassword = '';
    this.loginform.setValue( { 'email':'','password':'' } );
  }

  ngOnDestroy(): void {
    this.clear();
    if ( this.subscription ) {
      this.subscription.unsubscribe();
    }
  }
}
