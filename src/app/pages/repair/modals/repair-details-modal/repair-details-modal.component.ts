import { Component, EventEmitter, HostListener, Input, OnInit, Output, } from '@angular/core';
import { ReapirService } from '../../service/reapir.service';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { RepairDetails } from '../../model/repair.model';
import { ModalCloseStatus } from 'src/app/shared/enums/modal-close-status.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-repair-details-modal',
  templateUrl: './repair-details-modal.component.html'
})
export class RepairDetailsModalComponent implements OnInit {

  @Input() repairUuid!: string;

  @Output() closed = new EventEmitter<{ status: ModalCloseStatus, message?: string }>();

  repair: RepairDetails | null = null;

  loading = false;
  errorMessage: string | null = null;

  fullscreenIndex: number | null = null;

  constructor(private repairService: ReapirService,
              private router: Router) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.repairService.getRepairDetails(this.repairUuid).subscribe({
      next: (response) => {
        this.repair = response;
        this.loading = false;
      },
      error: (error: ApiErrorResponse) => {
        let status = error.status;

        this.errorMessage = this.mapErrorMessage(status);
        this.loading = false;
      }
    });
  }

  close() {
    this.closed.emit({ status: ModalCloseStatus.DISMISSED });
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

    if (!this.repair?.photos) {
      return;
    }

    if (this.fullscreenIndex !== null && this.fullscreenIndex < this.repair!.photos.length - 1) {
      this.fullscreenIndex++;
    }
  }

  openEditModal() {
    this.close();
    this.router.navigate(['/repairs'], { queryParams: { modal: 'edit', repairUuid: this.repairUuid } });
  }

  openDeleteModal() {
    this.close();
    this.router.navigate(['/repairs'], { queryParams: { modal: 'delete', repairUuid: this.repairUuid, repairName: this.repair?.title } });
  }

  private mapErrorMessage(status: string): string {
    switch (status) {
      case 'E06000':
        return 'Nie znaleziono naprawy. Być może została ona usunięta.';
      case 'E06001':
        return 'Nie masz uprawnień do podglądu tej naprawy.';
      default:
        return 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (this.fullscreenIndex !== null) {
      if (event.key === 'Escape') {
        this.closePhoto();
      } else if (event.key === 'ArrowLeft') {
        this.prevPhoto();
      } else if (event.key === 'ArrowRight') {
        this.nextPhoto();
      }
    }
  }
}