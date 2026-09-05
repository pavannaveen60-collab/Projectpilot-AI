import { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ProjectRoadmap, TaskStatus, RoadmapPhase } from '../../types';
import { apiService } from '../../services/api';
import { exportProjectAsMarkdown, downloadFile } from '../../utils/export';
import {
  Map,
  CheckCircle2,
  Clock,
  Circle,
  PlayCircle,
  RefreshCw,
  Download,
  Award,
  Calendar,
  AlertCircle,
  Bot,
} from 'lucide-react';

interface RoadmapPageProps {
  onAskMentorForTask?: (taskTitle: string) => void;
}

export function RoadmapPage({ onAskMentorForTask }: RoadmapPageProps) {
  const { activeProject, profile, roadmap, setRoadmap, updateTaskStatus, roadmapStats } = useProject();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<number | 'all'>('all');

  const fetchRoadmap = async () => {
    if (!activeProject) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.generateRoadmap(activeProject, profile);
      if (res.error) {
        setError(res.error);
      } else if (res.data?.roadmap) {
        setRoadmap(res.data.roadmap);
      }
    } catch {
      setError('Failed to generate project roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeProject && !roadmap) {
      fetchRoadmap();
    }
  }, [activeProject?.id]);

  const handleExportRoadmap = () => {
    if (!activeProject || !roadmap) return;
    const md = exportProjectAsMarkdown(activeProject, null, roadmap);
    downloadFile(`${activeProject.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_roadmap.md`, md, 'text/markdown');
  };

  if (!activeProject) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <Map className="w-12 h-12 text-slate-400 mx-auto" />
        <h1 className="text-xl font-bold text-white">No Active Project Selected</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Please select a final-year project from the Idea Generator to view or generate its 8-phase milestone roadmap.
        </p>
      </div>
    );
  }

  const phasesToRender = roadmap?.phases.filter(
    p => filterPhase === 'all' || p.phaseNumber === filterPhase
  ) || [];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header & Global Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            <Map className="w-4 h-4" />
            <span>8-Phase Milestone Tracker</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Development Roadmap: {activeProject.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track agile sprints from feasibility analysis to AI model orchestration and viva defense.
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            type="button"
            onClick={fetchRoadmap}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <button
            type="button"
            onClick={handleExportRoadmap}
            disabled={!roadmap}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold border border-emerald-400/30 text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-900" />
            <span>Export Roadmap</span>
          </button>
        </div>
      </div>

      {/* Progress Metric Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#1e293b]/40 shadow-xl space-y-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Overall Milestone Completion</div>
            <div className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <span className="text-emerald-400">{roadmapStats.percentage}% Completed</span>
              <span className="text-xs font-medium text-slate-400">
                ({roadmapStats.completedTasks} of {roadmapStats.totalTasks} tasks done)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{roadmapStats.completedTasks} Done</span>
            </div>
            <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
              <PlayCircle className="w-4 h-4" />
              <span>{roadmapStats.inProgressTasks} In Progress</span>
            </div>
          </div>
        </div>

        {/* Accessible Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={roadmapStats.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall roadmap completion"
          className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800"
        >
          <div
            className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-500"
            style={{ width: `${roadmapStats.percentage}%` }}
          />
        </div>

        {roadmapStats.nextRecommendedTask && (
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800/80 text-xs">
            <div className="text-slate-300">
              <strong className="text-emerald-300">Next Recommended Task: </strong>
              <span className="text-white font-medium">{roadmapStats.nextRecommendedTask.title}</span>
            </div>
            {onAskMentorForTask && (
              <button
                type="button"
                onClick={() => onAskMentorForTask(roadmapStats.nextRecommendedTask!.title)}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold focus:outline-none"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask AI Mentor How to Implement</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Phase Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          type="button"
          onClick={() => setFilterPhase('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            filterPhase === 'all'
              ? 'bg-emerald-500 text-slate-900 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All 8 Phases
        </button>
        {roadmap?.phases.map(p => (
          <button
            key={p.phaseNumber}
            type="button"
            onClick={() => setFilterPhase(p.phaseNumber)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterPhase === p.phaseNumber
                ? 'bg-emerald-500 text-slate-900 font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Phase {p.phaseNumber}
          </button>
        ))}
      </div>

      {loading && (
        <div className="p-12 text-center text-xs text-indigo-300 animate-pulse">
          Synthesizing customized 8-phase roadmap with duration estimates and task prerequisites...
        </div>
      )}

      {/* Phases & Tasks List */}
      {!loading && (
        <div className="space-y-6">
          {phasesToRender.map(phase => {
            const completedCount = phase.tasks.filter(t => t.status === 'completed').length;
            const isPhaseDone = completedCount === phase.tasks.length && phase.tasks.length > 0;

            return (
              <section
                key={phase.id || phase.phaseNumber}
                className={`rounded-2xl border transition-colors p-6 space-y-4 shadow-xl ${
                  isPhaseDone
                    ? 'border-emerald-500/40 bg-[#1e293b]/50'
                    : 'border-slate-800 bg-[#1e293b]/40 backdrop-blur-sm'
                }`}
              >
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        Phase {phase.phaseNumber}
                      </span>
                      <span className="text-xs text-slate-400">• {phase.estimatedDuration}</span>
                      {isPhaseDone && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          Phase Complete
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-white">{phase.title}</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">{phase.objective}</p>
                  </div>

                  <div className="text-xs font-semibold text-slate-400 flex-shrink-0">
                    {completedCount} / {phase.tasks.length} Completed
                  </div>
                </div>

                {/* Expected Output */}
                <div className="p-3 rounded-xl bg-[#0f172a] border border-slate-800/80 text-xs text-slate-300">
                  <strong className="text-emerald-400">Expected Output: </strong>
                  <span>{phase.expectedOutput}</span>
                </div>

                {/* Tasks List */}
                <div className="space-y-2.5 pt-1">
                  {phase.tasks.map(task => {
                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                          task.status === 'completed'
                            ? 'bg-[#0f172a]/70 border-emerald-500/20 text-slate-400'
                            : task.status === 'in-progress'
                            ? 'bg-[#0f172a] border-cyan-500/30 text-slate-200 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                            : 'bg-[#0f172a] border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                              {task.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({task.estimatedHours} hrs)
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Status Toggle & Mentor Action */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {onAskMentorForTask && (
                            <button
                              type="button"
                              onClick={() => onAskMentorForTask(task.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                              title="Ask AI Mentor for advice on this task"
                              aria-label={`Ask AI Mentor for advice on ${task.title}`}
                            >
                              <Bot className="w-4 h-4" />
                            </button>
                          )}

                          <select
                            value={task.status}
                            onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold focus:outline-none focus:ring-1 ${
                              task.status === 'completed'
                                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                                : task.status === 'in-progress'
                                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                                : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                            aria-label={`Status for task ${task.title}`}
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </section>
            );
          })}
        </div>
      )}

    </div>
  );
}
