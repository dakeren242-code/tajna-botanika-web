import { memo } from 'react';

function GlobalBackground() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-purple-950 via-slate-900 to-green-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,146,60,0.12),transparent_50%)]" />
      </div>
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02] pointer-events-none" />
    </>
  );
}

export default memo(GlobalBackground);
