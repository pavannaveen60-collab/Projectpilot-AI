import { useState, useEffect, useRef, FormEvent } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { MentorMessage } from '../../types';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { resolveDisplayName } from '../../utils/user';
import {
  Bot,
  Send,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Code2,
  Layers,
  HelpCircle,
  Trash2,
} from 'lucide-react';

interface MentorPageProps {
  initialPrompt?: string | null;
}

export function MentorPage({ initialPrompt }: MentorPageProps) {
  const { currentUser } = useAuth();
  const { activeProject, profile, roadmap, roadmapStats } = useProject();
  const userId = currentUser?.uid || currentUser?.userId || 'guest_user';
  const projectId = activeProject?.id || 'default_project';

  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load saved chat history
  useEffect(() => {
    if (activeProject) {
      const saved = storageService.getMentorMessages(userId, projectId);
      if (saved && saved.length > 0) {
        setMessages(saved);
      } else {
        const studentGreetingName = resolveDisplayName(
          profile.name,
          profile.fullName,
          currentUser?.displayName,
          currentUser?.email
        ) || 'Student';

        // Initial welcoming message grounded in the student's project
        const welcomeMsg: MentorMessage = {
          id: 'msg_welcome',
          userId,
          projectId,
          role: 'assistant',
          content: `Hello ${studentGreetingName}! I am your ProjectPilot Technical Mentor for **${activeProject.title}**.

I have loaded your active project context:
- **Tech Stack**: ${(activeProject.recommendedTechStack.backend || []).join(', ')} + ${(activeProject.recommendedTechStack.frontend || []).join(', ')}
- **Roadmap Progress**: ${roadmapStats.percentage}% complete (${roadmapStats.completedTasks} tasks done)
- **Next Milestone**: ${roadmapStats.nextRecommendedTask?.title || 'Initial Architecture Review'}

How can I help you accelerate your development today? Choose a quick question below or paste your code/error directly!`,
          createdAt: new Date().toISOString(),
        };
        setMessages([welcomeMsg]);
        storageService.saveMentorMessages(userId, projectId, [welcomeMsg]);
      }
    }
  }, [projectId, userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle initial prompt passed from another tab (e.g. Roadmap task action)
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      handleSendMessage(`Can you give me step-by-step implementation guidance for this task: "${initialPrompt}"?`);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text || text.trim().length === 0 || loading) return;

    setError(null);
    setInputText('');

    const userMsg: MentorMessage = {
      id: `msg_u_${Date.now()}`,
      userId,
      projectId,
      role: 'user',
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    const completedTitles: string[] = [];
    roadmap?.phases.forEach(p => {
      p.tasks.forEach(t => {
        if (t.status === 'completed') completedTitles.push(t.title);
      });
    });

    try {
      const res = await apiService.sendMentorMessage(text, newHistory, {
        project: activeProject,
        profile,
        currentPhaseTitle: roadmap?.phases[0]?.title,
        completedTaskTitles: completedTitles,
        nextTaskTitle: roadmapStats.nextRecommendedTask?.title,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.data?.reply) {
        const assistantMsg: MentorMessage = {
          id: `msg_a_${Date.now()}`,
          userId,
          projectId,
          role: 'assistant',
          content: res.data.reply,
          createdAt: new Date().toISOString(),
        };
        const finalHistory = [...newHistory, assistantMsg];
        setMessages(finalHistory);
        storageService.saveMentorMessages(userId, projectId, finalHistory);
      }
    } catch {
      setError('Failed to reach AI mentor.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear all conversation history for this project?')) {
      setMessages([]);
      storageService.saveMentorMessages(userId, projectId, []);
    }
  };

  const quickPrompts = [
    'What should I build next based on my roadmap?',
    'How do I implement Authentication for my stack?',
    'My API is failing with a 400 error, help me debug.',
    'How do I explain this architecture in my final viva?',
  ];

  if (!activeProject) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <Bot className="w-12 h-12 text-slate-400 mx-auto" />
        <h1 className="text-xl font-bold text-white">No Active Project Selected</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Select a project in the Idea Generator tab to start an intelligent mentoring conversation grounded in your specific tech stack.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      
      {/* Immersive Outer Card */}
      <div className="bg-[#1e293b]/40 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col flex-1 overflow-hidden backdrop-blur-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-900 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)] font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Project-Aware AI Mentor</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Grounded Context
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Advising on <strong className="text-slate-200">{activeProject.title}</strong> • Stack: {activeProject.recommendedTechStack.backend?.[0] || 'Node.js'} + {activeProject.recommendedTechStack.frontend?.[0] || 'React'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg text-xs transition-colors focus:outline-none"
            title="Clear chat history"
            aria-label="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Prompt Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto py-3 border-b border-slate-800/80 flex-shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 whitespace-nowrap pl-1">Suggested:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="px-2.5 py-1 rounded-full bg-[#0f172a] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-emerald-500/30 text-xs whitespace-nowrap transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Error notification */}
        {error && (
          <div role="alert" className="p-3 my-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1" role="log" aria-live="polite" aria-label="Mentor conversation history">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-900'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    isUser
                      ? 'bg-emerald-500 text-slate-900 font-medium rounded-tr-none shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-[#0f172a] border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-[10px] text-right font-mono ${
                      isUser ? 'text-slate-800 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-900 flex items-center justify-center flex-shrink-0 font-bold">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-200" />
                <span className="pl-1 text-slate-400">Synthesizing stack-specific guidance...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-3 border-t border-slate-800 flex items-center space-x-2 flex-shrink-0"
        >
          <label htmlFor="mentor-input" className="sr-only">
            Ask your technical mentor a question
          </label>
          <input
            id="mentor-input"
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`Ask about ${activeProject.title}, debugging, APIs, or viva defense...`}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.25)] flex items-center space-x-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
