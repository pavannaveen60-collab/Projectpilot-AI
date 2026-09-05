import { useState, FormEvent } from 'react';
import { useProject } from '../../context/ProjectContext';
import { FeasibilityValidationResult } from '../../types';
import { apiService } from '../../services/api';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Target,
  Layers,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

export function ValidatorPage() {
  const { profile, activeProject } = useProject();

  const [title, setTitle] = useState(activeProject?.title || 'AI Medical Imaging & EHR Triage Platform');
  const [description, setDescription] = useState(
    activeProject?.problemStatement ||
      'Build an end-to-end hospital imaging system with real-time multi-node DICOM processing, deep learning segmentation, patient mobile app, blockchain audit logs, and multilingual audio triage.'
  );
  const [featuresInput, setFeaturesInput] = useState(
    'DICOM image parser, U-Net tumor segmentation, Patient mobile app, Doctor web portal, Blockchain audit trail, Multilingual voice bot, Real-time telemetry, SMS appointment notifications'
  );
  const [duration, setDuration] = useState(profile.availableDuration || '4 Months (Single Semester)');
  const [teamSize, setTeamSize] = useState(profile.teamSize || 'Solo (1 Student)');
  const [studentSkills, setStudentSkills] = useState(profile.technicalSkills.join(', '));

  const [validation, setValidation] = useState<FeasibilityValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    const featureList = featuresInput
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    try {
      const res = await apiService.validateFeasibility({
        title,
        description,
        features: featureList,
        duration,
        teamSize,
        studentSkills,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.data?.validation) {
        setValidation(res.data.validation);
      }
    } catch {
      setError('Failed to validate project feasibility.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-1">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Feasibility & MVP Scoping Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Project Feasibility Validator
        </h1>
        <p className="text-xs text-slate-400">
          Evaluates whether your proposal is achievable within your academic timeframe and team size. If over-scoped, Gemini automatically extracts an essential MVP.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleValidate} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="val-title" className="block text-xs font-semibold text-slate-300">
              Project Title
            </label>
            <input
              id="val-title"
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="val-desc" className="block text-xs font-medium text-slate-300">
              Project Summary & Scope
            </label>
            <textarea
              id="val-desc"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="val-features" className="block text-xs font-medium text-slate-300">
              Proposed Features (comma-separated)
            </label>
            <input
              id="val-features"
              type="text"
              value={featuresInput}
              onChange={e => setFeaturesInput(e.target.value)}
              placeholder="Authentication, OCR Ingestion, AI Diagnosis, Push Notifications, Mobile App"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="val-duration" className="block text-xs font-medium text-slate-300">
              Available Duration
            </label>
            <select
              id="val-duration"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="3 Months (Fast-Track)">3 Months (Fast-Track)</option>
              <option value="4 Months (Single Semester)">4 Months (Single Semester)</option>
              <option value="6 Months (Academic Year)">6 Months (Academic Year)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="val-team" className="block text-xs font-medium text-slate-300">
              Team Size
            </label>
            <select
              id="val-team"
              value={teamSize}
              onChange={e => setTeamSize(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Solo (1 Student)">Solo (1 Student)</option>
              <option value="Pair (2 Students)">Pair (2 Students)</option>
              <option value="Small Team (3-4 Students)">Small Team (3-4 Students)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
          >
            <CheckCircle2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating Feasibility...' : 'Validate Feasibility & Scope'}</span>
          </button>
        </div>
      </form>

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Validation Results */}
      {validation && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Verdict Hero Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400">Verdict for: {validation.projectTitle}</span>
                <h2 className="text-lg font-bold text-white">{validation.scopeAssessment}</h2>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    validation.isAchievableInTime
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  }`}
                >
                  {validation.isAchievableInTime ? 'Achievable in Time' : 'Time Risk Detected'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {validation.overallVerdict}
            </p>

            {/* 4 Quick Criteria Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center">
                <div className="text-[11px] text-slate-400">Realistic</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5">
                  {validation.isRealistic ? 'Yes' : 'Unrealistic'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center">
                <div className="text-[11px] text-slate-400">Final-Year Suitable</div>
                <div className="text-xs font-bold text-indigo-400 mt-0.5">
                  {validation.isSuitableForFinalYear ? 'Yes' : 'Too Basic'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center">
                <div className="text-[11px] text-slate-400">Matches Skills</div>
                <div className="text-xs font-bold text-blue-400 mt-0.5">
                  {validation.matchesSkills ? 'Aligned' : 'Gap Warning'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center">
                <div className="text-[11px] text-slate-400">Target Timeline</div>
                <div className="text-xs font-bold text-amber-400 mt-0.5">
                  {validation.suggestedTimelineMonths} Months
                </div>
              </div>
            </div>
          </div>

          {/* MVP Partition Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Recommended MVP */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-6 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Zap className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Recommended MVP Scope (Must Build for Defense)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Prioritize these critical features for your mid-term evaluation and final viva:
              </p>

              <ul className="space-y-2 text-xs text-slate-200">
                {validation.recommendedMvpFeatures.map((f, i) => (
                  <li key={i} className="flex items-start space-x-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Future Scope */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-center space-x-2 text-blue-400">
                <Layers className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Future Scope (Optional Post-Evaluation)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Move these features to your "Future Enhancements" slide so you do not risk deadline failure:
              </p>

              <ul className="space-y-2 text-xs text-slate-300">
                {validation.futureScopeFeatures.map((f, i) => (
                  <li key={i} className="flex items-start space-x-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Risk Mitigation Box */}
          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>Evaluator Advisory: Risk Mitigation Strategies</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {validation.riskMitigationStrategies.map((risk, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold mt-0.5">→</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}

    </div>
  );
}
