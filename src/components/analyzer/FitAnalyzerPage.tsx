import { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ProjectIdea } from '../../types';
import { calculateProjectFit } from '../../utils/scoring';
import { apiService } from '../../services/api';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Brain,
  Clock,
  Briefcase,
  Layers,
  Award,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface FitAnalyzerPageProps {
  selectedProject?: ProjectIdea | null;
  onSelectActive?: (proj: ProjectIdea) => void;
  onGenerateBlueprint?: (proj: ProjectIdea) => void;
}

export function FitAnalyzerPage({ selectedProject, onSelectActive, onGenerateBlueprint }: FitAnalyzerPageProps) {
  const { profile, activeProject, savedIdeas, selectProject } = useProject();

  // Pick target project: priority order: prop > activeProject > first savedIdea > fallback demo project
  const candidateProjects = [
    ...(activeProject ? [activeProject] : []),
    ...savedIdeas.filter(i => i.id !== activeProject?.id),
  ];

  const [currentProject, setCurrentProject] = useState<ProjectIdea | null>(
    selectedProject || candidateProjects[0] || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAiAnalyzed, setIsAiAnalyzed] = useState(false);
  const [isCached, setIsCached] = useState(false);

  const handleRunAiAnalysis = async () => {
    if (!currentProject) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.analyzeFit(currentProject, profile);
      if (res.error) {
        setError(res.error);
      } else if (res.data?.fitScores) {
        const updated = {
          ...currentProject,
          fitScores: res.data.fitScores,
        };
        setCurrentProject(updated);
        setIsAiAnalyzed(true);
        setIsCached(Boolean(res.data.cached));
      }
    } catch {
      setError('Failed to analyze project fit with Gemini AI.');
    } finally {
      setLoading(false);
    }
  };

  const fitScores = currentProject
    ? currentProject.fitScores || calculateProjectFit(profile, currentProject)
    : null;

  const scoreMetrics = fitScores
    ? [
        {
          id: 'skillMatch',
          name: 'Skill Match',
          score: fitScores.skillMatch,
          explanation: fitScores.explanation.skillMatch,
          icon: Brain,
          color: 'from-blue-500 to-indigo-600',
          textColor: 'text-blue-400',
        },
        {
          id: 'feasibility',
          name: 'Academic Feasibility',
          score: fitScores.feasibility,
          explanation: fitScores.explanation.feasibility,
          icon: CheckCircle2,
          color: 'from-emerald-500 to-teal-600',
          textColor: 'text-emerald-400',
        },
        {
          id: 'innovation',
          name: 'Innovation & Evaluator Novelty',
          score: fitScores.innovation,
          explanation: fitScores.explanation.innovation,
          icon: TrendingUp,
          color: 'from-purple-500 to-pink-600',
          textColor: 'text-purple-400',
        },
        {
          id: 'careerRelevance',
          name: 'Career & Industry Relevance',
          score: fitScores.careerRelevance,
          explanation: fitScores.explanation.careerRelevance,
          icon: Briefcase,
          color: 'from-amber-500 to-orange-600',
          textColor: 'text-amber-400',
        },
        {
          id: 'timeSuitability',
          name: 'Timeline & Scope Suitability',
          score: fitScores.timeSuitability,
          explanation: fitScores.explanation.timeSuitability,
          icon: Clock,
          color: 'from-cyan-500 to-blue-600',
          textColor: 'text-cyan-400',
        },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-1">
        <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
          <Compass className="w-4 h-4" />
          <span>Explainable AI Evaluation Rubric</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Project Fit & Feasibility Analyzer
        </h1>
        <p className="text-xs text-slate-400">
          Every score is calculated deterministically against your academic profile ({profile.academicYear}, {profile.teamSize}, {profile.availableDuration}) with clear justifications.
        </p>
      </div>

      {/* Project Selector if multiple candidates available */}
      {candidateProjects.length > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-4 rounded-xl bg-[#1e293b]/40 border border-slate-800 shadow-xl backdrop-blur-sm">
          <label htmlFor="analyzer-select" className="text-xs font-semibold text-slate-300 flex-shrink-0">
            Select Project to Analyze:
          </label>
          <select
            id="analyzer-select"
            value={currentProject?.id || ''}
            onChange={e => {
              const found = candidateProjects.find(p => p.id === e.target.value);
              if (found) setCurrentProject(found);
            }}
            className="w-full sm:w-auto flex-1 px-3 py-2 bg-[#020617] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {candidateProjects.map(proj => (
              <option key={proj.id} value={proj.id}>
                {proj.title} ({proj.difficulty})
              </option>
            ))}
          </select>
        </div>
      )}

      {!currentProject ? (
        <div className="text-center py-16 p-6 rounded-2xl border border-dashed border-slate-800 space-y-4">
          <Compass className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-white">No Project Selected for Analysis</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Generate project ideas in the Idea Generator tab first or select one from your saved bookmarks to inspect its fit breakdown.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Overall Fit Hero Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#1e293b]/40 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                    Target Project
                  </span>
                  {isAiAnalyzed && (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold text-xs border border-purple-500/20">
                      Live Gemini AI Evaluated
                    </span>
                  )}
                  {isCached && (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-xs border border-cyan-500/20">
                      Cached Instant
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentProject.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {currentProject.shortDescription}
                </p>
              </div>

              {/* Big Score Dial */}
              <div className="flex items-center space-x-4 bg-[#020617] p-4 rounded-2xl border border-slate-800 flex-shrink-0 shadow-lg">
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">
                    {fitScores?.overallFit}%
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
                    Overall Fit Score
                  </div>
                </div>
              </div>

            </div>

            {/* Error banner if AI evaluation fails */}
            {error && (
              <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunAiAnalysis}
                  className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Overall Summary Box */}
            <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-400 block mb-1">Evaluator Synthesis:</strong>
              {fitScores?.explanation.overallSummary}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Evaluating with Gemini...' : 'Deep AI Fit Analysis'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  selectProject(currentProject);
                  if (onSelectActive) onSelectActive(currentProject);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm as Active Final-Year Project</span>
              </button>

              {onGenerateBlueprint && (
                <button
                  type="button"
                  onClick={() => onGenerateBlueprint(currentProject)}
                  className="px-4 py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <span>Proceed to Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              )}
            </div>
          </div>

          {/* Detailed Metric Cards with Explanations */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Multi-Dimensional Scoring Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scoreMetrics.map(m => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-[#1e293b]/40 border border-slate-800 shadow-xl space-y-3 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-xl bg-[#0f172a] border border-slate-800 ${m.textColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{m.name}</div>
                          <div className="text-[10px] text-slate-400">Academic & Industry Metric</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white">{m.score}%</div>
                    </div>

                    {/* Progress Bar (Accessible) */}
                    <div
                      role="progressbar"
                      aria-valuenow={m.score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${m.name} score`}
                      className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800"
                    >
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${m.color}`}
                        style={{ width: `${m.score}%` }}
                      />
                    </div>

                    {/* Justification Text */}
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {m.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
