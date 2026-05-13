import { useEffect, useRef, useState } from "react";

export function usePose(videoRef) {
  const landmarksRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !videoRef.current) return;

    let camera;
    let pose;
    let timeoutId;
    let isMounted = true;

    const initMediaPipe = () => {
      if (!isMounted) return;
      // Wait for the CDN scripts to evaluate
      if (window.Pose && window.Camera) {
        pose = new window.Pose({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1, // High precision
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
          if (results.poseLandmarks) {
            landmarksRef.current = results.poseLandmarks;
          }
        });

        camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await pose.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720,
        });

        camera.start().then(() => {
          if (isMounted) setIsReady(true);
        });
      } else {
        // Poll every 100ms until global variables are present
        timeoutId = setTimeout(initMediaPipe, 100);
      }
    };

    initMediaPipe();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (camera) camera.stop();
      if (pose) pose.close();
    };
  }, [videoRef]);

  return { landmarksRef, isReady };
}
