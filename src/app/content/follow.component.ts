
import { Component,OnInit,OnDestroy } from '@angular/core';
import { API } from '../api.service';

@Component({
  selector: 'app-follow',
  templateUrl: './follow.component.html',
  styleUrls: ['./follow.component.css']
})
export class FollowComponent implements OnInit,OnDestroy
{
  lat = 34.052234;
  lng = -118.243685;

  constructor( private api:API ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
