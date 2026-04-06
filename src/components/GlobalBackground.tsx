export default function GlobalBackground() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-purple-950 via-slate-900 to-green-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,146,60,0.12),transparent_50%)]" />
        <div className="absolute inset-0 animate-global-color-shift" />
      </div>
      <div
        className="fixed inset-0 z-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02] pointer-events-none"
        style={{ backdropFilter: 'blur(0.5px)' }}
      />
      <style>{`
        @keyframes global-color-shift {
          0%, 100% {
            background: radial-gradient(ellipse at top left, rgba(168,85,247,0.1), transparent 50%);
          }
          25% {
            background: radial-gradient(ellipse at bottom, rgba(34,197,94,0.12), transparent 50%);
          }
          50% {
            background: radial-gradient(ellipse at top right, rgba(251,146,60,0.12), transparent 50%);
          }
          75% {
            background: radial-gradient(ellipse at bottom left, rgba(59,130,246,0.1), transparent 50%);
          }
        }
        .animate-global-color-shift {
          animation: global-color-shift 20s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
