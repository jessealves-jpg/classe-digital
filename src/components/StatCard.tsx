import { ReactNode } from 'react';

const COLORS: Record<string, { icon: string; ring: string; text: string }> = {
  blue: { icon: 'bg-primary-100 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400', ring: '', text: 'text-primary-600 dark:text-primary-400' },
  cyan: { icon: 'bg-accent-100 text-accent-600 dark:bg-accent-950/60 dark:text-accent-400', ring: '', text: 'text-accent-600 dark:text-accent-400' },
  green: { icon: 'bg-success-100 text-success-600 dark:bg-success-950/60 dark:text-success-400', ring: '', text: 'text-success-600 dark:text-success-400' },
  amber: { icon: 'bg-warning-100 text-warning-600 dark:bg-warning-950/60 dark:text-warning-400', ring: '', text: 'text-warning-600 dark:text-warning-400' },
  red: { icon: 'bg-error-100 text-error-600 dark:bg-error-950/60 dark:text-error-400', ring: '', text: 'text-error-600 dark:text-error-400' },
  slate: { icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', ring: '', text: 'text-slate-600 dark:text-slate-300' },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color = 'blue',
  loading = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sublabel?: string;
  color?: keyof typeof COLORS;
  loading?: boolean;
}) {
  const c = COLORS[color] || COLORS.blue;

  if (loading) {
    return (
      <div className="card-base p-5">
        <div className="skeleton h-10 w-10 rounded-xl mb-3" />
        <div className="skeleton h-4 w-24 mb-2" />
        <div className="skeleton h-7 w-16" />
      </div>
    );
  }

  return (
    <div className="card-base p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.icon}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {sublabel && <p className={`text-xs mt-1 ${c.text}`}>{sublabel}</p>}
    </div>
  );
}
