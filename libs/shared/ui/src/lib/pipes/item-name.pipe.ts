import { Pipe, PipeTransform, inject } from '@angular/core';
import { CatalogService } from '@trokai/shared-data-access';

/**
 * Template facility for items-map name lookups — no per-component map plumbing.
 *   {{ clothes.gender | itemName: 'gender' }}
 *   {{ clothes.special | itemName: 'special' }}
 *   {{ clothes.category | itemName: 'category' }}
 *   {{ clothes.condition | itemName: 'condition' }}
 *   {{ clothes.age | itemName: 'age' }}
 *   {{ clothes.piece | itemName: 'piece' : clothes.category }}
 *   {{ clothes.size | itemName: 'size' : clothes.category : clothes.age }}
 *
 * Impure so the value resolves once the catalog (/init) has loaded.
 */
@Pipe({ name: 'itemName', standalone: true, pure: false })
export class ItemNamePipe implements PipeTransform {
  private catalog = inject(CatalogService);

  transform(
    id: number,
    kind:
      | 'gender'
      | 'special'
      | 'condition'
      | 'age'
      | 'category'
      | 'piece'
      | 'size',
    category?: number,
    age?: number,
  ): string {
    if (id == null) return '';

    switch (kind) {
      case 'gender':
        return this.catalog.getGenderName(id) ?? '';
      case 'special':
        return this.catalog.getSpecialName(id) ?? '';
      case 'condition':
        return this.catalog.getConditionName(id) ?? '';
      case 'age':
        return this.catalog.getAgeName(id) ?? '';
      case 'category':
        return this.catalog.getCategoryName(id) ?? '';
      case 'piece':
        return this.catalog.getPieceName(id, category!) ?? '';
      case 'size':
        return this.catalog.getSizeName(id, category!, age!) ?? '';
      default:
        return '';
    }
  }
}
