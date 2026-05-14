export default function ColorPalette({ skinData }) {
  if (!skinData) return null;

  return (
    <div className="bg-black/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 text-white shadow-4xl animate-in slide-in-from-bottom-8 duration-1000 w-full max-w-md">
      <div className="flex justify-between items-start mb-10">
        <div>
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Biometric Analysis</p>
          <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{skinData.label}</h3>
        </div>
        <div className="flex flex-col items-end">
          <div 
            className="w-12 h-12 rounded-2xl shadow-inner border border-white/10 transition-colors duration-500" 
            style={{ backgroundColor: skinData.hex }}
          />
          <p className="text-[8px] font-black text-zinc-500 mt-2 uppercase tracking-widest">{skinData.hex}</p>
        </div>
      </div>

      <p className="text-zinc-400 text-xs font-medium mb-8 leading-relaxed">
        This palette is mathematically generated to harmonize with your specific skin tone. These shades are derived from complementary, analogous, and monochromatic color theory.
      </p>

      <div className="space-y-6">
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Style Harmonies</p>
        <div className="grid grid-cols-6 gap-3">
          {skinData.palette.map((color, i) => (
            <div key={i} className="group relative cursor-help">
              <div 
                className="aspect-square rounded-xl border border-white/5 transition-all group-hover:scale-110 group-hover:rotate-6 duration-300 shadow-lg"
                style={{ backgroundColor: color }}
              />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {color}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">Generative Style Dossier v2.0</p>
        </div>
      </div>
    </div>
  );
}
