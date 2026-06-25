import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mxnCurrency', standalone: true })
export class MxnCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '$0.00';
    return `$${value.toFixed(2)}`;
  }
}
