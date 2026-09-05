import { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ProjectBlueprint, ProjectIdea } from '../../types';
import { apiService } from '../../services/api';
import { exportProjectAsMarkdown, downloadFile } from '../../utils/export';
import {
  FileCode,
  Download,
  RefreshCw,
  Database,
  Network,
  Shield,
  Layers,
  Cpu,
  TestTube,
  Rocket,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Server,
  Key,
} from 'lucide-react';

interface BlueprintPageProps {
  onNavigateToRoadmap?: () => void;
}

export function BlueprintPage({ onNavigateToRoadmap }: BlueprintPageProps) {
  const { activeProject, profile, blueprint, setBlueprint } = useProject();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'architecture' | 'database' | 'apis' | 'testing' | 'security'>('architecture');

  const fetchBlueprint = async (proj: ProjectIdea) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.generateBlueprint(proj, profile);
      if (res.error) {
        setError(res.error);
      } else if (res.data?.blueprint) {
        setBlueprint(res.data.blueprint);
      }
    } catch {
      setError('Failed to generate technical blueprint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeProject && !blueprint) {
      fetchBlueprint(activeProject);
    }
  }, [activeProject?.id]);

  const handleExportMarkdown = () => {
    if (!activeProject) return;
    const md = exportProjectAsMarkdown(activeProject, blueprint, null);
    downloadFile(`${activeProject.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_blueprint.md`, md, 'text/markdown');
  };

  const handleExportJson = () => {
    if (!blueprint) return;
    const jsonStr = JSON.stringify(blueprint, null, 2);
    downloadFile(`blueprint_${blueprint.projectId}.json`, jsonStr, 'application/json');
  };

  if (!activeProject) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <FileCode className="w-12 h-12 text-slate-400 mx-auto" />
        <h1 className="text-xl font-bold text-white">No Active Project Selected</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Please select a final-year project from the Idea Generator or Bookmarks first to generate its technical architecture blueprint.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header & Export Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            <FileCode className="w-4 h-4" />
            <span>Software Requirements & Architecture Specification</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Technical Project Blueprint: {activeProject.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Production-grade blueprint covering database schemas, REST APIs, AI orchestration, zero-trust security, and test plans.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => fetchBlueprint(activeProject)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            disabled={!blueprint}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold border border-emerald-400/30 text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
            title="Download formatted Markdown for capstone report"
          >
            <Download className="w-3.5 h-3.5 text-slate-900" />
            <span>Export Markdown</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            disabled={!blueprint}
            className="px-3 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
            title="Download raw JSON"
          >
            <span>JSON</span>
          </button>

          {onNavigateToRoadmap && (
            <button
              type="button"
              onClick={onNavigateToRoadmap}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-900 text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <span>View Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="p-12 text-center space-y-4" aria-live="polite" aria-busy="true">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-indigo-300">
            Synthesizing technical blueprint: system architecture, database entities, APIs, and security rules...
          </p>
        </div>
      )}

      {!loading && blueprint && (
        <div className="space-y-8">
          
          {/* Section Navigation Tabs */}
          <div className="flex space-x-2 border-b border-slate-800 overflow-x-auto pb-2">
            {[
              { id: 'architecture', label: 'Architecture & Overview', icon: Layers },
              { id: 'database', label: 'Database Design', icon: Database },
              { id: 'apis', label: 'API Specifications', icon: Server },
              { id: 'testing', label: 'Testing & QA', icon: TestTube },
              { id: 'security', label: 'Security & Deployment', icon: Shield },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isActive
                      ? 'bg-emerald-500 text-slate-900 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: System Architecture & Requirements */}
          {activeSection === 'architecture' && (
            <div className="space-y-6">
              
              {/* Executive Overview */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>System Overview & Proposed Solution</span>
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {blueprint.proposedSolution}
                </p>
                
                <div className="pt-2 border-t border-slate-800/80">
                  <strong className="text-xs font-semibold text-slate-300 block mb-1">Architecture Summary</strong>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {blueprint.systemArchitecture}
                  </p>
                </div>
              </div>

              {/* Functional & Non-Functional Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Functional */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Functional Requirements</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(blueprint.functionalRequirements || []).map((req, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Non-Functional */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>Non-Functional Requirements</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(blueprint.nonFunctionalRequirements || []).map((req, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* AI Integration Architecture */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-6 space-y-3">
                <h3 className="text-sm font-bold text-indigo-200 flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Google Gemini Integration & Model Orchestration</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {blueprint.aiIntegrationArchitecture}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: Database Design */}
          {activeSection === 'database' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Cloud Data Model & Entity Specifications</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Defines primary collections, document schemas, and field typing for Cloud Firestore / Cloud SQL.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(blueprint.databaseDesign || []).map(entity => (
                  <div
                    key={entity.name}
                    className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="font-mono text-xs font-bold text-indigo-300">
                        {entity.name}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Collection / Entity</span>
                    </div>
                    <p className="text-xs text-slate-400">{entity.description}</p>

                    <div className="space-y-1.5 pt-1">
                      {entity.fields.map(f => (
                        <div
                          key={f.name}
                          className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-950/50 border border-slate-800/60"
                        >
                          <span className="font-mono text-slate-200 text-[11px]">{f.name}</span>
                          <span className="text-slate-400 text-[10px]">{f.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: API Requirements */}
          {activeSection === 'apis' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-2">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>REST API Endpoint Specifications</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Backend API routes to be implemented in Express with input validation, authentication headers, and structured responses.
                </p>
              </div>

              <div className="space-y-3">
                {(blueprint.apiRequirements || []).map((api, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          api.method === 'GET'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {api.method}
                      </span>
                      <span className="font-mono text-slate-200 font-medium">{api.endpoint}</span>
                    </div>
                    <span className="text-slate-400">{api.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Testing & QA */}
          {activeSection === 'testing' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <TestTube className="w-4 h-4 text-emerald-400" />
                  <span>Testing Strategy & Automated Quality Gates</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Satisfying testing standards required by academic evaluators: unit, component, integration, security rules, and accessibility audits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(blueprint.testingStrategy || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 space-y-1"
                  >
                    <div className="font-semibold text-white">Strategy {idx + 1}</div>
                    <p className="text-slate-400 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Security & Deployment */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <span>Zero-Trust Security Considerations</span>
                </h2>
                <ul className="space-y-2 text-xs text-slate-300">
                  {(blueprint.securityConsiderations || []).map((sec, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deployment Plan */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Rocket className="w-4 h-4 text-indigo-400" />
                  <span>Production Cloud Deployment Plan</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {blueprint.deploymentPlan}
                </p>
              </div>

              {/* Future Scope */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
                <h3 className="text-sm font-bold text-white">Post-Evaluation Future Enhancements</h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                  {(blueprint.futureEnhancements || []).map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
