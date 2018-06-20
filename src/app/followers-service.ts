
import * as followersActions from './store/followers.actions';
import { Invitation } from './model/invitation';
import { AccountGuard } from './accountguard';
import { FollowerState } from './app.state';
import { Injectable } from '@angular/core';
import { isNullOrUndefined } from 'util';
import * as firebase from 'firebase';
import { Store } from '@ngrx/store';

@Injectable()
export class FollowersService
{
  constructor( private accountguard:AccountGuard,private followersstore:Store<FollowerState> ) {
    accountguard.signedin.subscribe(() => this.sync() );
  }

  private sync() {
    firebase.database().ref('invitations' ).off('value' );
    firebase.database().ref('followers' ).off('value' );

    const ownerid = this.accountguard.getOwnerId();
    if ( isNullOrUndefined( ownerid ) ) { return; }

    firebase.database().ref('invitations' )
      .orderByChild('accepted' )
      .equalTo( ownerid )
      .on('value',s => this.invitations( s ) );
  }

  private invitations( snapshot:firebase.database.DataSnapshot ) {
    const invitations: Invitation[] = [];

    snapshot.forEach( s => {
      const invitation: Invitation = s.val() as Invitation;
      invitations.push( invitation );
      return false;
    });

    // TODO: put invitations into store ?

    invitations.filter(i => (i.status === 'accepted') ).forEach(i => {
      firebase.database().ref('followers' )
        .child( i.ownerid )
        .child( i.personid )
        .on('value',s => this.followers( s,i.personid ) );
      } );
  }

  private followers( snapshot:firebase.database.DataSnapshot,personid:string ) {
    snapshot.forEach( s => {
      const transporterid = s.key;
      const followable = s.val();
      const follower = {
        id:(personid+':'+transporterid),
        personid:personid,
        transporterid:transporterid,
        followable:followable
      };
      this.followersstore.dispatch( new followersActions.Update( follower ) );
      return false;
    } );
  }
}
