import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  ShoppingBag,
  Boxes,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  ClipboardList,
  Sliders,
  Compass,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  reorderAlertCount: number;
  deadStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  reorderAlertCount,
  deadStockCount
}) => {
  const { t } = useLanguage();

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { id: 'weekly-review', label: t('weeklyReview'), icon: CalendarCheck },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'catalog', label: t('catalog'), icon: ShoppingBag },
        { id: 'inventory', label: t('inventory'), icon: Boxes },
        { id: 'imports', label: t('imports'), icon: FileSpreadsheet },
      ]
    },
    {
      title: 'PREDICTIVE INTELLIGENCE',
      items: [
        { id: 'forecasting', label: t('forecasting'), icon: TrendingUp },
        { 
          id: 'replenishment', 
          label: t('replenishment'), 
          icon: AlertTriangle,
          badge: reorderAlertCount > 0 ? `${reorderAlertCount}` : undefined,
          badgeType: 'error'
        },
        { 
          id: 'dead-stock', 
          label: t('deadStock'), 
          icon: Boxes,
          badge: deadStockCount > 0 ? `${deadStockCount}` : undefined,
          badgeType: 'warning'
        },
        { id: 'calendar', label: t('calendar'), icon: Calendar },
        { id: 'simulator', label: t('simulator'), icon: Sliders },
      ]
    },
    {
      title: 'PROCUREMENT',
      items: [
        { id: 'suppliers', label: t('suppliers'), icon: Users },
        { id: 'procurement', label: t('procurement'), icon: ClipboardList },
      ]
    },
    {
      title: 'EXPLORE & DOCS',
      items: [
        { id: 'landing', label: t('landingShowcase'), icon: Compass },
      ]
    }
  ];

  return (
    <aside style={{
      width: '250px',
      backgroundColor: 'var(--surface-cream)',
      borderRight: '1px solid var(--border-beige)',
      height: 'calc(100vh - 64px)',
      position: 'sticky',
      top: '64px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 12px',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--text-warm-gray)',
              padding: '0 12px 8px 12px'
            }}>
              {sec.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'var(--primary-forest-soft)' : 'transparent',
                      color: isActive ? 'var(--primary-forest)' : 'var(--text-charcoal)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 500,
                      transition: 'all 0.15s ease',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={17} color={isActive ? 'var(--primary-forest)' : 'var(--text-warm-gray)'} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: item.badgeType === 'error' ? 'var(--status-error)' : 'var(--accent-orange)',
                        color: '#fff'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div style={{
        padding: '14px 12px',
        borderTop: '1px solid var(--border-beige)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-charcoal)' }}>DemandIQ Core 1.0</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>
          Local processing • Zero external APIs
        </div>
      </div>
    </aside>
  );
};
