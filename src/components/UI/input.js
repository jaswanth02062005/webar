export default function Input({ onUrlSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onUrlSubmit(e.target.elements.url.value);
      }}
      className="flex w-full gap-2 bg-white/5 p-2 rounded-[2rem] backdrop-blur-3xl border border-white/10 shadow-2xl transition-all hover:border-white/20 group focus-within:border-white/30"
    >
      <div className="flex-1 flex items-center px-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-zinc-500 mr-3" viewBox="0 0 256 256"><path d="M168,152a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,152Zm-8-40H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm72-24V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V40A16,16,0,0,1,40,24H168a8,8,0,0,1,5.66,2.34l56,56A8,8,0,0,1,232,88Zm-16,4H176V40H40V200H216Zm-40-56v32h32Z"></path></svg>
        <input
          type="url"
          name="url"
          placeholder="New product link..."
          required
          className="flex-1 bg-transparent py-3 text-white placeholder-zinc-600 outline-none focus:ring-0 font-medium text-sm"
        />
      </div>
      <button
        type="submit"
        className="bg-white text-black px-8 py-3 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
      >
        Update Fit
      </button>
    </form>
  );
}
