export interface Dataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
  borderWidth?: number;
  tension?: number;
  pointRadius?: number;
  pointBackgroundColor?: string;
}

export interface KPI {
  label: string;
  value: number | string;
  format?: 'number' | 'percentage' | 'currency';
}

export interface AnalyticsData {
  labels: string[];
  datasets: Dataset[];
  kpis: KPI[];
  chartType: 'line' | 'bar' | 'scatter' | 'pie';
  title: string;
}

export interface ApiError {
  message: string;
  status?: number;
  endpoint?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}
