
import { animate,query,stagger,state,style,transition,trigger } from '@angular/animations';

export let appFade = trigger('app-fade',[
  state('void',style({ opacity:0 }) ),
  transition('void <=> *',animate(2000 ) ) // or can use aliases ':enter,:leave'
] );

export let gridAnimation = trigger('grid-animation',[
  transition('* => *',[
    query(':enter',[
      style({ opacity:0 } ),stagger(125,animate('.5s',style({ opacity:1 } ) ) )
    ],{ optional:true } )
  ] )
] );


export let scaleInAnimation = trigger('scale-in',[
  state('in',style({ transform:'scale(1)' } ) ),
  transition('void => *',[ style({ transform:'scale(0)' } ),animate('250ms ease-in' ) ] ),
] );

export let activeStateAnimation = trigger('active-state',[
  state('inactive',style({ opacity:'1',transform:'scale(1.00)' } ) ),
  state('active',style({ opacity:'1',transform:'scale(1.05)' } ) ),
  transition('inactive => active',animate('100ms ease-in' ) ),
  transition('active => inactive',animate('100ms ease-out' ) )
] );

