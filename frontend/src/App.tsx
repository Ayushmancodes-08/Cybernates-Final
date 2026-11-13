import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { LiveThreatsPage } from './pages/LiveThreatsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { InvestigationPage } from './pages/InvestigationPage';
import { AdaptiveFirewallPage } from './pages/AdaptiveFirewallPage';
import { NetworkIntelligencePage } from './pages/NetworkIntelligencePage';
import { IdentitySecurityPage } from './pages/IdentitySecurityPage';
import { PhishingAnalysisPage } from './pages/PhishingAnalysisPage';
import { MultimodalThreatLabPage } from './pages/MultimodalThreatLabPage';
import { GraphIntelligencePage } from './pages/GraphIntelligencePage';
import { AIAnalystPage } from './pages/AIAnalystPage';
import { ThreatIntelligencePage } from './pages/ThreatIntelligencePage';
import { ResponseCenterPage } from './pages/ResponseCenterPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { SettingsPage } from './pages/SettingsPage';
import { RemoteAttackerSimulator } from './pages/RemoteAttackerSimulator';
import { OkclEmailViewer } from './pages/OkclEmailViewer';
import { MobileDedicatedDashboard } from './pages/MobileDedicatedDashboard';
import { CommonAttacksPage } from './pages/CommonAttacksPage';
import { LiveDemoModal } from './components/demo/LiveDemoModal';
import { PwaNotificationManager } from './components/common/PwaNotificationManager';

const MainRouter: React.FC = () => {
  // Check if current URL path is explicitly Phone B (Protected Recipient / Grandpa)
  if (
    typeof window !== 'undefined' &&
    (window.location.pathname.includes('phone-b') ||
      window.location.pathname.includes('victim') ||
      window.location.pathname.includes('recipient') ||
      window.location.pathname.includes('target'))
  ) {
    return <RemoteAttackerSimulator defaultDevice="PHONE_B" />;
  }

  // Check if current URL path is Phone A / Attacker Simulator
  if (
    typeof window !== 'undefined' &&
    (window.location.port === '5900' ||
      window.location.pathname.includes('phone-a') ||
      window.location.pathname.includes('remote-attack') ||
      window.location.pathname.includes('attacker') ||
      window.location.pathname.includes('attacker-mobile') ||
      window.location.pathname.includes('ingress') ||
      window.location.pathname.includes('hacker99'))
  ) {
    return <RemoteAttackerSimulator defaultDevice="PHONE_A" />;
  }

  // Check if current URL path is /demo-email or /okcl-email
  if (typeof window !== 'undefined' && (window.location.pathname.includes('demo-email') || window.location.pathname.includes('okcl-email'))) {
    return <OkclEmailViewer />;
  }

  // Check if current URL path is /mobile, /personal, /my-circle, /circle, /grandpa, or /single-user
  if (
    typeof window !== 'undefined' &&
    (window.location.pathname.includes('mobile') ||
      window.location.pathname.includes('personal') ||
      window.location.pathname.includes('circle') ||
      window.location.pathname.includes('grandpa') ||
      window.location.pathname.includes('single-user'))
  ) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#0A0E13] p-2 sm:p-4 font-sans">
        <MobileDedicatedDashboard
          onNavigate={(route) => {
            if (route === 'remote-attack') window.location.href = '/remote-attack';
            else window.location.href = `/?route=${route}`;
          }}
        />
      </div>
    );
  }

  const { user, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('inc-1042');
  const [aiAnalystInitialPrompt, setAiAnalystInitialPrompt] = useState<string>('');
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f8f9ff] text-on-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-outline">Bootstrapping CyberGuard SOC Console...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => setCurrentRoute('overview')} />;
  }

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setCurrentRoute('investigation');
  };

  const handleAskAI = (prompt: string) => {
    setAiAnalystInitialPrompt(prompt);
    setCurrentRoute('ai-analyst');
  };

  return (
    <>
      <AppShell
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
        onOpenDemo={() => setDemoModalOpen(true)}
      >
        {currentRoute === 'overview' && (
          <>
            {/* Desktop & Tablet: High-End White Ceramic Defense Cockpit */}
            <div className="hidden md:block">
              <OverviewPage
                onNavigate={setCurrentRoute}
                onOpenDemo={() => setDemoModalOpen(true)}
              />
            </div>

            {/* Mobile Smartphones: Dedicated PhishGuard & CyberMentor App (User Mockup 1 & 2) */}
            <div className="block md:hidden">
              <MobileDedicatedDashboard
                onNavigate={setCurrentRoute}
                onOpenDemo={() => setDemoModalOpen(true)}
              />
            </div>
          </>
        )}
        {currentRoute === 'threats' && <LiveThreatsPage />}
        {currentRoute === 'incidents' && <IncidentsPage onSelectIncident={handleSelectIncident} />}
        {currentRoute === 'investigation' && (
          <InvestigationPage
            incidentId={selectedIncidentId}
            onBack={() => setCurrentRoute('incidents')}
            onAskAI={handleAskAI}
          />
        )}
        {currentRoute === 'firewall' && <AdaptiveFirewallPage />}
        {currentRoute === 'network' && <NetworkIntelligencePage />}
        {currentRoute === 'identity' && <IdentitySecurityPage />}
        {currentRoute === 'phishing' && <PhishingAnalysisPage />}
        {currentRoute === 'multimodal' && <MultimodalThreatLabPage />}
        {currentRoute === 'common-attacks' && <CommonAttacksPage onNavigate={setCurrentRoute} />}
        {currentRoute === 'graph-intelligence' && <GraphIntelligencePage />}
        {currentRoute === 'ai-analyst' && <AIAnalystPage initialQuery={aiAnalystInitialPrompt} />}
        {currentRoute === 'threat-intelligence' && <ThreatIntelligencePage />}
        {currentRoute === 'response-center' && <ResponseCenterPage />}
        {currentRoute === 'simulator' && <SimulatorPage onNavigate={setCurrentRoute} />}
        {currentRoute === 'system-health' && <SystemHealthPage />}
        {currentRoute === 'settings' && <SettingsPage />}
        {currentRoute === 'demo-email' && <OkclEmailViewer />}
      </AppShell>

      <LiveDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onNavigate={setCurrentRoute}
      />
    </>
  );
};

export function App() {
  return (
    <AuthProvider>
      <PwaNotificationManager />
      <MainRouter />
    </AuthProvider>
  );
}

export default App;
