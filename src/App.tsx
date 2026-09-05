import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { ProfilePage } from './components/profile/ProfilePage';
import { GeneratorPage } from './components/generator/GeneratorPage';
import { FitAnalyzerPage } from './components/analyzer/FitAnalyzerPage';
import { BlueprintPage } from './components/blueprint/BlueprintPage';
import { RoadmapPage } from './components/roadmap/RoadmapPage';
import { MentorPage } from './components/mentor/MentorPage';
import { ImproverPage } from './components/improver/ImproverPage';
import { ValidatorPage } from './components/validator/ValidatorPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { EvaluationPage } from './components/evaluation/EvaluationPage';
import { ProjectIdea } from './types';

function AppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedAnalyzerProject, setSelectedAnalyzerProject] = useState<ProjectIdea | null>(null);
  const [mentorInitialPrompt, setMentorInitialPrompt] = useState<string | null>(null);

  // Default to dashboard when user signs in, or landing if guest
  useEffect(() => {
    if (currentUser && (activeTab === 'landing' || activeTab === 'auth')) {
      setActiveTab('dashboard');
    }
  }, [currentUser]);

  const handleSelectProjectFromGen = (project: ProjectIdea) => {
    setActiveTab('blueprint');
  };

  const handleViewAnalyzer = (project: ProjectIdea) => {
    setSelectedAnalyzerProject(project);
    setActiveTab('analyzer');
  };

  const handleViewBlueprint = (project: ProjectIdea) => {
    setActiveTab('blueprint');
  };

  const handleAskMentorForTask = (taskTitle: string) => {
    setMentorInitialPrompt(taskTitle);
    setActiveTab('mentor');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 focus:outline-none">
        {activeTab === 'landing' && (
          <LandingPage
            onStart={() => (currentUser ? setActiveTab('generator') : setActiveTab('auth'))}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'auth' && (
          <AuthPage onSuccess={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            onNavigate={setActiveTab}
            onAskMentorForTask={handleAskMentorForTask}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            onNavigateToGenerator={() => setActiveTab('generator')}
          />
        )}

        {activeTab === 'generator' && (
          <GeneratorPage
            onSelectProject={handleSelectProjectFromGen}
            onViewAnalyzer={handleViewAnalyzer}
            onViewBlueprint={handleViewBlueprint}
            onNavigateToProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'analyzer' && (
          <FitAnalyzerPage
            selectedProject={selectedAnalyzerProject}
            onSelectActive={() => setActiveTab('blueprint')}
            onGenerateBlueprint={() => setActiveTab('blueprint')}
          />
        )}

        {activeTab === 'blueprint' && (
          <BlueprintPage onNavigateToRoadmap={() => setActiveTab('roadmap')} />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapPage onAskMentorForTask={handleAskMentorForTask} />
        )}

        {activeTab === 'mentor' && (
          <MentorPage initialPrompt={mentorInitialPrompt} />
        )}

        {activeTab === 'improver' && (
          <ImproverPage onAdoptImprovedProject={() => setActiveTab('blueprint')} />
        )}

        {activeTab === 'validator' && <ValidatorPage />}

        {activeTab === 'settings' && (
          <SettingsPage onNavigateToProfile={() => setActiveTab('profile')} />
        )}

        {activeTab === 'evaluation' && <EvaluationPage />}
      </main>

      <Footer />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
