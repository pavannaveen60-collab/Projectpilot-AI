import { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const { login, register, loginAsDemoStudent } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const res = await register(name, email, password);
        if (res.error) {
          setError(res.error);
        } else {
          onSuccess();
        }
      } else {
        const res = await login(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          onSuccess();
        }
      }
    } catch {
      setError('An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemoStudent();
      onSuccess();
    } catch {
      setError('Failed to log in as demo student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isRegistering ? 'Create Student Account' : 'Welcome to ProjectPilot AI'}
          </h1>
          <p className="text-xs text-slate-400">
            {isRegistering
              ? 'Register to save your project ideas, blueprints, and roadmap'
              : 'Sign in with your university or personal email'}
          </p>
        </div>

        {/* Demo Student Fast Login for Evaluators */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-2.5">
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Hackathon Evaluator / Quick Review Mode</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            One-click instant login pre-populated with a final-year CS profile, active capstone, and verified roadmap.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
          >
            <span>Log In as Demo Final-Year Student</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-medium absolute">
            Or continue with email
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1.5">
              <label htmlFor="auth-name" className="block text-xs font-medium text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. PAVAN KUMAR N or Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="auth-email" className="block text-xs font-medium text-slate-300">
              Academic or Personal Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="auth-password" className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 focus:outline-none focus:underline"
          >
            {isRegistering
              ? 'Already have an account? Sign in'
              : "Don't have an account? Create one"}
          </button>
        </div>

      </div>
    </div>
  );
}
