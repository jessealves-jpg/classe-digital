export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-2xl bg-primary-600 animate-pulse-glow" />
        <svg viewBox="0 0 32 32" className="absolute inset-0 w-full h-full p-2">
          <path d="M8 22V10l8 5 8-5v12" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Carregando Classe Digital...</p>
    </div>
  );
}
