import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  IndianRupee,
  Layers,
  ArrowUpRight,
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const sampleSalesData = [
  { day: 'Mon', sales: 14200, forecast: 13800 },
  { day: 'Tue', sales: 16800, forecast: 15500 },
  { day: 'Wed', sales: 15400, forecast: 16100 },
  { day: 'Thu', sales: 18900, forecast: 18200 },
  { day: 'Fri', sales: 22400, forecast: 21500 },
  { day: 'Sat', sales: 29500, forecast: 27800 },
  { day: 'Sun', sales: 27380, forecast: 26500 },
];

export const DashboardPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'reorder' | 'festive'>('sales');

  return (
    <div className="floating-dashboard-card">
      {/* Header with Live Status & Store Name */}
      <div className="dash-preview-header">
        <div className="dash-preview-title">
          <div className="dash-preview-live-dot" />
          <span>Sri Lakshmi Kirana & Provisions</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          color: 'var(--lp-orange)',
          fontWeight: 700,
          backgroundColor: 'var(--lp-orange-light)',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          <Sparkles size={11} />
          <span>DemandIQ Live</span>
        </div>
      </div>

      {/* Interactive Feature Pills */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('sales')}
          style={{
            flex: 1,
            padding: '5px 0',
            fontSize: '11px',
            fontWeight: 700,
            borderRadius: '6px',
            border: activeTab === 'sales' ? '1px solid var(--lp-forest-primary)' : '1px solid var(--lp-beige-border)',
            backgroundColor: activeTab === 'sales' ? 'var(--lp-sage-light)' : 'transparent',
            color: activeTab === 'sales' ? 'var(--lp-forest-dark)' : 'var(--lp-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Sales Trend
        </button>
        <button
          onClick={() => setActiveTab('reorder')}
          style={{
            flex: 1,
            padding: '5px 0',
            fontSize: '11px',
            fontWeight: 700,
            borderRadius: '6px',
            border: activeTab === 'reorder' ? '1px solid var(--lp-orange)' : '1px solid var(--lp-beige-border)',
            backgroundColor: activeTab === 'reorder' ? 'var(--lp-orange-light)' : 'transparent',
            color: activeTab === 'reorder' ? 'var(--lp-orange)' : 'var(--lp-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Reorder Alert (18)
        </button>
        <button
          onClick={() => setActiveTab('festive')}
          style={{
            flex: 1,
            padding: '5px 0',
            fontSize: '11px',
            fontWeight: 700,
            borderRadius: '6px',
            border: activeTab === 'festive' ? '1px solid var(--lp-forest-dark)' : '1px solid var(--lp-beige-border)',
            backgroundColor: activeTab === 'festive' ? 'var(--lp-forest-dark)' : 'transparent',
            color: activeTab === 'festive' ? '#FFFFFF' : 'var(--lp-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Diwali Prep (+85%)
        </button>
      </div>

      {/* 4 Core Metrics Grid */}
      <div className="dash-preview-metrics">
        <div className="dash-metric-box">
          <div className="dash-metric-label">Total Sales (7D)</div>
          <div className="dash-metric-val">₹1,24,580</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px', color: '#477A52', fontWeight: 600, marginTop: '2px' }}>
            <ArrowUpRight size={12} />
            <span>+14.2% this week</span>
          </div>
        </div>

        <div className="dash-metric-box">
          <div className="dash-metric-label">Total Products</div>
          <div className="dash-metric-val">342</div>
          <div style={{ fontSize: '10px', color: 'var(--lp-secondary)', marginTop: '2px' }}>
            Active Kirana SKUs
          </div>
        </div>

        <div className="dash-metric-box">
          <div className="dash-metric-label">Stock Value</div>
          <div className="dash-metric-val">₹3,45,320</div>
          <div style={{ fontSize: '10px', color: 'var(--lp-secondary)', marginTop: '2px' }}>
            Active inventory
          </div>
        </div>

        <div className="dash-metric-box" style={{ borderColor: 'rgba(217, 121, 61, 0.4)' }}>
          <div className="dash-metric-label" style={{ color: 'var(--lp-orange)' }}>Low Stock Items</div>
          <div className="dash-metric-val" style={{ color: 'var(--lp-orange)' }}>18</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--lp-orange)', fontWeight: 600, marginTop: '2px' }}>
            <AlertTriangle size={11} />
            <span>Review orders</span>
          </div>
        </div>
      </div>

      {/* Tab Content 1: Sales Trend Chart */}
      {activeTab === 'sales' && (
        <div className="dash-preview-chart-box">
          <div className="dash-chart-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <TrendingUp size={13} color="var(--lp-forest-primary)" />
              <span>Daily Sales vs Model Forecast</span>
            </span>
            <span style={{ fontSize: '10px', color: 'var(--lp-secondary)' }}>Last 7 Days</span>
          </div>

          <div style={{ width: '100%', height: 95 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleSalesData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="warmForestGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#20583D" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#20583D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#817D74" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#817D74" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFDF8',
                    borderColor: '#EDE5D3',
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(18, 61, 46, 0.1)'
                  }}
                  formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Sales']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#20583D"
                  strokeWidth={2.2}
                  fillOpacity={1}
                  fill="url(#warmForestGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab Content 2: Reorder Alerts */}
      {activeTab === 'reorder' && (
        <div style={{
          backgroundColor: 'var(--lp-orange-light)',
          border: '1px solid rgba(217, 121, 61, 0.3)',
          borderRadius: '10px',
          padding: '10px 12px',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--lp-orange)' }}>
              Urgent PO Recommendation
            </span>
            <span style={{ fontSize: '10.5px', color: 'var(--lp-secondary)' }}>Lead: 3 Days</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--lp-charcoal)', lineHeight: '1.4' }}>
            <strong>Toor Dal Unpolished (1kg)</strong> has only 12kg remaining. Suggested order: <strong>48kg (₹5,760)</strong> to prevent Saturday stockout.
          </div>
        </div>
      )}

      {/* Tab Content 3: Festive Surge */}
      {activeTab === 'festive' && (
        <div style={{
          backgroundColor: 'var(--lp-forest-dark)',
          color: '#FFFFFF',
          borderRadius: '10px',
          padding: '10px 12px',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--lp-sage-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flame size={12} color="var(--lp-orange)" />
              <span>Diwali Festive Surge Planner</span>
            </span>
            <span style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px' }}>Day -18</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--lp-sage-light)', lineHeight: '1.4' }}>
            Historical sales spike: <strong>+85%</strong> for Ghee, Cashews & Refined Oils. Wholesale booking cutoff: <strong>This Friday</strong>.
          </div>
        </div>
      )}

      {/* Top-Selling Products List */}
      <div className="dash-preview-products">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: 'var(--lp-charcoal)', marginBottom: '2px' }}>
          <span>High Demand SKUs</span>
          <span style={{ fontSize: '10px', color: 'var(--lp-secondary)' }}>Status</span>
        </div>

        <div className="dash-prod-row">
          <div>
            <span className="dash-prod-name">Sona Masoori Rice (25kg)</span>
            <span style={{ fontSize: '10px', color: 'var(--lp-secondary)', marginLeft: '6px' }}>48 sold</span>
          </div>
          <span className="dash-prod-tag tag-stock-healthy">Optimal</span>
        </div>

        <div className="dash-prod-row">
          <div>
            <span className="dash-prod-name">Fortune Sunflower Oil (1L)</span>
            <span style={{ fontSize: '10px', color: 'var(--lp-secondary)', marginLeft: '6px' }}>62 sold</span>
          </div>
          <span className="dash-prod-tag tag-stock-healthy">Optimal</span>
        </div>

        <div className="dash-prod-row">
          <div>
            <span className="dash-prod-name">Toor Dal Unpolished (1kg)</span>
            <span style={{ fontSize: '10px', color: 'var(--lp-secondary)', marginLeft: '6px' }}>34 sold</span>
          </div>
          <span className="dash-prod-tag tag-reorder-urgent">Reorder (3d left)</span>
        </div>
      </div>
    </div>
  );
};
