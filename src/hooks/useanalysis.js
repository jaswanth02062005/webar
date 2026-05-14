import { useState, useCallback } from "react";

export function useAnalysis() {
  const [analysis, setAnalysis] = useState(null);

  const calculateMeasurements = useCallback((landmarks, userHeightCm) => {
    if (!landmarks || landmarks.length < 33) return null;

    const nose = landmarks[0];
    const leftFoot = landmarks[31];
    const rightFoot = landmarks[32];
    const feetY = (leftFoot.y + rightFoot.y) / 2;
    const visibleHeightPixels = Math.abs(feetY - nose.y);
    const totalBodyPixels = visibleHeightPixels * 1.15;
    const pixelPerCm = totalBodyPixels / userHeightCm;

    const getDist = (l1, l2) => {
      const dx = (l1.x - l2.x);
      const dy = (l1.y - l2.y);
      return Math.sqrt(dx*dx + dy*dy) / pixelPerCm;
    };

    const isFullBodyVisible = 
      nose.visibility > 0.5 && 
      leftFoot.visibility > 0.5 && 
      rightFoot.visibility > 0.5 &&
      leftFoot.y < 1.0 && rightFoot.y < 1.0;

    const shoulderWidth = getDist(landmarks[11], landmarks[12]);
    const hipWidth = getDist(landmarks[23], landmarks[24]);
    
    const chestWidth = shoulderWidth * 0.98; 
    const chestDepth = chestWidth / 1.4;
    const chestCirc = Math.PI * (3 * (chestWidth + chestDepth) / 2 - Math.sqrt((3 * chestWidth / 2 + chestDepth / 2) * (chestWidth / 2 + 3 * chestDepth / 2)));

    const waistWidth = (shoulderWidth + hipWidth) / 2 * 0.88;
    const waistDepth = waistWidth / 1.35;
    const waistCirc = Math.PI * (3 * (waistWidth + waistDepth) / 2 - Math.sqrt((3 * waistWidth / 2 + waistDepth / 2) * (waistWidth / 2 + 3 * waistDepth / 2)));

    const hipsDepth = hipWidth / 1.25;
    const hipCirc = Math.PI * (3 * (hipWidth + hipsDepth) / 2 - Math.sqrt((3 * hipWidth / 2 + hipsDepth / 2) * (hipWidth / 2 + 3 * hipCirc / 2)));

    return {
      chest: Math.round(chestCirc),
      waist: Math.round(waistCirc),
      hips: Math.round(hipCirc),
      shoulders: Math.round(shoulderWidth),
      pixelPerCm,
      isFullBodyVisible
    };
  }, []);

  const generatePalette = (r, g, b) => {
    // Convert RGB to HSL for easier mathematical manipulation
    const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: h = (bNorm - rNorm) / d + 2; break;
        case bNorm: h = (rNorm - gNorm) / d + 4; break;
      }
      h /= 6;
    }

    const hslToHex = (h, s, l) => {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const f = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const r = Math.round(f(p, q, h + 1/3) * 255);
      const g = Math.round(f(p, q, h) * 255);
      const b = Math.round(f(p, q, h - 1/3) * 255);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    return [
      hslToHex(h, s, l * 0.8), // Shade
      hslToHex((h + 0.5) % 1, s, l), // Complementary
      hslToHex((h + 0.08) % 1, s * 0.8, l * 1.2), // Analogous 1
      hslToHex((h - 0.08) % 1, s * 0.8, l * 1.2), // Analogous 2
      hslToHex(h, s * 0.5, l * 1.5), // Tint
      hslToHex((h + 0.5) % 1, s * 0.5, l * 0.5), // Muted Complementary
    ];
  };

  const detectSkinTone = useCallback((videoElement, landmarks) => {
    if (!videoElement || !landmarks || !landmarks[0]) return null;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoElement, 0, 0);

      const p = landmarks[0];
      const x = p.x * canvas.width;
      const y = p.y * canvas.height;
      const data = ctx.getImageData(Math.floor(x - 5), Math.floor(y - 5), 10, 10).data;
      
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i+1]; b += data[i+2];
      }
      r /= (data.length / 4); g /= (data.length / 4); b /= (data.length / 4);

      const hex = `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
      
      return {
        hex,
        palette: generatePalette(r, g, b),
        label: r > 180 ? "Light Complexion" : r > 130 ? "Medium Complexion" : "Deep Complexion"
      };
    } catch (e) {
      return null;
    }
  }, []);

  return { calculateMeasurements, detectSkinTone, analysis, setAnalysis };
}
