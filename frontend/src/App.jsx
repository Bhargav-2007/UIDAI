
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import DescriptiveModule from './pages/DescriptiveModule';
import FraudModule from './pages/FraudModule';
import OperationsModule from './pages/OperationsModule';
import PredictiveModule from './pages/PredictiveModule';
import GeographicModule from './pages/GeographicModule';
import QualityModule from './pages/QualityModule';
import AdvancedModule from './pages/AdvancedModule';
import DataExplorer from './pages/DataExplorer';
import PowerBIContainer from './pages/PowerBIContainer';

function App() {
  const [activeModule, setActiveModule] = useState('home');

  const renderModule = () => {
    switch (activeModule) {
      case 'home': return <Home onNavigate={handleNavEnhanced} />;
      case 'descriptive': return <DescriptiveModule />;
      case 'fraud': return <FraudModule />;
      case 'operations': return <OperationsModule />;
      case 'predictive': return <PredictiveModule />;
      case 'geographic': return <GeographicModule />;
      case 'quality': return <QualityModule />;
      case 'advanced': return <AdvancedModule />;
      case 'explorer': // Data Management group
      case 'grid': return <DataExplorer />; // Alias
      case 'powerbi': return <PowerBIContainer />;
      default: return <Home onNavigate={handleNavEnhanced} />;
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

