import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { resolveDisplayName, getInitials } from '../../utils/user';
import {
  Sparkles,
  Compass,
  FileCode,
  Map,
  Bot,
  Wand2,
  CheckCircle2,
  Settings,
  LayoutDashboard,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { currentUser, loading: authLoading, logout } = useAuth();
  const { profile, loading: profileLoading, activeProject, roadmapStats } = useProject();

  // Dynamic user display derived from single source of truth
  const resolvedName = resolveDisplayName(
    profile?.name,
    profile?.fullName,
    currentUser?.displayName,
    currentUser?.email
  );
  const initials = getInitials(resolvedName);
  const isProfileNamed = Boolean(profile?.name && profile.name.trim() && !profile.name.includes('Alex Morgan'));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, authRequired: true },
    { id: 'generator', label: 'Idea Generator', icon: Sparkles, authRequired: false },
    { id: 'analyzer', label: 'Fit Analyzer', icon: Compass, authRequired: false },
    { id: 'blueprint', label: 'Blueprint', icon: FileCode, authRequired: true },
    { id: 'roadmap', label: 'Roadmap', icon: Map, authRequired: true },
    { id: 'mentor', label: 'AI Mentor', icon: Bot, authRequired: true },
    { id: 'improver', label: 'Improver', icon: Wand2, authRequired: false },
    { id: 'validator', label: 'Validator', icon: CheckCircle2, authRequired: false },
    { id: 'evaluation', label: 'Evaluation Matrix', icon: ShieldCheck, authRequired: false },
  ];

  return (
    <>
      {/* Skip to Main Content Link for WCAG Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('landing')}
                className="flex items-center space-x-2.5 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
                aria-label="ProjectPilot AI Home"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)] text-slate-900 font-bold text-base">
                  <span>P</span>
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    PROJECTPILOT
                  </span>
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    AI
                  </span>
                </div>
              </button>

              {/* Active Project Pill on Desktop */}
              {activeProject && (
                <div className="hidden xl:flex items-center space-x-2 pl-4 border-l border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-slate-400">Active Capstone:</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('blueprint')}
                    className="max-w-[200px] truncate text-xs font-semibold text-slate-200 hover:text-white bg-[#1e293b]/60 border border-slate-700/80 rounded-full px-2.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    title={activeProject.title}
                  >
                    {activeProject.title}
                  </button>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                    {roadmapStats.percentage}% Done
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-[0_0_10px_rgba(52,211,153,0.1)]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Profile / Auth State */}
            <div className="flex items-center space-x-2.5">
              {authLoading || profileLoading ? (
                <div className="flex items-center space-x-2 pl-3 border-l border-slate-800 animate-pulse" aria-label="Loading student profile">
                  <div className="text-right hidden sm:block space-y-1">
                    <div className="h-3.5 w-20 bg-slate-800 rounded"></div>
                    <div className="h-2.5 w-14 bg-slate-800/60 rounded"></div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700"></div>
                </div>
              ) : currentUser ? (
                <div className="flex items-center space-x-2 pl-3 border-l border-slate-800">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-white leading-tight" id="header-student-name">
                      {resolvedName || 'Student Pilot'}
                    </p>
                    {isProfileNamed ? (
                      <p className="text-[10px] text-slate-400" id="header-student-meta">
                        {profile.academicYear || profile.year || 'Student'}
                        {profile.branch ? ` • ${profile.branch.split(' ')[0]}` : (profile.degree ? ` • ${profile.degree.split(' ')[0]}` : '')}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-medium transition-colors"
                        id="header-complete-profile-btn"
                      >
                        Complete your profile →
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    id="header-user-avatar"
                    className={`w-9 h-9 rounded-full bg-slate-800 border flex items-center justify-center text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      activeTab === 'profile'
                        ? 'border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.25)]'
                        : 'border-slate-700 text-emerald-400 hover:border-slate-600'
                    }`}
                    title={resolvedName ? `${resolvedName} - Student Profile` : 'Student Profile'}
                    aria-label="Student Profile"
                  >
                    {initials || <User className="w-4 h-4 text-slate-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    id="header-settings-btn"
                    className={`p-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      activeTab === 'settings'
                        ? 'bg-slate-800 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    aria-label="Settings"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={logout}
                    id="header-logout-btn"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
                    aria-label="Logout"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('auth')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('generator')}
                    className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Generate Idea
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Scrolling Navigation Bar */}
        <div className="lg:hidden border-t border-slate-800/80 bg-[#0f172a]/95 overflow-x-auto px-2 py-2">
          <div className="flex space-x-1.5 min-w-max">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-emerald-500 text-slate-900 font-bold'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>
    </>
  );
}
