import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BikeService } from 'src/app/pages/bike/service/bike.service';
import { ModalCloseStatus } from 'src/app/shared/enums/modal-close-status.enum';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { safeTextValidator } from 'src/app/shared/validators/form-validators';
import { BikeDetails, EditBikeRequest } from '../../model/bike.model';

@Component({
  selector: 'app-bike-edit-modal',
  templateUrl: './bike-edit-modal.component.html'
})
export class BikeEditModalComponent implements OnInit {

  @Input() bikeUuid!: string;

  @ViewChild('modalContent') modalContent!: ElementRef;

  @Output() closed = new EventEmitter<{ status: ModalCloseStatus, message?: string }>();

  bikeDetails: BikeDetails | null = null;

  editBikeForm!: FormGroup;

  loading = false;
  errorMessage: string | null = null;

  constructor(private formBuilder: FormBuilder,
              private bikeService: BikeService) { }

  ngOnInit() {
    this.fetchBikeData();
  }

  private fetchBikeData(): void {
    this.errorMessage = null;
    this.loading = true;

    this.bikeService.getBikeDetails(this.bikeUuid).subscribe({
      next: (response) => {
        this.bikeDetails = response;

        this.editBikeForm = this.formBuilder.group({
          name: [this.bikeDetails.name, [safeTextValidator, Validators.required]],
          brand: [this.bikeDetails.brand, safeTextValidator],
          model: [this.bikeDetails.model, safeTextValidator],
          type: [this.bikeDetails.type, [safeTextValidator, Validators.required]],
          purchaseDate: [this.bikeDetails.purchaseDate],
          serialNumber: [this.bikeDetails.serialNumber, safeTextValidator],
          mileageKm: [this.bikeDetails.mileageKm, safeTextValidator],
          description: [this.bikeDetails.description, safeTextValidator]
        });


        this.loading = false;

      },
      error: (error: ApiErrorResponse) => {
        let status = error.status;

        this.loading = false;
        this.errorMessage = this.mapErrorMessage(status);

        this.scrollToTop();
      }
    });
  }

  get name() {
    return this.editBikeForm.get('name')!;
  }

  get brand() {
    return this.editBikeForm.get('brand')!;
  }

  get model() {
    return this.editBikeForm.get('model')!;
  }

  get type() {
    return this.editBikeForm.get('type')!;
  }

  get purchaseDate() {
    return this.editBikeForm.get('purchaseDate')!;
  }

  get serialNumber() {
    return this.editBikeForm.get('serialNumber')!;
  }

  get mileageKm() {
    return this.editBikeForm.get('mileageKm')!;
  }

  get description() {
    return this.editBikeForm.get('description')!;
  }

  onSubmit() {
    this.errorMessage = null;

    if (this.editBikeForm.invalid) {
      this.editBikeForm.markAllAsTouched();
      this.scrollToTop();
      return;
    }

    this.loading = true;

    this.bikeService.updateBike(this.prepareRequest()).subscribe({
      next: () => {
        this.closed.emit({ status: ModalCloseStatus.SUCCESS })
      },
      error: (error: ApiErrorResponse) => {
        let status = error.status;

        if (error.errors && error.errors.length > 0) {
          this.mapErrorValidationMessages(error);
        } else {
          this.errorMessage = this.mapErrorMessage(status);
        }

        this.loading = false;

        this.scrollToTop();
      }
    });
  }

  close() {
    this.closed.emit({ status: ModalCloseStatus.DISMISSED });
  }

  private prepareRequest(): FormData {
    const formData = new FormData();
    const editBikeRequest: EditBikeRequest = this.prepareEditBikeRequest();

    formData.append('bikeData', new Blob([JSON.stringify(editBikeRequest)], { type: 'application/json' }));

    return formData;
  }

  private prepareEditBikeRequest(): EditBikeRequest {
    return {
      bikeUuid: this.bikeDetails?.bikeUuid!,
      name: this.editBikeForm.value.name,
      brand: this.editBikeForm.value.brand,
      model: this.editBikeForm.value.model,
      type: this.editBikeForm.value.type,
      purchaseDate: this.editBikeForm.value.purchaseDate,
      serialNumber: this.editBikeForm.value.serialNumber,
      mileageKm: this.editBikeForm.value.mileageKm,
      description: this.editBikeForm.value.description
    };
  }

  private mapErrorValidationMessages(error: ApiErrorResponse) {
    if (!error.errors) return;

    error.errors.forEach(e => {
      const control = this.editBikeForm.get(e.field);
      if (control) {
        control.setErrors({ ...(control.errors || {}), backend: e.message });
      }
    });
  }

  private mapErrorMessage(status: string): string {
    switch (status) {
      case 'E05000':
        return 'Nie znaleziono roweru. Być może został on usunięty.';
      case 'E05001':
        return 'Nie masz uprawnień do edycji tego roweru.';
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