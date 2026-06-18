import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AutoUnsubscribe implements OnDestroy {
  private destroy$ = new Subject<void>();

  protected takeUntilDestroy<T>() {
    return (source: T) => source as T & { takeUntil: Subject<void> };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected get destroySignal() {
    return this.destroy$;
  }
}
