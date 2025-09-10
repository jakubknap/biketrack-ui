import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalCloseStatus } from 'src/app/shared/enums/modal-close-status.enum';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { safeTextValidator } from 'src/app/shared/validators/form-validators';
import { EditRepairRequest, RepairDetails } from '../../model/repair.model';
import { ReapirService } from '../../service/reapir.service';

@Component({
  selector: 'app-repair-edit-modal',
  templateUrl: './repair-edit-modal.component.html'
})
export class RepairEditModalComponent implements OnInit {

  @Input() repairUuid!: string;

  @ViewChild('modalContent') modalContent!: ElementRef;

  @Output() closed = new EventEmitter<{ status: ModalCloseStatus, message?: string }>();

  repairDetails: RepairDetails | null = null;

  editRepairForm!: FormGroup;

  loading = false;
  errorMessage: string | null = null;

  constructor(private formBuilder: FormBuilder,
              private repairService: ReapirService) { }

  ngOnInit() {
    this.fetchRepairData();
  }

  private fetchRepairData(): void {
    this.errorMessage = null;
    this.loading = true;

    this.repairService.getRepairDetails(this.repairUuid).subscribe({
      next: (response) => {
        this.repairDetails = response;

        this.editRepairForm = this.formBuilder.group({
          title: [this.repairDetails.title, [safeTextValidator, Validators.required]],
          description: [this.repairDetails.description, safeTextValidator],
          cost: [this.repairDetails.cost.amount],
          currency: [this.repairDetails.cost.currency],
          repairDate: [this.repairDetails.repairDate],
          createdDate: [this.repairDetails.createdDate],
          lastModifiedDate: [this.repairDetails.lastModifiedDate]
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

  onSubmit() {
    this.errorMessage = null;

    if (this.editRepairForm.invalid) {
      this.editRepairForm.markAllAsTouched();
      this.scrollToTop();
      return;
    }

    this.loading = true;

    this.repairService.updateRepair(this.prepareRequest()).subscribe({
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
    const editRepairRequest: EditRepairRequest = this.prepareEditRepairRequest();

    formData.append('repairData', new Blob([JSON.stringify(editRepairRequest)], { type: 'application/json' }));

    return formData;
  }

  private prepareEditRepairRequest(): EditRepairRequest {
    return {
      repairUuid: this.repairUuid,
      title: this.editRepairForm.value.title,
      description: this.editRepairForm.value.description,
      cost: this.editRepairForm.value.cost,
      currency: this.editRepairForm.value.currency,
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