import { AbstractControl, ValidatorFn } from '@angular/forms';

export default class Validation {

    static match(controlName: string, checkControlName: string): ValidatorFn {
        return (controls: AbstractControl) => {
            const control = controls.get(controlName);
            const checkControl = controls.get(checkControlName);

            if (!control || !checkControl) {
                return null;
            }

            const errors = checkControl.errors || {};

            if (!checkControl.value) {
                if (errors['matching']) {
                    delete errors['matching'];
                    checkControl.setErrors(Object.keys(errors).length ? errors : null);
                }
                return null;
            }

            if (control.value !== checkControl.value) {
                checkControl.setErrors({ ...errors, matching: true });
            } else {
                if (errors['matching']) {
                    delete errors['matching'];
                    checkControl.setErrors(Object.keys(errors).length ? errors : null);
                }
            }
            return null;
        };
    }
}
