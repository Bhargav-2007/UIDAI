import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DescriptiveAnalyticsPage from './DescriptiveAnalyticsPage';
import { analyticsApi } from '../services/analyticsApi';
import { AnalyticsData } from '../types/analytics';

// Mock the analytics API
vi.mock('../services/analyticsApi', () => ({
    analyticsApi: {
        getDescriptiveAnalytics: vi.fn(),
    },
}));

const mockAnalyticsApi = vi.mocked(analyticsApi);

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="line-chart">Line Chart</div>,
    Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
    Scatter: () => <div data-testid="scatter-chart">Scatter Chart</div>,
    Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

describe('DescriptiveAnalyticsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanup();
    });

    it('should fetch data on mount', async () => {
        const mockData: AnalyticsData = {
            labels: ['A', 'B', 'C'],
            datasets: [{ label: 'Stats', data: [1, 2, 3] }],
            kpis: [
                { label: 'KPI 1', value: 10, format: 'number' },
                { label: 'KPI 2', value: 20, format: 'number' },
                { label: 'KPI 3', value: 30, format: 'number' },
            ],
            chartType: 'bar',
            title: 'Descriptive Analytics',
        };

        mockAnalyticsApi.getDescriptiveAnalytics.mockResolvedValue(mockData);

        render(<DescriptiveAnalyticsPage />);

        expect(mockAnalyticsApi.getDescriptiveAnalytics).toHaveBeenCalledWith(false);

        await waitFor(() => {
            expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Descriptive Analytics')).toBeInTheDocument();
    });

    it('should render bar chart by default', async () => {
        const mockData: AnalyticsData = {
            labels: ['A', 'B'],
            datasets: [{ label: 'Stats', data: [10, 20] }],
            kpis: [
                { label: 'K1', value: 1 },
                { label: 'K2', value: 2 },
                { label: 'K3', value: 3 },
            ],
            chartType: 'bar',
            title: 'Descriptive Analytics',
        };

        mockAnalyticsApi.getDescriptiveAnalytics.mockResolvedValue(mockData);

        render(<DescriptiveAnalyticsPage />);

        await waitFor(() => {
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });
    });

    it('should update chart and KPIs when Before/After toggle is changed', async () => {
        const afterData: AnalyticsData = {
            labels: ['After'],
            datasets: [{ label: 'AfterSet', data: [100] }],
            kpis: [{ label: 'K1', value: 100 }, { label: 'K2', value: 100 }, { label: 'K3', value: 100 }],
            chartType: 'bar',
            title: 'After',
        };

        const beforeData: AnalyticsData = {
            labels: ['Before'],
            datasets: [{ label: 'BeforeSet', data: [50] }],
            kpis: [{ label: 'K1', value: 50 }, { label: 'K2', value: 50 }, { label: 'K3', value: 50 }],
            chartType: 'bar',
            title: 'Before',
        };

        mockAnalyticsApi.getDescriptiveAnalytics
            .mockResolvedValueOnce(afterData)
            .mockResolvedValueOnce(beforeData);

        const user = userEvent.setup();
        render(<DescriptiveAnalyticsPage />);

        await waitFor(() => {
            expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
        });

        const beforeButton = screen.getByRole('button', { name: /before/i });
        await user.click(beforeButton);

        await waitFor(() => {
            expect(mockAnalyticsApi.getDescriptiveAnalytics).toHaveBeenCalledWith(true);
        });
    });

    it('should display error message and retry button when API fails', async () => {
        const errorMessage = 'API Failure';
        mockAnalyticsApi.getDescriptiveAnalytics.mockRejectedValue(new Error(errorMessage));

        const user = userEvent.setup();
        render(<DescriptiveAnalyticsPage />);

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });

        const retryButton = screen.getByRole('button', { name: /retry/i });
        expect(retryButton).toBeInTheDocument();

        mockAnalyticsApi.getDescriptiveAnalytics.mockResolvedValue({
            labels: ['Test'],
            datasets: [{ label: 'Test', data: [1] }],
            kpis: [{ label: 'K1', value: 1 }, { label: 'K2', value: 2 }, { label: 'K3', value: 3 }],
            chartType: 'bar',
            title: 'Success',
        });

        await user.click(retryButton);

        await waitFor(() => {
            expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
        });
    });
});
