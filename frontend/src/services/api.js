const BASE_URL = "http://localhost:8000";

async function fetchAPI(endpoint) {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`);
        if (!res.ok) throw new Error(`API request failed: ${res.statusText}`);
        return await res.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
}

export const api = {
    executiveSummary: () => fetchAPI("/api/executive/summary"),
    descriptiveStats: () => fetchAPI("/api/descriptive/univariate"),
    anomalies: () => fetchAPI("/api/fraud/outliers"),
    fraudMetrics: () => fetchAPI("/api/fraud/benford"),
    operations: () => fetchAPI("/api/operations/throughput"),
    queueTheory: () => fetchAPI("/api/operations/queue-theory"),
    pareto: () => fetchAPI("/api/operations/pareto"),
    forecasting: () => fetchAPI("/api/predictive/forecast"),
    geography: () => fetchAPI("/api/geographic/hotspots"),
    cohorts: () => fetchAPI("/api/geographic/cohorts"),
    benchmarking: () => fetchAPI("/api/quality/benchmarking"),
    timeseries: () => fetchAPI("/api/descriptive/timeseries"),
    duplicates: () => fetchAPI("/api/fraud/duplicates"),
    patterns: () => fetchAPI("/api/fraud/patterns"),
    loadBalancing: () => fetchAPI("/api/operations/load-balance"),
    yieldMetrics: () => fetchAPI("/api/operations/yield"),
    regression: () => fetchAPI("/api/predictive/regression"),
    scenarios: () => fetchAPI("/api/predictive/scenarios"),
    survival: () => fetchAPI("/api/predictive/survival"),
    clusters: () => fetchAPI("/api/geographic/clusters"),
    gaps: () => fetchAPI("/api/geographic/gaps"),
    genderParity: () => fetchAPI("/api/geographic/gender-parity"),
    deciles: () => fetchAPI("/api/quality/deciles"),
    aiRisk: () => fetchAPI("/api/advanced/risk-scoring"),
    rawData: (dataset = 'enrolment', limit = 50, offset = 0) => fetchAPI(`/api/explorer/data?dataset=${dataset}&limit=${limit}&offset=${offset}`)
};
