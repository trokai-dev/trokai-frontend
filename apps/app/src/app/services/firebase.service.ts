import { Injectable } from '@angular/core';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { environment } from 'src/environments/environment';

export class FirebaseService {
  initialize(): void {
    if (environment.production)
      FirebaseAnalytics.initializeFirebase(environment.firebaseConfig);
  }

  log(name: string, params?: any): void {
    if (environment.production) FirebaseAnalytics.logEvent({ name, params });
  }

  setScreen(screenName: string, nameOverride: string) {
    if (environment.production)
      FirebaseAnalytics.setScreenName({ screenName, nameOverride });
  }

  setUser(userId: string) {
    if (environment.production) FirebaseAnalytics.setUserId({ userId });
  }
}
