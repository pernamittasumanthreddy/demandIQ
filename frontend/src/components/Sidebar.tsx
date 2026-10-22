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
  FileText
} from 'lucide-react';

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
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
        { id: 'weekly-review', label: 'Weekly Stock Review', icon: CalendarCheck },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'catalog', label: 'Product Catalog', icon: ShoppingBag },
        { id: 'inventory', label: 'Inventory Balances', icon: Boxes },
        { id: 'imports', label: 'Sales Import Center', icon: FileSpreadsheet },
      ]
    },
    {
      title: 'PREDICTIVE INTELLIGENCE',
      items: [
        { id: 'forecasting', label: 'Demand Forecasting', icon: TrendingUp },
        { 
          id: 'replenishment', 
          label: 'Reorder Suggestions', 
          icon: AlertTriangle,
          badge: reorderAlertCount > 0 ? `${reorderAlertCount}` : undefined,
          badgeType: 'error'
        },
        { 
          id: 'dead-stock', 
          label: 'Dead-Stock Detection', 
          icon: Boxes,
          badge: deadStockCount > 0 ? `${deadStockCount}` : undefined,
          badgeType: 'warning'
        },
        { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
      ]
    },
    {
      title: 'PROCUREMENT',
      items: [
        { id: 'suppliers', label: 'Suppliers & Vendors', icon: Users },
        { id: 'procurement', label: 'Purchase Orders', icon: ClipboardList },
      ]
    },
    {
      title: 'EXPLORE & DOCS',
      items: [
        { id: 'landing', label: 'Product Showcase', icon: Compass },
      ]
    }
  ];

  return (
    <aside style={{
      width: '240px',
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
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--primary-forest)' : 'transparent',
                      backgroundColor: isActive ? 'var(--primary-forest-soft)' : 'transparent',
                      color: isActive ? 'var(--primary-forest)' : 'var(--text-charcoal-subtle)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} color={isActive ? 'var(--primary-forest)' : 'var(--text-warm-gray)'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={item.badgeType === 'error' ? 'badge badge-error' : 'badge badge-warning'} style={{ fontSize: '10.5px', padding: '2px 6px' }}>
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

      {/* Brand footer assurance */}
      <div style={{
        padding: '12px',
        backgroundColor: 'var(--surface-tint)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontSize: '11.5px',
        color: 'var(--text-charcoal-subtle)',
        lineHeight: 1.4
      }}>
        <div style={{ fontWeight: 700, color: 'var(--primary-forest)' }}>DemandIQ v1.0</div>
        <div>No blue UI guarantee. Authentic Indian retail forecasting.</div>
      </div>
    </aside>
  );
};
