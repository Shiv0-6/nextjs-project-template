"use client";

import { useState, useEffect, useCallback } from 'react';

interface DetectedObject {
  type: string;
  count: number;
  confidence: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface YoloConfig {
  modelPath?: string;
  confidenceThreshold?: number;
  iouThreshold?: number;
}

export function useYolo(config: YoloConfig = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const {
    modelPath = '/models/yolo.onnx',
    confidenceThreshold = 0.5,
    iouThreshold = 0.4
  } = config;

  // Initialize YOLO model
  const initializeModel = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate model loading (replace with actual YOLO model loading)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsModelLoaded(true);
      console.log('YOLO model loaded successfully');
    } catch (err) {
      setError('Failed to load YOLO model');
      console.error('YOLO initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [modelPath]);

  // Detect objects in image/video frame
  const detectObjects = useCallback(async (imageData: string | ImageData) => {
    if (!isModelLoaded) {
      setError('Model not loaded');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      // Simulate YOLO detection (replace with actual YOLO inference)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock detection results for demonstration
      const mockDetections: DetectedObject[] = [
        {
          type: 'car',
          count: Math.floor(Math.random() * 15) + 5,
          confidence: 0.85 + Math.random() * 0.1,
          bbox: { x: 100, y: 150, width: 80, height: 60 }
        },
        {
          type: 'truck',
          count: Math.floor(Math.random() * 5) + 1,
          confidence: 0.75 + Math.random() * 0.15,
          bbox: { x: 200, y: 100, width: 120, height: 80 }
        },
        {
          type: 'pedestrian',
          count: Math.floor(Math.random() * 10) + 2,
          confidence: 0.80 + Math.random() * 0.15,
          bbox: { x: 50, y: 200, width: 30, height: 60 }
        },
        {
          type: 'bicycle',
          count: Math.floor(Math.random() * 3),
          confidence: 0.70 + Math.random() * 0.2,
          bbox: { x: 300, y: 180, width: 40, height: 50 }
        }
      ].filter(obj => obj.count > 0);

      setDetectedObjects(mockDetections);
      return mockDetections;
    } catch (err) {
      setError('Detection failed');
      console.error('YOLO detection error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isModelLoaded, confidenceThreshold, iouThreshold]);

  // Start continuous detection from video stream
  const startContinuousDetection = useCallback(async (videoElement?: HTMLVideoElement) => {
    if (!isModelLoaded) {
      await initializeModel();
    }

    // Simulate continuous detection
    const interval = setInterval(async () => {
      if (videoElement) {
        // In real implementation, capture frame from video element
        await detectObjects('video_frame');
      }
    }, 1000); // Detect every second

    return () => clearInterval(interval);
  }, [isModelLoaded, initializeModel, detectObjects]);

  // Calculate traffic density based on detected objects
  const calculateTrafficDensity = useCallback(() => {
    const totalVehicles = detectedObjects
      .filter(obj => ['car', 'truck', 'bus', 'motorcycle'].includes(obj.type))
      .reduce((sum, obj) => sum + obj.count, 0);
    
    if (totalVehicles === 0) return 'low';
    if (totalVehicles < 10) return 'medium';
    return 'high';
  }, [detectedObjects]);

  // Get traffic recommendations based on detection
  const getTrafficRecommendations = useCallback(() => {
    const density = calculateTrafficDensity();
    const pedestrians = detectedObjects.find(obj => obj.type === 'pedestrian')?.count || 0;
    
    const recommendations = [];
    
    if (density === 'high') {
      recommendations.push('Consider extending green light duration');
      recommendations.push('Monitor for potential congestion');
    }
    
    if (pedestrians > 5) {
      recommendations.push('Activate pedestrian crossing signals');
      recommendations.push('Reduce vehicle green light time');
    }
    
    if (detectedObjects.find(obj => obj.type === 'emergency_vehicle')) {
      recommendations.push('PRIORITY: Clear path for emergency vehicle');
    }
    
    return recommendations;
  }, [detectedObjects, calculateTrafficDensity]);

  useEffect(() => {
    // Auto-initialize model on hook mount
    initializeModel();
  }, [initializeModel]);

  return {
    // State
    isLoading,
    detectedObjects,
    error,
    isModelLoaded,
    
    // Actions
    initializeModel,
    detectObjects,
    startContinuousDetection,
    
    // Computed values
    trafficDensity: calculateTrafficDensity(),
    recommendations: getTrafficRecommendations(),
    
    // Utilities
    clearDetections: () => setDetectedObjects([]),
    clearError: () => setError(null)
  };
}

export type { DetectedObject, YoloConfig };
