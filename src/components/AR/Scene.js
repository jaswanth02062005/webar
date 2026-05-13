import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import ModelCanvas from "./modelcanvas";

export default function Scene({ imageUrl, landmarksRef, measurements }) {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          {imageUrl && (
            <ModelCanvas 
              imageUrl={imageUrl} 
              landmarksRef={landmarksRef} 
              measurements={measurements}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
