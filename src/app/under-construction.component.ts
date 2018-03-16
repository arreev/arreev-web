
import { Component,OnInit,OnDestroy } from '@angular/core';

@Component({
  selector: 'app-test',
  template: '<div style="margin:25px;"><img src="./assets/under-construction.png"></div>',
})
export class UnderConstructionComponent implements OnInit,OnDestroy
{
  constructor() {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}
}
