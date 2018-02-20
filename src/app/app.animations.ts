
import { animate,state,style,transition,trigger } from '@angular/animations';

export let appFade = trigger('app-fade',[
  state('void',style({ opacity:0 }) ),
  transition('void <=> *',animate(2000 ) ) // or can use aliases ':enter,:leave'
] );
