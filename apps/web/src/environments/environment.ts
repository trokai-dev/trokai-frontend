// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // urlApi: 'https://trokai.loca.lt/',
  urlApi: 'http://localhost:3987',
  // urlApi: 'https://api-prod.trokai.com',
  // imageURL: 'https://images.trokai.com.br/users/',
  imageURL: 'https://images.trokai.com.br/users_dev/',
  defaultAvatar: 'https://images.trokai.com.br/default_avatars/girl.png',
  defaultAvatar1: 'https://images.trokai.com.br/default_avatars/girl.png',
  gtm: 'GTM-PWM499L',
  clarity: 's16jrlwvdi',
  domain: 'https://www.trokai.com.br',
  mapsGeocodingKey: 'AIzaSyAmJRXF4iK8icFHoALz-B6_3lLh6D5kiJE',
  googleOAuthClientId:
    '311804597430-3vn51fgs1kecd4fp7bmab43am26q4s9a.apps.googleusercontent.com',
  appleClientId: 'com.trokai.appleauth',
  appleRedirectUri: 'https://www.trokai.com.br/auth/apple',
  appCustomScheme: 'trokai://',
  appStoreLink: 'https://apps.apple.com/us/app/troka%C3%AD/id1487495619',
  googlePlayLink:
    'https://play.google.com/store/apps/details?id=com.trokai.mobile',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
