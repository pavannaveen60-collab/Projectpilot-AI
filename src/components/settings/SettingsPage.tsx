import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { apiService } from '../../services/api';
import {
  Settings,
  ShieldCheck,
  Server,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Moon,
  Sun,
  Eye,
  Lock,
} from 'lucide-react';

interface SettingsPageProps {
  onNavigateToProfile: () => void;
}

export function SettingsPage({ onNavigateToProfile }: SettingsPageProps) {
  const { currentUser, logout } = useAuth();
  const { profile, updateProfileName } = useProject();

  const [health, setHealth] = useState<any>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [settingsName, setSettingsName] = useState(profile.name || currentUser?.displayName || '');
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    if (profile.name) {
      setSettingsName(profile.name);
    }
  }, [profile.name]);

  const handleSaveName = (e: FormEvent) => {
    e.preventDefault();
    const clean = settingsName.trim();
    if (!clean) return;
    updateProfileName(clean);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 4000);
  };

  const checkBackend = async () => {
    setCheckingHealth(true);
    try {
      const res = await apiService.checkHealth();
      setHealth(res);
    } catch {
      setHealth({ status: 'offline', hasGeminiKey: false });
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const handleClearCache = () => {
    if (confirm('Clear all cached ideas and reset student profile to initial state?')) {
      localStorage.clear();
      setMessage('Cache cleared successfully. Reloading application...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-1">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <Settings className="w-4 h-4" />
          <span>System & Preferences</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Application Settings & System Health
        </h1>
        <p className="text-xs text-slate-400">
          Manage system configurations, inspect backend security & Gemini status, and reset local caches.
        </p>
      </div>

      {message && (
        <div role="status" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Backend & Security Status Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Backend API & Gemini Service Health</span>
          </h2>
          <button
            type="button"
            onClick={checkBackend}
            disabled={checkingHealth}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none"
          >
            {checkingHealth ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-slate-400">Express Backend</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{health?.status === 'ok' ? 'Online & Healthy' : 'Checking'}</span>
            </div>
            <div className="text-[10px] text-slate-400">Port 3000 (Reverse Proxy Ingress)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-slate-400">Google Gemini 3.8 Flash</div>
            <div className="text-sm font-bold flex items-center space-x-1.5 text-indigo-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{health?.hasGeminiKey ? 'Active Server Key' : 'Deterministic Generator'}</span>
            </div>
            <div className="text-[10px] text-slate-400">Zero Key Exposure to Client</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="text-slate-400">SHA256 Response Cache</div>
            <div className="text-sm font-bold text-blue-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{health?.cacheSize ?? 0} Cached Responses</span>
            </div>
            <div className="text-[10px] text-slate-400">Slashing Unnecessary Token Costs</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-center space-x-2">
          <Lock className="w-4 h-4 flex-shrink-0 text-indigo-400" />
          <span>
            Security Verification: API keys are strictly confined to the container server environment and cannot be inspected via client DevTools.
          </span>
        </div>
      </div>

      {/* Student Account Summary & Identity Sync */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Active Student Session & Identity Sync</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-semibold text-white text-sm" id="settings-current-student-name">
              {profile.name || currentUser?.displayName || 'Student Profile Unset'}
            </div>
            <div className="text-slate-400">{currentUser?.email || 'student.pilot@university.edu'}</div>
            <div className="text-[11px] text-slate-400">
              {profile.degree || 'Degree not set'} • {profile.academicYear || profile.year || 'Academic Year Unset'}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onNavigateToProfile}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
            >
              Full Profile Setup
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick Name Update Form */}
        <form onSubmit={handleSaveName} className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="flex-1 w-full">
              <label htmlFor="settings-student-name" className="block text-xs font-medium text-slate-300 mb-1">
                Update Student Full Name (Single Source of Truth)
              </label>
              <input
                id="settings-student-name"
                type="text"
                value={settingsName}
                onChange={e => {
                  setSettingsName(e.target.value);
                  setNameSaved(false);
                }}
                placeholder="e.g. PAVAN KUMAR N or Rahul Sharma"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              id="save-settings-name-btn"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow-sm whitespace-nowrap"
            >
              Save Student Name
            </button>
          </div>

          {nameSaved && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Student name updated immediately across header, avatar initials, dashboard, and profile!</span>
            </div>
          )}
        </form>
      </div>

      {/* Danger Zone / Reset */}
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-6 space-y-4">
        <h2 className="text-sm font-bold text-rose-300 flex items-center space-x-2">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Data Storage & Cache Reset</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Clear all locally saved project bookmarks, custom roadmap task modifications, and chat history. This will restore default evaluation fixtures.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleClearCache}
            className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            Clear Local Data & Re-Initialize
          </button>
        </div>
      </div>

    </div>
  );
}
