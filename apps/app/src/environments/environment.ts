export const environment = {
  production: false,

  defaultAvatar: 'https://images.trokai.com.br/default_avatars/girl.png',
  defaultAvatar1: 'https://images.trokai.com.br/default_avatars/girl.png',

  // AMBIENTE PRODUCAO NOVO ---------------------------------------------------------------

  // urlApi: 'https://api-prod.trokai.com',
  imageURL: 'https://images.trokai.com.br/users/',

  // AMBIENTE LOCAL ----------------------------------------------------------------------

  urlApi: 'http://localhost:3987',
  // imageURL: 'https://images.trokai.com.br/users_dev/',

 // AMBIENTE HOMOLOGACAO ----------------------------------------------------------------------

  // urlApi: 'https://api-dev.trokai.com',
  // imageURL: 'https://images.trokai.com.br/users_dev/',


  firebaseConfig: {
    apiKey: 'AIzaSyDEkb2Mi8eBAkt7839MBpVxS-X6PfSr5ko',
    authDomain: 'trokai.firebaseapp.com',
    databaseURL: 'https://trokai.firebaseio.com',
    projectId: 'trokai',
    storageBucket: 'trokai.appspot.com',
    messagingSenderId: '311804597430',
    appId: '1:311804597430:web:d2fa3fd72650dacf1dc217',
    measurementId: 'G-Y12X5N3JTW',
  },

  googleAuth: {
    webClientId:
      '311804597430-3vn51fgs1kecd4fp7bmab43am26q4s9a.apps.googleusercontent.com',
    iosClientId:
      '311804597430-d24753bo3erd3evbn0q9gv6mbbkifi94.apps.googleusercontent.com',
  },

  mapsGeocodingKey: 'AIzaSyAmJRXF4iK8icFHoALz-B6_3lLh6D5kiJE',

  mobileVersion: 41,
};
