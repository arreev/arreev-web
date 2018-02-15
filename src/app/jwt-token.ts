
/*
{
  "sub": "2915766b-75ea-4540-8003-2c1cfbd845d2",
  "cognito:groups": [
    "admin",
    "user"
  ],
  "email_verified": true,
  "cognito:preferred_role": "arn:aws:iam::148500806662:role/service-role/mgp-private-role",
  "iss": "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_n3Is5FJ0D",
  "cognito:username": "2915766b-75ea-4540-8003-2c1cfbd845d2",
  "cognito:roles": [
    "arn:aws:iam::148500806662:role/service-role/mgp-private-role",
    "arn:aws:iam::148500806662:role/service-role/mgp-public-role"
  ],
  "aud": "3one8mhjmhqj1uo4ui87vffsuh",
  "token_use": "id",
  "auth_time": 1510681781,
  "exp": 1510685381,
  "iat": 1510681781,
  "email": "jschulz@giant-interactive.com"
}
 */
export class JWTPayload
{
  iss?: string;
  sub?: string;
  aud?: string;
  email?: string;
  token_use?: string;
}

export class JWTToken
{
  private token:string;

  constructor( token:string ) {
    this.token = token || '';
  }

  decodePayload() : JWTPayload {
    let payload:JWTPayload = new JWTPayload();

    try {
      const encoded = this.token.split( '.' )[ 1 ];
      const encoding = 'base64';
      const buffered = Buffer.from( encoded,encoding );
      const decoded = buffered.toString( 'utf8' );
      payload = JSON.parse( decoded ) as JWTPayload;
    } catch ( x ) {
      console.log( x );
    }

    return payload;
  }
}
