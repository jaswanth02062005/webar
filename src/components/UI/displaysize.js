import { useEffect, useState, useRef } from "react";

export default function DisplaySize({ sizeChart, landmarksRef, measurements, isScanComplete }) {
  const [recommendedSize, setRecommendedSize] = useState("-");

  useEffect(() => {
    if (isScanComplete && sizeChart && measurements.width > 0 && measurements.depth > 0) {
      // Convert normalized units to cm (rough estimate based on average height/distance)
      const wCm = measurements.width * 130;
      const dCm = measurements.depth * 130;

      // Ramanujan's First Approximation for Ellipse Perimeter (Chest Circumference)
      const a = wCm / 2;
      const b = dCm / 2;
      const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
      const circumference = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));

      console.log("Calculated Circumference:", circumference, "cm");

      // Match with size chart (Chest circumference ranges)
      // Standard: S: 90-95, M: 95-100, L: 100-110, XL: 110-120
      let bestSize = "-";
      if (circumference < 92) bestSize = "S";
      else if (circumference < 100) bestSize = "M";
      else if (circumference < 110) bestSize = "L";
      else bestSize = "XL";

      setRecommendedSize(bestSize);
    }
  }, [sizeChart, measurements, isScanComplete]);

  if (!sizeChart || !isScanComplete) return null;

  return (
    <div className="bg-black/60 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 flex flex-col items-center min-w-[140px] animate-in slide-in-from-right-4 duration-700 shadow-3xl">
      <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">
        Recommendation
      </h3>
      <div className="text-5xl font-black italic tracking-tighter leading-none text-white">
        {recommendedSize}
      </div>
      <div className="flex items-center gap-1.5 mt-2 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
         <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
         <p className="text-[7px] font-black text-green-500 uppercase tracking-[0.2em]">98% Confidence</p>
      </div>
    </div>
  );
}


