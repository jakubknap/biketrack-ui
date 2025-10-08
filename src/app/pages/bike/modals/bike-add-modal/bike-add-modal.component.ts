import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BikeService } from 'src/app/pages/bike/service/bike.service';
import { ModalCloseStatus } from 'src/app/shared/enums/modal-close-status.enum';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { safeTextValidator } from 'src/app/shared/validators/form-validators';
import { AddBikeRequest } from '../../model/bike.model';
import { PhotoFile } from 'src/app/shared/models/file';

@Component({
  selector: 'app-bike-add-modal',
  templateUrl: './bike-add-modal.component.html'
})
export class BikeAddModalComponent implements OnInit {

  readonly MAX_FILE_SIZE_MB = 10;
  readonly ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

  @ViewChild('modalContent') modalContent!: ElementRef;

  @Output() closed = new EventEmitter<{ status: ModalCloseStatus, message?: string }>();

  addBikeForm!: FormGroup;

  photo: PhotoFile | null = null;
  photoErrors: string[] = [];
  fullscreenIndex: number | null = null;

  loading = false;
  errorMessage: string | null = null;

  constructor(private formBuilder: FormBuilder,
              private bikeService: BikeService) { }

  ngOnInit() {
    this.addBikeForm = this.formBuilder.group({
      name: [null, [safeTextValidator, Validators.required, Validators.maxLength(255)]],
      brand: [null, [safeTextValidator, Validators.maxLength(255)]],
      model: [null, [safeTextValidator, Validators.maxLength(255)]],
      type: [null, [safeTextValidator, Validators.required, Validators.maxLength(255)]],
      purchaseDate: [null],
      serialNumber: [null, [safeTextValidator, Validators.maxLength(255)]],
      mileageKm: [null, [safeTextValidator, Validators.maxLength(255)]],
      description: [null, [safeTextValidator, Validators.maxLength(255)]]
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.photoErrors = [];

    const ext = file.name.split('.').pop()?.toLowerCase();
    const fileSizeMB = file.size / (1024 * 1024);

    if (!file.type.startsWith('image/') || !ext || !this.ALLOWED_EXTENSIONS.includes(ext)) {
      this.photoErrors.push(`❌ ${file.name} – niedozwolony format.`);
      input.value = '';
      return;
    }

    if (fileSizeMB > this.MAX_FILE_SIZE_MB) {
      this.photoErrors.push(`❌ ${file.name} – przekracza ${this.MAX_FILE_SIZE_MB} MB.`);
      input.value = '';
      return;
    }

    this.photo = Object.assign(file, {
      previewUrl: URL.createObjectURL(file)
    });

    input.value = '';
  }

  dismissPhotoError(index: number) {
    this.photoErrors.splice(index, 1);
  }

  removePhoto(): void {
    if (this.photo) {
      URL.revokeObjectURL(this.photo.previewUrl);
      this.photo = null;
    }
  }

  openPhoto(index: number) {
    this.fullscreenIndex = index;
  }

  closePhoto() {
    this.fullscreenIndex = null;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (this.fullscreenIndex !== null) {
      if (event.key === 'Escape') this.closePhoto();
    }
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

  private prepareRequest(): FormData {
    const formData = new FormData();
    const addBikeRequest: AddBikeRequest = this.prepareAddBikeRequest();

    formData.append('bikeData', new Blob([JSON.stringify(addBikeRequest)], { type: 'application/json' }));

    if (this.photo) {
      formData.append('bikePhoto', this.photo, this.photo.name);
    }

    return formData;
  }

  private prepareAddBikeRequest(): AddBikeRequest {
    return {
      name: this.addBikeForm.value.name,
      brand: this.addBikeForm.value.brand,
      model: this.addBikeForm.value.model,
      type: this.addBikeForm.value.type,
      purchaseDate: this.addBikeForm.value.purchaseDate,
      serialNumber: this.addBikeForm.value.serialNumber,
      mileageKm: this.addBikeForm.value.mileageKm,
      description: this.addBikeForm.value.description
    };
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
