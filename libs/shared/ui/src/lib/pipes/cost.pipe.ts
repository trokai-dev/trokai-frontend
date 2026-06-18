import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cost', standalone: true })
export class CostPipe implements PipeTransform {
  transform(value: number): number {
    return value / 100;
  }
}
