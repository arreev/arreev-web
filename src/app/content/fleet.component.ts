
import { Component,OnInit,OnDestroy } from '@angular/core';
import { Transporter } from '../model/transporter';
import { API } from '../api.service';

@Component({
  selector: 'app-fleet',
  templateUrl: './fleet.component.html',
  styleUrls: ['./fleet.component.css']
})
export class FleetComponent implements OnInit,OnDestroy
{
  transporters: Transporter[];
  cols: any[];

  constructor( private api:API ) {}

  ngOnInit(): void {
    this.transporters = [
      { vin:'934876782346873',name:'shutle bus',number:332,description:'lax to van nuys flyaway',marquee:'van nuys' },
      { vin:'348972347902309',name:'shutle bus',number:212,description:'lax to union station',marquee:'union station' },
      { vin:'783472390809804',name:'shutle bus',number:181,description:'lax to westwood',marquee:'westwood' },
    ];

    this.cols = [
      { field:'name',header:'name' },
      { field:'number',header:'number' },
      { field:'description',header:'description' },
      { field:'vin',header:'vin' },
      { field:'marquee',header:'marquee' }
    ];
  }

  ngOnDestroy(): void {}
}
