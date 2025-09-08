import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatCurrency' })
export class FormatCurrencyPipe implements PipeTransform {
    private symbols: Record<string, string> = {
        PLN: 'zł',
        EUR: '€',
        USD: '$'
    };

    transform(value: string | null | undefined): string | null {
        if (!value) return null;
        return this.symbols[value] || value;
    }
}