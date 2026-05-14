import { useEffect, useRef, useState, useMemo } from "react";
import Head from "next/head";
import BodyTracker from "../components/AR/bodytracker";
import LiveHUD from "../components/AR/LiveHUD";
import HeightInput from "../components/UI/HeightInput";
import MeasurementStats from "../components/UI/MeasurementStats";
import ColorPalette from "../components/UI/ColorPalette";
import { usePose } from "../hooks/usepose";
import { useAnalysis } from "../hooks/useanalysis";

const SCAN_STATES = {
  CALIBRATING: "CALIBRATING", 
  READY_SCAN: "READY_SCAN",   
  SCANNING: "SCANNING",       
  ANALYZING: "ANALYZING",     
  COMPLETE: "COMPLETE",       
};

export default function Analyze() {
  const videoRef = useRef(null);
  const [scanState, setScanState] = useState(SCAN_STATES.CALIBRATING);
  const [userHeight, setUserHeight] = useState(175);
  const [finalAnalysis, setFinalAnalysis] = useState(null);
  const [stability, setStability] = useState(0);

  const { landmarksRef, isReady, isPersonVisible } = usePose(videoRef);
  const { calculateMeasurements, detectSkinTone } = useAnalysis();

  // Compute live measurements for the HUD
  const liveMeasurements = useMemo(() => {
    if (!landmarksRef.current || !isPersonVisible || scanState !== SCAN_STATES.SCANNING) return null;
    return calculateMeasurements(landmarksRef.current, userHeight);
  }, [landmarksRef.current, isPersonVisible, scanState, userHeight, calculateMeasurements]);

  const handleHeightConfirm = (h) => {
    setUserHeight(h);
    setScanState(SCAN_STATES.READY_SCAN);
  };

  useEffect(() => {
    if (scanState === SCAN_STATES.READY_SCAN && isPersonVisible) {
        setScanState(SCAN_STATES.SCANNING);
    }
  }, [isPersonVisible, scanState]);

  // Stability logic: Increase when person is visible and in scanning state
  useEffect(() => {
    let interval;
    if (scanState === SCAN_STATES.SCANNING && isPersonVisible) {
      interval = setInterval(() => {
        setStability(s => Math.min(s + 5, 100));
      }, 100);
    } else {
      setStability(0);
    }
    return () => clearInterval(interval);
  }, [scanState, isPersonVisible]);

  const runAnalysis = () => {
    if (!landmarksRef.current || !videoRef.current) {
        console.error("Missing landmarks or video for capture");
        return;
    }
    
    setScanState(SCAN_STATES.ANALYZING);
    
    // Capture the current frame data
    const capturedLandmarks = JSON.parse(JSON.stringify(landmarksRef.current));
    const capturedVideo = videoRef.current;

    setTimeout(() => {
      const measurements = calculateMeasurements(capturedLandmarks, userHeight);
      const skinData = detectSkinTone(capturedVideo, capturedLandmarks);
      
      setFinalAnalysis({
        measurements,
        skinTone: skinData
      });
      setScanState(SCAN_STATES.COMPLETE);
    }, 2500);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-sans selection:bg-white selection:text-black">
      <Head>
        <title>STYLE.INTEL | BODY ANALYSIS</title>
      </Head>

      {/* Background Camera Layer */}
      <div className={`absolute inset-0 z-[1] transition-all duration-1000 ${scanState === SCAN_STATES.COMPLETE ? 'scale-110 opacity-30 blur-xl' : 'scale-100 opacity-100'}`}>
        <BodyTracker ref={videoRef} />
        
        {/* Live HUD Overlay */}
        {isReady && isPersonVisible && scanState === SCAN_STATES.SCANNING && (
            <LiveHUD landmarks={landmarksRef.current} measurements={liveMeasurements} />
        )}

        {/* HUD UI Elements */}
        {isReady && isPersonVisible && scanState !== SCAN_STATES.COMPLETE && (
            <div className="absolute inset-0 z-[4] pointer-events-none">
                <div className="absolute top-1/4 left-0 w-full h-[2px] bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-scan"></div>
                
                <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
                    <div className="px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-[8px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        Live Biometric Feed
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* UI Content Layer */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 md:p-12">
        
        {scanState === SCAN_STATES.CALIBRATING && (
           <HeightInput onConfirm={handleHeightConfirm} />
        )}

        {scanState === SCAN_STATES.READY_SCAN && !isPersonVisible && (
            <div className="flex flex-col items-center gap-8 text-center animate-in fade-in zoom-in duration-1000">
                <div className="w-32 h-32 border border-white/10 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping"></div>
                    <svg className="text-white w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div className="space-y-4">
                    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Step into <span className="text-zinc-500">Frame</span></h2>
                    <p className="text-zinc-500 text-[10px] font-medium tracking-widest uppercase max-w-[200px] mx-auto">Position yourself so your entire body is visible</p>
                </div>
            </div>
        )}

        {scanState === SCAN_STATES.SCANNING && (
             <div className="flex flex-col items-center gap-12 w-full max-w-4xl h-full">
                <div className="absolute bottom-20 flex flex-col items-center gap-8 animate-in slide-in-from-bottom-8 duration-700">
                    
                    {/* Stability Bar */}
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-500">
                            <span>Stability</span>
                            <span>{stability}%</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-white transition-all duration-300"
                                style={{ width: `${stability}%` }}
                            />
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">
                            {stability < 100 ? 'Analyzing Silhouette' : 'Ready for Extraction'}
                        </h2>
                    </div>
                    
                    <button 
                        onClick={runAnalysis}
                        disabled={!isPersonVisible || stability < 80}
                        className="px-16 py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.4em] text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-2xl"
                    >
                        Capture Biometrics
                    </button>
                </div>
             </div>
        )}

        {scanState === SCAN_STATES.ANALYZING && (
            <div className="flex flex-col items-center gap-10">
                <div className="relative w-40 h-40">
                    <div className="absolute inset-0 border-[1px] border-white/5 rounded-full scale-[1.7]"></div>
                    <div className="absolute inset-0 border-t-2 border-white rounded-full animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Processing <span className="text-zinc-500">Neural Maps</span></h2>
                    <p className="text-zinc-500 text-[10px] font-black tracking-[0.5em] uppercase animate-pulse">Running Volumetric Algorithms</p>
                </div>
            </div>
        )}

        {scanState === SCAN_STATES.COMPLETE && finalAnalysis && (
            <div className="w-full h-full flex flex-col items-center gap-12 max-w-6xl">
                <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">
                            Session Complete // Style ID: {Math.random().toString(36).substring(7).toUpperCase()}
                        </div>
                        <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">Your Style <span className="text-zinc-500">Dossier</span></h2>
                    </div>
                    <button 
                        onClick={() => { setScanState(SCAN_STATES.CALIBRATING); setStability(0); }}
                        className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all"
                    >
                        New Analysis
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                    <MeasurementStats measurements={finalAnalysis.measurements} />
                    <ColorPalette season={finalAnalysis.skinTone?.season} skinHex={finalAnalysis.skinTone?.hex} />
                </div>
            </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0vh); }
          50% { transform: translateY(100vh); }
        }
        .animate-scan {
          animation: scan 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
