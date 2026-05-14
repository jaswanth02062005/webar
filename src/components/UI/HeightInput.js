import { useState } from "react";

export default function HeightInput({ onConfirm }) {
  const [height, setHeight] = useState(175);

  return (
    <div className="flex flex-col items-center gap-10 animate-in zoom-in-95 duration-1000">
      <div className="space-y-4 text-center">
        <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">
          Step 01 // Calibration
        </div>
        <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
          What is your <span className="text-zinc-500">height?</span>
        </h2>
        <p className="text-zinc-500 text-[10px] font-medium tracking-widest uppercase">
          Precision requires a baseline measurement
        </p>
      </div>

      <div className="relative flex flex-col items-center">
        <div className="text-[120px] font-black italic tracking-tighter text-white leading-none tabular-nums">
          {height}
          <span className="text-3xl text-zinc-600 ml-2 not-italic">CM</span>
        </div>
        
        <input 
          type="range" 
          min="120" 
          max="220" 
          value={height} 
          onChange={(e) => setHeight(parseInt(e.target.value))}
          className="w-80 h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-white mt-8"
        />
        
        <div className="flex justify-between w-80 mt-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
          <span>120cm</span>
          <span>220cm</span>
        </div>
      </div>

      <button
        onClick={() => onConfirm(height)}
        className="group relative px-12 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.3em] text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
      >
        <span className="relative z-10">Initialize Scan</span>
        <div className="absolute inset-0 bg-zinc-200 rounded-2xl scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
      </button>

      <style jsx>{`
        input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: 4px solid #18181b;
          box-shadow: 0 0 20px rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}
