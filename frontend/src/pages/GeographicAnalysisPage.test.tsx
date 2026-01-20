import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import GeographicAnalysisPage from './GeographicAnalysisPage';
import { analyticsApi } from '../services/analyticsApi';

vi.mock('../services/analyticsApi', () => ({
    analyticsApi: { getGeographicAnalysis: vi.fn() },
}));
const mockApi = vi.mocked(analyticsApi);

vi.mock('react-chartjs-2', () => ({
    Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

describe('GeographicAnalysisPage', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); cleanup(); });

    it('should fetch data and render pie chart', async () => {
        mockApi.getGeographicAnalysis.mockResolvedValue({
            labels: ['A'], datasets: [{ label: 'G', data: [1] }],
            kpis: [{ label: 'K1', value: 1 }, { label: 'K2', value: 2 }, { label: 'K3', value: 3 }],
            chartType: 'pie', title: 'T',
        });
        render(<GeographicAnalysisPage />);
        await waitFor(() => expect(screen.getByText('Geographic & Demographic')).toBeInTheDocument());
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
});
