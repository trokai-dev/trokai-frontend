import { ClothesStatus } from './clothes-status';
import { notNullOrEmpty, parseMultipleChoiceParam } from '../utils/params';

export class Filters {
  [key: string]: any;

  // single choice
  category?: number;
  age?: number;

  // multiple choice
  piece?: number[];
  size?: number[];
  condition?: number[];
  gender?: number[];

  // booleans
  sell?: boolean;
  promotional?: boolean;

  // numbers
  costLower?: number;
  costUpper?: number;

  // strings
  sorting?: string;
  text?: string;

  status?: ClothesStatus;

  static readonly singleChoiceFilters = ['category', 'age'];
  static readonly multipleChoiceFilters = [
    'gender',
    'size',
    'piece',
    'condition',
  ];
  static readonly booleanFilters = ['sell', 'promotional'];

  enabled() {
    return this.count() > 0;
  }

  count() {
    let on = 0;

    Filters.singleChoiceFilters.forEach((k) => {
      if (this[k] != null) on++;
    });

    Filters.multipleChoiceFilters.forEach((k) => {
      if (notNullOrEmpty(this[k])) on += this[k].length;
    });

    Filters.booleanFilters.forEach((k) => {
      if (this[k]) on++;
    });

    if (
      (this.costLower && this.costLower > 0) ||
      (this.costUpper && this.costUpper >= 0)
    )
      on++;

    return on;
  }

  set(params: Partial<Filters>) {
    // can be only one selection
    Filters.singleChoiceFilters.forEach((k) => {
      if (params[k] != null && typeof params[k] === 'string')
        params[k] = parseInt(params[k]);
    });

    // can be more than one selection
    Filters.multipleChoiceFilters.forEach((k) => {
      if (notNullOrEmpty(params[k])) {
        // if as string "1,2,3" convert to array [1,2,3]
        if (typeof params[k] === 'string') {
          params[k] = params[k].split(',').map((v) => parseInt(v));
        } else {
          params[k] = parseMultipleChoiceParam(params[k]);
        }
      }
    });

    // default sorting
    if (!params.sorting) params.sorting = 'relevance';

    if (params.costLower == 0 || isNaN(params.costLower!))
      delete params.costLower;
    if (params.costUpper == 0 || isNaN(params.costUpper!))
      delete params.costUpper;

    if (params.costLower)
      params.costLower = parseInt(params.costLower.toString());

    if (params.costUpper)
      params.costUpper = parseInt(params.costUpper.toString());

    if (params.status != null)
      params.status = parseInt(params.status.toString());
    else delete params.status;

    Object.assign(this, params);
  }

  getUrlParams() {
    const _f = { ...this };
    // convert arrays to strings with comma
    Filters.multipleChoiceFilters.forEach((k) => {
      if (notNullOrEmpty(_f[k])) _f[k] = _f[k].join(',');
    });

    return _f;
  }

  constructor(filters?: Partial<Filters>) {
    this.sorting = 'relevance';
    this.piece = [];
    this.size = [];
    this.gender = [];
    this.condition = [];

    if (filters) this.set(filters);
  }
}
