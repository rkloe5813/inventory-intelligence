import { useState } from 'react';
import InventoryDashboard from './screens/InventoryDashboard';
import AcquisitionCalculator from './screens/AcquisitionCalculator';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  function openCalculator(vehicle = null) {
    setSelectedVehicle(vehicle);
    setView('calculator');
  }

  function goBack() {
    setView('dashboard');
    setSelectedVehicle(null);
  }

  return (
    <div>
      {view === 'dashboard' && (
        <>
          <InventoryDashboard onSelectVehicle={openCalculator} />
          <div style={{ height: 16 }} />
          <button className="btn btn-secondary" onClick={() => openCalculator(null)}>
            Open Acquisition Calculator
          </button>
          <div style={{ height: 8 }} />
        </>
      )}

      {view === 'calculator' && (
        <AcquisitionCalculator
          prefillVehicle={selectedVehicle}
          onBack={goBack}
        />
      )}
    </div>
  );
}
