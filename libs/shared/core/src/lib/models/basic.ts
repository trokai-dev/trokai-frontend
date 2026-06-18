export class BasicModel<T = number> {
  _id!: T;
  value!: string;

  constructor(id: T, value: string) {
    this._id = id;
    this.value = value;
  }
}
