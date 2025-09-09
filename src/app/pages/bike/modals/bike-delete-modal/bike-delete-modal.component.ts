import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BikeService } from 'src/app/pages/bike/service/bike.service';
import { BikeDto } from '../../model/bike.model';
import { ModalCloseStatus } from 'src/app/shared/enums/event-emitter.enum';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';

@Component({
  selector: 'app-bike-delete-modal',
  templateUrl: './bike-delete-modal.component.html'
})
export class BikeDeleteModalComponent {

  @Input() bikeDto!: BikeDto;

  @Output() closed = new EventEmitter<{ status: ModalCloseStatus, message?: string }>();

  loading = false;
  errorMessage: string | null = null;

  constructor(private bikeService: BikeService) { }

  delete() {
    this.loading = true;
    this.errorMessage = null;

    this.bikeService.deleteBike(this.bikeDto.uuid).subscribe({
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
      case 'E05000':
        return 'Nie znaleziono roweru. Być może został już usunięty.';
      case 'E05001':
        return 'Nie masz uprawnień do usunięcia tego roweru.';
      default:
        return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }
}