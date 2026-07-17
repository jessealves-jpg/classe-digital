import { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg mb-4">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Classe Digital</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Organização de Estudos EAD</p>
        </div>

        <div className="card-elevated p-8 animate-slide-up">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{subtitle}</p>
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</div>}
      </div>
    </div>
  );
}
