import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useLoyalty, SPIN_PRIZES } from '../contexts/LoyaltyContext';

interface Props {
  onClose: () => void;
}

export default function SpinWheel({ onClose }: Props) {
  const { spinWheel, points } = useLoyalty();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<typeof SPIN_PRIZES[0] | null>(null);
  const [error, setError] = useState('');

  const segmentAngle = 360 / SPIN_PRIZES.length;
  const spinCost = 300;
  const canSpin = (points?.current_points ?? 0) >= spinCost && !spinning;

  const handleSpin = async () => {
    if (!canSpin) return;
    setSpinning(true);
    setError('');
    setPrize(null);

    const result = await spinWheel();

    if (!result.success) {
      setError(result.error || 'Chyba');
      setSpinning(false);
      return;
    }

    const idx = result.prizeIndex ?? 0;
    // Calculate rotation: 5 full spins + land on prize segment
    const targetAngle = 360 * 5 + (360 - idx * segmentAngle - segmentAngle / 2);
    setRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setPrize(SPIN_PRIZES[idx]);
      setSpinning(false);
    }, 4200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative bg-gradient-to-b from-zinc-900 to-black border border-purple-500/20 rounded-3xl p-6 md:p-8 max-w-md w-full"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 0 80px rgba(168,85,247,0.1)' }}>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-black text-white mb-1">Kolo \u0161t\u011bst\u00ed</h3>
          <p className="text-sm text-gray-500">Zato\u010d a vyhraj! Stoj\u00ed {spinCost} bod\u016f.</p>
        </div>

        {/* Wheel */}
        <div className="relative w-64 h-64 mx-auto mb-6">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20 w-0 h-0"
            style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '18px solid #f59e0b' }} />

          {/* Wheel */}
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-purple-500/30 relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {SPIN_PRIZES.map((p, i) => {
                const startAngle = i * segmentAngle;
                const endAngle = (i + 1) * segmentAngle;
                const startRad = (startAngle - 90) * Math.PI / 180;
                const endRad = (endAngle - 90) * Math.PI / 180;
                const x1 = 100 + 100 * Math.cos(startRad);
                const y1 = 100 + 100 * Math.sin(startRad);
                const x2 = 100 + 100 * Math.cos(endRad);
                const y2 = 100 + 100 * Math.sin(endRad);
                const largeArc = segmentAngle > 180 ? 1 : 0;
                const midAngle = ((startAngle + endAngle) / 2 - 90) * Math.PI / 180;
                const tx = 100 + 60 * Math.cos(midAngle);
                const ty = 100 + 60 * Math.sin(midAngle);
                const textRot = (startAngle + endAngle) / 2;

                return (
                  <g key={i}>
                    <path
                      d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill={p.color}
                      opacity={0.85}
                      stroke="rgba(0,0,0,0.3)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={tx} y={ty}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="7"
                      fontWeight="bold"
                      transform={`rotate(${textRot}, ${tx}, ${ty})`}
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-black border-2 border-purple-400/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Result */}
        {prize && (
          <div className="text-center mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
            style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <p className="text-yellow-400 text-sm font-bold mb-1">V\u00fdhra!</p>
            <p className="text-white text-lg font-black">{prize.label}</p>
          </div>
        )}

        {error && (
          <div className="text-center mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Spin button */}
        <button
          onClick={handleSpin}
          disabled={!canSpin}
          className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${
            canSpin
              ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-[1.02]'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {spinning ? 'To\u010d\u00ed se...' : prize ? 'Zato\u010dit znovu' : `Zato\u010dit (${spinCost} bod\u016f)`}
        </button>

        <p className="text-center text-[10px] text-gray-600 mt-3">Max 3 to\u010den\u00ed denn\u011b</p>

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
}
