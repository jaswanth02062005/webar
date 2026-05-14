import { useState, useCallback } from "react";

const SEASONAL_PALETTES = {
  WINTER: {
    name: "True Winter",
    colors: ["#1D1D1D", "#FFFFFF", "#002366", "#C70039", "#800080", "#FF007F"],
    description: "High contrast, bold, and vivid cool tones."
  },
  SUMMER: {
    name: "Cool Summer",
    colors: ["#E5E4E2", "#93A8AC", "#708090", "#D8BFD8", "#B0C4DE", "#FFC0CB"],
    description: "Soft, muted, and gentle cool tones."
  },
  AUTUMN: {
    name: "Warm Autumn",
    colors: ["#800020", "#D2691E", "#556B2F", "#DAA520", "#A0522D", "#F4A460"],
    description: "Rich, earthy, and deep warm tones."
  },
  SPRING: {
    name: "Clear Spring",
    colors: ["#FFD700", "#FF7F50", "#40E0D0", "#98FB98", "#FFB6C1", "#FA8072"],
    description: "Bright, fresh, and light warm tones."
  }
};

export function useAnalysis() {
  const [analysis, setAnalysis] = useState(null);

  const calculateMeasurements = useCallback((landmarks, userHeightCm) => {
    if (!landmarks) return null;

    // 1. Calculate Pixel-to-CM Ratio
    // Top of head is roughly 10% above the nose (0) relative to total height
    const nose = landmarks[0];
    const leftFoot = landmarks[31];
    const rightFoot = landmarks[32];
    const feetY = (leftFoot.y + rightFoot.y) / 2;
    const pixelHeight = Math.abs(feetY - nose.y) / 0.9; // Adjust for head height
    const pixelPerCm = pixelHeight / userHeightCm;

    // 2. Measure Key Points
    const getDist = (l1, l2) => {
      const dx = (l1.x - l2.x);
      const dy = (l1.y - l2.y);
      return Math.sqrt(dx*dx + dy*dy) / pixelPerCm;
    };

    const shoulderWidth = getDist(landmarks[11], landmarks[12]);
    const hipWidth = getDist(landmarks[23], landmarks[24]);
    
    // Approximations for circumference (assuming elliptical cross-section)
    // Depth is usually ~70% of width for average builds
    const chestWidth = shoulderWidth * 0.95; 
    const chestDepth = chestWidth * 0.7;
    const chestCirc = Math.PI * (3 * (chestWidth + chestDepth) / 2 - Math.sqrt((3 * chestWidth / 2 + chestDepth / 2) * (chestWidth / 2 + 3 * chestDepth / 2)));

    const waistWidth = (shoulderWidth + hipWidth) / 2 * 0.85;
    const waistDepth = waistWidth * 0.75;
    const waistCirc = Math.PI * (3 * (waistWidth + waistDepth) / 2 - Math.sqrt((3 * waistWidth / 2 + waistDepth / 2) * (waistWidth / 2 + 3 * waistDepth / 2)));

    const hipsDepth = hipWidth * 0.8;
    const hipCirc = Math.PI * (3 * (hipWidth + hipsDepth) / 2 - Math.sqrt((3 * hipWidth / 2 + hipsDepth / 2) * (hipWidth / 2 + 3 * hipsDepth / 2)));

    return {
      chest: Math.round(chestCirc),
      waist: Math.round(waistCirc),
      hips: Math.round(hipCirc),
      shoulders: Math.round(shoulderWidth),
    };
  }, []);

  const detectSkinTone = useCallback((videoElement, landmarks) => {
    if (!videoElement || !landmarks) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoElement, 0, 0);

    // Sample from nose area (landmark 0)
    const nose = landmarks[0];
    const x = nose.x * canvas.width;
    const y = nose.y * canvas.height;
    
    const imageData = ctx.getImageData(x - 5, y - 5, 10, 10).data;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      r += imageData[i];
      g += imageData[i+1];
      b += imageData[i+2];
    }
    const count = imageData.length / 4;
    r /= count; g /= count; b /= count;

    // Convert to HSV for undertone analysis
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const v = max / 255;
    const s = max === 0 ? 0 : (max - min) / max;
    
    // Determine Season
    // Rough logic: 
    // Warm if R > B by a significant margin
    // Winter/Summer (Cool) vs Spring/Autumn (Warm)
    const isWarm = r > b * 1.1;
    const isBright = v > 0.6;

    let season;
    if (isWarm) {
      season = isBright ? SEASONAL_PALETTES.SPRING : SEASONAL_PALETTES.AUTUMN;
    } else {
      season = isBright ? SEASONAL_PALETTES.WINTER : SEASONAL_PALETTES.SUMMER;
    }

    return {
      hex: `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`,
      season
    };
  }, []);

  return { calculateMeasurements, detectSkinTone, analysis, setAnalysis };
}
