import { Injectable, NgZone, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Route,
  UrlSegment,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

import { NavController } from '@ionic/angular/standalone';
import { AlertService } from '@trokai/shared-ui';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private ngZone = inject(NgZone);
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);
  private alertSerivce = inject(AlertService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    const allows = !!this.authService.getUserValue();

    if (!allows) this.authService.askToLogin();

    return allows;
  }

  // canLoad ao inves de canActivate para evitar que o lazy loaded baixe a pagina que nao poderei acessar
  canLoad(
    route: Route,
    segments: UrlSegment[],
  ): Observable<boolean> | Promise<boolean> | boolean {
    const allows = !!this.authService.getUserValue();

    if (!allows) this.authService.askToLogin();

    return allows;
  }
}
