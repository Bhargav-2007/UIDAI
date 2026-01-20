import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import PageShell from './components/PageShell';

// Import Pages
import ExecutiveSummaryPage from './pages/ExecutiveSummaryPage';
import DescriptiveAnalyticsPage from './pages/DescriptiveAnalyticsPage';
import FraudDetectionPage from './pages/FraudDetectionPage';
import OutlierDetectionPage from './pages/OutlierDetectionPage';
import OperationalEfficiencyPage from './pages/OperationalEfficiencyPage';
import ForecastingPage from './pages/ForecastingPage';
import GeographicAnalysisPage from './pages/GeographicAnalysisPage';
import BenchmarkingPage from './pages/BenchmarkingPage';
import AiRiskScoringPage from './pages/AiRiskScoringPage';
import DataExplorer from './pages/DataExplorer';
import PowerBIContainer from './pages/PowerBIContainer';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Map paths to active module IDs for sidebar highlighting
  const getActiveId = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    return path.substring(1).replace('/', '-');
  };

  const activeId = getActiveId();

  const handleNavigate = (modId, itemId) => {
    // Basic mapping of item IDs to routes
    const routeMap = {
      'home': '/',
      'descriptive': '/descriptive',
      'fraud': '/fraud',
      'outliers': '/outliers',
      'operations': '/operations',
      'predictive': '/predictive',
      'geographic': '/geographic',
      'quality': '/quality',
      'advanced': '/advanced',
      'grid': '/data-explorer',
      'powerbi': '/power-bi'
    };

    const targetRoute = routeMap[itemId] || '/';
    navigate(targetRoute);
  };

  return (
    <PageShell activeModule={activeId} onNavigate={handleNavigate}>
      <Routes>
        <Route path="/" element={<ExecutiveSummaryPage />} />
        <Route path="/descriptive" element={<DescriptiveAnalyticsPage />} />
        <Route path="/fraud" element={<FraudDetectionPage />} />
        <Route path="/outliers" element={<OutlierDetectionPage />} />
        <Route path="/operations" element={<OperationalEfficiencyPage />} />
        <Route path="/predictive" element={<ForecastingPage />} />
        <Route path="/geographic" element={<GeographicAnalysisPage />} />
        <Route path="/quality" element={<BenchmarkingPage />} />
        <Route path="/advanced" element={<AiRiskScoringPage />} />
        <Route path="/data-explorer" element={<DataExplorer />} />
        <Route path="/power-bi" element={<PowerBIContainer />} />
        <Route path="*" element={<ExecutiveSummaryPage />} />
      </Routes>
    </PageShell>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

