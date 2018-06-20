
import { Transporter } from './model/transporter';
import { Follow } from './model/follow';
import { Follower } from './model/follower';
import { Fleet } from './model/fleet';
import { Route } from './model/route';
import { Waypoint } from './model/waypoint';
import { Assignment } from './model/assignment';

export interface FleetState { fleet: Fleet; }
export interface TransporterState { transporter: Transporter; }
export interface FollowState { follow: Follow; }
export interface FollowerState { follower: Follower; }
export interface RouteState { route: Route; }
export interface AssignmentState { assignment: Assignment; }
export interface WaypointState { waypoint: Waypoint; }
