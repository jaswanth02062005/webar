export default function MeasurementStats({ measurements }) {
  if (!measurements) return null;

  const stats = [
    { label: "Chest", value: measurements.chest, unit: "cm" },
    { label: "Waist", value: measurements.waist, unit: "cm" },
    { label: "Hips", value: measurements.hips, unit: "cm" },
    { label: "Shoulders", value: measurements.shoulders, unit: "cm" },
  ];

  return (
    <div className="bg-black/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 text-white shadow-4xl animate-in slide-in-from-right-8 duration-1000 w-full max-w-sm">
      <div className="mb-10">
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Biometric Scan</p>
        <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Body Profile</h3>
      </div>

      <div className="space-y-8">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-end justify-between group">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black italic tracking-tighter tabular-nums leading-none">
                  {stat.value}
                </span>
                <span className="text-sm font-bold text-zinc-600 uppercase italic">{stat.unit}</span>
              </div>
            </div>
            
            {/* Visual Indicator */}
            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative mb-2">
                <div 
                    className="absolute inset-0 bg-white origin-left transition-transform duration-1000 delay-300"
                    style={{ transform: `scaleX(${stat.value / 150})` }}
                />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">High Precision Signal</p>
        </div>
      </div>
    </div>
  );
}
