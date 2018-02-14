
import { Component,OnInit,OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor( private router:Router ) {}

  ngOnInit(): void {}

  onContent( content:string ) {
    this.currentroute = content;
    this.router.navigate( [ content ] ).catch( error => console.log( error ) );
  }

  ngOnDestroy(): void {}
}
