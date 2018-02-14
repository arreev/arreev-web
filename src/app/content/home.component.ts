
import { Component,OnInit,OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit,OnDestroy
{
  names:string[] = [];

  constructor( private router:Router ) {
    this.names.push( 'freddy' );
    this.names.push( 'cindy' );
    this.names.push( 'abigail' );
    this.names.push( 'wally' );
    this.names.push( 'ramsdahl' );
    this.names.push( 'pinkie' );
    this.names.push( 'snarky' );
    this.names.push( 'floods' );
    this.names.push( 'billy' );
    this.names.push( 'jimbo' );
    this.names.push( 'franklin' );
    this.names.push( 'beauregard' );
    this.names.push( 'staniel' );
    this.names.push( 'teeny' );
    this.names.push( 'maudlin' );
    this.names.push( 'perrywinkle' );
    this.names.push( 'deena' );
    this.names.push( 'arthur' );
    this.names.push( 'lummley' );
    this.names.push( 'tulips' );
    this.names.push( 'thurston' );
    this.names.push( 'sheister' );
    this.names.push( 'chinoweth' );
    this.names.push( 'bertie' );
    this.names.push( 'oscar' );
    this.names.push( 'madison' );
    this.names.push( 'grumpy' );
    this.names.push( 'zima' );
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {}
}
