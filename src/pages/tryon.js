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
  const [showFlash, setShowFlash] = useState(false);

  const { landmarksRef, isReady, isPersonVisible } = usePose(videoRef);
  const { calculateMeasurements, detectSkinTone } = useAnalysis();

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

  useEffect(() => {
    let interval;
    if (scanState === SCAN_STATES.SCANNING && isPersonVisible && liveMeasurements?.isFullBodyVisible) {
      interval = setInterval(() => {
        setStability(s => Math.min(s + 4, 100));
      }, 100);
    } else {
      setStability(0);
    }
    return () => clearInterval(interval);
  }, [scanState, isPersonVisible, liveMeasurements?.isFullBodyVisible]);

  const runAnalysis = () => {
    if (!landmarksRef.current || !videoRef.current || !liveMeasurements?.isFullBodyVisible) return;
    
    // Visual Feedback
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);

    const capturedMeasurements = { ...liveMeasurements };
    const skinData = detectSkinTone(videoRef.current, landmarksRef.current);
    
    setScanState(SCAN_STATES.ANALYZING);

    setTimeout(() => {
      setFinalAnalysis({
        measurements: capturedMeasurements,
        skinTone: skinData
      });
      setScanState(SCAN_STATES.COMPLETE);
    }, 2000);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-sans selection:bg-white selection:text-black">
      <Head>
        <title>STYLE.INTEL | BODY ANALYSIS</title>
      </Head>

      {/* Camera Layer */}
      <div className={`absolute inset-0 z-[1] transition-all duration-1000 ${scanState === SCAN_STATES.COMPLETE ? 'scale-110 opacity-30 blur-xl' : 'scale-100 opacity-100'}`}>
        <BodyTracker ref={videoRef} />
        
        {/* Live HUD - Always show when scanning */}
        {isReady && isPersonVisible && scanState === SCAN_STATES.SCANNING && (
            <LiveHUD landmarks={landmarksRef.current} measurements={liveMeasurements} />
        )}

        {/* Global HUD Elements */}
        {isReady && isPersonVisible && scanState !== SCAN_STATES.COMPLETE && (
            <div className="absolute inset-0 z-[4] pointer-events-none">
                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-white/10 animate-scan"></div>
                
                <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full border ${liveMeasurements?.isFullBodyVisible ? 'border-green-500/30 bg-green-500/10 text-green-500' : 'border-red-500/30 bg-red-500/10 text-red-500'} text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors duration-500`}>
                        <div className={`w-1 h-1 rounded-full ${liveMeasurements?.isFullBodyVisible ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {liveMeasurements?.isFullBodyVisible ? 'Full Body Detected' : 'Feet Not Detected'}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Screen Flash Effect */}
      {showFlash && <div className="absolute inset-0 z-[100] bg-white animate-out fade-out duration-300 pointer-events-none" />}

      {/* UI Content Layer */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 md:p-12">
        
        {scanState === SCAN_STATES.CALIBRATING && (
           <HeightInput onConfirm={handleHeightConfirm} />
        )}

        {scanState === SCAN_STATES.READY_SCAN && !isPersonVisible && (
            <div className="flex flex-col items-center gap-8 text-center animate-in fade-in zoom-in duration-1000">
                <div className="w-32 h-32 border border-white/10 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping"></div>
                    <svg className="text-white w-12 h-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div className="space-y-4">
                    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Step into <span className="text-zinc-500">Frame</span></h2>
                    <p className="text-zinc-500 text-[10px] font-medium tracking-widest uppercase">Position yourself head to toe</p>
                </div>
            </div>
        )}

        {scanState === SCAN_STATES.SCANNING && (
             <div className="flex flex-col items-center justify-end h-full w-full max-w-4xl pb-20">
                <div className="flex flex-col items-center gap-8 animate-in slide-in-from-bottom-8 duration-700">
                    
                    {/* Stability / Visibility Warning */}
                    {!liveMeasurements?.isFullBodyVisible ? (
                        <div className="bg-red-500/20 border border-red-500/40 px-6 py-3 rounded-2xl backdrop-blur-xl animate-pulse">
                            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">Please stand back // Feet must be visible</p>
                        </div>
                    ) : (
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-500">
                                <span>Signal Stability</span>
                                <span>{stability}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-white transition-all duration-300"
                                    style={{ width: `${stability}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={runAnalysis}
                        disabled={!liveMeasurements?.isFullBodyVisible || stability < 90}
                        className="px-16 py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.4em] text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-4xl"
                    >
                        {liveMeasurements?.isFullBodyVisible ? 'Capture Biometrics' : 'Waiting for Full Body...'}
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
                    <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Finalizing <span className="text-zinc-500">Analysis</span></h2>
                    <p className="text-zinc-500 text-[10px] font-black tracking-[0.5em] uppercase animate-pulse">Generating Style Dossier</p>
                </div>
            </div>
        )}

        {scanState === SCAN_STATES.COMPLETE && finalAnalysis && (
            <div className="w-full h-full flex flex-col items-center gap-12 max-w-6xl animate-in fade-in duration-1000">
                <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">
                            Snapshot Verified // Scale: {userHeight}cm Baseline
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
                    <ColorPalette skinData={finalAnalysis.skinTone} />
                </div>
            </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0vh); opacity: 0.1; }
          50% { transform: translateY(100vh); opacity: 0.5; }
        }
        .animate-scan {
          animation: scan 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
