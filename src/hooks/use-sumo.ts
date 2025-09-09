"use client";

import { useState, useEffect, useCallback } from 'react';

interface SumoVehicle {
  id: string;
  type: string;
  speed: number;
  position: { x: number; y: number };
  lane: string;
  route: string[];
}

interface SumoTrafficLight {
  id: string;
  state: string; // 'r' = red, 'g' = green, 'y' = yellow
  phase: number;
  duration: number;
}

interface SumoMetrics {
  totalVehicles: number;
  averageSpeed: number;
  averageWaitTime: number;
  throughput: number;
  queueLength: number;
  co2Emissions: number;
}

interface SumoConfig {
  configFile?: string;
  stepLength?: number;
  port?: number;
  host?: string;
}

export function useSumo(config: SumoConfig = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [vehicles, setVehicles] = useState<SumoVehicle[]>([]);
  const [trafficLights, setTrafficLights] = useState<SumoTrafficLight[]>([]);
  const [metrics, setMetrics] = useState<SumoMetrics>({
    totalVehicles: 0,
    averageSpeed: 0,
    averageWaitTime: 0,
    throughput: 0,
    queueLength: 0,
    co2Emissions: 0
  });
  const [error, setError] = useState<string | null>(null);

  const {
    configFile = 'traffic.sumocfg',
    stepLength = 1.0,
    port = 8813,
    host = 'localhost'
  } = config;

  // Connect to SUMO via TraCI
  const connect = useCallback(async () => {
    try {
      setError(null);
      
      // Simulate connection to SUMO (replace with actual TraCI connection)
      console.log(`Connecting to SUMO at ${host}:${port}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsConnected(true);
      
      // Initialize traffic lights
      const initialTrafficLights: SumoTrafficLight[] = [
        { id: 'tl_north', state: 'r', phase: 0, duration: 30 },
        { id: 'tl_south', state: 'r', phase: 0, duration: 30 },
        { id: 'tl_east', state: 'g', phase: 1, duration: 45 },
        { id: 'tl_west', state: 'g', phase: 1, duration: 45 }
      ];
      
      setTrafficLights(initialTrafficLights);
      console.log('Connected to SUMO successfully');
    } catch (err) {
      setError('Failed to connect to SUMO');
      console.error('SUMO connection error:', err);
    }
  }, [host, port]);

  // Disconnect from SUMO
  const disconnect = useCallback(async () => {
    try {
      setIsRunning(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsConnected(false);
      setCurrentStep(0);
      setVehicles([]);
      console.log('Disconnected from SUMO');
    } catch (err) {
      setError('Failed to disconnect from SUMO');
      console.error('SUMO disconnection error:', err);
    }
  }, []);

  // Start simulation
  const startSimulation = useCallback(async () => {
    if (!isConnected) {
      await connect();
    }
    
    try {
      setError(null);
      setIsRunning(true);
      console.log('Starting SUMO simulation');
    } catch (err) {
      setError('Failed to start simulation');
      console.error('SUMO start error:', err);
    }
  }, [isConnected, connect]);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    console.log('Stopping SUMO simulation');
  }, []);

  // Execute one simulation step
  const simulationStep = useCallback(async () => {
    if (!isConnected || !isRunning) return;

    try {
      // Simulate one step (replace with actual TraCI commands)
      setCurrentStep(prev => prev + 1);
      
      // Generate mock vehicle data
      const mockVehicles: SumoVehicle[] = Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
        id: `vehicle_${i}`,
        type: Math.random() > 0.8 ? 'truck' : 'car',
        speed: Math.random() * 50 + 10,
        position: {
          x: Math.random() * 800,
          y: Math.random() * 600
        },
        lane: `lane_${Math.floor(Math.random() * 4)}`,
        route: [`edge_${Math.floor(Math.random() * 4)}`, `edge_${Math.floor(Math.random() * 4)}`]
      }));
      
      setVehicles(mockVehicles);
      
      // Update metrics
      const newMetrics: SumoMetrics = {
        totalVehicles: mockVehicles.length,
        averageSpeed: mockVehicles.reduce((sum, v) => sum + v.speed, 0) / mockVehicles.length || 0,
        averageWaitTime: Math.random() * 5 + 1,
        throughput: Math.random() * 100 + 50,
        queueLength: Math.floor(Math.random() * 15),
        co2Emissions: mockVehicles.length * 0.12 + Math.random() * 2
      };
      
      setMetrics(newMetrics);
      
    } catch (err) {
      setError('Simulation step failed');
      console.error('SUMO step error:', err);
    }
  }, [isConnected, isRunning]);

  // Control traffic light
  const setTrafficLightState = useCallback(async (lightId: string, state: string) => {
    if (!isConnected) return;
    
    try {
      setTrafficLights(prev => 
        prev.map(light => 
          light.id === lightId ? { ...light, state } : light
        )
      );
      
      console.log(`Set traffic light ${lightId} to ${state}`);
    } catch (err) {
      setError('Failed to control traffic light');
      console.error('Traffic light control error:', err);
    }
  }, [isConnected]);

  // Get traffic light phases for AI optimization
  const optimizeTrafficLights = useCallback(async (vehicleData: SumoVehicle[]) => {
    if (!isConnected) return;
    
    try {
      // Simple optimization logic based on vehicle density
      const northSouthVehicles = vehicleData.filter(v => 
        v.lane.includes('north') || v.lane.includes('south')
      ).length;
      
      const eastWestVehicles = vehicleData.filter(v => 
        v.lane.includes('east') || v.lane.includes('west')
      ).length;
      
      // Switch lights based on traffic density
      if (northSouthVehicles > eastWestVehicles + 3) {
        await setTrafficLightState('tl_north', 'g');
        await setTrafficLightState('tl_south', 'g');
        await setTrafficLightState('tl_east', 'r');
        await setTrafficLightState('tl_west', 'r');
      } else if (eastWestVehicles > northSouthVehicles + 3) {
        await setTrafficLightState('tl_north', 'r');
        await setTrafficLightState('tl_south', 'r');
        await setTrafficLightState('tl_east', 'g');
        await setTrafficLightState('tl_west', 'g');
      }
      
      console.log('Traffic lights optimized based on vehicle density');
    } catch (err) {
      setError('Traffic light optimization failed');
      console.error('Optimization error:', err);
    }
  }, [isConnected, setTrafficLightState]);

  // Load simulation configuration
  const loadConfig = useCallback(async (configPath: string) => {
    try {
      setError(null);
      console.log(`Loading SUMO config: ${configPath}`);
      
      // Simulate config loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('SUMO configuration loaded successfully');
    } catch (err) {
      setError('Failed to load configuration');
      console.error('Config loading error:', err);
    }
  }, []);

  // Export simulation data
  const exportData = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      step: currentStep,
      vehicles: vehicles.length,
      metrics,
      trafficLights: trafficLights.map(tl => ({ id: tl.id, state: tl.state }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sumo_data_step_${currentStep}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentStep, vehicles, metrics, trafficLights]);

  // Auto-run simulation steps
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      simulationStep();
    }, stepLength * 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, simulationStep, stepLength]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, []);

  return {
    // State
    isConnected,
    isRunning,
    currentStep,
    vehicles,
    trafficLights,
    metrics,
    error,
    
    // Actions
    connect,
    disconnect,
    startSimulation,
    stopSimulation,
    simulationStep,
    setTrafficLightState,
    optimizeTrafficLights,
    loadConfig,
    exportData,
    
    // Utilities
    clearError: () => setError(null),
    resetSimulation: () => {
      setCurrentStep(0);
      setVehicles([]);
      setMetrics({
        totalVehicles: 0,
        averageSpeed: 0,
        averageWaitTime: 0,
        throughput: 0,
        queueLength: 0,
        co2Emissions: 0
      });
    }
  };
}

export type { SumoVehicle, SumoTrafficLight, SumoMetrics, SumoConfig };
