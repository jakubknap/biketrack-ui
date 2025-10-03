import { Component, OnInit } from '@angular/core';
import { BikeService } from 'src/app/pages/bike/service/bike.service';
import { BikeDto, BikeList } from './model/bike.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalCloseStatus } from 'src/app/shared/enums/modal-close-status.enum';

@Component({
  selector: 'app-bike',
  templateUrl: './bike.component.html'
})
export class BikeComponent implements OnInit {

  bikeList: BikeList[] = [];

  loading: boolean = true;
  errorMessage: string | null = null;

  readonly pageSize: number = 4;
  currentPage: number = 0;
  totalPages: number | null = 0;
  isFirstPage: boolean | null = null;
  isLastPage: boolean | null = null;

  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;

  selectedBike: BikeDto | null = null;

  constructor(private bikeService: BikeService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.loading = true;
    this.errorMessage = null;

    this.findAllBikes();
  }

  goToPreviousPage() {
    if (!this.isFirstPage) {
      this.currentPage--;
      this.findAllBikes();
    }
  }

  goToNextPage() {
    if (!this.isLastPage) {
      this.currentPage++;
      this.findAllBikes();
    }
  }

  openAddModal() {
    this.showAddModal = true;
    this.blockScroll();
    this.cleanQueryParams();
  }

  openEditModal(bikeUuid: string) {
    this.selectedBike = { uuid: bikeUuid } as BikeDto;
    this.showEditModal = true;
    this.blockScroll();
    this.cleanQueryParams();
  }

  openDeleteModal(bikeUuid: string, bikeName: string) {
    this.selectedBike = { uuid: bikeUuid, name: bikeName } as BikeDto;
    this.showDeleteModal = true;
    this.blockScroll();
    this.cleanQueryParams();
  }

  handleModalClosed(event: { status: ModalCloseStatus }) {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedBike = null;
    this.unblockScroll();

    if (ModalCloseStatus.SUCCESS === event.status) {
      this.fetchData();
    }
  }

  openBikeDetails(bikeUuid?: string) {
    this.router.navigate([`/bikes/${bikeUuid}`]);
  }

  private findAllBikes() {
    this.bikeService.getBikeList(this.currentPage, this.pageSize).subscribe({
      next: response => {
        this.bikeList = response.content;
        this.currentPage = response.pageable.pageNumber;
        this.totalPages = response.totalPages;
        this.isFirstPage = response.first;
        this.isLastPage = response.last;

        this.bikeList.forEach(bike => {
          if (bike.photo) {
            this.bikeService.getBikePhotoUrl(bike.photo).subscribe(url => {
              bike.previewUrl = url || 'assets/images/placeholder.png';
            });
          } else {
            bike.previewUrl = 'assets/images/placeholder.png';
          }
        });

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
      const bikeUuid = params['bikeUuid'];

      if (modal === 'add') this.openAddModal();
      if (modal === 'edit' && bikeUuid) this.openEditModal(bikeUuid);
    });
  }
}