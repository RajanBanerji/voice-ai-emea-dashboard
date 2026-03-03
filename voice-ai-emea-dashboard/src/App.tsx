import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import CompareTray from './components/CompareTray';
import Overview from './pages/Overview';
import VendorDeepDive from './pages/VendorDeepDive';
import HeadToHead from './pages/HeadToHead';
import MarketTrends from './pages/MarketTrends';
import SendbirdGapAnalysis from './pages/SendbirdGapAnalysis';
import VendorProfile from './pages/VendorProfile';
import ComparePage from './pages/ComparePage';
import { CompareProvider } from './context/CompareContext';
import { useAnthropicRefresh } from './hooks/useAnthropicRefresh';
import {
  initialVendors,
  marketGrowth,
  emeaMarketShare,
  verticalAdoption,
  sendbirdGapActions,
} from './data/initialData';
import type { Vendor, GapAction } from './types/vendor';

const PAGE_MAP: Record<string, string> = {
  '/': 'overview',
  '/deep-dive': 'deep-dive',
  '/head-to-head': 'head-to-head',
  '/trends': 'trends',
  '/gap-analysis': 'gap-analysis',
};

const ROUTE_MAP: Record<string, string> = {
  'overview': '/',
  'deep-dive': '/deep-dive',
  'head-to-head': '/head-to-head',
  'trends': '/trends',
  'gap-analysis': '/gap-analysis',
};

function AppContent() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [previousVendors, setPreviousVendors] = useState<Vendor[] | null>(null);
  const [gapActions, setGapActions] = useState<GapAction[]>(sendbirdGapActions);

  const location = useLocation();
  const navigate = useNavigate();

  const activePage = PAGE_MAP[location.pathname] || 'overview';

  const { refreshData, loading, lastUpdated } = useAnthropicRefresh(vendors);

  const handleRefresh = useCallback(async () => {
    const result = await refreshData();
    if (result) {
      setPreviousVendors(vendors);
      setVendors((prev) =>
        prev.map((vendor) => {
          const updated = result.find(
            (u: Partial<Vendor>) =>
              u.name?.toLowerCase() === vendor.name.toLowerCase()
          );
          if (updated) {
            return {
              ...vendor,
              overallScore: updated.overallScore ?? vendor.overallScore,
              emea_compliance: updated.emea_compliance ?? vendor.emea_compliance,
              language_coverage: updated.language_coverage ?? vendor.language_coverage,
              latency: updated.latency ?? vendor.latency,
              voice_quality: updated.voice_quality ?? vendor.voice_quality,
              ease_of_use: updated.ease_of_use ?? vendor.ease_of_use,
              enterprise_fit: updated.enterprise_fit ?? vendor.enterprise_fit,
              pricing_transparency: updated.pricing_transparency ?? vendor.pricing_transparency,
              market_sentiment: updated.market_sentiment ?? vendor.market_sentiment,
              one_line_summary: updated.one_line_summary ?? vendor.one_line_summary,
              top_strength: updated.top_strength ?? vendor.top_strength,
              top_weakness: updated.top_weakness ?? vendor.top_weakness,
            };
          }
          return vendor;
        })
      );
    }
  }, [refreshData, vendors]);

  const handleToggleAction = useCallback((id: number) => {
    setGapActions((prev) =>
      prev.map((action) => {
        if (action.id === id) {
          const nextStatus =
            action.status === 'pending'
              ? 'in_progress'
              : action.status === 'in_progress'
              ? 'done'
              : 'pending';
          return { ...action, status: nextStatus };
        }
        return action;
      })
    );
  }, []);

  const handleNavigate = useCallback(
    (page: string) => {
      const route = ROUTE_MAP[page] || '/';
      navigate(route);
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation
        activePage={activePage}
        onNavigate={handleNavigate}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        loading={loading}
      />
      <main>
        <Routes>
          <Route path="/" element={<Overview vendors={vendors} previousVendors={previousVendors} />} />
          <Route path="/deep-dive" element={<VendorDeepDive vendors={vendors} />} />
          <Route path="/head-to-head" element={<HeadToHead vendors={vendors} />} />
          <Route
            path="/trends"
            element={
              <MarketTrends
                vendors={vendors}
                marketGrowth={marketGrowth}
                emeaMarketShare={emeaMarketShare}
                verticalAdoption={verticalAdoption}
              />
            }
          />
          <Route
            path="/gap-analysis"
            element={
              <SendbirdGapAnalysis
                vendors={vendors}
                gapActions={gapActions}
                onToggleAction={handleToggleAction}
              />
            }
          />
          <Route path="/vendor/:vendorId" element={<VendorProfile vendors={vendors} />} />
          <Route path="/compare" element={<ComparePage vendors={vendors} />} />
        </Routes>
      </main>
      <CompareTray />
      <footer className="border-t border-slate-800 py-6 px-6 text-center text-slate-500 text-sm pb-20">
        <p>
          Data sources: Gartner, Forrester, MarketsandMarkets, a16z, Opus Research, Synthflow Reviews, G2
        </p>
        <p className="mt-1 text-slate-600">
          EMEA Voice AI Competitive Intelligence Dashboard &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CompareProvider>
        <AppContent />
      </CompareProvider>
    </BrowserRouter>
  );
}

export default App;
