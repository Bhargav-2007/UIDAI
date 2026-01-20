import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AnalyticsChart } from './AnalyticsChartNew';
import { ChartData, KPI } from '../types/analytics';
import fc from 'fast-check';

// Mock Chart.js to avoid canvas rendering issues in tests
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Scatter: () => <div data-testid="scatter-chart">Scatter Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

describe('AnalyticsChart Component', () => {
  // Cleanup after each test to prevent DOM pollution
  afterEach(() => {
    cleanup();
  });
  // Helper function to create valid chart data
  const createValidChartData = (overrides: Partial<ChartData> = {}): ChartData => ({
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Series 1',
        data: [10, 20, 15],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 243, 0.1)',
        fill: true,
      },
    ],
    ...overrides,
  });

  // Helper function to create valid KPIs
  const createValidKpis = (count: number = 3): KPI[] => {
    return Array.from({ length: count }, (_, i) => ({
      label: `KPI ${i + 1}`,
      value: 100 + i * 10,
      format: 'number' as const,
    }));
  };

  describe('Unit Tests', () => {
    describe('Chart Type Rendering', () => {
      it('should render line chart when chartType is "line"', () => {
        const data = createValidChartData();
        const kpis = createValidKpis();

        render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });

      it('should render bar chart when chartType is "bar"', () => {
        const data = createValidChartData();
        const kpis = createValidKpis();

        render(
          <AnalyticsChart
            chartType="bar"
            data={data}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });

      it('should render scatter chart when chartType is "scatter"', () => {
        const data = createValidChartData();
        const kpis = createValidKpis();

        render(
          <AnalyticsChart
            chartType="scatter"
            data={data}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
      });

      it('should render pie chart when chartType is "pie"', () => {
        const data = createValidChartData();
        const kpis = createValidKpis();

        render(
          <AnalyticsChart
            chartType="pie"
            data={data}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
    });

    describe('Error State', () => {
      it('should display error message when error prop is provided', () => {
        const data = createValidChartData();
        const kpis = createValidKpis();
        const errorMessage = 'Failed to load data';

        render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
            error={errorMessage}
          />
        );

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      it('should display retry button when error is provided and onRetry is defined', () => {
        const data = createValidChartData();
        const kpis = createValidKpis();
        const onRetry = vi.fn();

        render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
            error="Failed to load data"
            onRetry={onRetry}
          />
        );

        const retryButton = screen.getByRole('button', { name: /retry/i });
        expect(retryButton).toBeInTheDocument();
      });

      it('should call onRetry when retry button is clicked', () => {
        const data = createValidChartData();
        const kpis = createValidKpis();
        const onRetry = vi.fn();

        render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
            error="Failed to load data"
            onRetry={onRetry}
          />
        );

        const retryButton = screen.getByRole('button', { name: /retry/i });
        retryButton.click();

        expect(onRetry).toHaveBeenCalledTimes(1);
      });

      it('should display error message when data is invalid (missing labels)', () => {
        const invalidData = {
          labels: undefined as any,
          datasets: [{ label: 'Series', data: [1, 2, 3] }],
        };
        const kpis = createValidKpis();

        render(
          <AnalyticsChart
            chartType="line"
            data={invalidData}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByText(/invalid chart data/i)).toBeInTheDocument();
      });

      it('should display error message when data is invalid (missing datasets)', () => {
        const invalidData = {
          labels: ['A', 'B'],
          datasets: undefined as any,
        };
        const kpis = createValidKpis();

        render(
          <AnalyticsChart
            chartType="line"
            data={invalidData}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByText(/invalid chart data/i)).toBeInTheDocument();
      });

      it('should display error message when data is null', () => {
        const kpis = createValidKpis();

        render(
          <AnalyticsChart
            chartType="line"
            data={null as any}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByText(/invalid chart data/i)).toBeInTheDocument();
      });
    });

    describe('Loading State', () => {
      it('should display loading indicator when isLoading is true', () => {
        const data = createValidChartData();
        const kpis = createValidKpis();

        render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
            isLoading={true}
          />
        );

        expect(screen.getByText(/loading chart data/i)).toBeInTheDocument();
      });

      it('should not display chart when isLoading is true', () => {
        const data = createValidChartData();
        const kpis = createValidKpis();

        render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
            isLoading={true}
          />
        );

        expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
      });

      it('should display chart when isLoading is false', () => {
        const data = createValidChartData();
        const kpis = createValidKpis();

        render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
            isLoading={false}
          />
        );

        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });

    describe('KPI Display', () => {
      it('should display all KPIs with labels', () => {
        const data = createValidChartData();
        const kpis = [
          { label: 'Total Revenue', value: 50000, format: 'currency' as const },
          { label: 'Growth Rate', value: 12.5, format: 'percentage' as const },
          { label: 'Active Users', value: 1250, format: 'number' as const },
        ];

        render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        expect(screen.getByText('Growth Rate')).toBeInTheDocument();
        expect(screen.getByText('Active Users')).toBeInTheDocument();
      });

      it('should format currency values correctly', () => {
        const data = createValidChartData();
        const kpis = [
          { label: 'Revenue', value: 50000.5, format: 'currency' as const },
        ];

        render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
          />
        );

        // Currency format should include thousands separator and 2 decimal places
        expect(screen.getByText(/50,000\.50/)).toBeInTheDocument();
      });

      it('should format percentage values correctly', () => {
        const data = createValidChartData();
        const kpis = [
          { label: 'Growth', value: 12.5, format: 'percentage' as const },
        ];

        render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByText(/12\.50%/)).toBeInTheDocument();
      });

      it('should format number values with thousands separator', () => {
        const data = createValidChartData();
        const kpis = [
          { label: 'Users', value: 1250000, format: 'number' as const },
        ];

        render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByText(/1,250,000/)).toBeInTheDocument();
      });

      it('should display string KPI values as-is', () => {
        const data = createValidChartData();
        const kpis = [
          { label: 'Status', value: 'Active' },
        ];

        render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByText('Active')).toBeInTheDocument();
      });

      it('should display multiple KPIs in order', () => {
        const data = createValidChartData();
        const kpis = [
          { label: 'First', value: 1 },
          { label: 'Second', value: 2 },
          { label: 'Third', value: 3 },
        ];

        const { container } = render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
          />
        );

        const kpiLabels = container.querySelectorAll('.kpi-label');
        expect(kpiLabels).toHaveLength(3);
        expect(kpiLabels[0]).toHaveTextContent('First');
        expect(kpiLabels[1]).toHaveTextContent('Second');
        expect(kpiLabels[2]).toHaveTextContent('Third');
      });
    });

    describe('Chart Updates', () => {
      it('should update chart when data changes', () => {
        const initialData = createValidChartData({
          labels: ['A', 'B'],
          datasets: [{ label: 'Series', data: [1, 2] }],
        });
        const kpis = createValidKpis();

        const { rerender } = render(
          <AnalyticsChart
            chartType="line"
            data={initialData}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByTestId('line-chart')).toBeInTheDocument();

        const updatedData = createValidChartData({
          labels: ['X', 'Y', 'Z'],
          datasets: [{ label: 'Updated Series', data: [10, 20, 30] }],
        });

        rerender(
          <AnalyticsChart
            chartType="line"
            data={updatedData}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });

      it('should update chart type when chartType prop changes', () => {
        const data = createValidChartData();
        const kpis = createValidKpis();

        const { rerender } = render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.getByTestId('line-chart')).toBeInTheDocument();

        rerender(
          <AnalyticsChart
            chartType="bar"
            data={data}
            title="Test Chart"
            kpis={kpis}
          />
        );

        expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });

      it('should update KPIs when kpis prop changes', () => {
        const data = createValidChartData();
        const initialKpis = [{ label: 'Initial', value: 100 }];

        const { rerender } = render(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={initialKpis}
          />
        );

        expect(screen.getByText('Initial')).toBeInTheDocument();

        const updatedKpis = [{ label: 'Updated', value: 200 }];

        rerender(
          <AnalyticsChart
            chartType="line"
            data={data}
            title="Test Chart"
            kpis={updatedKpis}
          />
        );

        expect(screen.queryByText('Initial')).not.toBeInTheDocument();
        expect(screen.getByText('Updated')).toBeInTheDocument();
      });
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Property 3: Chart Rendering for Valid Data
     * For any valid chart data with a specified chart type (line, bar, scatter, or pie),
     * the AnalyticsChart component SHALL render the correct chart type without errors.
     * **Validates: Requirements 3.2**
     */
    describe('Property 3: Chart Rendering for Valid Data', () => {
      it('should render correct chart type for any valid data and chart type combination', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              fc.constant('line' as const),
              fc.constant('bar' as const),
              fc.constant('scatter' as const),
              fc.constant('pie' as const)
            ),
            fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
            fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 1, maxLength: 10 }),
            (chartType, labels, dataValues) => {
              const data: ChartData = {
                labels,
                datasets: [
                  {
                    label: 'Test Series',
                    data: dataValues,
                  },
                ],
              };
              const kpis = createValidKpis();

              const { unmount } = render(
                <AnalyticsChart
                  chartType={chartType}
                  data={data}
                  title="Test"
                  kpis={kpis}
                />
              );

              // Verify correct chart type is rendered
              const expectedTestId = `${chartType}-chart`;
              expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();

              // Clean up
              unmount();
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should render without errors for any valid chart data structure', () => {
        fc.assert(
          fc.property(
            fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 5 }),
            fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 1, maxLength: 5 }),
            (labels, dataValues) => {
              const data: ChartData = {
                labels,
                datasets: [
                  {
                    label: 'Series 1',
                    data: dataValues,
                  },
                ],
              };
              const kpis = createValidKpis();

              let renderResult: any;
              expect(() => {
                renderResult = render(
                  <AnalyticsChart
                    chartType="line"
                    data={data}
                    title="Test"
                    kpis={kpis}
                  />
                );
              }).not.toThrow();

              // Clean up
              if (renderResult) {
                renderResult.unmount();
              }
            }
          ),
          { numRuns: 50 }
        );
      });

      it('should render all four chart types correctly', () => {
        const chartTypes: Array<'line' | 'bar' | 'scatter' | 'pie'> = [
          'line',
          'bar',
          'scatter',
          'pie',
        ];
        const data = createValidChartData();
        const kpis = createValidKpis();

        for (const chartType of chartTypes) {
          const { container, unmount } = render(
            <AnalyticsChart
              chartType={chartType}
              data={data}
              title="Test"
              kpis={kpis}
            />
          );

          const chart = container.querySelector(`[data-testid="${chartType}-chart"]`);
          expect(chart).toBeTruthy();
          unmount();
        }
      });
    });

    /**
     * Property 4: Invalid Data Error Display
     * For any invalid or missing chart data provided to the AnalyticsChart component,
     * the component SHALL display an error message instead of rendering a broken chart.
     * **Validates: Requirements 3.3**
     */
    describe('Property 4: Invalid Data Error Display', () => {
      it('should display error message for any invalid data structure', () => {
        const invalidDataScenarios = [
          { labels: null, datasets: [] },
          { labels: undefined, datasets: [] },
          { labels: [], datasets: null },
          { labels: [], datasets: undefined },
          { labels: 'not-array', datasets: [] },
          { labels: [], datasets: 'not-array' },
          null,
          undefined,
          {},
        ];

        const kpis = createValidKpis();

        for (const invalidData of invalidDataScenarios) {
          const { unmount } = render(
            <AnalyticsChart
              chartType="line"
              data={invalidData as any}
              title="Test"
              kpis={kpis}
            />
          );

          // Should display error message
          expect(screen.getByText(/invalid chart data/i)).toBeInTheDocument();

          // Should not render any chart
          expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
          expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
          expect(screen.queryByTestId('scatter-chart')).not.toBeInTheDocument();
          expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();

          unmount();
        }
      });

      it('should display error message for any missing required data fields', () => {
        fc.assert(
          fc.property(
            fc.oneof(
              fc.constant({ datasets: [], kpis: [] }),
              fc.constant({ labels: [], kpis: [] }),
              fc.constant({ labels: [], datasets: [] }),
              fc.constant(null),
              fc.constant(undefined)
            ),
            (invalidData) => {
              const kpis = createValidKpis();

              const { unmount } = render(
                <AnalyticsChart
                  chartType="line"
                  data={invalidData as any}
                  title="Test"
                  kpis={kpis}
                />
              );

              // Should display error message
              expect(screen.getByText(/invalid chart data/i)).toBeInTheDocument();

              // Should not render chart
              expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
              expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
              expect(screen.queryByTestId('scatter-chart')).not.toBeInTheDocument();
              expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();

              // Clean up
              unmount();
            }
          ),
          { numRuns: 50 }
        );
      });

      it('should never render a broken chart for invalid data', () => {
        const invalidDataScenarios = [
          { labels: null, datasets: [{ label: 'Series', data: [1, 2] }] },
          { labels: [], datasets: null },
          { labels: 'invalid', datasets: [] },
          null,
          undefined,
        ];

        const kpis = createValidKpis();

        for (const invalidData of invalidDataScenarios) {
          const { unmount } = render(
            <AnalyticsChart
              chartType="line"
              data={invalidData as any}
              title="Test"
              kpis={kpis}
            />
          );

          // Verify no chart is rendered
          expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
          expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
          expect(screen.queryByTestId('scatter-chart')).not.toBeInTheDocument();
          expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();

          // Verify error message is shown
          expect(screen.getByText(/invalid chart data/i)).toBeInTheDocument();

          unmount();
        }
      });
    });

    /**
     * Property 5: Chart Update Consistency
     * For any sequence of data updates to the AnalyticsChart component,
     * the component SHALL render the latest data correctly without stale data or memory leaks.
     * **Validates: Requirements 3.5**
     */
    describe('Property 5: Chart Update Consistency', () => {
      it('should render latest data after multiple updates', () => {
        fc.assert(
          fc.property(
            fc.array(
              fc.record({
                labels: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 3 }),
                data: fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 1, maxLength: 3 }),
              }),
              { minLength: 2, maxLength: 5 }
            ),
            (dataSequence) => {
              const kpis = createValidKpis();
              let currentData = {
                labels: dataSequence[0].labels,
                datasets: [{ label: 'Series', data: dataSequence[0].data }],
              };

              const { rerender, unmount } = render(
                <AnalyticsChart
                  chartType="line"
                  data={currentData}
                  title="Test"
                  kpis={kpis}
                />
              );

              // Update data multiple times
              for (let i = 1; i < dataSequence.length; i++) {
                currentData = {
                  labels: dataSequence[i].labels,
                  datasets: [{ label: 'Series', data: dataSequence[i].data }],
                };

                rerender(
                  <AnalyticsChart
                    chartType="line"
                    data={currentData}
                    title="Test"
                    kpis={kpis}
                  />
                );

                // Verify chart is still rendered (no memory leaks)
                expect(screen.getByTestId('line-chart')).toBeInTheDocument();
              }

              // Clean up
              unmount();
            }
          ),
          { numRuns: 50 }
        );
      });

      it('should handle rapid chart type changes without errors', () => {
        const chartTypes: Array<'line' | 'bar' | 'scatter' | 'pie'> = [
          'line',
          'bar',
          'scatter',
          'pie',
        ];
        const data = createValidChartData();
        const kpis = createValidKpis();

        const { rerender } = render(
          <AnalyticsChart
            chartType={chartTypes[0]}
            data={data}
            title="Test"
            kpis={kpis}
          />
        );

        // Rapidly change chart types
        for (let i = 1; i < chartTypes.length; i++) {
          rerender(
            <AnalyticsChart
              chartType={chartTypes[i]}
              data={data}
              title="Test"
              kpis={kpis}
            />
          );

          // Verify correct chart is rendered
          expect(screen.getByTestId(`${chartTypes[i]}-chart`)).toBeInTheDocument();
        }
      });

      it('should maintain consistency when toggling between error and valid states', () => {
        const validData = createValidChartData();
        const invalidData = null;
        const kpis = createValidKpis();

        const { rerender } = render(
          <AnalyticsChart
            chartType="line"
            data={validData}
            title="Test"
            kpis={kpis}
          />
        );

        // Should show chart
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();

        // Switch to invalid data
        rerender(
          <AnalyticsChart
            chartType="line"
            data={invalidData as any}
            title="Test"
            kpis={kpis}
          />
        );

        // Should show error
        expect(screen.getByText(/invalid chart data/i)).toBeInTheDocument();
        expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();

        // Switch back to valid data
        rerender(
          <AnalyticsChart
            chartType="line"
            data={validData}
            title="Test"
            kpis={kpis}
          />
        );

        // Should show chart again
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.queryByText(/invalid chart data/i)).not.toBeInTheDocument();
      });
    });
  });
});
