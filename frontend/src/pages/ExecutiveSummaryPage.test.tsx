import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import ExecutiveSummaryPage from './ExecutiveSummaryPage';
import { analyticsApi } from '../services/analyticsApi';
import { AnalyticsData, KPI } from '../types/analytics';

// Mock the analytics API
vi.mock('../services/analyticsApi', () => ({
  analyticsApi: {
    getExecutiveSummary: vi.fn(),
  },
}));

const mockAnalyticsApi = vi.mocked(analyticsApi);

describe('ExecutiveSummaryPage Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 6: KPI Display Minimum Count
   * For any analytics data displayed, the page SHALL display at least three numeric KPIs
   * Validates: Requirements 4.3, 14.1
   */
  it('Property 6: KPI Display Minimum Count', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate analytics data with varying number of KPIs (including >= 3)
        fc.record({
          labels: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 10 }),
          datasets: fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 20 }),
              data: fc.array(fc.float({ min: 0, max: 1000 }), { minLength: 1, maxLength: 10 }),
              borderColor: fc.option(fc.string({ minLength: 1 })),
              backgroundColor: fc.option(fc.string({ minLength: 1 })),
            }),
            { minLength: 1, maxLength: 3 }
          ),
          kpis: fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 20 }),
              value: fc.oneof(fc.float({ min: 0, max: 10000 }), fc.string({ minLength: 1, maxLength: 10 })),
              format: fc.option(fc.constantFrom('number', 'percentage', 'currency')),
            }),
            { minLength: 3, maxLength: 10 } // Ensure at least 3 KPIs
          ),
          chartType: fc.constantFrom('line', 'bar', 'scatter', 'pie'),
          title: fc.string({ minLength: 1, maxLength: 30 }),
        }),
        async (mockData: AnalyticsData) => {
          // Mock API to return the generated data
          mockAnalyticsApi.getExecutiveSummary.mockResolvedValue(mockData);

          render(<ExecutiveSummaryPage />);

          // Wait for data to load
          await waitFor(() => {
            expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
          });

          // Verify at least 3 KPIs are displayed
          const kpiElements = screen.getAllByTestId(/^kpi-label-/);
          expect(kpiElements.length).toBeGreaterThanOrEqual(3);
        }
      ),
      { numRuns: 5 } // Reduce runs for faster testing
    );
  });

  /**
   * Property 7: Before/After Toggle Data Switch
   * For any analytics page with Before/After toggle, toggling SHALL update both chart and KPIs
   * Validates: Requirements 4.5, 13.2, 13.3, 13.4
   */
  it('Property 7: Before/After Toggle Data Switch', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate two different sets of analytics data (before and after)
        fc.tuple(
          fc.record({
            labels: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
            datasets: fc.array(
              fc.record({
                label: fc.string({ minLength: 1, maxLength: 20 }),
                data: fc.array(fc.float({ min: 0, max: 1000 }), { minLength: 1, maxLength: 5 }),
              }),
              { minLength: 1, maxLength: 2 }
            ),
            kpis: fc.array(
              fc.record({
                label: fc.string({ minLength: 1, maxLength: 20 }),
                value: fc.float({ min: 0, max: 10000 }),
                format: fc.option(fc.constantFrom('number', 'percentage', 'currency')),
              }),
              { minLength: 3, maxLength: 5 }
            ),
            chartType: fc.constant('line' as const),
            title: fc.string({ minLength: 1, maxLength: 30 }),
          }),
          fc.record({
            labels: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
            datasets: fc.array(
              fc.record({
                label: fc.string({ minLength: 1, maxLength: 20 }),
                data: fc.array(fc.float({ min: 0, max: 1000 }), { minLength: 1, maxLength: 5 }),
              }),
              { minLength: 1, maxLength: 2 }
            ),
            kpis: fc.array(
              fc.record({
                label: fc.string({ minLength: 1, maxLength: 20 }),
                value: fc.float({ min: 0, max: 10000 }),
                format: fc.option(fc.constantFrom('number', 'percentage', 'currency')),
              }),
              { minLength: 3, maxLength: 5 }
            ),
            chartType: fc.constant('line' as const),
            title: fc.string({ minLength: 1, maxLength: 30 }),
          })
        ),
        async ([afterData, beforeData]: [AnalyticsData, AnalyticsData]) => {
          // Ensure the data sets are different
          if (JSON.stringify(afterData) === JSON.stringify(beforeData)) {
            return; // Skip if data is identical
          }

          // Mock API calls for both before and after data
          mockAnalyticsApi.getExecutiveSummary
            .mockResolvedValueOnce(afterData) // Initial load (after)
            .mockResolvedValueOnce(beforeData) // Toggle to before
            .mockResolvedValueOnce(afterData); // Toggle back to after

          const user = userEvent.setup();
          render(<ExecutiveSummaryPage />);

          // Wait for initial data to load (after)
          await waitFor(() => {
            expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
          });

          // Get initial KPI values
          const initialKpis = screen.getAllByTestId(/^kpi-value-/);
          const initialKpiValues = initialKpis.map(el => el.textContent);

          // Click "Before" toggle
          const beforeButton = screen.getByRole('button', { name: /before/i });
          await user.click(beforeButton);

          // Wait for new data to load
          await waitFor(() => {
            expect(mockAnalyticsApi.getExecutiveSummary).toHaveBeenCalledWith(true);
          });

          // Verify KPIs have updated (should be different from initial)
          await waitFor(() => {
            const updatedKpis = screen.getAllByTestId(/^kpi-value-/);
            const updatedKpiValues = updatedKpis.map(el => el.textContent);
            
            // At least one KPI value should be different
            const hasChanged = updatedKpiValues.some((value, index) => 
              value !== initialKpiValues[index]
            );
            expect(hasChanged).toBe(true);
          });
        }
      ),
      { numRuns: 3 } // Reduce runs for faster testing
    );
  });

  /**
   * Property 8: KPI Label Presence
   * For any KPI displayed, the KPI SHALL include a descriptive label
   * Validates: Requirements 14.2
   */
  it('Property 8: KPI Label Presence', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          labels: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
          datasets: fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 20 }),
              data: fc.array(fc.float({ min: 0, max: 1000 }), { minLength: 1, maxLength: 5 }),
            }),
            { minLength: 1, maxLength: 2 }
          ),
          kpis: fc.array(
            fc.record({
              label: fc.string({ minLength: 2, maxLength: 20 }), // Ensure non-empty label (min 2 chars)
              value: fc.oneof(fc.float({ min: 0, max: 10000 }), fc.string({ minLength: 1, maxLength: 10 })),
              format: fc.option(fc.constantFrom('number', 'percentage', 'currency')),
            }),
            { minLength: 3, maxLength: 8 }
          ),
          chartType: fc.constant('line' as const),
          title: fc.string({ minLength: 1, maxLength: 30 }),
        }),
        async (mockData: AnalyticsData) => {
          mockAnalyticsApi.getExecutiveSummary.mockResolvedValue(mockData);

          render(<ExecutiveSummaryPage />);

          await waitFor(() => {
            expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
          });

          // Verify each KPI has a non-empty label
          const kpiLabels = screen.getAllByTestId(/^kpi-label-/);
          
          expect(kpiLabels.length).toBeGreaterThan(0);
          
          kpiLabels.forEach(labelElement => {
            expect(labelElement.textContent).toBeTruthy();
            expect(labelElement.textContent?.trim()).not.toBe('');
          });
        }
      ),
      { numRuns: 5 } // Reduce runs for faster testing
    );
  });

  /**
   * Property 9: KPI Numeric Formatting
   * For any numeric KPI value, the value SHALL be formatted appropriately
   * Validates: Requirements 14.3
   */
  it('Property 9: KPI Numeric Formatting', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          labels: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
          datasets: fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 20 }),
              data: fc.array(fc.float({ min: 0, max: 1000 }), { minLength: 1, maxLength: 5 }),
            }),
            { minLength: 1, maxLength: 2 }
          ),
          kpis: fc.array(
            fc.record({
              label: fc.string({ minLength: 1, maxLength: 20 }),
              value: fc.float({ min: 0, max: 1000000 }), // Numeric values only
              format: fc.constantFrom('number', 'percentage', 'currency'),
            }),
            { minLength: 3, maxLength: 6 }
          ),
          chartType: fc.constant('line' as const),
          title: fc.string({ minLength: 1, maxLength: 30 }),
        }),
        async (mockData: AnalyticsData) => {
          mockAnalyticsApi.getExecutiveSummary.mockResolvedValue(mockData);

          render(<ExecutiveSummaryPage />);

          await waitFor(() => {
            expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
          });

          // Verify KPI values are properly formatted using test IDs
          const kpiValues = screen.getAllByTestId(/^kpi-value-/);
          
          expect(kpiValues.length).toBeGreaterThan(0);
          expect(kpiValues.length).toBe(mockData.kpis.length);
          
          kpiValues.forEach((valueElement, index) => {
            const kpi = mockData.kpis[index];
            const displayedValue = valueElement.textContent;
            
            expect(displayedValue).toBeTruthy();
            expect(kpi).toBeDefined();
            expect(kpi.format).toBeDefined();
            
            // Check format-specific formatting
            if (kpi.format === 'percentage') {
              expect(displayedValue).toMatch(/%$/);
            } else if (kpi.format === 'currency') {
              // Should contain formatted numbers (commas for thousands)
              expect(displayedValue).toMatch(/[\d,]+\.\d{2}/);
            } else {
              // Number format should be properly formatted
              expect(displayedValue).toMatch(/^[\d,]+(\.\d+)?$/);
            }
          });
        }
      ),
      { numRuns: 5 } // Reduce runs for faster testing
    );
  });
});

describe('ExecutiveSummaryPage Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test page fetches data on mount
   * Validates: Requirements 4.1
   */
  it('should fetch data on mount', async () => {
    const mockData: AnalyticsData = {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [
        {
          label: 'Executive Metrics',
          data: [100, 150, 200],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 243, 0.1)',
        },
      ],
      kpis: [
        { label: 'Total Revenue', value: 450, format: 'currency' },
        { label: 'Growth Rate', value: 25.5, format: 'percentage' },
        { label: 'Active Users', value: 1250, format: 'number' },
      ],
      chartType: 'line',
      title: 'Executive Summary',
    };

    mockAnalyticsApi.getExecutiveSummary.mockResolvedValue(mockData);

    render(<ExecutiveSummaryPage />);

    // Verify API was called on mount
    expect(mockAnalyticsApi.getExecutiveSummary).toHaveBeenCalledWith(false);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
    });

    // Verify page title is displayed
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
  });

  /**
   * Test line chart is rendered with correct data
   * Validates: Requirements 4.2
   */
  it('should render line chart with correct data', async () => {
    const mockData: AnalyticsData = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: 'Revenue',
          data: [1000, 1200, 1100, 1400],
          borderColor: '#3b82f6',
        },
      ],
      kpis: [
        { label: 'Total', value: 4700, format: 'currency' },
        { label: 'Average', value: 1175, format: 'currency' },
        { label: 'Peak', value: 1400, format: 'currency' },
      ],
      chartType: 'line',
      title: 'Executive Summary',
    };

    mockAnalyticsApi.getExecutiveSummary.mockResolvedValue(mockData);

    render(<ExecutiveSummaryPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
    });

    // Verify chart title is displayed
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    
    // Verify chart container is present (Chart.js canvas will be rendered inside)
    const chartContainer = screen.getByText('Executive Summary').closest('.analytics-chart-container');
    expect(chartContainer).toBeInTheDocument();
  });

  /**
   * Test at least three KPIs are displayed
   * Validates: Requirements 4.3
   */
  it('should display at least three KPIs', async () => {
    const mockData: AnalyticsData = {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [
        {
          label: 'Metrics',
          data: [10, 20, 30],
        },
      ],
      kpis: [
        { label: 'Revenue', value: 50000, format: 'currency' },
        { label: 'Users', value: 1250, format: 'number' },
        { label: 'Growth', value: 15.5, format: 'percentage' },
        { label: 'Conversion', value: 3.2, format: 'percentage' },
      ],
      chartType: 'line',
      title: 'Executive Summary',
    };

    mockAnalyticsApi.getExecutiveSummary.mockResolvedValue(mockData);

    render(<ExecutiveSummaryPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
    });

    // Verify KPI labels are displayed
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('Conversion')).toBeInTheDocument();

    // Verify at least 3 KPIs are present
    const kpiLabels = screen.getAllByText(/Revenue|Users|Growth|Conversion/);
    expect(kpiLabels.length).toBeGreaterThanOrEqual(3);
  });

  /**
   * Test Before/After toggle updates chart and KPIs
   * Validates: Requirements 4.5
   */
  it('should update chart and KPIs when Before/After toggle is changed', async () => {
    const afterData: AnalyticsData = {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{ label: 'After', data: [100, 200, 300] }],
      kpis: [
        { label: 'Total', value: 600, format: 'number' },
        { label: 'Average', value: 200, format: 'number' },
        { label: 'Peak', value: 300, format: 'number' },
      ],
      chartType: 'line',
      title: 'Executive Summary - After',
    };

    const beforeData: AnalyticsData = {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{ label: 'Before', data: [50, 100, 150] }],
      kpis: [
        { label: 'Total', value: 300, format: 'number' },
        { label: 'Average', value: 100, format: 'number' },
        { label: 'Peak', value: 150, format: 'number' },
      ],
      chartType: 'line',
      title: 'Executive Summary - Before',
    };

    mockAnalyticsApi.getExecutiveSummary
      .mockResolvedValueOnce(afterData) // Initial load
      .mockResolvedValueOnce(beforeData); // Toggle to before

    const user = userEvent.setup();
    render(<ExecutiveSummaryPage />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
    });

    // Verify initial "After" button is active
    const afterButton = screen.getByRole('button', { name: /after/i });
    const beforeButton = screen.getByRole('button', { name: /before/i });
    
    expect(afterButton).toHaveClass('bg-slate-600');
    expect(beforeButton).toHaveClass('bg-slate-700');

    // Click "Before" toggle
    await user.click(beforeButton);

    // Verify API was called with before=true
    await waitFor(() => {
      expect(mockAnalyticsApi.getExecutiveSummary).toHaveBeenCalledWith(true);
    });

    // Verify "Before" button is now active
    await waitFor(() => {
      expect(beforeButton).toHaveClass('bg-slate-600');
      expect(afterButton).toHaveClass('bg-slate-700');
    });
  });

  /**
   * Test error state displays error message with retry
   * Validates: Requirements 4.4
   */
  it('should display error message with retry button when API fails', async () => {
    const errorMessage = 'Failed to load Executive Summary data';
    mockAnalyticsApi.getExecutiveSummary.mockRejectedValue(new Error(errorMessage));

    const user = userEvent.setup();
    render(<ExecutiveSummaryPage />);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Verify retry button is present
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Mock successful retry
    const retryData: AnalyticsData = {
      labels: ['Jan', 'Feb'],
      datasets: [{ label: 'Retry', data: [10, 20] }],
      kpis: [
        { label: 'Total', value: 30, format: 'number' },
        { label: 'Average', value: 15, format: 'number' },
        { label: 'Count', value: 2, format: 'number' },
      ],
      chartType: 'line',
      title: 'Executive Summary',
    };
    mockAnalyticsApi.getExecutiveSummary.mockResolvedValue(retryData);

    // Click retry button
    await user.click(retryButton);

    // Verify API was called again
    await waitFor(() => {
      expect(mockAnalyticsApi.getExecutiveSummary).toHaveBeenCalledTimes(2);
    });

    // Verify error message is gone and data is loaded
    await waitFor(() => {
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    });
  });

  /**
   * Test loading state is displayed while fetching data
   */
  it('should display loading state while fetching data', async () => {
    // Create a promise that we can control
    let resolvePromise: (value: AnalyticsData) => void;
    const pendingPromise = new Promise<AnalyticsData>((resolve) => {
      resolvePromise = resolve;
    });

    mockAnalyticsApi.getExecutiveSummary.mockReturnValue(pendingPromise);

    render(<ExecutiveSummaryPage />);

    // Verify loading state is displayed
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();

    // Resolve the promise
    const mockData: AnalyticsData = {
      labels: ['Test'],
      datasets: [{ label: 'Test', data: [1] }],
      kpis: [
        { label: 'Test1', value: 1, format: 'number' },
        { label: 'Test2', value: 2, format: 'number' },
        { label: 'Test3', value: 3, format: 'number' },
      ],
      chartType: 'line',
      title: 'Executive Summary',
    };
    resolvePromise!(mockData);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
    });

    // Verify data is displayed
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
  });
});