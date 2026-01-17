
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ExecutiveSummary from './pages/ExecutiveSummary';
import Home from './pages/Home';
import FraudModuleNew from './pages/FraudModuleNew';
import OperationsModuleNew from './pages/OperationsModuleNew';
import PredictiveModuleNew from './pages/PredictiveModuleNew';
import GeographicModuleNew from './pages/GeographicModuleNew';
import DescriptiveModule from './pages/DescriptiveModule';
import QualityModule from './pages/QualityModule';
import AdvancedModule from './pages/AdvancedModule';
import DataExplorer from './pages/DataExplorer';
import PowerBIContainer from './pages/PowerBIContainer';

function App() {
  const [activeModule, setActiveModule] = useState('home');

  const renderModule = () => {
    switch (activeModule) {
      case 'home': return <ExecutiveSummary />;
      case 'fraud': return <FraudModuleNew />;
      case 'operations': return <OperationsModuleNew />;
      case 'predictive': return <PredictiveModuleNew />;
      case 'geographic': return <GeographicModuleNew />;
      case 'descriptive': return <DescriptiveModule />;
      case 'quality': return <QualityModule />;
      case 'advanced': return <AdvancedModule />;
      case 'explorer':
      case 'grid': return <DataExplorer />;
      case 'powerbi': return <PowerBIContainer />;
      default: return <ExecutiveSummary />;
    }
  };

  // Re-implement state to capture sub-navigation
  // But to keep it simple, I will modify handleNavigation to set activeModule 
  // to the itemId if it matches certain cases, or keep module ID.

  const handleNavEnhanced = (modId, itemId) => {
    if (modId === 'explorer') {
      setActiveModule(itemId); // 'grid' or 'powerbi'
    } else if (modId === 'home') {
      setActiveModule('home');
    } else {
      setActiveModule(modId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <Sidebar activeModule={activeModule} onNavigate={handleNavEnhanced} />
      {renderModule()}
    </div>
  );
}

export default App;

