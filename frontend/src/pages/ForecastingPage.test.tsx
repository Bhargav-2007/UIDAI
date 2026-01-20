import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import ForecastingPage from './ForecastingPage';
import { analyticsApi } from '../services/analyticsApi';

vi.mock('../services/analyticsApi', () => ({
    analyticsApi: { getForecasting: vi.fn() },
}));
const mockApi = vi.mocked(analyticsApi);

vi.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="line-chart">Line Chart</div>,
}));

describe('ForecastingPage', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); cleanup(); });

    it('should fetch data and render line chart', async () => {
        mockApi.getForecasting.mockResolvedValue({
            labels: ['A'], datasets: [{ label: 'F', data: [1] }],
            kpis: [{ label: 'K1', value: 1 }, { label: 'K2', value: 2 }, { label: 'K3', value: 3 }],
            chartType: 'line', title: 'T',
        });
        render(<ForecastingPage />);
        await waitFor(() => expect(screen.getByText('Forecasting')).toBeInTheDocument());
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
});
