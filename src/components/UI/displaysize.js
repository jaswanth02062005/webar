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
    <div className="bg-white text-black p-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center min-w-[140px] animate-in zoom-in-95 duration-500">
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">
        Your Fit
      </h3>
      <div className="text-6xl font-black italic tracking-tighter leading-none">
        {recommendedSize}
      </div>
      <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">360° Volumetric</p>
    </div>
  );
}
