import { useState, useEffect } from 'react';
import { usePerformance } from '../contexts/PerformanceContext';
import { X } from 'lucide-react';

export default function PerformanceDebug() {
  const { mode, fps, currentLevel, particleCount, enableShadows, enableAnimations, enableCursor } = usePerformance();
  const [visible, setVisible] = useState(() => {
    const saved = localStorage.getItem('showPerformanceDebug');
    return saved === 'true';
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        setVisible(prev => {
          const newValue = !prev;
          localStorage.setItem('showPerformanceDebug', String(newValue));
          return newValue;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!visible) {
    return (
      <button
        onClick={() => {
          setVisible(true);
          localStorage.setItem('showPerformanceDebug', 'true');
        }}
        className="fixed bottom-4 left-4 z-[9999] bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-lg px-3 py-2 text-cyan-400 hover:text-cyan-300 transition-all text-xs font-mono"
        title="Stiskněte P nebo klikněte pro zobrazení"
      >
        FPS
      </button>
    );
  }

  const levelColors = {
    high: 'from-green-500 to-emerald-500',
    medium: 'from-yellow-500 to-orange-500',
    low: 'from-orange-500 to-red-500',
    potato: 'from-red-500 to-red-700',
  };

  const levelLabels = {
    high: 'Vysoký',
    medium: 'Střední',
    low: 'Nízký',
    potato: 'Ultra nízký',
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 text-white text-xs font-mono shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse bg-gradient-to-r ${levelColors[currentLevel]}`} />
          <div className="font-bold text-cyan-400">Performance Monitor</div>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            localStorage.setItem('showPerformanceDebug', 'false');
          }}
          className="text-gray-400 hover:text-white transition-colors"
          title="Zavřít (nebo stiskněte P)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Režim:</span>
          <span className="text-white font-bold">{mode === 'auto' ? 'Automaticky' : 'Ručně'}</span>
        </div>

        {mode === 'auto' && (
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">FPS:</span>
            <span className={`font-bold bg-gradient-to-r ${levelColors[currentLevel]} bg-clip-text text-transparent`}>
              {fps}
            </span>
          </div>
        )}

        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Úroveň:</span>
          <span className={`font-bold bg-gradient-to-r ${levelColors[currentLevel]} bg-clip-text text-transparent`}>
            {levelLabels[currentLevel]}
          </span>
        </div>

        <div className="border-t border-cyan-500/20 my-2 pt-2 space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Částice:</span>
            <span className={particleCount > 0 ? 'text-green-400' : 'text-red-400'}>
              {particleCount}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Stíny:</span>
            <span className={enableShadows ? 'text-green-400' : 'text-red-400'}>
              {enableShadows ? 'Zapnuto' : 'Vypnuto'}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Animace:</span>
            <span className={enableAnimations ? 'text-green-400' : 'text-red-400'}>
              {enableAnimations ? 'Zapnuto' : 'Vypnuto'}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Kurzor:</span>
            <span className={enableCursor ? 'text-green-400' : 'text-red-400'}>
              {enableCursor ? 'Zapnuto' : 'Vypnuto'}
            </span>
          </div>
        </div>

        <div className="border-t border-cyan-500/20 mt-2 pt-2">
          <div className="text-gray-500 text-[10px]">
            Stiskněte [P] pro skrytí/zobrazení
          </div>
        </div>
      </div>
    </div>
  );
}
