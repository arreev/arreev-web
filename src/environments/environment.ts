// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { StoreDevtoolsModule } from '@ngrx/store-devtools';

export const environment = {
  production: false,

  aws_region: 'us-west-2',
  aws_userpool_id: 'us-west-2_q3pK7mNmr',
  aws_userpool_appclientid: '3b17pag51qqcmndcql0079hap5',

  openweathermap_apikey: 'ef5b91a383228ba57ff9f478b8a74f27',

  arreev_api_host: 'https://arreev-api-195423.appspot.com',
  arreev_api_key: '1',

  firebase: {
    apiKey: 'AIzaSyDsWNUcP01oZFvjDUqWCtLqxOAOB6Tt-6g',
    authDomain: 'arreev-fireplace.firebaseapp.com',
    databaseURL: 'https://arreev-fireplace.firebaseio.com',
    projectId: 'arreev-fireplace',
    storageBucket: 'arreev-fireplace.appspot.com',
    messagingSenderId: '70966123442'
  },

  imports: [
    StoreDevtoolsModule.instrument({ maxAge:10 } )
  ]
};
