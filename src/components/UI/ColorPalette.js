export default function ColorPalette({ season, skinHex }) {
  if (!season) return null;

  return (
    <div className="bg-black/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 text-white shadow-4xl animate-in slide-in-from-bottom-8 duration-1000 w-full max-w-md">
      <div className="flex justify-between items-start mb-10">
        <div>
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Analysis Result</p>
          <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{season.name}</h3>
        </div>
        <div className="flex flex-col items-end">
          <div 
            className="w-12 h-12 rounded-2xl shadow-inner border border-white/10" 
            style={{ backgroundColor: skinHex }}
          />
          <p className="text-[8px] font-black text-zinc-500 mt-2 uppercase tracking-widest">{skinHex}</p>
        </div>
      </div>

      <p className="text-zinc-400 text-xs font-medium mb-8 leading-relaxed">
        {season.description} These colors are mathematically calculated to complement your natural skin tone and undertone.
      </p>

      <div className="space-y-6">
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Power Palette</p>
        <div className="grid grid-cols-6 gap-3">
          {season.colors.map((color, i) => (
            <div key={i} className="group relative cursor-help">
              <div 
                className="aspect-square rounded-xl border border-white/5 transition-transform group-hover:scale-110 duration-300"
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
        <div className="flex -space-x-2">
            {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-zinc-800" />
            ))}
        </div>
        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">Personalized Style Dossier v1.0</p>
      </div>
    </div>
  );
}
