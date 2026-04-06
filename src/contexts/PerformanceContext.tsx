import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { usePerformanceMonitor, PerformanceLevel } from '../hooks/usePerformanceMonitor';

interface PerformanceSettings {
  mode: 'auto' | 'manual';
  manualLevel: PerformanceLevel;
  fps: number;
  currentLevel: PerformanceLevel;
  particleCount: number;
  enableShadows: boolean;
  enableAnimations: boolean;
  setMode: (mode: 'auto' | 'manual') => void;
  setManualLevel: (level: PerformanceLevel) => void;
}

const PerformanceContext = createContext<PerformanceSettings | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'auto' | 'manual'>(() => {
    const saved = localStorage.getItem('performanceMode');
    return (saved as 'auto' | 'manual') || 'auto';
  });

  const [manualLevel, setManualLevel] = useState<PerformanceLevel>(() => {
    const saved = localStorage.getItem('performanceLevel');
    return (saved as PerformanceLevel) || 'high';
  });

  const autoMetrics = usePerformanceMonitor(mode === 'auto');
  const { fps, level, particleCount, enableShadows, enableAnimations } = autoMetrics;

  useEffect(() => {
    localStorage.setItem('performanceMode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('performanceLevel', manualLevel);
  }, [manualLevel]);

  const getManualSettings = useCallback((level: PerformanceLevel) => {
    switch (level) {
      case 'high':
        return {
          particleCount: 30,
          enableShadows: true,
          enableAnimations: true,
        };
      case 'medium':
        return {
          particleCount: 20,
          enableShadows: false,
          enableAnimations: true,
        };
      case 'low':
        return {
          particleCount: 10,
          enableShadows: false,
          enableAnimations: true,
        };
      case 'potato':
        return {
          particleCount: 0,
          enableShadows: false,
          enableAnimations: false,
        };
    }
  }, []);

  const handleSetMode = useCallback((newMode: 'auto' | 'manual') => {
    setMode(newMode);
  }, []);

  const handleSetManualLevel = useCallback((level: PerformanceLevel) => {
    setManualLevel(level);
  }, []);

  const settings = useMemo(() => {
    if (mode === 'auto') {
      return {
        fps,
        currentLevel: level,
        particleCount,
        enableShadows,
        enableAnimations,
      };
    }
    return {
      fps: 0,
      currentLevel: manualLevel,
      ...getManualSettings(manualLevel),
    };
  }, [mode, fps, level, particleCount, enableShadows, enableAnimations, manualLevel, getManualSettings]);

  const value = useMemo(() => ({
    mode,
    manualLevel,
    setMode: handleSetMode,
    setManualLevel: handleSetManualLevel,
    ...settings,
  }), [mode, manualLevel, handleSetMode, handleSetManualLevel, settings]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
}
