import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { HomePage } from './components/pages/HomePage';
import { SignInPage } from './components/pages/SignInPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { ProjectsPage } from './components/pages/ProjectsPage';
import { ProjectDetailsPage } from './components/pages/ProjectDetailsPage';
import { RiskAlertsPage } from './components/pages/RiskAlertsPage';
import { AIAnalysisPage } from './components/pages/AIAnalysisPage';
import { ProjectMonitoringPage } from './components/pages/ProjectMonitoringPage';
import { FinancialMonitoringPage } from './components/pages/FinancialMonitoringPage';
import { DelayProgressPage } from './components/pages/DelayProgressPage';
import { DuplicateDetectionPage } from './components/pages/DuplicateDetectionPage';
import { RiskMapPage } from './components/pages/RiskMapPage';
import { PredictionsPage } from './components/pages/PredictionsPage';
import { InvestigationsPage } from './components/pages/InvestigationsPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { UsersPage } from './components/pages/UsersPage';
import { SettingsPage } from './components/pages/SettingsPage';

const MainLayout: React.FC = () => {
  const { currentPage } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Standalone public pages without dashboard sidebar
  if (currentPage === 'home') {
    return (
      <>
        <HomePage />
        <ToastContainer />
      </>
    );
  }

  if (currentPage === 'signin' || currentPage === 'demo-access') {
    return (
      <>
        <SignInPage />
        <ToastContainer />
      </>
    );
  }

  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'project-details':
        return <ProjectDetailsPage />;
      case 'risk-alerts':
        return <RiskAlertsPage />;
      case 'ai-analysis':
        return <AIAnalysisPage />;
      case 'project-monitoring':
        return <ProjectMonitoringPage />;
      case 'financial-monitoring':
        return <FinancialMonitoringPage />;
      case 'delay-progress':
        return <DelayProgressPage />;
      case 'duplicate-detection':
        return <DuplicateDetectionPage />;
      case 'risk-map':
        return <RiskMapPage />;
      case 'predictions':
        return <PredictionsPage />;
      case 'investigations':
        return <InvestigationsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#334155] font-sans antialiased flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-[240px] flex-1 flex flex-col min-w-0">
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-5 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>

        {/* Enterprise System Footer */}
        <footer className="p-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500 gap-1.5 sm:gap-0">
          <div>
            <span className="font-semibold text-[#002D62]">MPLADS INTELLIGENCE</span> | Project Monitoring & Risk Analytics
          </div>
          <div className="text-gray-400">
            Automated risk indicators are advisory in nature and subject to administrative verification.
          </div>
        </footer>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
