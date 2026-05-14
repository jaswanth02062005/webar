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
    if (!landmarks || landmarks.length < 33) return null;

    // 1. Refined Pixel-to-CM Ratio
    // Use Nose (0) to Foot Index (31/32) as the primary height reference.
    // In Pose detection, the distance from Nose to Top-of-Head is roughly 1/8th of total height.
    const nose = landmarks[0];
    const leftFoot = landmarks[31];
    const rightFoot = landmarks[32];
    
    // Average feet position
    const feetY = (leftFoot.y + rightFoot.y) / 2;
    const feetX = (leftFoot.x + rightFoot.x) / 2;
    
    // Total visible vertical pixels for the body (Nose to Feet)
    const visibleHeightPixels = Math.abs(feetY - nose.y);
    
    // Add 15% to account for head height above the nose
    const totalBodyPixels = visibleHeightPixels * 1.15;
    const pixelPerCm = totalBodyPixels / userHeightCm;

    // 2. Measure Key Points
    const getDist = (l1, l2) => {
      const dx = (l1.x - l2.x);
      const dy = (l1.y - l2.y);
      return Math.sqrt(dx*dx + dy*dy) / pixelPerCm;
    };

    const shoulderWidth = getDist(landmarks[11], landmarks[12]);
    const hipWidth = getDist(landmarks[23], landmarks[24]);
    
    // Better Circumference Approximation
    // Most humans have a width-to-depth ratio of ~1.4 for the chest and ~1.3 for the waist.
    const chestWidth = shoulderWidth * 0.98; 
    const chestDepth = chestWidth / 1.4;
    const chestCirc = Math.PI * (3 * (chestWidth + chestDepth) / 2 - Math.sqrt((3 * chestWidth / 2 + chestDepth / 2) * (chestWidth / 2 + 3 * chestDepth / 2)));

    const waistWidth = (shoulderWidth + hipWidth) / 2 * 0.88;
    const waistDepth = waistWidth / 1.35;
    const waistCirc = Math.PI * (3 * (waistWidth + waistDepth) / 2 - Math.sqrt((3 * waistWidth / 2 + waistDepth / 2) * (waistWidth / 2 + 3 * waistDepth / 2)));

    const hipsDepth = hipWidth / 1.25;
    const hipCirc = Math.PI * (3 * (hipWidth + hipsDepth) / 2 - Math.sqrt((3 * hipWidth / 2 + hipsDepth / 2) * (hipWidth / 2 + 3 * hipsDepth / 2)));

    return {
      chest: Math.round(chestCirc),
      waist: Math.round(waistCirc),
      hips: Math.round(hipCirc),
      shoulders: Math.round(shoulderWidth),
      pixelPerCm // Export for HUD drawing
    };
  }, []);

  const detectSkinTone = useCallback((videoElement, landmarks) => {
    if (!videoElement || !landmarks || !landmarks[0]) return null;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext("2d");
      
      // Mirror the draw to match video feed if necessary, but here we just need pixel data
      ctx.drawImage(videoElement, 0, 0);

      // Sample from multiple points for better accuracy (Nose, Forehead, Shoulders)
      const points = [
        landmarks[0], // Nose
        { x: landmarks[0].x, y: landmarks[0].y - 0.05 }, // Forehead (approx)
      ];

      let r = 0, g = 0, b = 0, totalPixels = 0;

      points.forEach(p => {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) {
            const data = ctx.getImageData(Math.floor(x - 5), Math.floor(y - 5), 10, 10).data;
            for (let i = 0; i < data.length; i += 4) {
              r += data[i];
              g += data[i+1];
              b += data[i+2];
              totalPixels++;
            }
        }
      });

      if (totalPixels === 0) return null;

      r /= totalPixels; g /= totalPixels; b /= totalPixels;

      // Convert to HSV for undertone analysis
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const v = max / 255;
      
      // Check for Warm/Cool using a simple ratio
      const isWarm = r > b * 1.05;
      const isBright = v > 0.65;

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
    } catch (e) {
      console.error("Skin detection error:", e);
      return null;
    }
  }, []);

  return { calculateMeasurements, detectSkinTone, analysis, setAnalysis };
}
