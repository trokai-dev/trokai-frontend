export class Brand {
  slug: string;
  name: string;

  constructor(name: string, slug?: string) {
    this.name = name;
    this.slug = slug ?? '';
  }

  static markToRemove() {
    return new Brand('', '');
  }
}
