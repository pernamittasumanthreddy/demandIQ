import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './pages/DashboardView';
import { LandingPageView } from './pages/LandingPageView';
import { ForecastExplorerView } from './pages/ForecastExplorerView';
import { ReplenishmentView } from './pages/ReplenishmentView';
import { DeadStockView } from './pages/DeadStockView';
import { CatalogView } from './pages/CatalogView';
import { InventoryView } from './pages/InventoryView';
import { ImportsView } from './pages/ImportsView';
import { SuppliersView } from './pages/SuppliersView';
import { PurchaseOrdersView } from './pages/PurchaseOrdersView';
import { SimulatorView } from './pages/SimulatorView';
import { WeeklyReviewView } from './pages/WeeklyReviewView';
import { ApiClient } from './services/api';
import { Business, Branch, NotificationItem } from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reorderAlertCount, setReorderAlertCount] = useState<number>(0);
  const [deadStockCount, setDeadStockCount] = useState<number>(0);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // 1. Fetch current business
      const bizRes = await ApiClient.get<any>('/businesses/current/').catch(() => null);
      if (bizRes && bizRes.business) {
        setBusiness(bizRes.business);
        ApiClient.setActiveBusiness(bizRes.business.id);
        if (bizRes.business.branches && bizRes.business.branches.length > 0) {
          setActiveBranch(bizRes.business.branches[0]);
        }
      } else {
        // Auto seed if database is clean
        await handleSeedDemo();
      }

      // 2. Fetch notifications
      const notifs = await ApiClient.get<any>('/notifications/').catch(() => ({ results: [] }));
      setNotifications(notifs.results || (Array.isArray(notifs) ? notifs : []));

      // 3. Fetch alert badges
      const [recs, dead] = await Promise.all([
        ApiClient.get<any>('/replenishment/recommendations/').catch(() => ({ results: [] })),
        ApiClient.get<any>('/replenishment/dead-stock/').catch(() => ({ results: [] })),
      ]);
      const recList = recs.results || (Array.isArray(recs) ? recs : []);
      const deadList = dead.results || (Array.isArray(dead) ? dead : []);
      setReorderAlertCount(recList.filter((r: any) => r.urgency === 'CRITICAL').length);
      setDeadStockCount(deadList.filter((d: any) => d.classification === 'DEAD_STOCK').length);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      await ApiClient.post('/businesses/seed-demo/');
      const bizRes = await ApiClient.get<any>('/businesses/current/');
      if (bizRes && bizRes.business) {
        setBusiness(bizRes.business);
        ApiClient.setActiveBusiness(bizRes.business.id);
        if (bizRes.business.branches && bizRes.business.branches.length > 0) {
          setActiveBranch(bizRes.business.branches[0]);
        }
      }
      // Refresh notifications & alerts
      const notifs = await ApiClient.get<any>('/notifications/');
      setNotifications(notifs.results || (Array.isArray(notifs) ? notifs : []));
    } catch (e) {
      console.error('Seed demo failed:', e);
    }
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPageView onEnterApp={(v) => setCurrentView(v || 'dashboard')} />;
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} />;
      case 'weekly-review':
        return <WeeklyReviewView />;
      case 'forecasting':
        return <ForecastExplorerView />;
      case 'replenishment':
        return <ReplenishmentView onNavigate={setCurrentView} />;
      case 'dead-stock':
        return <DeadStockView />;
      case 'catalog':
        return <CatalogView />;
      case 'inventory':
        return <InventoryView />;
      case 'imports':
        return <ImportsView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'procurement':
        return <PurchaseOrdersView />;
      case 'simulator':
        return <SimulatorView />;
      default:
        return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-ivory)', display: 'flex', flexDirection: 'column' }}>
      {currentView !== 'landing' && (
        <Navbar
          business={business}
          activeBranch={activeBranch}
          onSelectBranch={setActiveBranch}
          notifications={notifications}
          onSeedDemo={handleSeedDemo}
          currentView={currentView}
          onNavigate={setCurrentView}
        />
      )}

      <div style={{ display: 'flex', flex: 1 }}>
        {currentView !== 'landing' && (
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            reorderAlertCount={reorderAlertCount}
            deadStockCount={deadStockCount}
          />
        )}

        <main style={{
          flex: 1,
          padding: currentView === 'landing' ? '0' : '32px',
          maxWidth: currentView === 'landing' ? '100%' : '1440px',
          margin: '0 auto',
          width: '100%'
        }}>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};
