import { useEffect, useRef } from "react";

export default function LiveHUD({ landmarks, measurements }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !landmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Set canvas size to match parent
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawLine = (p1, p2, color = "rgba(255, 255, 255, 0.4)", width = 2) => {
      ctx.beginPath();
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    };

    const drawLabel = (p, text, subtext) => {
      const x = p.x * canvas.width;
      const y = p.y * canvas.height;

      // Label Box
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.font = "bold 10px Inter, sans-serif";
      const metrics = ctx.measureText(text);
      const padding = 8;
      
      ctx.beginPath();
      ctx.roundRect(x + 20, y - 15, metrics.width + padding * 2, 30, 8);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.stroke();

      // Text
      ctx.fillStyle = "white";
      ctx.fillText(text, x + 20 + padding, y);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "black 7px Inter, sans-serif";
      ctx.fillText(subtext, x + 20 + padding, y + 10);
      
      // Connector Dot
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.shadowColor = "white";
    };

    // Draw Skeleton Lines
    if (landmarks[11] && landmarks[12]) drawLine(landmarks[11], landmarks[12]); // Shoulders
    if (landmarks[23] && landmarks[24]) drawLine(landmarks[23], landmarks[24]); // Hips
    if (landmarks[11] && landmarks[23]) drawLine(landmarks[11], landmarks[23]); // Left Torso
    if (landmarks[12] && landmarks[24]) drawLine(landmarks[12], landmarks[24]); // Right Torso

    // Draw Measurement Labels if they exist
    if (measurements) {
      if (landmarks[11]) drawLabel(landmarks[11], `Chest: ${measurements.chest}cm`, "Estimated Circumference");
      if (landmarks[23]) drawLabel(landmarks[23], `Waist: ${measurements.waist}cm`, "Calculated Core");
      if (landmarks[24]) drawLabel(landmarks[24], `Hips: ${measurements.hips}cm`, "Pelvic Width");
    }

  }, [landmarks, measurements]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full z-[3] pointer-events-none scale-x-[-1]" 
    />
  );
}
