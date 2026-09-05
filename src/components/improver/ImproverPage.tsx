import { useState, FormEvent } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ProjectImprovementAnalysis, ProjectIdea } from '../../types';
import { apiService } from '../../services/api';
import {
  Wand2,
  AlertTriangle,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
  Layout,
  Layers,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface ImproverPageProps {
  onAdoptImprovedProject?: (project: ProjectIdea) => void;
}

export function ImproverPage({ onAdoptImprovedProject }: ImproverPageProps) {
  const { profile, selectProject } = useProject();

  const [ideaInput, setIdeaInput] = useState('An online patient appointment and hospital record management system');
  const [domainInput, setDomainInput] = useState('Healthcare & Hospital Administration');
  const [skillsInput, setSkillsInput] = useState(profile.technicalSkills.join(', '));
  const [analysis, setAnalysis] = useState<ProjectImprovementAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!ideaInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiService.improveProject(ideaInput, domainInput, skillsInput);
      if (res.error) {
        setError(res.error);
      } else if (res.data?.analysis) {
        setAnalysis(res.data.analysis);
      }
    } catch {
      setError('Failed to analyze and improve project idea.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = () => {
    if (!analysis) return;
    const imp = analysis.improvedProject;
    const convertedProject: ProjectIdea = {
      id: `proj_improved_${Date.now()}`,
      title: imp.title,
      shortDescription: imp.elevatedProblemStatement.slice(0, 160) + '...',
      problemStatement: imp.elevatedProblemStatement,
      targetUsers: ['Final-Year Students', 'Enterprise Operators', 'Domain Specialists'],
      realWorldUseCase: imp.novelAiHook,
      coreFeatures: imp.upgradedFeatures,
      recommendedTechStack: imp.modernTechStack,
      aiComponent: imp.novelAiHook,
      requiredSkills: profile.technicalSkills,
      skillsToLearn: ['Zero-Trust ABAC', 'Model Grounding', 'Cloud Orchestration'],
      estimatedDuration: profile.availableDuration || '6 Months',
      difficulty: 'Intermediate',
      innovationFactor: imp.novelAiHook,
      careerRelevance: imp.industryReadinessFactor,
      potentialChallenges: ['Data compliance masking', 'Zero-trust authorization'],
      futureScope: ['Microservices decomposition', 'Native mobile application'],
      fitScores: {
        skillMatch: 92,
        feasibility: 89,
        innovation: 94,
        careerRelevance: 95,
        timeSuitability: 90,
        overallFit: 93,
        explanation: {
          skillMatch: 'Built directly upon your declared technical skills with clear AI enhancement.',
          feasibility: 'Engineered as a modular capstone achievable within an academic semester.',
          innovation: 'Solves real-world bottlenecks instead of basic CRUD operations.',
          careerRelevance: 'Industry readiness factor provides exceptional interview demonstration.',
          timeSuitability: 'Fits comfortably into your available project duration.',
          overallSummary: 'Transformed into an enterprise-ready, defensible capstone project.',
        },
      },
    };

    selectProject(convertedProject);
    if (onAdoptImprovedProject) {
      onAdoptImprovedProject(convertedProject);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-1">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <Wand2 className="w-4 h-4" />
          <span>Capstone Modernization Engine</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Project Idea Improver & Modernizer
        </h1>
        <p className="text-xs text-slate-400">
          Already have a basic idea or faculty proposal? Let Gemini analyze weaknesses, missing features, security loopholes, and elevate it into a hackathon-winning capstone.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="space-y-1">
          <label htmlFor="improver-idea" className="block text-xs font-semibold text-slate-300">
            Describe Your Current Project Idea or College Proposal
          </label>
          <textarea
            id="improver-idea"
            rows={3}
            required
            value={ideaInput}
            onChange={e => setIdeaInput(e.target.value)}
            placeholder="e.g. Student attendance system using face recognition / Online food ordering website..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="improver-domain" className="block text-xs font-medium text-slate-300">
              Domain / Application Area
            </label>
            <input
              id="improver-domain"
              type="text"
              value={domainInput}
              onChange={e => setDomainInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="improver-skills" className="block text-xs font-medium text-slate-300">
              Your Primary Skills
            </label>
            <input
              id="improver-skills"
              type="text"
              value={skillsInput}
              onChange={e => setSkillsInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading || !ideaInput.trim()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
          >
            <Wand2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing & Elevating Idea...' : 'Analyze & Modernize Idea'}</span>
          </button>
        </div>
      </form>

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Comparison Cards: Current vs Improved */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Current Concept */}
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-xs uppercase font-bold text-rose-400 tracking-wider">
                  Original Proposal
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Basic Prototype
                </span>
              </div>
              <h2 className="text-sm font-bold text-white">{analysis.originalIdea}</h2>

              {/* Weaknesses */}
              <div className="space-y-2 pt-2">
                <strong className="text-xs font-semibold text-rose-300 block">Identified Weaknesses:</strong>
                <ul className="space-y-1 text-xs text-slate-400">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-rose-400">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Features */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <strong className="text-xs font-semibold text-amber-300 block">Missing Features:</strong>
                <ul className="space-y-1 text-xs text-slate-400">
                  {analysis.missingFeatures.map((m, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-amber-400">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Elevated Production Project */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/40 space-y-4 shadow-lg shadow-indigo-950/50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                  AI-Elevated Capstone
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  Industry Grade
                </span>
              </div>

              <h2 className="text-base font-bold text-white">{analysis.improvedProject.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {analysis.improvedProject.elevatedProblemStatement}
              </p>

              {/* Novel AI Hook */}
              <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-800/60 text-xs text-indigo-200">
                <strong className="font-semibold block mb-1">Novel AI Differentiator:</strong>
                {analysis.improvedProject.novelAiHook}
              </div>

              {/* Upgraded Features */}
              <div className="space-y-2 pt-1">
                <strong className="text-xs font-semibold text-white block">Upgraded Core Features:</strong>
                <ul className="space-y-1 text-xs text-slate-300">
                  {analysis.improvedProject.upgradedFeatures.map((f, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Adopt Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAdopt}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Adopt This Elevated Project as My Capstone</span>
                </button>
              </div>

            </div>

          </div>

          {/* Deep Dimension Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* AI Opportunities */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AI Opportunities</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                {analysis.aiOpportunities.map((o, i) => (
                  <li key={i}>• {o}</li>
                ))}
              </ul>
            </div>

            {/* Security Improvements */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-rose-400 font-bold">
                <Shield className="w-4 h-4" />
                <span>Security Hardening</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                {analysis.securityImprovements.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>

            {/* Scalability Improvements */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-blue-400 font-bold">
                <Layers className="w-4 h-4" />
                <span>Cloud & Scalability</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                {analysis.scalabilityImprovements.map((sc, i) => (
                  <li key={i}>• {sc}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
