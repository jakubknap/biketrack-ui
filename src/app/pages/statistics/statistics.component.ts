import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { StatisticsService } from './service/statistics.service';
import { AverageRepairCostPerBike, RepairsPerBike, RepairsThisYearPerMonth, StatisticsResponse, Summary } from './model/statistics.model';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticsComponent implements AfterViewInit {

  @ViewChild('repairsPerBikeChart') repairsPerBikeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('averageRepairCostChart') averageRepairCostChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('repairsThisYearChart') repairsThisYearChartRef!: ElementRef<HTMLCanvasElement>;

  summary: Summary = { totalBikes: 0, totalRepairs: 0, totalRepairCost: { amount: 0.00, currency: 'PLN' } };

  loading = true;
  errorMessage: string | null = null;

  constructor(private statisticsService: StatisticsService, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit() {
    setTimeout(() => this.loadStatistics());
  }

  loadStatistics() {
    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.statisticsService.getStatistics().subscribe({
      next: (data: StatisticsResponse) => {
        this.summary = data.summary;
        this.loading = false;
        this.cdr.detectChanges();
        this.initCharts(data);
      },
      error: (err) => {
        this.errorMessage = 'Nie udało się załadować statystyk. Spróbuj ponownie.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private initCharts(data: StatisticsResponse) {
    setTimeout(() => {
      this.initRepairsPerBikeChart(data.repairsPerBike);
      this.initAverageRepairCostChart(data.averageRepairCostPerBike);
      this.initRepairsThisYearChart(data.repairsThisYearPerMonth);
    });
  }

  retry() {
    this.loadStatistics();
  }

  initRepairsPerBikeChart(data: RepairsPerBike[]) {
    if (!this.repairsPerBikeChartRef) return;

    new Chart(this.repairsPerBikeChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(d => d.bikeName),
        datasets: [{
          label: 'Liczba napraw',
          data: data.map(d => d.repairs),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(234, 179, 8, 0.7)',
            'rgba(239, 68, 68, 0.7)'
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(234, 179, 8, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true, title: { display: true, text: 'Liczba napraw' } }, x: { title: { display: true, text: 'Rower' } } } }
    });
  }

  initAverageRepairCostChart(data: AverageRepairCostPerBike[]) {
    if (!this.averageRepairCostChartRef) return;

    new Chart(this.averageRepairCostChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.map(d => d.bikeName),
        datasets: [{
          label: 'Średni koszt naprawy (PLN)',
          data: data.map(d => d.averageCost),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true, title: { display: true, text: 'Średni koszt (PLN)' } }, x: { title: { display: true, text: 'Rower' } } } }
    });
  }

  initRepairsThisYearChart(data: RepairsThisYearPerMonth[]) {
    if (!this.repairsThisYearChartRef) return;

    new Chart(this.repairsThisYearChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Liczba napraw w tym roku',
          data: data.map(d => d.repairs),
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          tension: 0.3,
          fill: true
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true, title: { display: true, text: 'Liczba napraw' }, ticks: { stepSize: 1, precision: 0 }, }, x: { title: { display: true, text: 'Miesiąc' } } } }
    });
  }
}