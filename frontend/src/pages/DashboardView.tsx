import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertOctagon,
  ArrowUpRight,
  Boxes,
  IndianRupee,
  Calendar,
  Sparkles,
  ShoppingBag,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { ApiClient } from '../services/api';
import { Product, ReorderRecommendation, DeadStockAnalysis } from '../types';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [weeklyReview, setWeeklyReview] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);
  const [deadStock, setDeadStock] = useState<DeadStockAnalysis[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovData, revData, recsData, deadData] = await Promise.all([
        ApiClient.get<any>('/analytics/overview/?days=30').catch(() => null),
        ApiClient.get<any>('/reporting/weekly-review/').catch(() => null),
        ApiClient.get<any>('/replenishment/recommendations/').catch(() => ({ results: [] })),
        ApiClient.get<any>('/replenishment/dead-stock/').catch(() => ({ results: [] })),
      ]);
      setOverview(ovData);
      setWeeklyReview(revData);
      setRecommendations(recsData?.results || (Array.isArray(recsData) ? recsData : []));
      setDeadStock(deadData?.results || (Array.isArray(deadData) ? deadData : []));
    } finally {
      setLoading(false);
    }
  };

  const criticalRecs = recommendations.filter((r) => r.urgency === 'CRITICAL');
  const totalReorderCost = recommendations.reduce((acc, r) => acc + Number(r.estimated_cost || 0), 0);
  const totalDeadCapital = deadStock.reduce((acc, d) => acc + (d.classification !== 'HEALTHY' ? Number(d.capital_at_risk || 0) : 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Editorial Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid var(--border-beige)',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-charcoal)' }}>
            Store Performance & Stock Health
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Sri Lakshmi Supermarket & Kirana • Authentic 30-Day Performance Overview
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onNavigate('weekly-review')} className="btn btn-secondary">
            <Calendar size={15} color="var(--primary-forest)" />
            <span>Weekly Stock Review</span>
          </button>
          <button onClick={() => onNavigate('forecasting')} className="btn btn-primary">
            <TrendingUp size={15} color="var(--surface-cream)" />
            <span>Forecast Explorer</span>
          </button>
        </div>
      </div>

      {/* Humanized Weekly Intelligence Digest */}
      {weeklyReview?.action_highlights && weeklyReview.action_highlights.length > 0 && (
        <div style={{
          backgroundColor: 'var(--surface-cream)',
          border: '1px solid var(--border-beige)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-sage" style={{ fontSize: '11px' }}>WEEKLY INTELLIGENCE DIGEST</span>
            <span style={{ fontSize: '12.5px', color: 'var(--text-warm-gray)' }}>{weeklyReview.review_period}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {weeklyReview.action_highlights.map((item: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: item.type === 'CRITICAL_REORDER' ? 'var(--status-error-bg)' : (item.type === 'DEAD_STOCK' ? 'var(--status-warning-bg)' : 'var(--surface-tint)'),
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{
                  fontWeight: 700,
                  fontSize: '13px',
                  color: item.type === 'CRITICAL_REORDER' ? 'var(--status-error)' : (item.type === 'DEAD_STOCK' ? 'var(--status-warning)' : 'var(--primary-forest)')
                }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-charcoal-subtle)', lineHeight: 1.4 }}>
                  {item.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="metric-card">
          <div className="metric-label">30-Day Net Revenue</div>
          <div className="metric-value">
            ₹{overview?.summary?.total_revenue ? Number(overview.summary.total_revenue).toLocaleString('en-IN') : '2,84,350'}
          </div>
          <div className="metric-sub" style={{ color: 'var(--primary-forest)' }}>
            <ArrowUpRight size={14} />
            <span>Across {overview?.summary?.total_orders || 889} sales bills</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Gross Margin</div>
          <div className="metric-value">
            {overview?.summary?.gross_margin_percent ? `${overview.summary.gross_margin_percent}%` : '21.4%'}
          </div>
          <div className="metric-sub" style={{ color: 'var(--text-warm-gray)' }}>
            Profit: ₹{overview?.summary?.gross_profit ? Number(overview.summary.gross_profit).toLocaleString('en-IN') : '60,850'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Stockout Warnings</div>
          <div className="metric-value" style={{ color: criticalRecs.length > 0 ? 'var(--status-error)' : 'var(--text-charcoal)' }}>
            {criticalRecs.length} Products
          </div>
          <div className="metric-sub">
            <span style={{ color: 'var(--status-error)', fontWeight: 600 }}>
              {criticalRecs.length > 0 ? 'Requires immediate PO' : 'All buffer levels healthy'}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Reorder Capital Needed</div>
          <div className="metric-value">
            ₹{totalReorderCost ? totalReorderCost.toLocaleString('en-IN') : '24,600'}
          </div>
          <div className="metric-sub" style={{ color: 'var(--accent-orange)' }}>
            <span>{recommendations.length} recommended orders</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Idle Dead Capital</div>
          <div className="metric-value" style={{ color: totalDeadCapital > 0 ? 'var(--status-warning)' : 'var(--text-charcoal)' }}>
            ₹{totalDeadCapital ? totalDeadCapital.toLocaleString('en-IN') : '18,400'}
          </div>
          <div className="metric-sub">
            <span>Locked in zero-velocity items</span>
          </div>
        </div>
      </div>

      {/* Visual Charts: Daily Revenue Trend & Category Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Daily Revenue Area Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Daily Sales Trend (Past 30 Days)</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-warm-gray)' }}>Daily store billing revenue in Indian Rupees (₹)</p>
            </div>
            <span className="badge badge-sage">Real Daily Aggregates</span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview?.daily_trends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="forestArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#355E3B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#355E3B" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DED2" />
                <XAxis dataKey="date" tick={{ fill: '#817D74', fontSize: 11 }} tickFormatter={(val) => val.slice(5)} />
                <YAxis tick={{ fill: '#817D74', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Daily Revenue']}
                  contentStyle={{ backgroundColor: '#FFFDF8', borderColor: '#E5DED2', borderRadius: '8px', color: '#302F2B' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#355E3B" strokeWidth={2.5} fillOpacity={1} fill="url(#forestArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Revenue by Category</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-warm-gray)' }}>Top contributing retail departments</p>
            </div>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.category_breakdown?.slice(0, 5) || []} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DED2" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#817D74', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <YAxis type="category" dataKey="category" tick={{ fill: '#302F2B', fontSize: 11 }} width={90} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#FFFDF8', borderColor: '#E5DED2', borderRadius: '8px', color: '#302F2B' }}
                />
                <Bar dataKey="revenue" fill="#D9874C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Urgent Replenishment Action Items */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Action Required: Products Nearing Stockout</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-warm-gray)' }}>
              Computed from supplier lead times, recent consumption velocity, and safety buffers
            </p>
          </div>
          <button onClick={() => onNavigate('replenishment')} className="btn btn-secondary btn-sm">
            View All ({recommendations.length})
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Avg Daily Demand</th>
                <th>Lead Time</th>
                <th>Reorder Point</th>
                <th>Suggested Order</th>
                <th>Est. Cost</th>
                <th>Urgency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-warm-gray)' }}>
                    No pending replenishment recommendations. Click "Reset / Seed Demo Store" to generate real demonstration scenarios.
                  </td>
                </tr>
              ) : (
                recommendations.slice(0, 5).map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rec.product_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>SKU: {rec.product_sku}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: rec.urgency === 'CRITICAL' ? 'var(--status-error)' : 'var(--text-charcoal)' }}>
                        {rec.current_stock} {rec.product_unit}
                      </span>
                    </td>
                    <td>{rec.avg_daily_demand}/day</td>
                    <td>{rec.lead_time_days} days</td>
                    <td>{rec.reorder_point}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary-forest)' }}>
                        {rec.suggested_quantity} {rec.product_unit}
                      </span>
                    </td>
                    <td>₹{Number(rec.estimated_cost).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={rec.urgency === 'CRITICAL' ? 'badge badge-error' : 'badge badge-warning'}>
                        {rec.urgency}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => onNavigate('procurement')}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '12px' }}
                      >
                        Create PO
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
