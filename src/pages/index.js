import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/tryon");
  };

  const brands = ["ZARA", "AMAZON", "MYNTRA", "H&M", "NIKE", "ADIDAS", "ASOS", "UNIQLO"];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-between font-sans selection:bg-white selection:text-black overflow-hidden relative">
      <Head>
        <title>VIRTUAL FIT | Next Gen AI Dressing Room</title>
      </Head>

      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-zinc-800/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/5 blur-[150px] rounded-full"></div>
      </div>

      <nav className="w-full p-8 flex justify-between items-center relative z-10">
        <div className="text-2xl font-black tracking-tighter italic">VIRTUAL.FIT</div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
          <span className="text-white">Experience</span>
          <span>Technology</span>
          <span>API</span>
        </div>
      </nav>

      <main className="max-w-5xl w-full text-center space-y-24 px-6 relative z-10 py-20">
        {/* Branding */}
        <div className="space-y-10">
          <div className="inline-block px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4">
            Volumetric AI Body Tracking
          </div>
          <h1 className="text-6xl md:text-[10rem] font-black tracking-[-0.06em] leading-[0.8] uppercase">
            Style <br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-800">Intelligence.</span>
          </h1>
          <p className="text-zinc-500 text-base md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed px-4">
            The future of personal styling. Scan your body, discover your measurements, and find your perfect color palette with AI.
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col items-center gap-8">
          <button
            onClick={handleStart}
            className="group relative px-16 py-8 bg-white text-black rounded-[2.5rem] overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span className="relative z-10 font-black uppercase tracking-[0.2em] text-xl">Start Your Fit Scan</span>
          </button>
          
          <div className="flex items-center gap-4 text-zinc-600">
            <div className="h-px w-8 bg-zinc-800"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">No App Required</span>
            <div className="h-px w-8 bg-zinc-800"></div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-12 border-t border-white/5">
          {[
            { t: "01. CALIBRATE", d: "Set your height to establish a precise biometric baseline." },
            { t: "02. SCAN", d: "High-fidelity AI capture of your unique body profile." },
            { t: "03. ANALYZE", d: "Get exact dimensions and your personalized color palette." }
          ].map((f, i) => (
            <div key={i} className="text-left space-y-4 group">
              <h3 className="text-lg font-black italic tracking-tighter text-white/40 group-hover:text-white transition-colors">{f.t}</h3>
              <p className="text-sm text-zinc-500 font-medium leading-snug">{f.d}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Brand Marquee */}
      <footer className="w-full py-16 border-t border-white/5 bg-zinc-900/10 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700">Supported Retailers</p>
          <div className="flex overflow-hidden w-full opacity-30 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-700">
            <div className="flex animate-marquee whitespace-nowrap gap-20 px-20">
              {[...brands, ...brands].map((b, i) => (
                <span key={i} className="text-4xl font-black italic tracking-tighter text-zinc-600">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}

