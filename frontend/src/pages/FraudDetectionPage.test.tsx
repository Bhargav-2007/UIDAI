import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FraudDetectionPage from './FraudDetectionPage';
import { analyticsApi } from '../services/analyticsApi';
import { AnalyticsData } from '../types/analytics';

vi.mock('../services/analyticsApi', () => ({
    analyticsApi: {
        getFraudDetection: vi.fn(),
    },
}));

const mockAnalyticsApi = vi.mocked(analyticsApi);

vi.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="line-chart">Line Chart</div>,
    Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
    Scatter: () => <div data-testid="scatter-chart">Scatter Chart</div>,
    Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

describe('FraudDetectionPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanup();
    });

    it('should fetch data on mount', async () => {
        const mockData: AnalyticsData = {
            labels: ['1', '2', '3'],
            datasets: [{ label: 'Fraud', data: [10, 20, 30] }],
            kpis: [
                { label: 'K1', value: 10 },
                { label: 'K2', value: 20 },
                { label: 'K3', value: 30 },
            ],
            chartType: 'bar',
            title: 'Fraud Detection',
        };

        mockAnalyticsApi.getFraudDetection.mockResolvedValue(mockData);

        render(<FraudDetectionPage />);

        expect(mockAnalyticsApi.getFraudDetection).toHaveBeenCalledWith(false);

        await waitFor(() => {
            expect(screen.queryByText('Loading chart data...')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Fraud & Integrity')).toBeInTheDocument();
    });

    it('should render bar chart by default', async () => {
        const mockData: AnalyticsData = {
            labels: ['A'], datasets: [{ label: 'L', data: [1] }],
            kpis: [{ label: 'K1', value: 1 }, { label: 'K2', value: 2 }, { label: 'K3', value: 3 }],
            chartType: 'bar', title: 'T',
        };
        mockAnalyticsApi.getFraudDetection.mockResolvedValue(mockData);
        render(<FraudDetectionPage />);
        await waitFor(() => { expect(screen.getByTestId('bar-chart')).toBeInTheDocument(); });
    });

    it('should update chart when toggle changes', async () => {
        mockAnalyticsApi.getFraudDetection.mockResolvedValue({
            labels: ['X'], datasets: [{ label: 'Y', data: [1] }],
            kpis: [{ label: 'K1', value: 1 }, { label: 'K2', value: 2 }, { label: 'K3', value: 3 }],
            chartType: 'bar', title: 'T',
        });
        const user = userEvent.setup();
        render(<FraudDetectionPage />);
        await waitFor(() => screen.getByRole('button', { name: /before/i }));
        await user.click(screen.getByRole('button', { name: /before/i }));
        await waitFor(() => expect(mockAnalyticsApi.getFraudDetection).toHaveBeenCalledWith(true));
    });

    it('should handle error and retry', async () => {
        mockAnalyticsApi.getFraudDetection.mockRejectedValue(new Error('Fail'));
        const user = userEvent.setup();
        render(<FraudDetectionPage />);
        await waitFor(() => screen.getByText('Fail'));
        const retry = screen.getByRole('button', { name: /retry/i });
        mockAnalyticsApi.getFraudDetection.mockResolvedValue({
            labels: ['X'], datasets: [{ label: 'Y', data: [1] }],
            kpis: [{ label: 'K1', value: 1 }, { label: 'K2', value: 2 }, { label: 'K3', value: 3 }],
            chartType: 'bar', title: 'T',
        });
        await user.click(retry);
        await waitFor(() => expect(screen.queryByText('Fail')).not.toBeInTheDocument());
    });
});
