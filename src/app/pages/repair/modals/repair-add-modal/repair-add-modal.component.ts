import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalCloseStatus } from 'src/app/shared/enums/modal-close-status.enum';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { safeTextValidator } from 'src/app/shared/validators/form-validators';
import { ReapirService } from '../../service/reapir.service';
import { AddRepairRequest } from '../../model/repair.model';
import { BikeService } from 'src/app/pages/bike/service/bike.service';
import { BikeDto, BikeListToSelect } from 'src/app/pages/bike/model/bike.model';
import { Router } from '@angular/router';
import { PhotoFile } from 'src/app/shared/models/file';

@Component({
  selector: 'app-repair-add-modal',
  templateUrl: './repair-add-modal.component.html'
})
export class RepairAddModalComponent implements OnInit {

  readonly MAX_PHOTOS = 10;
  readonly MAX_FILE_SIZE_MB = 10;
  readonly MAX_TOTAL_SIZE_MB = 100;
  readonly ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

  @Input() bikeDto: BikeDto | null = null;

  @ViewChild('modalContent') modalContent!: ElementRef;

  @Output() closed = new EventEmitter<{ status: ModalCloseStatus, message?: string }>();

  addRepairForm!: FormGroup;
  bikes: BikeListToSelect[] = [];

  photos: PhotoFile[] = [];
  photoErrors: string[] = [];
  fullscreenIndex: number | null = null;

  loading = false;
  loadingBikes = false;
  loadingErrorMessage: string | null = null;
  savingErrorMessage: string | null = null;

  constructor(private formBuilder: FormBuilder,
              private repairService: ReapirService,
              private bikeService: BikeService,
              private router: Router) { }

  ngOnInit() {
    this.addRepairForm = this.formBuilder.group({
      bikeUuid: [this.bikeDto ? this.bikeDto.uuid : null, Validators.required],
      bikeName: [this.bikeDto ? { value: this.bikeDto.name, disabled: true } : null],
      title: [null, [safeTextValidator, Validators.required]],
      description: [null, safeTextValidator],
      cost: [null, [Validators.min(0), Validators.pattern(/^-?\d+(\,\d{1,2})?$/)]],
      currency: ['PLN'],
      repairDate: [null]
    });

    this.fetchBikes();
  }

  get bikeUuid() {
    return this.addRepairForm.get('bikeUuid')!;
  }

  get title() {
    return this.addRepairForm.get('title')!;
  }

  get description() {
    return this.addRepairForm.get('description')!;
  }

  get cost() {
    return this.addRepairForm.get('cost')!;
  }

  get currency() {
    return this.addRepairForm.get('currency')!;
  }

  get repairDate() {
    return this.addRepairForm.get('repairDate')!;
  }

  get totalPhotosSizeMB(): number {
    return this.photos.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
  }

  fetchBikes() {
    this.loadingBikes = true;
    this.loadingErrorMessage = null;

    this.bikeService.getBikesToSelectList().subscribe({
      next: (response) => {
        this.bikes = response;
        this.loadingBikes = false;
      },
      error: (error: ApiErrorResponse) => {
        let status = error.status;

        this.loadingErrorMessage = this.mapErrorMessage(status);
        this.loadingBikes = false;
      }
    });
  }

  openAddBikeModal() {
    this.router.navigate(['/bikes'], { queryParams: { modal: 'add' } });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

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
    if (this.addRepairForm.invalid) {
      this.addRepairForm.markAllAsTouched();
      this.scrollToTop();
      return;
    }

    this.savingErrorMessage = null;
    this.loading = true;

    this.repairService.addRepair(this.prepareRequest()).subscribe({
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

  private createRepairPhotoFile(file: File): PhotoFile {
    return Object.assign(file, {
      previewUrl: URL.createObjectURL(file)
    });
  }

  private prepareRequest(): FormData {
    const formData = new FormData();
    const addRepairRequest: AddRepairRequest = this.prepareAddRepairRequest();

    formData.append('repairData', new Blob([JSON.stringify(addRepairRequest)], { type: 'application/json' }));

    this.photos.forEach(file => formData.append('repairPhotos', file, file.name));

    return formData;
  }

  private prepareAddRepairRequest(): AddRepairRequest {
    return {
      bikeUuid: this.addRepairForm.value.bikeUuid,
      title: this.addRepairForm.value.title,
      description: this.addRepairForm.value.description,
      cost: this.addRepairForm.value.cost ? this.addRepairForm.value.cost.toString().replace(',', '.') : null,
      currency: this.addRepairForm.value.cost != null ? this.addRepairForm.value.currency : null,
      repairDate: this.addRepairForm.value.repairDate
    };
  }

  private mapErrorValidationMessages(error: ApiErrorResponse) {
    if (!error.errors) return;

    error.errors.forEach(e => {
      const control = this.addRepairForm.get(e.field);
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
        return 'Nie masz uprawnień do dodania naprawy do tego roweru.';
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