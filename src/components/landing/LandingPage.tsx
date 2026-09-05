import {
  Sparkles,
  ArrowRight,
  Compass,
  FileCode,
  Map,
  Bot,
  Wand2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  GraduationCap,
  Layers,
  Cpu,
  Terminal,
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onSelectTab: (tab: string) => void;
}

export function LandingPage({ onStart, onSelectTab }: LandingPageProps) {
  const workflowSteps = [
    { step: '01', title: 'Student Profile', desc: 'Specify your academic branch, mastered skills, team size, timeline, and career aspirations.' },
    { step: '02', title: 'Skill & Fit Analysis', desc: 'Gemini analyzes your strengths to avoid projects either too trivial or out-of-scope.' },
    { step: '03', title: 'Personalized Ideas', desc: 'Receive 3–4 tailored, non-generic capstone proposals with dedicated AI components.' },
    { step: '04', title: 'Fit Evaluation', desc: 'Inspect explainable scores: Skill Match, Feasibility, Innovation, Career Relevance, and Time Suitability.' },
    { step: '05', title: 'Project Blueprint', desc: 'Generate system architecture, database schemas, REST APIs, and security specifications.' },
    { step: '06', title: 'Development Roadmap', desc: 'Follow an 8-phase milestone breakdown with task status tracking and progress metrics.' },
    { step: '07', title: 'Project-Aware Mentor', desc: 'Ask guidance to an AI mentor grounded in your specific tech stack and active tasks.' },
    { step: '08', title: 'Project Improver & MVP', desc: 'Turn vague ideas into robust projects and prune excessive scope into achievable MVPs.' },
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'Contextual AI Generation',
      desc: 'No generic calculators or basic todo lists. Every generated idea is grounded in real-world problems with practical AI components.',
    },
    {
      icon: Compass,
      title: 'Explainable Fit Scoring',
      desc: 'Understand exactly why a project fits your timeline and skills with clear percentage breakdowns and rationale.',
    },
    {
      icon: FileCode,
      title: 'Comprehensive Technical Blueprints',
      desc: 'From entity-relationship database design to non-functional requirements and deployment plans on Google Cloud Run.',
    },
    {
      icon: Map,
      title: '8-Phase Milestone Roadmap',
      desc: 'Track tasks from requirements and UI through database, AI integration, testing, and final viva presentation prep.',
    },
    {
      icon: Bot,
      title: 'Stack-Aware AI Mentor',
      desc: 'The mentor knows your completed tasks, active phase, and chosen framework, providing targeted code snippets and debugging advice.',
    },
    {
      icon: Wand2,
      title: 'Idea Improver & Scope Validator',
      desc: 'Refine your existing ideas with security audits, UX enhancements, and automated MVP scoping.',
    },
  ];

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Powered by Google Gemini 3.8 Flash & Google Cloud</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            From Blank Screen to{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Award-Winning Capstone
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            ProjectPilot AI is the end-to-end intelligent copilot for final-year engineering students. Generate tailored project ideas, technical blueprints, and agile roadmaps with a project-aware AI mentor.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <span>Generate My Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('improver')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-700"
            >
              Improve Existing Idea
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-left border-t border-slate-800/80 max-w-4xl mx-auto">
            <div className="p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Target Audience</div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">Final-Year Students</div>
            </div>
            <div className="p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Core AI Engine</div>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">Google Gemini API</div>
            </div>
            <div className="p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Security Standard</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">Zero-Trust ABAC Rules</div>
            </div>
            <div className="p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Accessibility</div>
              <div className="text-sm font-bold text-teal-300 mt-0.5">WCAG 2.1 AA Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Student Problem Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="rounded-2xl border border-slate-800 bg-[#1e293b]/40 p-8 sm:p-10 space-y-8 shadow-xl">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The Final-Year Dilemma: Why 78% of Students Struggle
            </h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Choosing and building a capstone project is the most critical milestone before graduation, yet students face severe bottlenecks:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/20">
                01
              </div>
              <h3 className="text-base font-semibold text-white">Generic & Overdone Topics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluators reject repetitive CRUD clones (e-commerce, hospital management, weather apps). Students lack access to modern problem statements with real-world AI utility.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
                02
              </div>
              <h3 className="text-base font-semibold text-white">Scope & Feasibility Mismatch</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Many students pick ambitious research papers that cannot be executed in 4 months with a 2-person team, leading to last-minute panic or incomplete submissions.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/20">
                03
              </div>
              <h3 className="text-base font-semibold text-white">Lack of Contextual Guidance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generic chatbots do not know what tasks the student has finished, what database was chosen, or what the professor expects for the mid-term milestone review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Complete Workflow Section */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider">The Complete Pipeline</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How ProjectPilot AI Drives Your Capstone
          </h2>
          <p className="text-sm text-slate-400">
            A deeply integrated engineering workflow designed to turn ideas into defensible production applications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map(item => (
            <div
              key={item.step}
              className="p-5 rounded-xl bg-[#1e293b]/40 border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-2 relative shadow-lg"
            >
              <div className="text-xs font-mono font-bold text-emerald-400">{item.step}</div>
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Capabilities</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for Academic & Technical Rigor
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#1e293b]/40 border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-3 shadow-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Google Gemini Integration Spotlight */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#1e293b]/80 via-slate-900 to-[#0f172a] p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="flex items-center space-x-3 text-emerald-400">
            <Cpu className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider">Meaningful Google Technology Usage</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Powered by Google Gemini 3.8 Flash via Secure Backend Proxy
          </h2>

          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            ProjectPilot AI adheres strictly to industry security best practices: Gemini API keys are never exposed to browser bundles. All requests are routed through authenticated server endpoints with strict input sanitization, in-memory request caching, and structured schema parsing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold text-cyan-300">Structured Response Schemas</div>
              <div className="text-xs text-slate-400 mt-1">
                Enforces Type.OBJECT and Type.ARRAY constraints, preventing malformed UI outputs.
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold text-emerald-300">SHA256 Result Caching</div>
              <div className="text-xs text-slate-400 mt-1">
                Caches identical student queries in memory, slashing latency and unnecessary token expenditure.
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-semibold text-teal-300">Zero-Trust Firestore ABAC</div>
              <div className="text-xs text-slate-400 mt-1">
                Data security rules validate user tenancy and prevent unauthorized document modifications.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6 pt-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Ready to Define Your Final-Year Project?
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Start with your academic profile and let ProjectPilot AI generate personalized, high-scoring project proposals.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.3)] inline-flex items-center space-x-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <span>Generate My Project</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
}
