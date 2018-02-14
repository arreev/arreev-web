
import { Component,OnInit,OnDestroy } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit,OnDestroy
{
  shownavbar = true;

  constructor() {}

  ngOnInit(): void {}
  ngOnDestroy(): void {}
}
