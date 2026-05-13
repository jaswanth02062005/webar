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
  READY_SIDE: "READY_SIDE",
  GET_LINK: "GET_LINK",
  LOADING_PRODUCT: "LOADING_PRODUCT",
  COMPLETE: "COMPLETE",
};

export default function TryOn() {
  const videoRef = useRef(null);
  const router = useRouter();
  const [scanState, setScanState] = useState(SCAN_STATES.CALIBRATING);
  const [showDetails, setShowDetails] = useState(false);
  const [measurements, setMeasurements] = useState({ width: 0, depth: 0 });

  // Initialize Hooks
  const { landmarksRef, isReady, isPersonVisible } = usePose(videoRef);
  const { scrape, data, loading, error } = useScraper();

  useEffect(() => {
    if (isReady && scanState === SCAN_STATES.CALIBRATING) {
      const checkCalibration = setInterval(() => {
        if (isPersonVisible) {
          setScanState(SCAN_STATES.READY_FRONT);
          clearInterval(checkCalibration);
        }
      }, 500);
      return () => clearInterval(checkCalibration);
    }
  }, [isReady, scanState, isPersonVisible]);

  const captureMeasurement = (type) => {
    if (!isPersonVisible) return;
    const ls = landmarksRef.current[11];
    const rs = landmarksRef.current[12];
    const dist = Math.sqrt(Math.pow(ls.x - rs.x, 2) + Math.pow(ls.y - rs.y, 2));

    if (type === "width") {
      setMeasurements((m) => ({ ...m, width: dist }));
      setScanState(SCAN_STATES.READY_SIDE);
    } else {
      setMeasurements((m) => ({ ...m, depth: dist }));
      setScanState(SCAN_STATES.GET_LINK);
    }
  };

  const handleUrlSubmit = async (url) => {
    setScanState(SCAN_STATES.LOADING_PRODUCT);
    const success = await scrape(url);
    if (error) {
       setScanState(SCAN_STATES.GET_LINK);
    } else {
       setScanState(SCAN_STATES.COMPLETE);
    }
  };

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
        <title>AR SCAN | VIRTUAL.FIT</title>
      </Head>

      <div className="absolute inset-0 z-[1]">
        <BodyTracker ref={videoRef} />
      </div>

      {/* Engine Loading Overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
          <div className="flex flex-col items-center gap-8">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-[1px] border-white/5 rounded-full scale-150"></div>
              <div className="absolute inset-0 border-t-2 border-white rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2 text-center">
              <p className="text-2xl font-black italic tracking-tighter text-white uppercase">Neural Engine</p>
              <p className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase">Warming up systems</p>
            </div>
          </div>
        </div>
      )}

      {/* Guided Scanning UI */}
      {isReady && scanState !== SCAN_STATES.COMPLETE && scanState !== SCAN_STATES.LOADING_PRODUCT && (
        <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none p-4">
          <div className="text-white flex flex-col items-center gap-8 max-w-sm w-full text-center p-8 md:p-10 pointer-events-auto bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-4xl animate-in zoom-in-95 duration-700">
            {scanState === SCAN_STATES.CALIBRATING && (
              <div className="space-y-6">
                <div className="w-16 h-16 border border-white/10 rounded-full mx-auto flex items-center justify-center relative">
                   <div className="absolute inset-0 border border-white/20 rounded-full animate-ping"></div>
                   <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Find Space</h2>
                  <p className="text-zinc-400 text-xs font-medium">Position yourself 2 meters from the camera.</p>
                </div>
              </div>
            )}

            {(scanState === SCAN_STATES.READY_FRONT || scanState === SCAN_STATES.READY_SIDE) && (
              <div className="space-y-8 w-full">
                <div className={`w-32 h-48 border-[1px] ${isPersonVisible ? 'border-green-500/50' : 'border-white/10'} rounded-[2rem] mx-auto relative overflow-hidden transition-colors duration-500 shadow-2xl shadow-green-500/10`}>
                   <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
                   <div className={`absolute top-1/2 left-0 w-full h-[1px] ${isPersonVisible ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]' : 'bg-white/20'} animate-scan`}></div>
                </div>
                <div className="space-y-2">
                  <div className={`flex items-center justify-center gap-2 mb-2 px-3 py-1 rounded-full border ${isPersonVisible ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'} transition-all duration-500`}>
                     <div className={`w-1.5 h-1.5 rounded-full ${isPersonVisible ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                     <p className={`text-[8px] font-black uppercase tracking-widest ${isPersonVisible ? 'text-green-500' : 'text-red-500'}`}>
                       {isPersonVisible ? 'Human Detected' : 'No Human Detected'}
                     </p>
                  </div>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                    {scanState === SCAN_STATES.READY_FRONT ? 'Front View' : 'Side View'}
                  </h2>
                  <p className="text-zinc-400 text-[10px] font-medium px-4">
                    {scanState === SCAN_STATES.READY_FRONT ? 'Stand straight with arms slightly out.' : 'Turn 90° to capture body depth.'}
                  </p>
                </div>
                <button
                  disabled={!isPersonVisible}
                  onClick={() => captureMeasurement(scanState === SCAN_STATES.READY_FRONT ? "width" : "depth")}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-200 transition-all active:scale-95 shadow-xl disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  {isPersonVisible ? 'Capture' : 'Waiting for Detection...'}
                </button>
              </div>
            )}

            {scanState === SCAN_STATES.GET_LINK && (
              <div className="space-y-8 w-full">
                <div className="space-y-2">
                  <div className="inline-block px-2 py-0.5 rounded-full bg-white/10 text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                    Analysis Ready
                  </div>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Paste Link</h2>
                  <p className="text-zinc-400 text-[10px] font-medium">Add product URL to see your fit.</p>
                </div>
                <div className="w-full">
                   <Input onUrlSubmit={handleUrlSubmit} />
                </div>
                {error && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">
                    Error: {error}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Product State */}
      {scanState === SCAN_STATES.LOADING_PRODUCT && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center p-6">
           <div className="flex flex-col items-center gap-8 max-w-sm text-center">
            <div className="relative w-32 h-32">
               <div className="absolute inset-0 border-[1px] border-white/5 rounded-full scale-150"></div>
               <div className="absolute inset-0 border-t-2 border-white rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Fetching Garment</h2>
              <p className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase">Extracting textures & dimensions</p>
            </div>
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

      {/* UI Overlay Layer (Only show when complete) */}
      {scanState === SCAN_STATES.COMPLETE && (
        <div className="absolute inset-0 z-[10] pointer-events-none flex flex-col justify-between p-4 md:p-6">
          {/* Header Dashboard */}
          <header className="pointer-events-auto flex flex-col md:flex-row justify-between items-center w-full px-4 py-3 md:py-2 bg-black/40 md:bg-black/20 backdrop-blur-md rounded-[2rem] md:rounded-full border border-white/5 gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-4">
                <div className="text-lg font-black tracking-tighter italic text-white">V.F</div>
                <div className="h-4 w-[1px] bg-white/10 hidden md:block"></div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:block">Live Session</div>
              </div>
              <div className="md:hidden flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Latency</p>
                    <p className="text-[10px] font-bold text-green-500">12ms</p>
                  </div>
              </div>
            </div>
            
            <div className="w-full md:flex-1 md:max-w-sm">
              <Input onUrlSubmit={handleUrlSubmit} />
            </div>

            <div className="hidden md:flex items-center gap-3">
               <div className="flex flex-col items-end">
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Latency</p>
                  <p className="text-[10px] font-bold text-green-500">12ms</p>
               </div>
            </div>
          </header>

          {/* Bottom Panel */}
          <div className="flex flex-col-reverse md:flex-row justify-between items-end pointer-events-auto w-full gap-4 md:gap-6">
            {/* Garment Details Card */}
            {data && (
              <div className="bg-black/60 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 text-white shadow-3xl w-full md:max-w-[280px] animate-in slide-in-from-bottom-4 duration-700">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Selected</p>
                <h3 className="text-xl font-black italic tracking-tighter leading-none mb-2 uppercase truncate">{data.brandName}</h3>
                <p className="text-[10px] text-zinc-400 line-clamp-1 font-medium mb-4">{data.title}</p>
                
                <button
                  onClick={takeSnapshot}
                  className="w-full bg-white text-black py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M208,56H181.33L164.67,34.67A8,8,0,0,0,158.33,32H97.67a8,8,0,0,0-6.34,2.67L74.67,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.33-3.11L103,48h50l16.67,20.89A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z"></path></svg>
                  Snapshot
                </button>
              </div>
            )}

            {/* Fit Stats Card */}
            <div className="flex flex-col items-end w-full md:w-auto">
               <DisplaySize
                sizeChart={data?.sizeChart}
                landmarksRef={landmarksRef}
                measurements={measurements}
                isScanComplete={scanState === SCAN_STATES.COMPLETE}
              />
            </div>
          </div>
        </div>
      )}


      <style jsx global>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-50px); }
          50% { transform: translateY(200px); }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
