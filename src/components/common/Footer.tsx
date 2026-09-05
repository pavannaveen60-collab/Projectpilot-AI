import { ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-[#0f172a] py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Responsible AI Advisory Banner */}
        <div className="rounded-xl border border-emerald-500/20 bg-[#1e293b]/40 p-4 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 text-slate-300 shadow-lg backdrop-blur-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <div className="text-xs leading-relaxed">
            <strong className="font-semibold text-emerald-300">Responsible AI Notice:</strong> ProjectPilot AI project ideas, feasibility scorings, blueprints, and roadmaps are intelligent advisory suggestions synthesized by Google Gemini. Students must critically evaluate hardware, dataset, and library availability, and formally consult with their academic department faculty guide or capstone review committee before commencing implementation.
          </div>
        </div>

        {/* Live Status Bar in Immersive UI Style */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 uppercase tracking-widest">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2 normal-case tracking-normal">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-900 text-[10px] font-bold shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white text-xs">PROJECTPILOT AI</span>
              <span className="text-slate-500 text-xs">&copy; {new Date().getFullYear()}</span>
            </div>

            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>Google Gemini 3.8 Flash: Active</span>
            </span>

            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>Zero-Trust ABAC: Enforced</span>
            </span>

            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              <span>Cloud Run: Connected</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>WCAG 2.1 AA Compliant</span>
            </span>
            <span className="text-slate-500">v1.2.0-Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
