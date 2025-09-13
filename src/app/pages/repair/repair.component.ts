import { Component, OnInit } from '@angular/core';
import { RepairDto, RepairList } from './model/repair.model';
import { ReapirService } from './service/reapir.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalCloseStatus } from 'src/app/shared/enums/modal-close-status.enum';

@Component({
  selector: 'app-repair',
  templateUrl: './repair.component.html'
})
export class RepairComponent implements OnInit {

  repairs: RepairList[] = [];

  loading: boolean = true;
  errorMessage: string | null = null;

  readonly pageSize: number = 4;
  currentPage: number = 0;
  totalPages: number | null = 0;
  isFirstPage: boolean | null = null;
  isLastPage: boolean | null = null;

  sortColumn: string = 'createdDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  showAddModal: boolean = false;
  showDetailsModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;

  selectedRepair: RepairDto | null = null;

  constructor(private repairService: ReapirService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    this.errorMessage = null;

    this.findAllRepairs();
  }

  goToPreviousPage() {
    if (!this.isFirstPage) {
      this.currentPage--;
      this.findAllRepairs();
    }
  }

  goToNextPage() {
    if (!this.isLastPage) {
      this.currentPage++;
      this.findAllRepairs();
    }
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.findAllRepairs();
  }

  openAddModal() {
    this.showAddModal = true;
    this.blockScroll();
    this.cleanQueryParams();
  }

  openDetailsModal(repairUuid: string) {
    this.selectedRepair = { uuid: repairUuid } as RepairDto;
    this.showDetailsModal = true;
    this.blockScroll();
    this.cleanQueryParams();
  }

  openEditModal(repairUuid: string) {
    this.selectedRepair = { uuid: repairUuid } as RepairDto;
    this.showEditModal = true;
    this.blockScroll();
    this.cleanQueryParams();
  }

  openDeleteModal(repairUuid: string, repairName: string) {
    this.selectedRepair = { uuid: repairUuid, name: repairName } as RepairDto;
    this.showDeleteModal = true;
    this.blockScroll();
    this.cleanQueryParams();
  }

  handleModalClosed(event: { status: ModalCloseStatus }) {
    this.showAddModal = false;
    this.showDetailsModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedRepair = null;
    this.unblockScroll();

    if (ModalCloseStatus.SUCCESS === event.status) {
      this.fetchData();
    }
  }

  private findAllRepairs() {
    this.repairService.getRepairList(this.currentPage, this.pageSize, this.sortColumn, this.sortDirection).subscribe({
      next: response => {
        this.repairs = response.content;
        this.currentPage = response.pageable.pageNumber;
        this.totalPages = response.totalPages;
        this.isFirstPage = response.first;
        this.isLastPage = response.last;
        this.loading = false;

        this.checkQueryParams();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać danych z serwera.';
        this.loading = false;
      }
    });
  }

  private blockScroll() {
    document.body.style.overflow = 'hidden';
  }

  private unblockScroll() {
    document.body.style.overflow = '';
  }

  private cleanQueryParams() {
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  private checkQueryParams() {
    this.activatedRoute.queryParams.subscribe(params => {
      const modal = params['modal'];
      const repairUuid = params['repairUuid'];
      const repairName = params['repairName'];

      if (modal === 'add') this.openAddModal();
      if (modal === 'details' && repairUuid) this.openDetailsModal(repairUuid);
      if (modal === 'edit' && repairUuid) this.openEditModal(repairUuid);
      if (modal === 'delete' && repairUuid) this.openDeleteModal(repairUuid, repairName);
    });
  }
}