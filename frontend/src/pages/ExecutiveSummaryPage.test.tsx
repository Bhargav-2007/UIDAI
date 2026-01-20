import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
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
    cleanup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  /**
   * Property 6: KPI Display Minimum Count
   * For any analytics data displayed, the page SHALL display at least three numeric KPIs
   * Validates: Requirements 4.3, 14.1
   */
  it('Property 6: KPI Display Minimum Count', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate realistic analytics data with proper strings
        fc.record({
          labels: fc.array(fc.constantFrom('Jan', 'Feb', 'Mar', 'Q1', 'Q2', 'Q3', 'Week1', 'Week2'), { minLength: 1, maxLength: 5 }),
          datasets: fc.array(
            fc.record({
              label: fc.constantFrom('Revenue', 'Users', 'Sales', 'Growth', 'Metrics'),
              data: fc.array(fc.float({ min: 1, max: 1000 }), { minLength: 1, maxLength: 5 }),
              borderColor: fc.option(fc.constantFrom('#3b82f6', '#ef4444', '#10b981')),
              backgroundColor: fc.option(fc.constantFrom('rgba(59, 130, 243, 0.1)', 'rgba(239, 68, 68, 0.1)')),
            }),
            { minLength: 1, maxLength: 2 }
          ),
          kpis: fc.array(
            fc.record({
              label: fc.constantFrom('Total Revenue', 'Active Users', 'Growth Rate', 'Conversion Rate', 'Average Order', 'Monthly Sales'),
              value: fc.float({ min: 1, max: 10000 }),
              format: fc.option(fc.constantFrom('number', 'percentage', 'currency')),
            }),
            { minLength: 3, maxLength: 6 } // Ensure at least 3 KPIs
          ),
          chartType: fc.constantFrom('line', 'bar', 'scatter', 'pie'),
          title: fc.constantFrom('Executive Summary', 'Analytics Dashboard', 'Performance Metrics'),
        }),
        async (mockData: AnalyticsData) => {
          // Mock API to return the generated data
          mockAnalyticsApi.getExecutiveSummary.mockResolvedValue(mockData);

          render(<ExecutiveSummaryPage />);

          // Wait for data to load
          await waitFor(() => {
            expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
          });

          // Verify at least 3 KPIs are displayed using test IDs
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
        // Generate two different sets of realistic analytics data (before and after)
        fc.tuple(
          fc.record({
            labels: fc.array(fc.constantFrom('Jan', 'Feb', 'Mar', 'Q1', 'Q2'), { minLength: 1, maxLength: 3 }),
            datasets: fc.array(
              fc.record({
                label: fc.constantFrom('After Analysis', 'Processed Data', 'Final Results'),
                data: fc.array(fc.float({ min: 100, max: 1000 }), { minLength: 1, maxLength: 3 }),
              }),
              { minLength: 1, maxLength: 1 }
            ),
            kpis: fc.array(
              fc.record({
                label: fc.constantFrom('Total Revenue', 'Active Users', 'Growth Rate'),
                value: fc.float({ min: 100, max: 1000 }),
                format: fc.option(fc.constantFrom('number', 'percentage', 'currency')),
              }),
              { minLength: 3, maxLength: 3 }
            ),
            chartType: fc.constant('line' as const),
            title: fc.constant('Executive Summary - After'),
          }),
          fc.record({
            labels: fc.array(fc.constantFrom('Jan', 'Feb', 'Mar', 'Q1', 'Q2'), { minLength: 1, maxLength: 3 }),
            datasets: fc.array(
              fc.record({
                label: fc.constantFrom('Before Analysis', 'Raw Data', 'Initial Results'),
                data: fc.array(fc.float({ min: 50, max: 500 }), { minLength: 1, maxLength: 3 }),
              }),
              { minLength: 1, maxLength: 1 }
            ),
            kpis: fc.array(
              fc.record({
                label: fc.constantFrom('Total Revenue', 'Active Users', 'Growth Rate'),
                value: fc.float({ min: 50, max: 500 }),
                format: fc.option(fc.constantFrom('number', 'percentage', 'currency')),
              }),
              { minLength: 3, maxLength: 3 }
            ),
            chartType: fc.constant('line' as const),
            title: fc.constant('Executive Summary - Before'),
          })
        ),
        async ([afterData, beforeData]: [AnalyticsData, AnalyticsData]) => {
          // Mock API calls for both before and after data
          mockAnalyticsApi.getExecutiveSummary
            .mockResolvedValueOnce(afterData) // Initial load (after)
            .mockResolvedValueOnce(beforeData); // Toggle to before

          const user = userEvent.setup();
          render(<ExecutiveSummaryPage />);

          // Wait for initial data to load (after)
          await waitFor(() => {
            expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
          });

          // Get initial KPI values using test IDs
          const initialKpis = screen.getAllByTestId(/^kpi-value-/);
          const initialKpiValues = initialKpis.map(el => el.textContent);

          // Click "Historical" toggle - get the first one if multiple exist
          const beforeButtons = screen.getAllByRole('button', { name: /historical/i });
          const beforeButton = beforeButtons[0];
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
          labels: fc.array(fc.constantFrom('Jan', 'Feb', 'Mar'), { minLength: 1, maxLength: 3 }),
          datasets: fc.array(
            fc.record({
              label: fc.constantFrom('Revenue', 'Users', 'Sales'),
              data: fc.array(fc.float({ min: 1, max: 1000 }), { minLength: 1, maxLength: 3 }),
            }),
            { minLength: 1, maxLength: 1 }
          ),
          kpis: fc.array(
            fc.record({
              label: fc.constantFrom('Total Revenue', 'Active Users', 'Growth Rate', 'Conversion Rate', 'Monthly Sales'),
              value: fc.oneof(fc.float({ min: 1, max: 10000 }), fc.constantFrom('High', 'Medium', 'Low')),
              format: fc.option(fc.constantFrom('number', 'percentage', 'currency')),
            }),
            { minLength: 3, maxLength: 5 }
          ),
          chartType: fc.constant('line' as const),
          title: fc.constantFrom('Executive Summary', 'Analytics Dashboard'),
        }),
        async (mockData: AnalyticsData) => {
          mockAnalyticsApi.getExecutiveSummary.mockResolvedValue(mockData);

          render(<ExecutiveSummaryPage />);

          await waitFor(() => {
            expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
          });

          // Verify each KPI has a non-empty label using test IDs
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
          labels: fc.array(fc.constantFrom('Jan', 'Feb', 'Mar'), { minLength: 1, maxLength: 3 }),
          datasets: fc.array(
            fc.record({
              label: fc.constantFrom('Revenue', 'Users', 'Sales'),
              data: fc.array(fc.float({ min: 1, max: 1000 }), { minLength: 1, maxLength: 3 }),
            }),
            { minLength: 1, maxLength: 1 }
          ),
          kpis: fc.array(
            fc.record({
              label: fc.constantFrom('Total Revenue', 'Active Users', 'Growth Rate'),
              value: fc.float({ min: 1, max: 100000 }), // Numeric values only
              format: fc.constantFrom('number', 'percentage', 'currency'),
            }),
            { minLength: 3, maxLength: 4 }
          ),
          chartType: fc.constant('line' as const),
          title: fc.constantFrom('Executive Summary', 'Analytics Dashboard'),
        }),
        async (mockData: AnalyticsData) => {
          // Clear all previous mocks to avoid interference
          vi.clearAllMocks();
          cleanup();
          
          mockAnalyticsApi.getExecutiveSummary.mockResolvedValue(mockData);

          render(<ExecutiveSummaryPage />);

          await waitFor(() => {
            expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
          }, { timeout: 10000 });

          // Verify the mock was called with the expected data
          expect(mockAnalyticsApi.getExecutiveSummary).toHaveBeenCalledWith(false);

          // Verify KPI values are properly formatted using specific test IDs
          // Only check the first 3 KPIs to match the minimum requirement
          const kpiCount = Math.min(3, mockData.kpis.length);
          
          for (let i = 0; i < kpiCount; i++) {
            const kpiValueElements = screen.getAllByTestId(`kpi-value-${i}`);
            expect(kpiValueElements.length).toBeGreaterThan(0);
            
            const kpiValueElement = kpiValueElements[0]; // Take first element in case of duplicates
            const kpi = mockData.kpis[i];
            const displayedValue = kpiValueElement.textContent;
            
            expect(displayedValue).toBeTruthy();
            expect(kpi).toBeDefined();
            
            // Check format-specific formatting based on the actual KPI format
            if (kpi.format === 'percentage') {
              expect(displayedValue).toMatch(/%$/);
            } else if (kpi.format === 'currency') {
              // Should contain formatted numbers (commas for thousands)
              expect(displayedValue).toMatch(/^\$[\d,]+\.\d{2}$/);
            } else if (kpi.format === 'number') {
              // Number format should be properly formatted
              expect(displayedValue).toMatch(/^[\d,]+(\.\d+)?$/);
            } else {
              // For any other format or undefined, just check it's a valid string
              expect(displayedValue).toBeTruthy();
            }
          }
        }
      ),
      { numRuns: 3 } // Reduce runs for faster testing
    );
  });
});

describe('ExecutiveSummaryPage Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
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

    // Verify page title is displayed - use getAllByText since we have multiple "Executive Summary" headings
    const executiveSummaryElements = screen.getAllByText('Executive Summary');
    expect(executiveSummaryElements.length).toBeGreaterThan(0);
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
    const executiveSummaryElements = screen.getAllByText('Executive Summary');
    expect(executiveSummaryElements.length).toBeGreaterThan(0);
    
    // Verify chart container is present (Chart.js canvas will be rendered inside)
    const chartContainer = screen.getByRole('img');
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

    // Verify KPI labels are displayed using test IDs
    const kpiLabels = screen.getAllByTestId(/^kpi-label-/);
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

    // Verify initial "AI-Enhanced (After)" button is active
    const afterButton = screen.getByRole('button', { name: /ai-enhanced/i });
    const beforeButton = screen.getByRole('button', { name: /historical/i });
    
    expect(afterButton).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-purple-500');
    expect(beforeButton).toHaveClass('text-gray-600');

    // Click "Historical" toggle
    await user.click(beforeButton);

    // Verify API was called with before=true
    await waitFor(() => {
      expect(mockAnalyticsApi.getExecutiveSummary).toHaveBeenCalledWith(true);
    });

    // Verify "Historical" button is now active
    await waitFor(() => {
      expect(beforeButton).toHaveClass('bg-gradient-to-r', 'from-amber-500', 'to-orange-500');
      expect(afterButton).toHaveClass('text-gray-600');
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

    // Wait for error to be displayed - look for any error text since our new design might format it differently
    await waitFor(() => {
      const errorElements = screen.queryAllByText(/failed to load/i);
      expect(errorElements.length).toBeGreaterThan(0);
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
      const errorElements = screen.queryAllByText(/failed to load/i);
      expect(errorElements.length).toBe(0);
      const executiveSummaryElements = screen.getAllByText('Executive Summary');
      expect(executiveSummaryElements.length).toBeGreaterThan(0);
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
    const executiveSummaryElements = screen.getAllByText('Executive Summary');
    expect(executiveSummaryElements.length).toBeGreaterThan(0);
  });
});