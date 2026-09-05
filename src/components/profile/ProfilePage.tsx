import { useState, useEffect, FormEvent, useId } from 'react';
import { useProject } from '../../context/ProjectContext';
import { StudentProfile } from '../../types';
import { validateStudentProfile } from '../../utils/validator';
import {
  User,
  GraduationCap,
  Code2,
  Cpu,
  Layers,
  Clock,
  Users,
  Target,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Plus,
  X,
  Compass,
  Briefcase,
  Sliders,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface ProfilePageProps {
  onProfileSaved?: () => void;
  onNavigateToGenerator?: () => void;
}

// Preset options for rapid, frictionless user selection
const DEGREE_OPTIONS = [
  'B.Tech / B.E.',
  'B.Sc Computer Science / IT',
  'BCA (Bachelor of Computer Applications)',
  'M.Tech / M.E.',
  'MCA (Master of Computer Applications)',
  'M.Sc Data Science / AI',
  'Other / Dual Degree',
];

const BRANCH_OPTIONS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Software Engineering',
  'Mechanical Engineering',
  'Other Specialization',
];

const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  'Final Year (4th Year)',
  'Final Year (Semester 8)',
  'Master / Post-Grad',
];

const POPULAR_LANGUAGES = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C++',
  'C',
  'Go',
  'Rust',
  'Kotlin',
  'Swift',
  'PHP',
  'SQL',
  'R',
  'Dart',
];

const POPULAR_SKILLS = [
  'REST APIs',
  'Data Structures & Algorithms',
  'Git / GitHub',
  'HTML & CSS',
  'SQL & Relational DBs',
  'MongoDB & NoSQL',
  'Cloud Firestore / Firebase',
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Docker & Containers',
  'Kubernetes',
  'Cloud Computing (GCP/AWS)',
  'UI/UX Prototyping',
  'Microservices',
  'GraphQL',
  'CI/CD Pipelines',
];

const POPULAR_FRAMEWORKS = [
  'React',
  'Next.js',
  'Node.js / Express',
  'FastAPI',
  'Django',
  'Flask',
  'Spring Boot',
  'Vue.js',
  'Angular',
  'Flutter',
  'React Native',
  'Tailwind CSS',
  'PyTorch',
  'TensorFlow',
  'Scikit-Learn',
];

const INTEREST_AREAS = [
  'Artificial Intelligence & GenAI',
  'Web Systems & SaaS',
  'Mobile Application Development',
  'Cloud Native & DevOps',
  'Cybersecurity & Ethical Hacking',
  'Data Science & Analytics',
  'FinTech & Decentralized Systems',
  'HealthTech & Clinical AI',
  'EdTech & Smart Classrooms',
  'Internet of Things (IoT)',
  'Robotics & Embedded Systems',
  'CleanTech & Sustainability',
];

const PROJECT_DOMAINS = [
  'Healthcare & Patient Care',
  'Education & Learning Systems',
  'Finance & Fraud Prevention',
  'Agriculture & Smart Farming',
  'Environment & Renewable Energy',
  'Smart Cities & Urban Mobility',
  'Developer Tooling & Security',
  'E-Commerce & Supply Chain',
  'Social Good & Accessibility',
  'Open to Any High-Impact Domain',
];

const SKILL_LEVELS = [
  { value: 'Beginner', title: 'Beginner', desc: 'Building foundational projects with standard guidance' },
  { value: 'Intermediate', title: 'Intermediate', desc: 'Comfortable with full-stack APIs, databases, or ML libraries' },
  { value: 'Advanced', title: 'Advanced', desc: 'Ready for distributed microservices, complex algorithms, or custom models' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'Beginner', label: 'Beginner-Friendly' },
  { value: 'Intermediate', label: 'Balanced (Intermediate)' },
  { value: 'Advanced', label: 'Advanced Engineering' },
  { value: 'Challenging', label: 'Research-Grade / High Rigor' },
];

const DURATION_OPTIONS = [
  '2–4 weeks (Fast Prototype)',
  '1–2 months',
  '2–3 months',
  '3–6 months (Full Semester)',
  '6+ months (Full Academic Year)',
];

const TEAM_SIZE_OPTIONS = [
  'Solo (1 Student)',
  'Pair (2 Students)',
  'Small Team (3-4 Students)',
  'Team (5+ Students)',
];

const CAREER_GOALS = [
  'Full-Stack Software Engineer',
  'AI / Machine Learning Engineer',
  'Backend & Systems Engineer',
  'Frontend / Web Application Developer',
  'Cloud / DevOps Engineer',
  'Data Scientist / ML Researcher',
  'Cybersecurity Specialist',
  'Mobile Application Developer',
  'Technical Product Lead',
  'Academic / Postgraduate Researcher',
];

const PREFERRED_STACK_ITEMS = [
  'React + Node.js + Firebase',
  'Next.js + TypeScript + PostgreSQL',
  'Python + FastAPI + Gemini AI',
  'Python + PyTorch + Streamlit',
  'Flutter + Firebase + Cloud Functions',
  'Spring Boot + React + MySQL',
  'Docker + Google Cloud Run',
  'Go + Microservices + gRPC',
];

export function ProfilePage({ onProfileSaved, onNavigateToGenerator }: ProfilePageProps) {
  const { profile, setProfile, resetProfile, loadDemoProfile, profileCompletion, canGenerateIdeas } = useProject();

  const nameInputId = useId();
  const degreeInputId = useId();
  const branchInputId = useId();
  const careerGoalInputId = useId();

  // Local state initialized with current profile
  const [name, setName] = useState(profile.name || '');
  const [degree, setDegree] = useState(profile.degree || '');
  const [branch, setBranch] = useState(profile.branch || '');
  const [year, setYear] = useState(profile.year || profile.academicYear || 'Final Year (4th Year)');
  
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(profile.programmingLanguages || []);
  const [customLanguage, setCustomLanguage] = useState('');

  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile.technicalSkills || []);
  const [customSkill, setCustomSkill] = useState('');

  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(profile.frameworks || []);
  const [customFramework, setCustomFramework] = useState('');

  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    profile.interests || profile.areasOfInterest || profile.primaryInterests || []
  );
  const [customInterest, setCustomInterest] = useState('');

  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    profile.preferredDomains || (profile.preferredDomain ? [profile.preferredDomain] : [])
  );
  const [customDomain, setCustomDomain] = useState('');

  const [skillLevel, setSkillLevel] = useState(profile.skillLevel || profile.difficultyLevel || 'Intermediate');
  const [difficulty, setDifficulty] = useState(profile.difficulty || profile.difficultyLevel || 'Intermediate');
  const [duration, setDuration] = useState(profile.duration || profile.availableDuration || '3–6 months (Full Semester)');
  const [teamSize, setTeamSize] = useState(profile.teamSize || 'Solo (1 Student)');
  
  const [careerGoal, setCareerGoal] = useState(profile.careerGoal || '');
  const [selectedStack, setSelectedStack] = useState<string[]>(
    profile.preferredStack || profile.preferredTechnologies || []
  );
  const [customStack, setCustomStack] = useState('');

  const [isDemo, setIsDemo] = useState(Boolean(profile.isDemoProfile));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize local form state whenever central profile changes (guarantees single-source-of-truth reactivity)
  useEffect(() => {
    setName(profile.name || profile.fullName || '');
    setDegree(profile.degree || '');
    setBranch(profile.branch || '');
    setYear(profile.year || profile.academicYear || 'Final Year (4th Year)');
    setSelectedLanguages(profile.programmingLanguages || []);
    setSelectedSkills(profile.technicalSkills || []);
    setSelectedFrameworks(profile.frameworks || []);
    setSelectedInterests(profile.interests || profile.areasOfInterest || profile.primaryInterests || []);
    setSelectedDomains(profile.preferredDomains || (profile.preferredDomain ? [profile.preferredDomain] : []));
    setSkillLevel(profile.skillLevel || profile.difficultyLevel || 'Intermediate');
    setDifficulty(profile.difficulty || profile.difficultyLevel || 'Intermediate');
    setDuration(profile.duration || profile.availableDuration || '3–6 months (Full Semester)');
    setTeamSize(profile.teamSize || 'Solo (1 Student)');
    setCareerGoal(profile.careerGoal || '');
    setSelectedStack(profile.preferredStack || profile.preferredTechnologies || []);
    setIsDemo(Boolean(profile.isDemoProfile));
  }, [profile]);

  // Chip toggle helper
  const toggleItem = (list: string[], setList: (items: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addCustomItem = (
    value: string,
    setValue: (val: string) => void,
    list: string[],
    setList: (items: string[]) => void
  ) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setValue('');
    }
  };

  const removeItem = (list: string[], setList: (items: string[]) => void, item: string) => {
    setList(list.filter(i => i !== item));
  };

  const handleClearForm = () => {
    setName('');
    setDegree('');
    setBranch('');
    setYear('Final Year (4th Year)');
    setSelectedLanguages([]);
    setSelectedSkills([]);
    setSelectedFrameworks([]);
    setSelectedInterests([]);
    setSelectedDomains([]);
    setSkillLevel('Intermediate');
    setDifficulty('Intermediate');
    setDuration('3–6 months (Full Semester)');
    setTeamSize('Solo (1 Student)');
    setCareerGoal('');
    setSelectedStack([]);
    setIsDemo(false);
    setErrors({});
    setSaveSuccess(false);
    resetProfile();
  };

  const handleLoadDemo = () => {
    loadDemoProfile();
    // Sync local state
    setName('Demo Student (Sample Profile)');
    setDegree('B.Tech / B.E.');
    setBranch('Computer Science & Engineering');
    setYear('Final Year (4th Year)');
    setSelectedLanguages(['TypeScript', 'Python', 'JavaScript', 'SQL']);
    setSelectedSkills(['React', 'REST APIs', 'Node.js / Express', 'Git', 'Data Structures']);
    setSelectedFrameworks(['Tailwind CSS', 'Vite', 'FastAPI']);
    setSelectedInterests(['Artificial Intelligence & GenAI', 'HealthTech & Clinical AI', 'Cloud Native & DevOps']);
    setSelectedDomains(['Healthcare & Patient Care', 'Education & Learning Systems']);
    setSkillLevel('Intermediate');
    setDifficulty('Intermediate');
    setDuration('3–6 months (Full Semester)');
    setTeamSize('Solo (1 Student)');
    setCareerGoal('Full-Stack Software Engineer');
    setSelectedStack(['React + Node.js + Firebase', 'Python + FastAPI + Gemini AI']);
    setIsDemo(true);
    setErrors({});
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    const updated: StudentProfile = {
      ...profile,
      name: name.trim(),
      degree: degree.trim(),
      branch: branch.trim(),
      year: year,
      academicYear: year,
      programmingLanguages: selectedLanguages,
      technicalSkills: selectedSkills,
      frameworks: selectedFrameworks,
      interests: selectedInterests,
      areasOfInterest: selectedInterests,
      primaryInterests: selectedInterests,
      preferredDomains: selectedDomains,
      preferredDomain: selectedDomains[0] || 'General Software',
      skillLevel: skillLevel,
      difficulty: difficulty,
      difficultyLevel: difficulty,
      duration: duration,
      availableDuration: duration,
      teamSize: teamSize,
      careerGoal: careerGoal.trim(),
      preferredStack: selectedStack,
      preferredTechnologies: selectedStack,
      isDemoProfile: isDemo,
      updatedAt: new Date().toISOString(),
    };

    const validation = validateStudentProfile(updated);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setProfile(updated);
    setSaveSuccess(true);

    if (onProfileSaved) {
      onProfileSaved();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="profile-setup-page">
      {/* Top Banner / Progress Indicator */}
      <div className="bg-[#0f172a]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <GraduationCap className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Student Profile Setup</h1>
                <p className="text-sm text-slate-400">
                  Input your actual academic details, skills, and goals so Google Gemini generates customized, viable project proposals.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={handleClearForm}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
              title="Clear all fields to enter your own information from scratch"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Form / Blank
            </button>
            <button
              type="button"
              onClick={handleLoadDemo}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-950/70 rounded-lg border border-cyan-800/60 transition-colors"
              title="Load pre-filled sample profile for testing and evaluation"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Demo Profile
            </button>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">Profile Completion:</span>
              <span className={`font-bold ${profileCompletion.percentage === 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {profileCompletion.percentage}%
              </span>
              <span className="text-xs text-slate-400">
                ({profileCompletion.completedFieldsCount} of {profileCompletion.totalFieldsCount} sections completed)
              </span>
            </div>

            <div>
              {canGenerateIdeas ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready for AI Generation
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {profileCompletion.missingRequired.length} required field{profileCompletion.missingRequired.length > 1 ? 's' : ''} left
                </span>
              )}
            </div>
          </div>

          {/* Graphical Progress Bar */}
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                profileCompletion.percentage >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                  : 'bg-gradient-to-r from-amber-500 to-emerald-500'
              }`}
              style={{ width: `${Math.max(5, profileCompletion.percentage)}%` }}
            />
          </div>

          {/* Notice when demo profile is active */}
          {isDemo && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>Demo Profile Mode Active:</strong> This profile contains sample test data for hackathon reviewers. Click &quot;Clear Form / Blank&quot; anytime to fill in your real information.
                </span>
              </div>
            </div>
          )}

          {/* Missing required items helper */}
          {!canGenerateIdeas && profileCompletion.missingRequired.length > 0 && (
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-amber-400 font-semibold">Still required before generating projects: </span>
              {profileCompletion.missingRequired.join(' • ')}
            </div>
          )}
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Error Alert Box */}
        {Object.keys(errors).length > 0 && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Please correct the following fields:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-rose-200">
                {Object.values(errors).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Success Alert Box */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Profile saved successfully!</p>
                <p className="text-xs text-emerald-200/80">Your authentic skills and preferences will now be used by Google Gemini.</p>
              </div>
            </div>
            {onNavigateToGenerator && (
              <button
                type="button"
                onClick={onNavigateToGenerator}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-slate-950 font-semibold rounded-lg text-xs hover:bg-emerald-400 transition-colors"
              >
                Generate AI Ideas
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Section 1: Academic Identity */}
        <section className="bg-[#0f172a]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <User className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">1. Academic Identity</h2>
              <p className="text-xs text-slate-400">Your institution standing, department, and program</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor={nameInputId} className="block text-sm font-medium text-slate-200 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                id={nameInputId}
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setIsDemo(false);
                }}
                placeholder="e.g. PAVAN KUMAR N or Rahul Sharma"
                aria-required="true"
                aria-invalid={Boolean(errors.name)}
                className={`w-full px-4 py-2.5 bg-slate-900/90 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all ${
                  errors.name ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Current Academic Year <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACADEMIC_YEARS.map(yr => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setYear(yr)}
                    className={`px-3 py-2 text-xs font-medium rounded-xl border text-center transition-all ${
                      year === yr
                        ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Degree Program */}
            <div>
              <label htmlFor={degreeInputId} className="block text-sm font-medium text-slate-200 mb-1.5">
                Degree Program <span className="text-rose-400">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {DEGREE_OPTIONS.slice(0, 5).map(deg => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setDegree(deg)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                      degree === deg
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {deg}
                  </button>
                ))}
              </div>
              <input
                id={degreeInputId}
                type="text"
                value={degree}
                onChange={e => setDegree(e.target.value)}
                placeholder="Or type custom degree, e.g. B.Tech in CSE"
                aria-required="true"
                aria-invalid={Boolean(errors.degree)}
                className={`w-full px-4 py-2.5 bg-slate-900/90 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all ${
                  errors.degree ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
              {errors.degree && <p className="mt-1 text-xs text-rose-400">{errors.degree}</p>}
            </div>

            {/* Branch / Specialization */}
            <div>
              <label htmlFor={branchInputId} className="block text-sm font-medium text-slate-200 mb-1.5">
                Branch / Specialization <span className="text-rose-400">*</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {BRANCH_OPTIONS.slice(0, 4).map(br => (
                  <button
                    key={br}
                    type="button"
                    onClick={() => setBranch(br)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                      branch === br
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {br}
                  </button>
                ))}
              </div>
              <input
                id={branchInputId}
                type="text"
                value={branch}
                onChange={e => setBranch(e.target.value)}
                placeholder="e.g. Computer Science, AI & ML, Robotics"
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Programming Languages */}
        <section className="bg-[#0f172a]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Code2 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">2. Programming Languages</h2>
                <p className="text-xs text-slate-400">Select the languages you can actually write and debug code in</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
              {selectedLanguages.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {POPULAR_LANGUAGES.map(lang => {
              const isSelected = selectedLanguages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleItem(selectedLanguages, setSelectedLanguages, lang)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {lang}
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Add custom language input */}
          <div className="flex gap-2 pt-2 max-w-md">
            <input
              type="text"
              value={customLanguage}
              onChange={e => setCustomLanguage(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomItem(customLanguage, setCustomLanguage, selectedLanguages, setSelectedLanguages);
                }
              }}
              placeholder="Add another language (e.g. Julia, Solidity)..."
              className="flex-1 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => addCustomItem(customLanguage, setCustomLanguage, selectedLanguages, setSelectedLanguages)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1 border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </section>

        {/* Section 3: Technical Competencies & Skills */}
        <section className="bg-[#0f172a]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">3. Technical Skills & Concepts</h2>
                <p className="text-xs text-slate-400">Core architectural, backend, database, and algorithmic competencies</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
              {selectedSkills.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {POPULAR_SKILLS.map(skill => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleItem(selectedSkills, setSelectedSkills, skill)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {skill}
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2 max-w-md">
            <input
              type="text"
              value={customSkill}
              onChange={e => setCustomSkill(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomItem(customSkill, setCustomSkill, selectedSkills, setSelectedSkills);
                }
              }}
              placeholder="Add custom skill (e.g. WebSockets, Redis, LangChain)..."
              className="flex-1 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={() => addCustomItem(customSkill, setCustomSkill, selectedSkills, setSelectedSkills)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1 border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </section>

        {/* Section 4: Frameworks & Libraries */}
        <section className="bg-[#0f172a]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">4. Frameworks & Libraries</h2>
                <p className="text-xs text-slate-400">Web frameworks, ML platforms, and runtime environments</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
              {selectedFrameworks.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {POPULAR_FRAMEWORKS.map(fw => {
              const isSelected = selectedFrameworks.includes(fw);
              return (
                <button
                  key={fw}
                  type="button"
                  onClick={() => toggleItem(selectedFrameworks, setSelectedFrameworks, fw)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {fw}
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2 max-w-md">
            <input
              type="text"
              value={customFramework}
              onChange={e => setCustomFramework(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomItem(customFramework, setCustomFramework, selectedFrameworks, setSelectedFrameworks);
                }
              }}
              placeholder="Add other framework (e.g. Svelte, Astro, Keras)..."
              className="flex-1 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => addCustomItem(customFramework, setCustomFramework, selectedFrameworks, setSelectedFrameworks)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1 border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </section>

        {/* Section 5: Areas of Interest & Project Domains */}
        <section className="bg-[#0f172a]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">5. Areas of Interest & Application Domains</h2>
              <p className="text-xs text-slate-400">What fields or societal challenges motivate you?</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Tech Focus Areas <span className="text-rose-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_AREAS.map(interest => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleItem(selectedInterests, setSelectedInterests, interest)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {interest}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Preferred Project Domains (Industries)
              </label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_DOMAINS.map(domain => {
                  const isSelected = selectedDomains.includes(domain);
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => toggleItem(selectedDomains, setSelectedDomains, domain)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {domain}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Skill Level & Scope Constraints */}
        <section className="bg-[#0f172a]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">6. Skill Level & Delivery Scope</h2>
              <p className="text-xs text-slate-400">Parameters used to calculate academic feasibility and project fit scores</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Skill Level */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Your Current Skill Level <span className="text-rose-400">*</span>
              </label>
              <div className="space-y-2">
                {SKILL_LEVELS.map(lvl => (
                  <label
                    key={lvl.value}
                    className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                      skillLevel === lvl.value
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="skillLevel"
                        value={lvl.value}
                        checked={skillLevel === lvl.value}
                        onChange={() => setSkillLevel(lvl.value)}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">{lvl.title}</div>
                        <div className="text-xs text-slate-400">{lvl.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Project Difficulty Preference */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Target Project Difficulty
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDifficulty(opt.value)}
                    className={`p-3 text-xs font-medium rounded-xl border text-center transition-all ${
                      difficulty === opt.value
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Available Duration */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Available Project Duration <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DURATION_OPTIONS.map(dur => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={`p-2 text-xs font-medium rounded-xl border text-left transition-all ${
                        duration === dur
                          ? 'bg-purple-500/15 border-purple-500 text-purple-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team Size */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Team Structure
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TEAM_SIZE_OPTIONS.map(ts => (
                    <button
                      key={ts}
                      type="button"
                      onClick={() => setTeamSize(ts)}
                      className={`p-2 text-xs font-medium rounded-xl border text-center transition-all ${
                        teamSize === ts
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {ts}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Career Goal & Preferred Stack */}
        <section className="bg-[#0f172a]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Briefcase className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">7. Career Aspirations & Target Stack</h2>
              <p className="text-xs text-slate-400">Gemini uses this to maximize the industry relevance and hiring appeal of your capstone</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor={careerGoalInputId} className="block text-sm font-medium text-slate-200 mb-2">
                Primary Career Goal <span className="text-rose-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {CAREER_GOALS.map(cg => (
                  <button
                    key={cg}
                    type="button"
                    onClick={() => setCareerGoal(cg)}
                    className={`px-3 py-1.5 text-xs rounded-xl border transition-all ${
                      careerGoal === cg
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {cg}
                  </button>
                ))}
              </div>
              <input
                id={careerGoalInputId}
                type="text"
                value={careerGoal}
                onChange={e => setCareerGoal(e.target.value)}
                placeholder="Or specify custom goal, e.g. Autonomous Vehicle Perception Engineer"
                aria-required="true"
                aria-invalid={Boolean(errors.careerGoal)}
                className={`w-full px-4 py-2.5 bg-slate-900/90 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all ${
                  errors.careerGoal ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-slate-800 focus:border-emerald-500'
                }`}
              />
              {errors.careerGoal && <p className="mt-1 text-xs text-rose-400">{errors.careerGoal}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Preferred Technology Combinations (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {PREFERRED_STACK_ITEMS.map(stack => {
                  const isSelected = selectedStack.includes(stack);
                  return (
                    <button
                      key={stack}
                      type="button"
                      onClick={() => toggleItem(selectedStack, setSelectedStack, stack)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {stack}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Submit & Save Footer Bar */}
        <div className="sticky bottom-4 z-20 bg-[#0f172a]/95 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${canGenerateIdeas ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400'}`} />
            <div>
              <p className="text-sm font-medium text-white">
                {canGenerateIdeas
                  ? 'All required profile parameters are satisfied!'
                  : `Please provide: ${profileCompletion.missingRequired.slice(0, 2).join(', ')}${profileCompletion.missingRequired.length > 2 ? '...' : ''}`}
              </p>
              <p className="text-xs text-slate-400">
                Saves directly to your user Firestore record: <code className="text-slate-300">users/{profile.userId || 'current'}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-semibold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Student Profile
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
