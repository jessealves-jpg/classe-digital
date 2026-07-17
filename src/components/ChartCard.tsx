import { ReactNode } from 'react';
import { BarChart3 } from 'lucide-react';

export default function ChartCard({
  title,
  subtitle,
  children,
  height,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number;
}) {
  return (
    <div className="card-base p-5 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-slate-400" />
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div style={height ? { height } : undefined}>{children}</div>
    </div>
  );
}
