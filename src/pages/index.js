import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  const handleStart = (e) => {
    e.preventDefault();
    if (!url) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      router.push({
        pathname: "/tryon",
        query: { productUrl: url },
      });
    }, 1500);
  };

  const brands = ["ZARA", "AMAZON", "MYNTRA", "H&M", "NIKE", "ADIDAS", "ASOS", "UNIQLO"];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-between font-sans selection:bg-white selection:text-black overflow-hidden">
      <Head>
        <title>VIRTUAL FIT | AI Dressing Room</title>
      </Head>

      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full"></div>
      </div>

      <nav className="w-full p-8 flex justify-between items-center relative z-10">
        <div className="text-xl font-black tracking-tighter italic">VIRTUAL.FIT</div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
          <span className="text-white">Dressing Room</span>
          <span>Technology</span>
          <span>Pricing</span>
        </div>
      </nav>

      <main className="max-w-5xl w-full text-center space-y-16 px-6 relative z-10 py-12">
        {/* Branding */}
        <div className="space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 animate-pulse">
            Next Gen Virtual Retail
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-[ -0.05em] leading-[0.85] uppercase">
            Try on <br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-700">Anything.</span>
          </h1>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Universal AI fitting room. Paste a product link from any store to see how it fits in real-time AR.
          </p>
        </div>

        {/* Input Card */}
        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 via-white/20 to-zinc-800 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-zinc-900/80 backdrop-blur-2xl border border-white/10 p-4 rounded-[2.2rem] shadow-3xl">
            <form onSubmit={handleStart} className="flex flex-col md:flex-row gap-3">
              <input
                type="url"
                required
                placeholder="Paste Amazon, Zara, or Myntra link..."
                className="flex-1 bg-black/50 border border-white/5 rounded-2xl py-5 px-8 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-lg font-medium"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                type="submit"
                disabled={isAnalyzing}
                className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? "Analyzing..." : "Step In"}
              </button>
            </form>
            <div className="mt-4 flex justify-center">
              <button 
                onClick={() => setUrl("https://www.zara.com/us/en/oversized-t-shirt-p00922401.html")}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
              >
                Or try a sample Zara T-Shirt
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12">
          {[
            { t: "01. PASTE", d: "Any garment URL from your favorite retailer." },
            { t: "02. ANALYZE", d: "AI extracts style, size charts, and textures." },
            { t: "03. FIT", d: "Instant AR try-on with real-time body tracking." }
          ].map((f, i) => (
            <div key={i} className="text-left space-y-3 group">
              <h3 className="text-sm font-black italic tracking-tighter text-white group-hover:translate-x-1 transition-transform">{f.t}</h3>
              <p className="text-sm text-zinc-500 font-medium leading-snug">{f.d}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Brand Marquee */}
      <footer className="w-full py-12 border-t border-white/5 bg-zinc-900/30 backdrop-blur-sm mt-12">
        <div className="flex flex-col items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Universal Support For</p>
          <div className="flex overflow-hidden w-full">
            <div className="flex animate-marquee whitespace-nowrap gap-16 px-16">
              {[...brands, ...brands].map((b, i) => (
                <span key={i} className="text-2xl font-black italic tracking-tighter text-zinc-800 hover:text-zinc-600 transition-colors cursor-default">
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
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
