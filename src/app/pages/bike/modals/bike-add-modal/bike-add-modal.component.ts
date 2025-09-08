import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BikeService } from 'src/app/pages/bike/service/bike.service';
import { ModalCloseStatus } from 'src/app/shared/enums/event-emitter.enum';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { safeTextValidator } from 'src/app/shared/validators/form-validators';

@Component({
  selector: 'app-bike-add-modal',
  templateUrl: './bike-add-modal.component.html'
})
export class BikeAddModalComponent implements OnInit {

  @ViewChild('modalContent') modalContent!: ElementRef;

  @Output() closed = new EventEmitter<{ status: ModalCloseStatus, message?: string }>();

  addBikeForm!: FormGroup;

  loading = false;
  errorMessage: string | null = null;

  constructor(private formBuilder: FormBuilder,
              private bikeService: BikeService) { }

  ngOnInit() {
    this.addBikeForm = this.formBuilder.group({
      name: [null, [safeTextValidator, Validators.required]],
      brand: [null, safeTextValidator],
      model: [null, safeTextValidator],
      type: [null, [safeTextValidator, Validators.required]],
      purchaseDate: [null],
      serialNumber: [null, safeTextValidator],
      mileageKm: [null, safeTextValidator],
      description: [null, safeTextValidator]
    });
  }

  get name() {
    return this.addBikeForm.get('name')!;
  }

  get brand() {
    return this.addBikeForm.get('brand')!;
  }

  get model() {
    return this.addBikeForm.get('model')!;
  }

  get type() {
    return this.addBikeForm.get('type')!;
  }

  get purchaseDate() {
    return this.addBikeForm.get('purchaseDate')!;
  }

  get serialNumber() {
    return this.addBikeForm.get('serialNumber')!;
  }

  get mileageKm() {
    return this.addBikeForm.get('mileageKm')!;
  }

  get description() {
    return this.addBikeForm.get('description')!;
  }

  onSubmit() {
    this.errorMessage = null;

    if (this.addBikeForm.invalid) {
      this.addBikeForm.markAllAsTouched();
      this.scrollToTop();
      return;
    }

    this.loading = true;

    this.bikeService.addBike(this.prepareRequest()).subscribe({
      next: () => {
        this.closed.emit({ status: ModalCloseStatus.SUCCESS })
      },
      error: (error: ApiErrorResponse) => {
        let status = error.status;

        this.loading = false;

        if (error.errors && error.errors.length > 0) {
          this.mapErrorValidationMessages(error);
        } else {
          this.errorMessage = this.mapErrorMessage(status);
        }

        this.scrollToTop();
      }
    });
  }

  close() {
    this.closed.emit({ status: ModalCloseStatus.DISMISSED });
  }

  private prepareRequest(): any {
    const formData = new FormData();
    formData.append('bikeData', new Blob([JSON.stringify({
      name: this.addBikeForm.value.name,
      brand: this.addBikeForm.value.brand,
      model: this.addBikeForm.value.model,
      type: this.addBikeForm.value.type,
      purchaseDate: this.addBikeForm.value.purchaseDate,
      serialNumber: this.addBikeForm.value.serialNumber,
      mileageKm: this.addBikeForm.value.mileageKm,
      description: this.addBikeForm.value.description
    })], { type: 'application/json' }));

    return formData;
  }

  private mapErrorValidationMessages(error: ApiErrorResponse) {
    if (!error.errors) return;

    error.errors.forEach(e => {
      const control = this.addBikeForm.get(e.field);
      if (control) {
        control.setErrors({ ...(control.errors || {}), backend: e.message });
      }
    });
  }

  private mapErrorMessage(status: string): string {
    switch (status) {
      default:
        return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }

  private scrollToTop() {
    if (this.modalContent) {
      this.modalContent.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}