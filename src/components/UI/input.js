import { useState } from "react";

export default function Input({ onUrlSubmit }) {
  const [isSyncing, setIsSyncing] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setIsSyncing(true);
        await onUrlSubmit(e.target.elements.url.value);
        setIsSyncing(false);
      }}
      className="flex w-full max-w-lg gap-2 bg-black/40 p-1.5 rounded-full backdrop-blur-xl border border-white/10 transition-all focus-within:border-white/30 shadow-2xl"
    >
      <div className="flex-1 flex items-center px-4">
        <input
          type="url"
          name="url"
          placeholder="Paste product link..."
          required
          className="flex-1 bg-transparent py-2 text-white placeholder-zinc-500 outline-none focus:ring-0 font-medium text-xs tracking-tight"
        />
      </div>
      <button
        type="submit"
        disabled={isSyncing}
        className="bg-white text-black px-6 py-2 rounded-full font-black uppercase tracking-widest text-[9px] hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
      >
        {isSyncing && (
          <div className="w-2 h-2 border-[1px] border-black/20 border-t-black rounded-full animate-spin"></div>
        )}
        {isSyncing ? "Syncing" : "Sync"}
      </button>
    </form>
  );
}



