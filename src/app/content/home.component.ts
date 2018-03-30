
import { Component,OnInit,OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit,OnDestroy
{
  constructor( private router:Router ) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {}
}
