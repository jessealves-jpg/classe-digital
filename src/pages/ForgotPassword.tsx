import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MailCheck, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout
        title="Verifique seu e-mail"
        subtitle="Enviamos um link de recuperação"
        footer={
          <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4" /> Voltar para o login
          </Link>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-950 flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-8 h-8 text-success-600 dark:text-success-400" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
            Se existir uma conta com
          </p>
          <p className="font-semibold text-slate-900 dark:text-white mb-2">{email}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            você receberá um e-mail com instruções para redefinir sua senha.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Esqueci minha senha"
      subtitle="Informe seu e-mail para receber o link de recuperação"
      footer={
        <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700">
          <ArrowLeft className="w-4 h-4" /> Voltar para o login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-error-50 border border-error-200 text-error-700 text-sm animate-slide-down dark:bg-error-950/40 dark:border-error-800 dark:text-error-400">
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="email">E-mail cadastrado</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-11"
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Enviar link de recuperação
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
