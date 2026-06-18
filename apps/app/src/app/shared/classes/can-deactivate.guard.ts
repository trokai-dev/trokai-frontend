import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs';
import { IDeactivatableComponent } from 'src/app/shared/classes/deactivatable-component.interface';

@Injectable()
export class CanDeactivateGuard {
  canDeactivate(
    component: IDeactivatableComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    return component.canDeactivate();
  }
}
