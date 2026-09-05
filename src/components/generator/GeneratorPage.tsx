import { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ProjectIdea } from '../../types';
import { apiService } from '../../services/api';
import {
  Sparkles,
  RefreshCw,
  Compass,
  FileCode,
  Bookmark,
  Check,
  Cpu,
  Layers,
  Clock,
  Briefcase,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
} from 'lucide-react';

interface GeneratorPageProps {
  onSelectProject: (project: ProjectIdea) => void;
  onViewAnalyzer: (project: ProjectIdea) => void;
  onViewBlueprint: (project: ProjectIdea) => void;
  onNavigateToProfile?: () => void;
}

export function GeneratorPage({ onSelectProject, onViewAnalyzer, onViewBlueprint, onNavigateToProfile }: GeneratorPageProps) {
  const {
    profile,
    activeProject,
    selectProject,
    savedIdeas,
    saveIdea,
    removeIdea,
    profileCompletion,
    canGenerateIdeas,
    loadDemoProfile,
  } = useProject();

  const [projects, setProjects] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const fetchProjects = async () => {
    if (!canGenerateIdeas) {
      setError('Please complete the required profile fields before generating projects.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiService.generateProjects(profile);
      if (res.error) {
        setError(res.error);
      } else if (res.data?.projects) {
        setProjects(res.data.projects);
        setIsCached(Boolean(res.data.cached));
        setIsFallback(Boolean(res.data.fallback));
        if (res.data.projects.length > 0) {
          setExpandedId(res.data.projects[0].id);
        }
      }
    } catch {
      setError('An error occurred while generating project ideas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Generate initial ideas on mount if profile is complete and projects list is empty
    if (canGenerateIdeas && projects.length === 0) {
      fetchProjects();
    }
  }, [canGenerateIdeas]);

  const isSaved = (id: string) => savedIdeas.some(i => i.id === id);

  const toggleSave = (proj: ProjectIdea) => {
    if (isSaved(proj.id)) {
      removeIdea(proj.id);
    } else {
      saveIdea(proj);
    }
  };

  const handleSelectActive = (proj: ProjectIdea) => {
    selectProject(proj);
    onSelectProject(proj);
  };

  // Profile completion guard screen
  if (!canGenerateIdeas) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="p-8 bg-[#0f172a]/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Student Profile Required</h2>
            <p className="text-sm text-slate-300">
              ProjectPilot AI needs your real academic standing, languages, and career goals to synthesize realistic, evaluable capstone projects with Google Gemini.
            </p>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 max-w-md mx-auto text-left text-xs text-slate-300 space-y-2">
            <div className="flex justify-between font-semibold text-slate-200">
              <span>Profile Progress:</span>
              <span className="text-amber-400">{profileCompletion.percentage}%</span>
            </div>
            <div className="text-amber-300">
              <strong>Missing required fields:</strong> {profileCompletion.missingRequired.join(', ')}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onNavigateToProfile && (
              <button
                type="button"
                onClick={onNavigateToProfile}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
              >
                Set Up Your Student Profile
              </button>
            )}
            <button
              type="button"
              onClick={loadDemoProfile}
              className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 transition-colors"
            >
              Load Sample Demo Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      
      {/* Top Banner & Generation Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Curated for {profile.name || 'Student'} ({profile.degree ? profile.degree.split(' ')[0] : 'Degree'})
            </span>
            {profile.isDemoProfile && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ⚠️ Demo Profile
              </span>
            )}
            {isCached && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Cached Instant
              </span>
            )}
            {isFallback && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Verified Fallback Matrix
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center space-x-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>AI Project Idea Generator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personalized capstone proposals synthesized by Google Gemini, tailored to your technical skills and timeline.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProjects}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Synthesizing Ideas...' : 'Regenerate Ideas'}</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchProjects}
            className="underline hover:text-rose-300 font-semibold text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4" aria-live="polite" aria-busy="true">
          <div className="p-4 text-center text-xs text-indigo-300 animate-pulse">
            Analyzing student competencies ({profile.technicalSkills.join(', ')}) & running Gemini reasoning pipeline...
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse space-y-4">
              <div className="h-6 bg-slate-800 rounded w-2/3" />
              <div className="h-4 bg-slate-800/60 rounded w-full" />
              <div className="h-4 bg-slate-800/60 rounded w-4/5" />
              <div className="flex space-x-2 pt-2">
                <div className="h-8 bg-slate-800 rounded w-28" />
                <div className="h-8 bg-slate-800 rounded w-28" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Idea Cards */}
      {!loading && (
        <div className="space-y-6">
          {projects.map(project => {
            const isExpanded = expandedId === project.id;
            const isActive = activeProject?.id === project.id;
            const overallFit = project.fitScores?.overallFit || 90;

            return (
              <article
                key={project.id}
                className={`rounded-2xl border transition-all ${
                  isActive
                    ? 'border-emerald-500/50 bg-[#1e293b]/70 shadow-[0_0_25px_rgba(16,185,129,0.12)]'
                    : 'border-slate-800 bg-[#1e293b]/40 hover:border-slate-700 shadow-xl'
                } p-6 space-y-6`}
              >
                {/* Card Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
                        {project.difficulty}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{project.estimatedDuration}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 flex items-center space-x-1">
                        <Award className="w-3 h-3 text-emerald-400" />
                        <span>{overallFit}% Fit Score</span>
                      </span>
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-900 font-bold text-[11px] shadow-sm">
                          Active Capstone
                        </span>
                      )}
                    </div>

                    {/* Title & Short Description */}
                    <h2 className="text-xl font-bold text-white tracking-tight pt-1">
                      {project.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {project.shortDescription}
                    </p>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center space-x-2 flex-shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => toggleSave(project)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isSaved(project.id)
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={isSaved(project.id) ? 'Remove bookmark' : 'Bookmark this idea'}
                      aria-label={isSaved(project.id) ? 'Remove bookmark' : 'Bookmark this idea'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectActive(project)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        isActive
                          ? 'bg-emerald-500 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Select as Capstone</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Problem Statement & Real-World Use Case */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2 md:space-y-0">
                  <div className="space-y-1">
                    <strong className="font-semibold text-rose-300 block">Problem Statement</strong>
                    <p className="text-slate-400 leading-relaxed">{project.problemStatement}</p>
                  </div>
                  <div className="space-y-1 md:border-l md:border-slate-800/80 md:pl-4">
                    <strong className="font-semibold text-indigo-300 block">Real-World Use Case</strong>
                    <p className="text-slate-400 leading-relaxed">{project.realWorldUseCase}</p>
                  </div>
                </div>

                {/* AI Component Highlight */}
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-start space-x-3 text-xs">
                  <Cpu className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-indigo-200">Intelligent AI Component: </strong>
                    <span className="text-slate-300">{project.aiComponent}</span>
                  </div>
                </div>

                {/* Core Features List */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Core Features</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {project.coreFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/70 text-xs text-slate-300 flex items-start space-x-2"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack Pills */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Recommended Tech Stack</div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {(project.recommendedTechStack.frontend || []).map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-blue-950/40 border border-blue-800/40 text-blue-300">
                        Frontend: {t}
                      </span>
                    ))}
                    {(project.recommendedTechStack.backend || []).map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                        Backend: {t}
                      </span>
                    ))}
                    {(project.recommendedTechStack.database || []).map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-800/40 text-amber-300">
                        Database: {t}
                      </span>
                    ))}
                    {(project.recommendedTechStack.aiOrMl || []).map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-purple-950/40 border border-purple-800/40 text-purple-300">
                        AI: {t}
                      </span>
                    ))}
                    {(project.recommendedTechStack.cloudOrDevOps || []).map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-800/40 text-cyan-300">
                        Cloud: {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Collapsible Deep Details (Skills, Challenges, Future Scope) */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-800 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Skills match */}
                      <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                        <strong className="text-slate-300 block">Required Skills (You Know)</strong>
                        <div className="flex flex-wrap gap-1.5">
                          {project.requiredSkills.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]">
                              {s}
                            </span>
                          ))}
                        </div>
                        <strong className="text-slate-300 block pt-2">Skills You Will Learn</strong>
                        <div className="flex flex-wrap gap-1.5">
                          {project.skillsToLearn.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Evaluator Viva Edge */}
                      <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2">
                        <strong className="text-slate-300 block">Innovation & Evaluator Viva Edge</strong>
                        <p className="text-slate-400 leading-relaxed">{project.innovationFactor}</p>
                        <strong className="text-slate-300 block pt-1">Career Relevance</strong>
                        <p className="text-slate-400 leading-relaxed">{project.careerRelevance}</p>
                      </div>

                    </div>

                    {/* Challenges & Future Scope */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                        <strong className="text-amber-400 block mb-1">Potential Technical Challenges</strong>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                          {project.potentialChallenges.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                        <strong className="text-blue-400 block mb-1">Future Scope Post-Graduation</strong>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                          {project.futureScope.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Bar with Deep View Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : project.id)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors focus:outline-none"
                  >
                    <span>{isExpanded ? 'Collapse Details' : 'Expand Full Specification'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => onViewAnalyzer(project)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    >
                      <Compass className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Inspect Fit Scores</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onViewBlueprint(project)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    >
                      <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Generate Blueprint</span>
                    </button>
                  </div>
                </div>

              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}
