import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { BikeDetails, BikeDto, BikeRepair, BikeRepairStatistics } from '../model/bike.model';
import { RepairDto } from '../../repair/model/repair.model';
import { ModalCloseStatus } from 'src/app/shared/enums/modal-close-status.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { BikeService } from '../service/bike.service';
import { validate as isValidUUID } from 'uuid';
import { ApiErrorResponse } from 'src/app/shared/models/api-response';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-bike-details',
  templateUrl: './bike-details.component.html'
})
export class BikeDetailsComponent implements OnInit {

  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;

  bikeUuid: string | null = null;

  bike?: BikeDetails;
  bikeStats?: BikeRepairStatistics;
  bikeRepairs: BikeRepair[] = [];
  bikePhotoUrl: string = 'assets/images/placeholder.png';

  globalLoading: boolean = true;
  globalErrorMessage: string | null = null;

  bikeLoading: boolean = true;
  bikeErrorMessage: string | null = null;

  bikeStatsLoading: boolean = true;
  bikeStatsErrorMessage: string | null = null;

  bikeRepairsLoading: boolean = true;
  bikeRepairsErrorMessage: string | null = null;

  readonly repairsPageSize: number = 4;
  repairsCurrentPage: number = 0;
  repairsTotalPages: number | null = 0;
  repairsIsFirstPage: boolean | null = null;
  reparisIsLastPage: boolean | null = null;

  repairsSortColumn: string = 'createdDate';
  repairsSortDirection: 'asc' | 'desc' = 'desc';

  showEditBikeModal: boolean = false;
  showDeleteBikeModal: boolean = false;

  selectedBike: BikeDto | null = null;

  showAddRepairModal: boolean = false;
  showRepairsDetailsModal: boolean = false;
  showEditRepairModal: boolean = false;
  showDeleteRepairModal: boolean = false;

  selectedRepair: RepairDto | null = null;

  showReportDropdown = false;
  reportLoading = false;

  constructor(private bikeService: BikeService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private toastService: ToastService) { }

  ngOnInit() {
    this.bikeUuid = this.getBikeUuidFromUrl();

    if (!this.bikeUuid || !isValidUUID(this.bikeUuid)) {
      this.globalLoading = false;
      this.globalErrorMessage = 'Ups! Ten rower nie istnieje lub link jest nieprawidłowy.';
      return;
    }

    this.globalLoading = false;
    this.globalErrorMessage = null;

    this.fetchData();
  }

  fetchData() {
    this.bikeLoading = true;
    this.bikeErrorMessage = null;

    this.bikeStatsLoading = true;
    this.bikeStatsErrorMessage = null;

    this.bikeRepairsLoading = true;
    this.bikeRepairsErrorMessage = null;

    this.getBikeDetails();
    this.getBikeStats();
    this.getBikeRepairs();
  }

  getBikeDetails() {
    this.bikeLoading = true;
    this.bikeErrorMessage = null;

    this.bikeService.getBikeDetails(this.bikeUuid!).subscribe({
      next: response => {
        this.bike = response;

        if (response.photo) {
          this.bikeService.getBikePhotoUrl(response.photo).subscribe(url => {
            this.bikePhotoUrl = url || 'assets/images/placeholder.png';
          });
        }

        this.bikeLoading = false;
      },
      error: (error: ApiErrorResponse) => {
        let status = error.status;

        if (status === 'E05000') {
          this.globalLoading = false;
          this.globalErrorMessage = 'Ups! Ten rower nie istnieje lub link jest nieprawidłowy.';
          return;
        };

        this.bikeErrorMessage = 'Nie udało się pobrać danych z serwera.';
        this.bikeLoading = false;
      }
    });
  }

  getBikeStats() {
    this.bikeStatsLoading = true;
    this.bikeStatsErrorMessage = null;

    this.bikeService.getBikeStatistics(this.bikeUuid!).subscribe({
      next: response => {
        this.bikeStats = response;
        this.bikeStatsLoading = false;
      },
      error: () => {
        this.bikeStatsErrorMessage = 'Nie udało się pobrać danych z serwera.';
        this.bikeStatsLoading = false;
      }
    });
  }

  getBikeRepairs() {
    this.bikeRepairsLoading = true;
    this.bikeRepairsErrorMessage = null;

    this.getBikeRepairsWithoutReload();
  }

  getBikeRepairsWithoutReload() {
    this.bikeService.getBikeRepairs(this.bikeUuid!, this.repairsCurrentPage, this.repairsPageSize, this.repairsSortColumn, this.repairsSortDirection).subscribe({
      next: response => {
        this.bikeRepairs = response.content;
        this.repairsCurrentPage = response.pageable.pageNumber;
        this.repairsTotalPages = response.totalPages;
        this.repairsIsFirstPage = response.first;
        this.reparisIsLastPage = response.last;
        this.bikeRepairsLoading = false;

        this.checkQueryParamsFromRepair();
      },
      error: () => {
        this.bikeRepairsErrorMessage = 'Nie udało się pobrać danych z serwera.';
        this.bikeRepairsLoading = false;
      }
    });
  }

  goToPreviousPage() {
    if (!this.repairsIsFirstPage) {
      this.repairsCurrentPage--;
      this.getBikeRepairsWithoutReload();
    }
  }

  goToNextPage() {
    if (!this.reparisIsLastPage) {
      this.repairsCurrentPage++;
      this.getBikeRepairsWithoutReload();
    }
  }

  sortData(column: string) {
    if (this.repairsSortColumn === column) {
      this.repairsSortDirection = this.repairsSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.repairsSortColumn = column;
      this.repairsSortDirection = 'asc';
    }
    this.getBikeRepairsWithoutReload();
  }

  openAddRepairModal() {
    this.showAddRepairModal = true;
    this.blockScroll();
    this.cleanQueryParamsFromRepair();
  }

  openRepairDetailsModal(repairUuid: string) {
    this.selectedRepair = { uuid: repairUuid } as RepairDto;
    this.showRepairsDetailsModal = true;
    this.blockScroll();
    this.cleanQueryParamsFromRepair();
  }

  openEditRepairModal(repairUuid: string) {
    this.selectedRepair = { uuid: repairUuid } as RepairDto;
    this.showEditRepairModal = true;
    this.blockScroll();
    this.cleanQueryParamsFromRepair();
  }

  openDeleteRepairModal(repairUuid: string, repairName: string) {
    this.selectedRepair = { uuid: repairUuid, name: repairName } as RepairDto;
    this.showDeleteRepairModal = true;
    this.blockScroll();
    this.cleanQueryParamsFromRepair();
  }

  handleRepairModalClosed(event: { status: ModalCloseStatus }) {
    this.showAddRepairModal = false;
    this.showRepairsDetailsModal = false;
    this.showEditRepairModal = false;
    this.showDeleteRepairModal = false;
    this.selectedRepair = null;
    this.unblockScroll();

    if (ModalCloseStatus.SUCCESS === event.status) {
      this.fetchData();
    }
  }

  openEditBikeModal(bikeUuid: string) {
    this.selectedBike = { uuid: bikeUuid } as BikeDto;
    this.showEditBikeModal = true;
    this.blockScroll();
  }

  openDeleteBikeModal(bikeUuid: string, bikeName: string) {
    this.selectedBike = { uuid: bikeUuid, name: bikeName } as BikeDto;
    this.showDeleteBikeModal = true;
    this.blockScroll();
  }

  handleEditBikeModalClosed(event: { status: ModalCloseStatus }) {
    this.showEditBikeModal = false;
    this.showDeleteBikeModal = false;
    this.selectedBike = null;
    this.unblockScroll();

    if (ModalCloseStatus.SUCCESS === event.status) {
      this.fetchData();
    }
  }

  handleDeleteBikeModalClosed(event: { status: ModalCloseStatus }) {
    this.showEditBikeModal = false;
    this.showDeleteBikeModal = false;
    this.selectedBike = null;
    this.unblockScroll();

    if (ModalCloseStatus.SUCCESS === event.status) {
      this.router.navigate(['/bikes']);
    }
  }

  goBack() {
    history.back();
  }

  openReport(): void {
    this.reportLoading = true;

    this.bikeService.getBikeReport(this.bike!.bikeUuid).subscribe({
      next: (response) => {
        const url = window.URL.createObjectURL(response.body!);
        this.reportLoading = false;
        window.open(url, '_blank');
      },
      error: () => {
        this.reportLoading = false;
        this.toastService.show('Nie udało się wygenerować raportu');
      }
    });
  }

  downloadReport(): void {
    this.reportLoading = true;

    this.bikeService.getBikeReport(this.bike!.bikeUuid).subscribe({
      next: (response) => {
        const blob = response.body!;
        const contentDisposition = response.headers.get('Content-Disposition');

        let filename = "Raport roweru - " + this.bike?.name + ".pdf";

        if (contentDisposition) {
          const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/);
          if (match && match[1]) {
            filename = decodeURIComponent(match[1]);
          }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        this.reportLoading = false;
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.reportLoading = false;
        this.toastService.show('Nie udało się wygenerować raportu');
      }
    });
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement) {
    if (!this.dropdownContainer?.nativeElement.contains(targetElement)) {
      this.showReportDropdown = false;
    }
  }

  private getBikeUuidFromUrl(): string | null {
    return this.activatedRoute.snapshot.paramMap.get('bikeUuid');
  }

  private blockScroll() {
    document.body.style.overflow = 'hidden';
  }

  private unblockScroll() {
    document.body.style.overflow = '';
  }

  private cleanQueryParamsFromRepair() {
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  private checkQueryParamsFromRepair() {
    this.activatedRoute.queryParams.subscribe(params => {
      const modal = params['modal'];
      const repairUuid = params['repairUuid'];
      const repairName = params['repairName'];

      if (modal === 'add') this.openAddRepairModal();
      if (modal === 'details' && repairUuid) this.openRepairDetailsModal(repairUuid);
      if (modal === 'edit' && repairUuid) this.openEditRepairModal(repairUuid);
      if (modal === 'delete' && repairUuid) this.openDeleteRepairModal(repairUuid, repairName);
    });
  }
}
