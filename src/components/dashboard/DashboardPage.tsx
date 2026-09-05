import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { resolveDisplayName } from '../../utils/user';
import {
  Sparkles,
  Map,
  FileCode,
  Compass,
  Bot,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Zap,
  UserCheck,
  AlertTriangle,
  Edit3,
  CheckCircle2,
  Code2,
  Cpu,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  onAskMentorForTask?: (taskTitle: string) => void;
}

export function DashboardPage({ onNavigate, onAskMentorForTask }: DashboardPageProps) {
  const { currentUser } = useAuth();
  const { profile, activeProject, savedIdeas, roadmapStats, selectProject, profileCompletion, canGenerateIdeas } = useProject();

  const fitScore = activeProject?.fitScores?.overallFit || 94;

  return (
    <div className="max-w-7xl mx-auto py-6 px-2 sm:px-4 space-y-6">
      
      {/* Profile Notice Banners */}
      {profile.isDemoProfile && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Demo Profile Mode Active
              </p>
              <p className="text-xs text-amber-200/80">
                You are viewing sample review data. To generate projects tailored to your actual skills, customize your profile.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors whitespace-nowrap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit to Real Profile
          </button>
        </div>
      )}

      {!canGenerateIdeas && !profile.isDemoProfile && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-cyan-300">
                Complete Your Student Profile ({profileCompletion.percentage}%)
              </p>
              <p className="text-xs text-slate-300">
                Required for Gemini AI project generation: {profileCompletion.missingRequired.join(', ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:from-emerald-400 hover:to-cyan-400 transition-all whitespace-nowrap shadow-md"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Complete Profile Setup
          </button>
        </div>
      )}

      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Capstone Command Center • Immersive Mode</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1" id="dashboard-student-heading">
            Welcome back, {resolveDisplayName(profile.name, profile.fullName, currentUser?.displayName, currentUser?.email) || 'Student'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {profile.degree || 'Degree not set'}{profile.branch ? ` • ${profile.branch}` : ''} • {profile.year || profile.academicYear || 'Academic Year'} • Target: {profile.careerGoal || 'Not specified'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold py-2 px-3.5 rounded-lg text-xs border border-slate-700 transition-all flex items-center space-x-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('generator')}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>GENERATE IDEAS</span>
          </button>
        </div>
      </div>

      {/* Main 12-Column Immersive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Student Profile & Evaluation Summary (3 cols) */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Student Profile Card */}
          <div className="bg-[#1e293b]/40 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Student Profile
                </h2>
                {profile.isDemoProfile && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    DEMO
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            </div>

            <div className="space-y-4">
              {/* Name & Academic details */}
              <div className="pb-3 border-b border-slate-800">
                <p className="text-sm font-bold text-white">{profile.name || 'Unnamed Student'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{profile.degree || 'Degree unspecified'}</p>
                {profile.branch && <p className="text-xs text-cyan-400">{profile.branch}</p>}
                <p className="text-[11px] text-slate-500 mt-0.5">{profile.year || profile.academicYear || 'Final Year'}</p>
              </div>

              {/* Programming Languages */}
              {profile.programmingLanguages && profile.programmingLanguages.length > 0 && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Code2 className="w-3 h-3 text-cyan-400" /> Languages
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {profile.programmingLanguages.map(lang => (
                      <span
                        key={lang}
                        className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded text-[10px] font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-purple-400" /> Technical Skills
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.technicalSkills && profile.technicalSkills.length > 0 ? (
                    profile.technicalSkills.map((skill, index) => {
                      const badgeClasses = [
                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                        'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
                        'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
                      ][index % 3];
                      return (
                        <span
                          key={skill}
                          className={`px-2 py-1 border rounded text-[10px] font-medium ${badgeClasses}`}
                        >
                          {skill}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-slate-500">No skills declared</span>
                  )}
                </div>
              </div>

              {/* Frameworks */}
              {profile.frameworks && profile.frameworks.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Frameworks</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.frameworks.map(fw => (
                      <span
                        key={fw}
                        className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px]"
                      >
                        {fw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interest Domain */}
              <div className="pt-3 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Interest Areas</p>
                <p className="text-xs mt-1 text-slate-200 font-medium">
                  {profile.preferredDomain || (profile.interests && profile.interests.join(', ')) || (profile.areasOfInterest && profile.areasOfInterest.join(', ')) || 'AI & Distributed Systems'}
                </p>
              </div>

              {/* Career Goal */}
              <div className="pt-3 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Career Target</p>
                <p className="text-xs mt-1 text-emerald-300 font-medium">
                  {profile.careerGoal || 'Software Engineer'}
                </p>
              </div>

              {/* Duration & Team */}
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Timeline: {profile.duration || profile.availableDuration || '3-6 Months'}</span>
                <span>Team: {profile.teamSize || 'Solo'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              Update Profile Details
            </button>
          </div>

          {/* Evaluation Summary Card */}
          <div className="bg-gradient-to-b from-[#1e293b]/60 to-[#0f172a]/20 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
              Evaluation Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs text-slate-400">Project Fit Score</span>
                <span className="text-2xl font-bold text-emerald-400">{fitScore}%</span>
              </div>

              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${fitScore}%` }}
                  role="progressbar"
                  aria-valuenow={fitScore}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>

              <ul className="space-y-2 mt-4 text-xs text-slate-300">
                <li className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-400 font-bold">✔</span>
                  <span>Skill Match: {activeProject?.fitScores ? 'Optimal' : '88% Match'}</span>
                </li>
                <li className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-400 font-bold">✔</span>
                  <span>Time Feasibility: High</span>
                </li>
                <li className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-400 font-bold">✔</span>
                  <span>Innovation Factor: 8.8 / 10</span>
                </li>
                <li className="flex items-center gap-2 text-[11px]">
                  <span className="text-cyan-400 font-bold">✔</span>
                  <span>Google AI & Cloud Alignment: 95%</span>
                </li>
              </ul>
            </div>
          </div>

        </section>

        {/* CENTER COLUMN: Active Project Blueprint & Mentor Context (6 cols) */}
        <section className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-[#1e293b]/40 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl">
            
            {activeProject ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        ACTIVE BLUEPRINT
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                        {activeProject.difficulty}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-white mt-1">
                      {activeProject.title}
                    </h2>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {activeProject.shortDescription}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('blueprint')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex-shrink-0"
                  >
                    INSPECT BLUEPRINT
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Core Features */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                    <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      Core Features
                    </h3>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      {(activeProject.coreFeatures || []).slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Google Tech Stack */}
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                    <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2">
                      Target Tech Stack
                    </h3>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>Google Gemini 3.8 Flash (Analysis)</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{activeProject.recommendedTechStack?.database?.[0] || 'Firebase Auth & Firestore'}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{activeProject.recommendedTechStack?.frontend?.[0] || 'React + TypeScript'}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{activeProject.recommendedTechStack?.backend?.[0] || 'Node.js Express / Cloud Run'}</span>
                      </li>
                    </ul>
                  </div>

                  {/* AI Mentor Context Feed */}
                  <div className="sm:col-span-2 bg-slate-900/50 rounded-xl p-4 border border-slate-800/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                        AI Mentor Context Feed
                      </h3>
                      <button
                        type="button"
                        onClick={() => onNavigate('mentor')}
                        className="text-[10px] text-indigo-300 hover:text-white font-semibold"
                      >
                        Open Chat →
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex-shrink-0 text-[10px] font-bold text-emerald-400 flex items-center justify-center">
                          AI
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "Based on your project scope, I recommend structuring your backend with zero-trust tenancy rules early so your SRS documentation is defense-ready."
                        </p>
                      </div>

                      {roadmapStats.nextRecommendedTask && (
                        <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-800/60">
                          <p className="text-[11px] text-slate-400 truncate">
                            Next milestone task: <span className="text-white font-medium">{roadmapStats.nextRecommendedTask.title}</span>
                          </p>
                          {onAskMentorForTask && (
                            <button
                              type="button"
                              onClick={() => onAskMentorForTask(roadmapStats.nextRecommendedTask!.title)}
                              className="px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-colors flex-shrink-0"
                            >
                              Ask Mentor
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Navigation Action Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onNavigate('blueprint')}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                  >
                    <FileCode className="w-4 h-4 text-emerald-400 mb-1" />
                    <p className="text-xs font-semibold text-white">Blueprint</p>
                    <p className="text-[10px] text-slate-500">SRS & Architecture</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('roadmap')}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                  >
                    <Map className="w-4 h-4 text-cyan-400 mb-1" />
                    <p className="text-xs font-semibold text-white">Roadmap</p>
                    <p className="text-[10px] text-slate-500">Sprint Tracking</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('mentor')}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                  >
                    <Bot className="w-4 h-4 text-indigo-400 mb-1" />
                    <p className="text-xs font-semibold text-white">AI Mentor</p>
                    <p className="text-[10px] text-slate-500">Viva & Debugging</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('analyzer')}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
                  >
                    <Compass className="w-4 h-4 text-amber-400 mb-1" />
                    <p className="text-xs font-semibold text-white">Fit Analyzer</p>
                    <p className="text-[10px] text-slate-500">Feasibility Scores</p>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">No Active Capstone Selected Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Synthesize tailored project concepts aligned with your academic department, preferred technologies, and viva defense requirements.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('generator')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] inline-flex items-center space-x-2"
                >
                  <span>Synthesize Project Ideas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </section>

        {/* RIGHT COLUMN: Development Roadmap (3 cols) */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-[#1e293b]/40 border border-slate-800 rounded-2xl p-5 flex flex-col h-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Development Roadmap
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('roadmap')}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                View Full
              </button>
            </div>

            <div className="flex-1 space-y-4">
              {/* Phase 1 */}
              <div className="relative pl-6 border-l-2 border-emerald-500/30">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#020617]" />
                <p className="text-xs font-bold text-emerald-400">Phase 1: Foundation & Specs</p>
                <p className="text-[10px] text-slate-500">SRS Document & Architecture • Completed</p>
              </div>

              {/* Phase 2 */}
              <div className="relative pl-6 border-l-2 border-emerald-500/30">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#020617]" />
                <p className="text-xs font-bold text-white">Phase 2: Core ML / Backend Logic</p>
                <p className="text-[10px] text-slate-400">In Progress • APIs & Data Pipelines</p>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-slate-300">
                    <div className="w-3.5 h-3.5 rounded border border-emerald-500 flex items-center justify-center text-[8px] bg-emerald-500 text-slate-900 font-bold">
                      ✓
                    </div>
                    <span>Data Model & Entities</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-300">
                    <div className="w-3.5 h-3.5 rounded border border-slate-600 flex items-center justify-center text-[8px] text-slate-400">
                      •
                    </div>
                    <span>Gemini API Integration</span>
                  </div>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="relative pl-6 border-l-2 border-slate-800">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-800 rounded-full border-4 border-[#020617]" />
                <p className="text-xs font-bold text-slate-500">Phase 3: Client Experience & UI</p>
                <p className="text-[10px] text-slate-600">Pending Sprint 2</p>
              </div>

              {/* Phase 4 */}
              <div className="relative pl-6 border-l-2 border-slate-800">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-800 rounded-full border-4 border-[#020617]" />
                <p className="text-xs font-bold text-slate-600">Phase 4: Testing & Viva Defense</p>
                <p className="text-[10px] text-slate-700">Scheduled</p>
              </div>
            </div>

            {/* Total Progress Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-[10px] mb-2">
                <span className="text-slate-500 uppercase tracking-wider font-semibold">Total Progress</span>
                <span className="text-white font-bold">{roadmapStats.percentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                  style={{ width: `${roadmapStats.percentage}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-right">
                {roadmapStats.completedTasks} of {roadmapStats.totalTasks} tasks completed
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Bookmarked / Saved Project Ideas Section */}
      <div className="bg-[#1e293b]/40 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-2">
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved Project Proposals ({savedIdeas.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('generator')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            Explore More Ideas →
          </button>
        </div>

        {savedIdeas.length === 0 ? (
          <div className="p-6 rounded-xl border border-slate-800/80 bg-slate-900/40 text-center text-xs text-slate-500">
            No saved proposals yet. Use the bookmark icon on any idea card in the generator to save it here for comparison.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedIdeas.map(idea => (
              <div
                key={idea.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {idea.difficulty}
                    </span>
                    <span className="text-emerald-400 font-bold text-xs">
                      {idea.fitScores?.overallFit || 90}% Fit
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{idea.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {idea.shortDescription}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      selectProject(idea);
                      onNavigate('blueprint');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold focus:outline-none"
                  >
                    Select as Capstone
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      selectProject(idea);
                      onNavigate('analyzer');
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    Inspect Fit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
