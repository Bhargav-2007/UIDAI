import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import AiRiskScoringPage from './AiRiskScoringPage';
import { analyticsApi } from '../services/analyticsApi';

vi.mock('../services/analyticsApi', () => ({
    analyticsApi: { getAiRiskScoring: vi.fn() },
}));
const mockApi = vi.mocked(analyticsApi);

vi.mock('react-chartjs-2', () => ({
    Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

describe('AiRiskScoringPage', () => {
    beforeEach(() => { vi.clearAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); cleanup(); });

    it('should fetch data and render bar chart', async () => {
        mockApi.getAiRiskScoring.mockResolvedValue({
            labels: ['A'], datasets: [{ label: 'A', data: [1] }],
            kpis: [{ label: 'K1', value: 1 }, { label: 'K2', value: 2 }, { label: 'K3', value: 3 }],
            chartType: 'bar', title: 'T',
        });
        render(<AiRiskScoringPage />);
        await waitFor(() => expect(screen.getByText('AI Risk Scoring')).toBeInTheDocument());
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
});
