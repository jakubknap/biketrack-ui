import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalCloseStatus } from 'src/app/shared/enums/modal-close-status.enum';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { RepairDto } from '../../model/repair.model';
import { ReapirService } from '../../service/reapir.service';

@Component({
  selector: 'app-repair-delete-modal',
  templateUrl: './repair-delete-modal.component.html'
})
export class RepairDeleteModalComponent {

  @Input() repairDto!: RepairDto;

  @Output() closed = new EventEmitter<{ status: ModalCloseStatus, message?: string }>();

  loading = false;
  errorMessage: string | null = null;

  constructor(private repairService: ReapirService) { }

  delete() {
    this.loading = true;
    this.errorMessage = null;

    this.repairService.deleteRepair(this.repairDto.uuid).subscribe({
      next: () => {
        this.loading = false;
        this.closed.emit({ status: ModalCloseStatus.SUCCESS })
      },
      error: (error: ApiErrorResponse) => {
        let status = error.status;

        this.loading = false;
        this.errorMessage = this.mapErrorMessage(status);
      }
    });
  }

  close() {
    this.closed.emit({ status: ModalCloseStatus.DISMISSED });
  }

  private mapErrorMessage(status: string): string {
    switch (status) {
      case 'E06000':
        return 'Nie znaleziono naprawy. Być może została już usunięta.';
      case 'E06001':
        return 'Nie masz uprawnień do usunięcia tej naprawy.';
      default:
        return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }
}