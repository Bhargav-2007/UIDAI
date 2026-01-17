import { AnalyticsData, ApiError } from '../types/analytics';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Validates that the response data matches the expected AnalyticsData structure
 */
function validateAnalyticsData(data: unknown): data is AnalyticsData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Check required fields
  if (!Array.isArray(obj.labels)) return false;
  if (!Array.isArray(obj.datasets)) return false;
  if (!Array.isArray(obj.kpis)) return false;
  if (typeof obj.title !== 'string') return false;

  // Check chartType is valid
  const validChartTypes = ['line', 'bar', 'scatter', 'pie'];
  if (!validChartTypes.includes(obj.chartType as string)) return false;

  // Validate datasets structure
  for (const dataset of obj.datasets) {
    if (typeof dataset !== 'object' || !dataset) return false;
    if (typeof dataset.label !== 'string') return false;
    if (!Array.isArray(dataset.data)) return false;
  }

  // Validate KPIs structure
  for (const kpi of obj.kpis) {
    if (typeof kpi !== 'object' || !kpi) return false;
    if (typeof kpi.label !== 'string') return false;
    if (typeof kpi.value !== 'number' && typeof kpi.value !== 'string') return false;
  }

  return true;
}

/**
 * Makes an HTTP request to the backend API
 */
async function fetchFromApi(endpoint: string, before?: boolean): Promise<AnalyticsData> {
  try {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (before !== undefined) {
      url.searchParams.append('before', before ? 'true' : 'false');
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate the response data structure
    if (!validateAnalyticsData(data)) {
      throw new Error('Invalid response data structure');
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw {
        message: 'Unable to connect to analytics service. Please check your connection.',
        endpoint,
      } as ApiError;
    }

    // Handle HTTP errors
    if (error instanceof Error && error.message.includes('HTTP')) {
      const statusMatch = error.message.match(/HTTP (\d+)/);
      const status = statusMatch ? parseInt(statusMatch[1], 10) : undefined;
      throw {
        message: `Failed to load analytics data. Status: ${status || 'Unknown'}`,
        status,
        endpoint,
      } as ApiError;
    }

    // Handle validation errors
    if (error instanceof Error && error.message.includes('Invalid response')) {
      throw {
        message: 'Received invalid data format from analytics service',
        endpoint,
      } as ApiError;
    }

    // Handle other errors
    throw {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      endpoint,
    } as ApiError;
  }
}

/**
 * Analytics API Service
 * Provides methods to fetch analytics data from the backend
 */
export const analyticsApi = {
  /**
   * Fetch Executive Summary data
   */
  async getExecutiveSummary(before?: boolean): Promise<AnalyticsData> {
    return fetchFromApi('/executive-summary', before);
  },

  /**
   * Fetch Descriptive Analytics data
   */
  async getDescriptiveAnalytics(before?: boolean): Promise<AnalyticsData> {
    return fetchFromApi('/descriptive-analytics', before);
  },

  /**
   * Fetch Fraud Detection data
   */
  async getFraudDetection(before?: boolean): Promise<AnalyticsData> {
    return fetchFromApi('/fraud-detection', before);
  },

  /**
   * Fetch Outlier Detection data
   */
  async getOutlierDetection(before?: boolean): Promise<AnalyticsData> {
    return fetchFromApi('/outlier-detection', before);
  },

  /**
   * Fetch Operational Efficiency data
   */
  async getOperationalEfficiency(before?: boolean): Promise<AnalyticsData> {
    return fetchFromApi('/operational-efficiency', before);
  },

  /**
   * Fetch Forecasting data
   */
  async getForecasting(before?: boolean): Promise<AnalyticsData> {
    return fetchFromApi('/forecasting', before);
  },

  /**
   * Fetch Geographic Analysis data
   */
  async getGeographicAnalysis(before?: boolean): Promise<AnalyticsData> {
    return fetchFromApi('/geographic-analysis', before);
  },

  /**
   * Fetch Benchmarking data
   */
  async getBenchmarking(before?: boolean): Promise<AnalyticsData> {
    return fetchFromApi('/benchmarking', before);
  },

  /**
   * Fetch AI Risk Scoring data
   */
  async getAiRiskScoring(before?: boolean): Promise<AnalyticsData> {
    return fetchFromApi('/ai-risk-scoring', before);
  },
};
