import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchPageService {
  private _mainSearchText = new BehaviorSubject<string>('');

  get mainSearchText$() {
    return this._mainSearchText.asObservable();
  }

  setMainSearchText(text: string) {
    this._mainSearchText.next(text);
  }
}
