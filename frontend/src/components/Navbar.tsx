import React, { useState } from 'react';
import { Package, Bell, RefreshCw, Sparkles, Building2, ChevronDown, Check } from 'lucide-react';
import { Business, Branch, NotificationItem } from '../types';

interface NavbarProps {
  business: Business | null;
  activeBranch: Branch | null;
  onSelectBranch: (branch: Branch) => void;
  notifications: NotificationItem[];
  onSeedDemo: () => Promise<void>;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  business,
  activeBranch,
  onSelectBranch,
  notifications,
  onSeedDemo,
  currentView,
  onNavigate,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await onSeedDemo();
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--surface-cream)',
      borderBottom: '1px solid var(--border-beige)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Brand & Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div 
          onClick={() => onNavigate('landing')} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'var(--primary-forest)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--surface-cream)',
            boxShadow: '0 2px 4px rgba(53, 94, 59, 0.2)'
          }}>
            <Package size={20} strokeWidth={2.5} />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-charcoal)',
              letterSpacing: '-0.02em'
            }}>
              Demand<span style={{ color: 'var(--primary-forest)' }}>IQ</span>
            </span>
            <div style={{ fontSize: '10px', color: 'var(--text-warm-gray)', fontWeight: 600, letterSpacing: '0.04em' }}>
              RETAIL INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Business and Branch Indicator */}
        {business && (
          <div style={{ position: 'relative', marginLeft: '16px' }}>
            <button
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Building2 size={14} color="var(--primary-forest)" />
              <span style={{ fontWeight: 600 }}>{business.name}</span>
              <span style={{ color: 'var(--text-warm-gray)', fontSize: '11px' }}>
                • {activeBranch ? activeBranch.name : 'Main Store'}
              </span>
              <ChevronDown size={12} color="var(--text-warm-gray)" />
            </button>

            {showBranchMenu && business.branches && business.branches.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                width: '260px',
                backgroundColor: 'var(--surface-cream)',
                border: '1px solid var(--border-beige)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                zIndex: 50
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', padding: '6px 8px', fontWeight: 700 }}>
                  SELECT OPERATING BRANCH
                </div>
                {business.branches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectBranch(b);
                      setShowBranchMenu(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      backgroundColor: activeBranch?.id === b.id ? 'var(--primary-forest-soft)' : 'transparent',
                      color: activeBranch?.id === b.id ? 'var(--primary-forest)' : 'var(--text-charcoal)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{b.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>{b.city}, {b.state}</div>
                    </div>
                    {activeBranch?.id === b.id && <Check size={14} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Seed Demo Action */}
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="btn btn-secondary btn-sm"
          title="Seed realistic Indian Grocery & Pharmacy store demonstration data"
          style={{ borderColor: 'var(--accent-sage)', color: 'var(--primary-forest)' }}
        >
          <Sparkles size={14} color="var(--accent-orange)" />
          <span>{seeding ? 'Seeding Demo Data...' : 'Reset / Seed Demo Store'}</span>
        </button>

        {/* Notifications Icon */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-secondary btn-sm"
            style={{ position: 'relative', padding: '7px 10px' }}
          >
            <Bell size={16} color="var(--text-charcoal)" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--accent-orange)',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '8px',
              width: '320px',
              backgroundColor: 'var(--surface-cream)',
              border: '1px solid var(--border-beige)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              padding: '12px',
              zIndex: 50
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>Operational Alerts</span>
                <span className="badge badge-sage">{unreadCount} New</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ color: 'var(--text-warm-gray)', fontSize: '12.5px', padding: '16px 0', textAlign: 'center' }}>
                    All inventory levels optimal. No alerts.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: n.severity === 'CRITICAL' ? 'var(--status-error-bg)' : 'var(--surface-tint)',
                        border: '1px solid var(--border-beige)'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--text-charcoal)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-charcoal-subtle)', marginTop: '2px' }}>
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile avatar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--surface-tint)',
          border: '1px solid var(--border-beige)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-forest)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 700
          }}>
            RP
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-charcoal)' }}>
            Ramesh Patel
          </div>
        </div>
      </div>
    </header>
  );
};
