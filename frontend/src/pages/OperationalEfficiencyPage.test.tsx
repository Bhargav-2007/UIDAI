import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import OperationalEfficiencyPage from './OperationalEfficiencyPage';
import { analyticsApi } from '../services/analyticsApi';

vi.mock('../services/analyticsApi', () => ({
    analyticsApi: { getOperationalEfficiency: vi.fn() },
}));
const mockApi = vi.mocked(analyticsApi);

vi.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="line-chart">Line Chart</div>,
    Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

describe('OperationalEfficiencyPage', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); cleanup(); });

    it('should fetch data and render', async () => {
        mockApi.getOperationalEfficiency.mockResolvedValue({
            labels: ['A'], datasets: [{ label: 'O', data: [1] }],
            kpis: [{ label: 'K1', value: 1 }, { label: 'K2', value: 2 }, { label: 'K3', value: 3 }],
            chartType: 'bar', title: 'T',
        });
        render(<OperationalEfficiencyPage />);
        await waitFor(() => expect(screen.getByText('Operational Efficiency')).toBeInTheDocument());
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
});
