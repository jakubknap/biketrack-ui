import { Component, OnInit } from '@angular/core';
import { BikeDetails, BikeDto, BikeRepair, BikeRepairStatistics } from '../model/bike.model';
import { RepairDto } from '../../repair/model/repair.model';
import { ModalCloseStatus } from 'src/app/shared/enums/modal-close-status.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { BikeService } from '../service/bike.service';
import { validate as isValidUUID } from 'uuid';

@Component({
  selector: 'app-bike-details',
  templateUrl: './bike-details.component.html'
})
export class BikeDetailsComponent implements OnInit {

  bikeUuid: string | null = null;

  bike?: BikeDetails;
  bikeStats?: BikeRepairStatistics;
  bikeRepairs: BikeRepair[] = [];

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

  constructor(private bikeService: BikeService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.bikeUuid = this.getBikeUuidFromUrl();

    if (!this.bikeUuid || !isValidUUID(this.bikeUuid)) {
      this.globalLoading = false;
      this.globalErrorMessage = 'Zły link coś tam';//todo
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
        this.bikeLoading = false;
      },
      error: () => {
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

  handleBikeModalClosed(event: { status: ModalCloseStatus }) {
    this.showEditBikeModal = false;
    this.showDeleteBikeModal = false;
    this.selectedBike = null;
    this.unblockScroll();

    if (ModalCloseStatus.SUCCESS === event.status) {
      this.fetchData();
    }
  }

  goBack() {
    history.back();
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