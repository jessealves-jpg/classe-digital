export default function ProgressBar({
  value,
  max,
  color = '#3b82f6',
  showLabel = false,
  height = 'md',
}: {
  value: number;
  max: number;
  color?: string;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const h = height === 'sm' ? 'h-1.5' : height === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full">
      <div className={`w-full ${h} bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden`}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}40` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
          <span>{value.toLocaleString('pt-BR')}</span>
          <span>{max.toLocaleString('pt-BR')}</span>
        </div>
      )}
    </div>
  );
}
