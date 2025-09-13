'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from '@/components/pages/home-page';
import { DetailsPage } from '@/components/pages/details-page';
import { ConfigPage } from '@/components/pages/config-page';
import { Button } from '@/components/ui/button';

interface MetricData {
  voltage: string;
  current: string;
  power: string;
  energy: string;
  efficiency: string;
  pf: string;
  apparentPower: string;
  reactivePower: string;
}

interface MetricStatus {
  voltage: 'ok' | 'warning';
  powerFactor: 'ok' | 'warning';
  power: 'ok' | 'warning';
  apparentPower: 'ok' | 'warning';
  reactivePower: 'ok' | 'warning';
}

export default function App() {
  const [data, setData] = useState<MetricData>({
    voltage: '0',
    current: '0',
    power: '0',
    energy: '0',
    efficiency: '0',
    pf: '0',
    apparentPower: '0',
    reactivePower: '0',
  });
  const [metricStatus, setMetricStatus] = useState<MetricStatus>({
    voltage: 'ok',
    powerFactor: 'ok',
    power: 'ok',
    apparentPower: 'ok',
    reactivePower: 'ok',
  });
  const [resetStatus, setResetStatus] = useState('');
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedMetric, setSelectedMetric] = useState<{ title: string, value: string, unit: string } | null>(null);
  const [showLowEnergyWarning, setShowLowEnergyWarning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  // const [showConfig, setShowConfig] = useState(typeof window !== 'undefined' ? !navigator.onLine || !localStorage.getItem('esp32Ip') : true);
  const [esp32Ip, setEsp32Ip] = useState(typeof window !== 'undefined' ? localStorage.getItem('esp32Ip') || '' : '');
  const [ssid, setSsid] = useState(typeof window !== 'undefined' ? localStorage.getItem('ssid') || '' : '');
  const [password, setPassword] = useState(typeof window !== 'undefined' ? localStorage.getItem('password') || '' : '');
  const [dateRange, setDateRange] = useState('7d');

  const getBaseUrl = () => `http://${esp32Ip}`;

  const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        }).catch(error => {
          console.log('Service Worker registration failed:', error);
        });
      });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      registerServiceWorker();
      const handleOnlineStatus = () => {
        const onlineStatus = navigator.onLine;
        setIsOnline(onlineStatus);
        if (onlineStatus && !localStorage.getItem('esp32Ip')) {
          setShowConfig(true);
        } else if (!onlineStatus) {
          setShowConfig(false);
        }
      };
      window.addEventListener('online', handleOnlineStatus);
      window.addEventListener('offline', handleOnlineStatus);
      return () => {
        window.removeEventListener('online', handleOnlineStatus);
        window.removeEventListener('offline', handleOnlineStatus);
      };
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!isOnline || !esp32Ip) return;
    try {
      const response = await fetch(`${getBaseUrl()}/data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      const newPower = parseFloat(jsonData.power).toFixed(1);
      const newEnergy = (parseFloat(jsonData.energy) * 1000).toFixed(0);
      const newEfficiency = (parseFloat(newEnergy) > 0 ? (parseFloat(jsonData.power) / parseFloat(newEnergy)) * 100 : 0).toFixed(2);
      const newPf = parseFloat(jsonData.pf).toFixed(2);
      const newApparentPower = parseFloat(jsonData.apparentPower).toFixed(1);
      const newReactivePower = parseFloat(jsonData.reactivePower).toFixed(1);

      setData({
        voltage: parseFloat(jsonData.voltage).toFixed(1),
        current: parseFloat(jsonData.current).toFixed(2),
        power: newPower,
        energy: newEnergy,
        efficiency: newEfficiency,
        pf: newPf,
        apparentPower: newApparentPower,
        reactivePower: newReactivePower,
      });

      // Smart Alerts Logic
      const lowEnergyThreshold = 50;
      const lowVoltageThreshold = 190;
      const highVoltageThreshold = 250;
      const lowPfThreshold = 0.75;
      
      const newMetricStatus: MetricStatus = { voltage: 'ok', powerFactor: 'ok', power: 'ok', apparentPower: 'ok', reactivePower: 'ok' };
      
      if (parseFloat(newPower) < lowEnergyThreshold && parseFloat(newPower) > 0) {
        newMetricStatus.power = 'warning';
      }
      
      if (parseFloat(jsonData.voltage) < lowVoltageThreshold || parseFloat(jsonData.voltage) > highVoltageThreshold) {
        newMetricStatus.voltage = 'warning';
      }
      
      if (parseFloat(newPf) < lowPfThreshold) {
        newMetricStatus.powerFactor = 'warning';
      }
      
      // I've also added a check for apparent power, a large difference between
      // apparent and real power could indicate an issue.
      if (parseFloat(newApparentPower) > (parseFloat(newPower) * 1.5)) {
        newMetricStatus.apparentPower = 'warning';
      }
      
      // Similarly for reactive power, high values indicate a poor power factor
      if (parseFloat(newReactivePower) > 100) {
        newMetricStatus.reactivePower = 'warning';
      }
      
      setMetricStatus(newMetricStatus);
      setShowLowEnergyWarning(newMetricStatus.power === 'warning');

    } catch (error) {
      console.error("Could not fetch data:", error);
      setShowLowEnergyWarning(false);
      setResetStatus('Connection failed. Check IP address and Wi-Fi.');
      setTimeout(() => setResetStatus(''), 5000);
      setMetricStatus({ voltage: 'warning', powerFactor: 'warning', power: 'warning', apparentPower: 'warning', reactivePower: 'warning' });
    }
  }, [isOnline, esp32Ip]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleResetEnergy = async () => {
    setResetStatus('Resetting...');
    try {
      const response = await fetch(`${getBaseUrl()}/reset`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      setResetStatus(text);
    } catch (error) {
      setResetStatus('Failed to reset. Check connection.');
      console.error("Error resetting energy:", error);
    } finally {
      setTimeout(() => setResetStatus(''), 3000);
    }
  };

  const handleCardClick = (metric: { title: string, value: string, unit: string }) => {
    setSelectedMetric(metric);
    setCurrentPage('details');
  };

  const handleSaveConfig = () => {
    localStorage.setItem('esp32Ip', esp32Ip);
    localStorage.setItem('ssid', ssid);
    localStorage.setItem('password', password);
    setShowConfig(false);
  };

  const renderCurrentPage = () => {
    if (showConfig) {
      return (
        <ConfigPage
          esp32Ip={esp32Ip}
          setEsp32Ip={setEsp32Ip}
          ssid={ssid}
          setSsid={setSsid}
          password={password}
          setPassword={setPassword}
          onSave={handleSaveConfig}
        />
      );
    }
    switch (currentPage) {
      case 'home':
        return (
          <>
            <HomePage
              data={data}
              metricStatus={metricStatus}
              onCardClick={handleCardClick}
              onResetEnergy={handleResetEnergy}
              resetStatus={resetStatus}
            />
            <div className="text-center mt-12">
              <Button onClick={() => setShowConfig(true)} variant="primary" className="text-sm">
                Configure Wi-Fi Connection
              </Button>
            </div>
          </>
        );
      case 'details':
        if (selectedMetric) {
          return (
            <DetailsPage
              metric={selectedMetric}
              onBack={() => setCurrentPage('home')}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-white p-4 font-sans">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="cursor-pointer" onClick={() => setCurrentPage('home')}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mt-8 mb-14 text-blue-400 font-michroma">
            Renewable Energy Monitor
          </h1>
        </div>
        {showLowEnergyWarning && (
          <div className="bg-red-600 text-white p-3 rounded-lg text-center mb-6 font-medium animate-pulse">
            WARNING: Low energy input detected! Check the microgrid for inefficiencies.
          </div>
        )}
        {!isOnline && (
          <div className="bg-yellow-500 text-yellow-900 p-3 rounded-lg text-center mb-6 font-medium">
            You are currently offline. Displaying cached data.
          </div>
        )}
        {renderCurrentPage()}
      </div>
    </div>
  );
}