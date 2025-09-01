import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatCurrency' })
export class FormatCurrencyPipe implements PipeTransform {
    private symbols: Record<string, string> = {
        PLN: 'zł',
        EUR: '€',
        USD: '$'
    };

    transform(value: string | null | undefined): string {
        if (!value) return '';
        return this.symbols[value] || value;
    }
}