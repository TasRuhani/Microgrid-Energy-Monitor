'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Define the SVG icon components directly in the file
interface IconProps {
  className?: string;
}

const SunnyIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2" />
    <path d="M12 21v2" />
    <path d="M4.22 4.22l1.42 1.42" />
    <path d="M18.36 18.36l1.42 1.42" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="M4.22 19.78l1.42-1.42" />
    <path d="M18.36 5.64l1.42-1.42" />
  </svg>
);

const WarningIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CloseIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);


interface Panel {
  id: string;
  status: 'ok' | 'warning' | 'error';
  isEnabled: boolean;
}

// Helper function to generate a unique ID for each panel
const generatePanelId = () => {
  return Math.random().toString(36).substring(2, 9);
};

const SolarPanelDashboard: React.FC = () => {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to create initial panel state
  const initializePanels = useCallback(() => {
    const initialPanels: Panel[] = Array.from({ length: 40 }, () => ({
      id: generatePanelId(),
      status: Math.random() < 0.2 ? 'warning' : 'ok', // 20% chance of a warning state
      isEnabled: true,
    }));
    setPanels(initialPanels);
  }, []); // Note: the dependency array is now empty because panelCount is no longer a state variable

  useEffect(() => {
    initializePanels();
  }, [initializePanels]);

  // Handle panel click to show modal
  const handlePanelClick = (panel: Panel) => {
    setSelectedPanel(panel);
    setShowModal(true);
  };

  // Handle toggling the panel status (on/off)
  const togglePanelStatus = () => {
    if (!selectedPanel) return;

    setLoading(true);
    setTimeout(() => {
      setPanels(panels.map(p =>
        p.id === selectedPanel.id ? { ...p, isEnabled: !p.isEnabled } : p
      ));
      setLoading(false);
      setShowModal(false);
    }, 1000); // Simulate network latency
  };

  const getStatusColor = (status: string, isEnabled: boolean) => {
    if (!isEnabled) {
      return 'bg-gray-500 hover:bg-gray-600';
    }
    switch (status) {
      case 'ok':
        return 'bg-green-500 hover:bg-green-600';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusIcon = (status: string, isEnabled: boolean) => {
    if (!isEnabled) {
      return <CloseIcon className="text-white text-3xl"/>;
    }
    switch (status) {
      case 'ok':
        return <SunnyIcon className="text-white text-3xl"/>;
      case 'warning':
        return <WarningIcon className="text-white text-3xl"/>;
      case 'error':
        return <CloseIcon className="text-white text-3xl"/>;
      default:
        return <CloseIcon className="text-white text-3xl"/>;
    }
  };

  const getStatusText = (status: string, isEnabled: boolean) => {
    if (!isEnabled) {
      return 'Off';
    }
    switch (status) {
      case 'ok':
        return 'Working';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Faulty';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans flex flex-col items-center">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 mt-8 tracking-tight text-white shadow-text-neon">
          Solar Panel Monitor
        </h1>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 justify-items-center">
          {panels.map((panel, index) => (
            <div
              key={panel.id}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl shadow-lg transform transition-transform duration-300 ease-in-out cursor-pointer
                ${getStatusColor(panel.status, panel.isEnabled)}
                ${selectedPanel?.id === panel.id ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-105'}
              `}
              onClick={() => handlePanelClick(panel)}
            >
              {getStatusIcon(panel.status, panel.isEnabled)}
              <span className="text-xs mt-2 font-medium">Panel {index + 1}</span>
              <span className="text-xs mt-1 text-gray-200">{getStatusText(panel.status, panel.isEnabled)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Panel Details */}
      {showModal && selectedPanel && (
        <div className="fixed inset-0 bg-gray-950 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Panel {panels.findIndex(p => p.id === selectedPanel.id) + 1}</h2>
            <div className="flex flex-col items-center mb-6">
                {getStatusIcon(selectedPanel.status, selectedPanel.isEnabled)}
                <span className={`mt-2 font-semibold text-xl ${selectedPanel.isEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                    {getStatusText(selectedPanel.status, selectedPanel.isEnabled)}
                </span>
            </div>

            <button
              onClick={togglePanelStatus}
              disabled={loading}
              className={`
                w-full py-3 px-6 rounded-lg text-lg font-bold transition-colors duration-300 ease-in-out
                ${selectedPanel.isEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : (
                selectedPanel.isEnabled ? 'Turn Off Panel' : 'Turn On Panel'
              )}
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full py-2 px-6 rounded-lg text-gray-400 hover:text-white transition-colors duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarPanelDashboard;