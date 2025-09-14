import { Directive, HostListener, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({ selector: '[EmptyToNull]' })
export class EmptyToNullDirective {

    constructor(@Self() private ngControl: NgControl) { }

    @HostListener('keyup', ['$event']) onKeyDowns(event: KeyboardEvent) {
        if (this.ngControl.value?.trim() === '') {
            this.ngControl.reset(null);
        }
    }
}