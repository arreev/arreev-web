
import { Transporter } from './model/transporter';
import { Account } from './model/account';
import { Follow } from './model/follow';
import { Fleet } from './model/fleet';
import { Route } from './model/route';

export interface AccountState { account: Account; }
export interface FleetState { fleet: Fleet; }
export interface TransporterState { transporter: Transporter; }
export interface FollowState { follow: Follow; }
export interface RouteState { route: Route; }
