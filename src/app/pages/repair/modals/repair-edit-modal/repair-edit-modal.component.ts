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
          cost: [this.repairDetails.cost.amount, [Validators.min(0), Validators.pattern(/^-?\d+(\.\d{1,2})?$/)]],
          currency: [this.repairDetails.cost.currency ? this.repairDetails.cost.currency : 'PLN'],
          repairDate: [this.repairDetails.repairDate]
        });

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

  get bikeName() {
    return this.editRepairForm.get('bikeName')!;
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
      currency: this.editRepairForm.value.cost ? this.editRepairForm.value.currency : null,
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