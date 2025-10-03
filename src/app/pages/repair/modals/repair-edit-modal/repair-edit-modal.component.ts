import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalCloseStatus } from 'src/app/shared/enums/modal-close-status.enum';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { safeTextValidator } from 'src/app/shared/validators/form-validators';
import { EditRepairRequest, RepairDetails } from '../../model/repair.model';
import { ReapirService } from '../../service/reapir.service';
import { PhotoFile } from "../../../../shared/models/file";

@Component({
  selector: 'app-repair-edit-modal',
  templateUrl: './repair-edit-modal.component.html'
})
export class RepairEditModalComponent implements OnInit {

  readonly MAX_PHOTOS = 10;
  readonly MAX_FILE_SIZE_MB = 10;
  readonly MAX_TOTAL_SIZE_MB = 100;
  readonly ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

  @Input() repairUuid!: string;

  @ViewChild('modalContent') modalContent!: ElementRef;

  @Output() closed = new EventEmitter<{ status: ModalCloseStatus, message?: string }>();

  repairDetails: RepairDetails | null = null;

  editRepairForm!: FormGroup;

  photos: PhotoFile[] = [];
  photoErrors: string[] = [];
  fullscreenIndex: number | null = null;

  loading = false;
  loadingErrorMessage: string | null = null;
  savingErrorMessage: string | null = null;

  constructor(private formBuilder: FormBuilder,
              private repairService: ReapirService) { }

  ngOnInit() {
    this.fetchRepairData();
  }

  fetchRepairData(): void {
    this.loading = true;
    this.loadingErrorMessage = null;
    this.savingErrorMessage = null;

    this.repairService.getRepairDetails(this.repairUuid).subscribe({
      next: (response) => {
        this.repairDetails = response;

        this.editRepairForm = this.formBuilder.group({
          bikeName: [{ value: this.repairDetails.bike.name, disabled: true }],
          title: [this.repairDetails.title, [safeTextValidator, Validators.required]],
          description: [this.repairDetails.description, safeTextValidator],
          cost: [this.repairDetails?.cost?.amount ? this.repairDetails?.cost?.amount.toString().replace('.', ',') : null, [Validators.min(0), Validators.pattern(/^-?\d+(\,\d{1,2})?$/)]],
          currency: [this.repairDetails?.cost?.currency ? this.repairDetails.cost.currency : 'PLN'],
          repairDate: [this.repairDetails.repairDate]
        });

        this.loadRepairPhotos();

        this.loading = false;
      },
      error: (error: ApiErrorResponse) => {
        let status = error.status;

        this.loadingErrorMessage = this.mapErrorMessage(status);
        this.loading = false;

        this.scrollToTop();
      }
    });
  }

  get title() {
    return this.editRepairForm.get('title')!;
  }

  get description() {
    return this.editRepairForm.get('description')!;
  }

  get cost() {
    return this.editRepairForm.get('cost')!;
  }

  get currency() {
    return this.editRepairForm.get('currency')!;
  }

  get repairDate() {
    return this.editRepairForm.get('repairDate')!;
  }

  get totalPhotosSizeMB(): number {
    return this.photos.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const selectedFiles = Array.from(input.files);
    this.photoErrors = [];

    const remainingSlots = this.MAX_PHOTOS - this.photos.length;
    if (remainingSlots <= 0) {
      this.photoErrors.push(`Możesz mieć maksymalnie ${this.MAX_PHOTOS} zdjęć.`);
      input.value = '';
      return;
    }

    let totalSize = this.photos.reduce((sum, f) => sum + f.size, 0);

    for (const file of selectedFiles) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const fileSizeMB = file.size / (1024 * 1024);

      if (!file.type.startsWith('image/') || !ext || !this.ALLOWED_EXTENSIONS.includes(ext)) {
        this.photoErrors.push(`❌ ${file.name} – niedozwolony format.`);
        continue;
      }

      if (fileSizeMB > this.MAX_FILE_SIZE_MB) {
        this.photoErrors.push(`❌ ${file.name} – przekracza ${this.MAX_FILE_SIZE_MB} MB.`);
        continue;
      }

      if (totalSize + file.size > this.MAX_TOTAL_SIZE_MB * 1024 * 1024) {
        this.photoErrors.push(`❌ ${file.name} – przekroczyłby łączny limit ${this.MAX_TOTAL_SIZE_MB} MB.`);
        continue;
      }

      if (this.photos.length >= this.MAX_PHOTOS) {
        this.photoErrors.push(`❌ ${file.name} – limit ${this.MAX_PHOTOS} zdjęć osiągnięty.`);
        break;
      }

      this.photos.push(this.createRepairPhotoFile(file));
      totalSize += file.size;
    }

    input.value = '';
  }

  dismissPhotoError(index: number) {
    this.photoErrors.splice(index, 1);
  }

  removePhoto(index: number): void {
    if (!this.photos[index]) return;
    URL.revokeObjectURL(this.photos[index].previewUrl);
    this.photos.splice(index, 1);
  }

  openPhoto(index: number) {
    this.fullscreenIndex = index;
  }

  closePhoto() {
    this.fullscreenIndex = null;
  }

  prevPhoto(event?: Event) {
    event?.stopPropagation();
    if (this.fullscreenIndex !== null && this.fullscreenIndex > 0) {
      this.fullscreenIndex--;
    }
  }

  nextPhoto(event?: Event) {
    event?.stopPropagation();
    if (this.fullscreenIndex !== null && this.fullscreenIndex < this.photos.length - 1) {
      this.fullscreenIndex++;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (this.fullscreenIndex !== null) {
      if (event.key === 'Escape') this.closePhoto();
      else if (event.key === 'ArrowLeft') this.prevPhoto();
      else if (event.key === 'ArrowRight') this.nextPhoto();
    }
  }

  onSubmit() {
    if (this.editRepairForm.invalid) {
      this.editRepairForm.markAllAsTouched();
      this.scrollToTop();
      return;
    }

    this.savingErrorMessage = null;
    this.loading = true;

    this.repairService.updateRepair(this.prepareRequest()).subscribe({
      next: () => {
        this.loading = false;
        this.closed.emit({ status: ModalCloseStatus.SUCCESS })
      },
      error: (error: ApiErrorResponse) => {
        let status = error.status;

        this.loading = false;

        if (error.errors && error.errors.length > 0) {
          this.mapErrorValidationMessages(error);
        } else {
          this.savingErrorMessage = this.mapErrorMessage(status);
        }

        this.scrollToTop();
      }
    });
  }

  close() {
    this.closed.emit({ status: ModalCloseStatus.DISMISSED });
  }

  private loadRepairPhotos() {
    this.repairService.getRepairPhotos(this.repairUuid).subscribe({
      next: files => {
        this.photos = files.map(file => this.createRepairPhotoFile(file));
      },
      error: () => {
        this.photoErrors.push('❌ Nie udało się załadować zdjęć');
      }
    });
  }

  private createRepairPhotoFile(file: File): PhotoFile {
    return Object.assign(file, {
      previewUrl: URL.createObjectURL(file)
    });
  }

  private prepareRequest(): FormData {
    const formData = new FormData();
    const editRepairRequest: EditRepairRequest = this.prepareEditRepairRequest();

    formData.append('repairData', new Blob([JSON.stringify(editRepairRequest)], { type: 'application/json' }));

    this.photos.forEach(file => formData.append('repairPhotos', file, file.name));

    return formData;
  }

  private prepareEditRepairRequest(): EditRepairRequest {
    return {
      repairUuid: this.repairUuid,
      title: this.editRepairForm.value.title,
      description: this.editRepairForm.value.description,
      cost: this.editRepairForm.value.cost ? this.editRepairForm.value.cost.toString().replace(',', '.') : null,
      currency: this.editRepairForm.value.cost != null ? this.editRepairForm.value.currency : null,
      repairDate: this.editRepairForm.value.repairDate
    };
  }

  private mapErrorValidationMessages(error: ApiErrorResponse) {
    if (!error.errors) return;

    error.errors.forEach(e => {
      const control = this.editRepairForm.get(e.field);
      if (control) {
        control.setErrors({ ...(control.errors || {}), backend: e.message });
      }
    });
  }

  private mapErrorMessage(status: string): string {
    switch (status) {
      case 'E06000':
        return 'Nie znaleziono naprawy. Być może została ona usunięta.';
      case 'E06001':
        return 'Nie masz uprawnień do edycji tej naprawy.';
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