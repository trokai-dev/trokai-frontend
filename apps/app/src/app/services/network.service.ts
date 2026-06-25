import { inject, Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';
import { FeedbackService } from '@trokai/shared-core';
import { PluginListenerHandle } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private feedback = inject(FeedbackService);

  private sub: PluginListenerHandle;
  private _status = new BehaviorSubject<boolean>(undefined);

  get connected$() {
    return this._status.asObservable();
  }

  public async start() {
    Network.addListener('networkStatusChange', (status) => {
      const lastStatus = this._status.value;
      this._status.next(status.connected);
      console.log('Network status changed: ', status.connected);
      if (lastStatus !== undefined && lastStatus !== status.connected) {
        // se nao for a primeira vez
        if (status.connected) this.feedback.success('Conectado');
        else this.feedback.error('Sem conexão');
      }
    });

    const status = await Network.getStatus();
    this._status.next(status.connected);

    console.log('Network service started with status: ', status.connected);
  }

  async isConnected() {
    return this._status.value;
  }

  public stop() {
    this.sub.remove();
  }
}
