import { useEffect, useRef, Suspense, useState } from "react";
import Head from "next/head";
import BodyTracker from "../components/AR/bodytracker";
import Scene from "../components/AR/Scene";
import Input from "../components/UI/input";
import DisplaySize from "../components/UI/displaysize";
import { usePose } from "../hooks/usepose";
import { useScraper } from "../hooks/usescraper";
import { useRouter } from "next/router";

const SCAN_STATES = {
  CALIBRATING: "CALIBRATING",
  READY_FRONT: "READY_FRONT",
  SCANNING_FRONT: "SCANNING_FRONT",
  READY_SIDE: "READY_SIDE",
  SCANNING_SIDE: "SCANNING_SIDE",
  COMPLETE: "COMPLETE",
};

export default function TryOn() {
  const videoRef = useRef(null);
  const router = useRouter();
  const { productUrl } = router.query;
  const [scanState, setScanState] = useState(SCAN_STATES.CALIBRATING);
  const [showDetails, setShowDetails] = useState(false);
  const [measurements, setMeasurements] = useState({ width: 0, depth: 0 });

  // Initialize Hooks
  const { landmarksRef, isReady } = usePose(videoRef);
  const { scrape, data, loading, error } = useScraper();

  useEffect(() => {
    if (productUrl) {
      scrape(productUrl);
    }
  }, [productUrl]);

  useEffect(() => {
    if (isReady && scanState === SCAN_STATES.CALIBRATING) {
      const checkCalibration = setInterval(() => {
        if (landmarksRef.current && landmarksRef.current[11]?.visibility > 0.8) {
          setScanState(SCAN_STATES.READY_FRONT);
          clearInterval(checkCalibration);
        }
      }, 500);
      return () => clearInterval(checkCalibration);
    }
  }, [isReady, scanState, landmarksRef]);

  const captureMeasurement = (type) => {
    if (!landmarksRef.current) return;
    const ls = landmarksRef.current[11];
    const rs = landmarksRef.current[12];
    const dist = Math.sqrt(Math.pow(ls.x - rs.x, 2) + Math.pow(ls.y - rs.y, 2));

    if (type === "width") {
      setMeasurements((m) => ({ ...m, width: dist }));
      setScanState(SCAN_STATES.READY_SIDE);
    } else {
      setMeasurements((m) => ({ ...m, depth: dist }));
      setScanState(SCAN_STATES.COMPLETE);
    }
  };

  const handleUrlSubmit = (url) => scrape(url);

  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const link = document.createElement("a");
    link.download = "ar-fit-snapshot.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-sans selection:bg-white selection:text-black">
      <Head>
        <title>AR Dressing Room | Perfect Fit 360</title>
      </Head>

      <div className="absolute inset-0 z-[1]">
        <BodyTracker ref={videoRef} />
      </div>

      {/* Engine Loading Overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-xl font-bold tracking-tight text-white uppercase">Initializing Engine</p>
          </div>
        </div>
      )}

      {/* Guided Scanning UI */}
      {isReady && scanState !== SCAN_STATES.COMPLETE && (
        <div className="absolute inset-0 z-40 bg-black/30 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
          <div className="text-white flex flex-col items-center gap-6 max-w-md text-center p-8 pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-[3rem]">
            {scanState === SCAN_STATES.CALIBRATING && (
              <div className="space-y-4">
                <div className="w-16 h-16 border-2 border-white/20 rounded-full animate-pulse mx-auto flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/40 rounded-full"></div>
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Initializing Scan</h2>
                <p className="text-sm text-zinc-400">Step 6 feet back until the camera detects your torso.</p>
              </div>
            )}

            {scanState === SCAN_STATES.READY_FRONT && (
              <div className="space-y-6">
                <div className="w-32 h-48 border-2 border-dashed border-white/30 rounded-full mx-auto relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Scan Front</h2>
                  <p className="text-sm text-zinc-400">Face the camera squarely with arms slightly out.</p>
                </div>
                <button
                  onClick={() => captureMeasurement("width")}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Capture Front
                </button>
              </div>
            )}

            {scanState === SCAN_STATES.READY_SIDE && (
              <div className="space-y-6">
                <div className="w-16 h-48 border-2 border-dashed border-white/30 rounded-full mx-auto relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Scan Side</h2>
                  <p className="text-sm text-zinc-400">Turn 90 degrees to show your side profile.</p>
                </div>
                <button
                  onClick={() => captureMeasurement("depth")}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Capture Side
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AR Scene Layer */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <Suspense fallback={null}>
          {isReady && scanState === SCAN_STATES.COMPLETE && (
            <Scene imageUrl={data?.imageUrl} landmarksRef={landmarksRef} measurements={measurements} />
          )}
        </Suspense>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-[10] pointer-events-none flex flex-col justify-between p-6 md:p-10">
        <header className="pointer-events-auto flex justify-center w-full">
          <div className="max-w-2xl w-full">
            <Input onUrlSubmit={handleUrlSubmit} />
          </div>
        </header>

        <div className="flex justify-between items-end pointer-events-auto w-full">
          <div className="flex flex-col gap-4 max-w-sm">
            {loading && (
              <div className="bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm font-bold text-white uppercase tracking-wider">Analyzing...</span>
              </div>
            )}

            {data && !loading && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-xl p-5 rounded-3xl border border-white/10 text-white shadow-2xl transition-all text-left w-full"
                >
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-1">Brand</p>
                  <p className="text-2xl font-bold tracking-tighter leading-none mb-1">{data.brandName}</p>
                  <p className="text-xs text-zinc-400 line-clamp-1">{data.title}</p>
                </button>

                {showDetails && (
                  <div className="bg-white text-black p-6 rounded-3xl shadow-2xl space-y-4 animate-in slide-in-from-left-4">
                    <h3 className="font-black italic text-xl uppercase tracking-tighter leading-none">Specs</h3>
                    <p className="text-sm text-zinc-600 leading-snug">{data.description}</p>
                  </div>
                )}

                <button
                  onClick={takeSnapshot}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-2xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M208,56H181.33L164.67,34.67A8,8,0,0,0,158.33,32H97.67a8,8,0,0,0-6.34,2.67L74.67,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.33-3.11L103,48h50l16.67,20.89A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z"></path></svg>
                  Snapshot
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-4">
             <DisplaySize
              sizeChart={data?.sizeChart}
              landmarksRef={landmarksRef}
              measurements={measurements}
              isScanComplete={scanState === SCAN_STATES.COMPLETE}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
