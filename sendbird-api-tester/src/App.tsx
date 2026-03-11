import { useState, useCallback, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { useCredentials } from './context/CredentialsContext';
import { useTestResults } from './context/TestResultsContext';
import { useTestRunner } from './hooks/useTestRunner';
import { exportTestResults } from './utils/exportResults';
import { CATEGORIES, ALL_ENDPOINTS } from './data/endpoints';
import CredentialGate from './components/CredentialGate';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import CredentialDrawer from './components/CredentialDrawer';
import CategoryPanel from './components/CategoryPanel';
import HelpModal from './components/HelpModal';
import RunSuiteConfirmModal from './components/RunSuiteConfirmModal';
import HealthSummaryPanel from './components/HealthSummaryPanel';
import OnboardingBanner from './components/OnboardingBanner';
import HistoryPage from './pages/HistoryPage';
import PerformancePage from './pages/PerformancePage';
import WebhookPage from './pages/WebhookPage';
import type { EndpointDef } from './data/endpoints';

function App() {
  const { credentials } = useCredentials();
  const { results, runProgress, includeDestructive } = useTestResults();
  const { runCategoryTests } = useTestRunner();

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]?.name || '');
  const [credDrawerOpen, setCredDrawerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [focusedEndpointId, setFocusedEndpointId] = useState<string | null>(null);
  const [confirmSuiteOpen, setConfirmSuiteOpen] = useState(false);
  const [showHealthSummary, setShowHealthSummary] = useState(false);

  // Show the summary panel when a full-suite run completes
  const wasRunning = useRef(false);
  useEffect(() => {
    if (runProgress.isRunning) {
      wasRunning.current = true;
    } else if (wasRunning.current) {
      wasRunning.current = false;
      if (runProgress.category === 'Full Suite') {
        setShowHealthSummary(true);
        setCurrentPage('dashboard');
      }
    }
  }, [runProgress.isRunning, runProgress.category]);

  const handleSelectEndpoint = useCallback((category: string, endpointId: string) => {
    setCurrentPage('dashboard');
    setSelectedCategory(category);
    setFocusedEndpointId(endpointId);
  }, []);

  const handleExportResults = useCallback(() => {
    exportTestResults(results, ALL_ENDPOINTS, credentials.appId, credentials.region);
  }, [results, credentials]);

  const handleRunFullSuiteConfirmed = useCallback(() => {
    setConfirmSuiteOpen(false);
    const getParams = (ep: EndpointDef) => {
      const defaults: Record<string, unknown> = {};
      for (const p of ep.params) {
        defaults[p.name] = p.default ?? '';
      }
      return defaults;
    };
    const getBody = (ep: EndpointDef): Record<string, unknown> | null => {
      if (ep.bodyFields.length === 0) return null;
      const body: Record<string, unknown> = {};
      const suffix = `_${Date.now()}`;
      for (const f of ep.bodyFields) {
        const val = f.default ?? '';
        if (f.type === 'array' && typeof val === 'string' && val !== '') {
          body[f.name] = val.split(',').map(s => s.trim());
        } else if (ep.method === 'POST' && typeof val === 'string' && val !== '' && (f.name === 'user_id' || f.name === 'bot_userid')) {
          body[f.name] = val + suffix;
        } else {
          body[f.name] = val;
        }
      }
      return body;
    };
    runCategoryTests(ALL_ENDPOINTS, getParams, getBody, 'Full Suite');
  }, [runCategoryTests]);

  if (!credentials.isConnected) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#16132D', color: '#E6EDF3', border: '1px solid #2E2A52' },
        }} />
        <CredentialGate />
      </>
    );
  }

  const activeCat = CATEGORIES.find(c => c.name === selectedCategory) || CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#0D0A1C]">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#16132D', color: '#E6EDF3', border: '1px solid #2E2A52' },
      }} />

      <TopBar
        onOpenCredentials={() => setCredDrawerOpen(true)}
        onExportResults={handleExportResults}
        onRunFullSuite={() => setConfirmSuiteOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
      />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <RunSuiteConfirmModal
        isOpen={confirmSuiteOpen}
        onConfirm={handleRunFullSuiteConfirmed}
        onCancel={() => setConfirmSuiteOpen(false)}
        includeDestructive={includeDestructive}
      />

      <Sidebar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
        onSelectEndpoint={handleSelectEndpoint}
      />

      <CredentialDrawer
        isOpen={credDrawerOpen}
        onClose={() => setCredDrawerOpen(false)}
      />

      {/* Main Content */}
      <main className="ml-60 mt-14 p-6 space-y-4">
        {currentPage === 'dashboard' && <OnboardingBanner />}
        {showHealthSummary && currentPage === 'dashboard' && (
          <HealthSummaryPanel
            onNavigateToCategory={(cat) => {
              setSelectedCategory(cat);
              setShowHealthSummary(false);
            }}
            onDismiss={() => setShowHealthSummary(false)}
          />
        )}
        {currentPage === 'dashboard' && activeCat && (
          <CategoryPanel
            category={activeCat}
            focusedEndpointId={focusedEndpointId}
            onFocusCleared={() => setFocusedEndpointId(null)}
          />
        )}
        {currentPage === 'history' && <HistoryPage />}
        {currentPage === 'performance' && <PerformancePage />}
        {currentPage === 'webhooks' && <WebhookPage />}
      </main>
    </div>
  );
}

export default App;
