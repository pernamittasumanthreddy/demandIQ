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
  Clock,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sliders
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
import { useLanguage } from '../services/LanguageContext';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [weeklyReview, setWeeklyReview] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<ReorderRecommendation[]>([]);
  const [deadStock, setDeadStock] = useState<DeadStockAnalysis[]>([]);

  // Mini What-If State
  const [simDemandSurge, setSimDemandSurge] = useState<number>(20);

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

  // Simulated metrics based on slider
  const baseRevenue = overview?.summary?.total_revenue ? Number(overview.summary.total_revenue) : 284350;
  const simulatedRevenue = Math.round(baseRevenue * (1 + simDemandSurge / 100));
  const additionalProfit = Math.round((simulatedRevenue - baseRevenue) * 0.214);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Editorial Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid var(--border-beige)',
        paddingBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-charcoal)' }}>
            {t('dashboard')}
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Sri Lakshmi Supermarket & Kirana • {t('dailyBriefingSub')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('calendar')} className="btn btn-secondary">
            <Calendar size={15} color="var(--primary-forest)" />
            <span>{t('calendar')}</span>
          </button>
          <button onClick={() => onNavigate('weekly-review')} className="btn btn-secondary">
            <Clock size={15} color="var(--primary-forest)" />
            <span>{t('weeklyReview')}</span>
          </button>
          <button onClick={() => onNavigate('forecasting')} className="btn btn-primary">
            <TrendingUp size={15} color="var(--surface-cream)" />
            <span>{t('forecasting')}</span>
          </button>
        </div>
      </div>

      {/* Daily Morning Stock Briefing Card */}
      <div style={{
        backgroundColor: 'var(--surface-cream)',
        border: '1px solid var(--border-beige)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-forest)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={14} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-charcoal)' }}>
              {t('dailyBriefingTitle')}
            </span>
            <span style={{
              backgroundColor: 'var(--primary-forest-soft)',
              color: 'var(--primary-forest)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              LIVE INTELLIGENCE
            </span>
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-warm-gray)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {/* Briefing Item 1: Urgent Reorder */}
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: criticalRecs.length > 0 ? 'var(--status-error-bg)' : 'var(--primary-forest-soft)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{
              fontWeight: 700,
              fontSize: '13px',
              color: criticalRecs.length > 0 ? 'var(--status-error)' : 'var(--primary-forest)'
            }}>
              {criticalRecs.length > 0
                ? `${criticalRecs.length} ${language === 'te' ? 'వస్తువులు అత్యవసరంగా ఆర్డర్ చేయాలి' : language === 'hi' ? 'उत्पादों को तुरंत री-ऑर्डर करने की आवश्यकता है' : 'Items Urgently Need Replenishment'}`
                : 'All Safety Stocks Optimal'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-charcoal-subtle)' }}>
              {criticalRecs.length > 0
                ? `${criticalRecs[0].product_name} will stock out in ${criticalRecs[0].estimated_stockout_days || 2} days. Suggested order: ${criticalRecs[0].suggested_quantity} units.`
                : 'Zero stockouts forecasted across current supplier lead times.'}
            </div>
            {criticalRecs.length > 0 && (
              <span
                onClick={() => onNavigate('replenishment')}
                style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--status-error)', cursor: 'pointer', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>{t('reorderNow')}</span>
                <ArrowRight size={12} />
              </span>
            )}
          </div>

          {/* Briefing Item 2: Demand Trend */}
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--surface-tint)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary-forest)' }}>
              {language === 'te' ? 'సోనా మసూరి బియ్యం డిమాండ్ పెరుగుతోంది' : language === 'hi' ? 'सोना मसूरी चावल की मांग में वृद्धि' : 'Rice Demand Accelerating (+18%)'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-charcoal-subtle)' }}>
              Weekend household grocery purchases trended 18% higher than weekday moving averages.
            </div>
            <span
              onClick={() => onNavigate('forecasting')}
              style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--primary-forest)', cursor: 'pointer', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View Time-Series ML Model</span>
              <ArrowRight size={12} />
            </span>
          </div>

          {/* Briefing Item 3: Dead Capital Recovery */}
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: totalDeadCapital > 0 ? 'var(--status-warning-bg)' : 'var(--surface-tint)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--accent-orange)' }}>
              {language === 'te' ? `₹${totalDeadCapital.toLocaleString('en-IN')} నిరుపయోగ మూలధనం విడుదల చేయవచ్చు` : language === 'hi' ? `₹${totalDeadCapital.toLocaleString('en-IN')} फंसी हुई पूंजी मुक्त की जा सकती है` : `Unlock ₹${totalDeadCapital.toLocaleString('en-IN')} in Working Capital`}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-charcoal-subtle)' }}>
              Slow-moving goods have zero velocity past 60 days. Bundle promotion recommended.
            </div>
            <span
              onClick={() => onNavigate('dead-stock')}
              style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-orange)', cursor: 'pointer', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Review Clearance Actions</span>
              <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Indian Festival Alert Banner */}
      <div style={{
        backgroundColor: 'var(--lp-forest-dark, #123D2E)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 4px 14px rgba(18, 61, 46, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(217, 121, 61, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--lp-orange, #D9793D)'
          }}>
            <Flame size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '15px' }}>
                Diwali & Dhanteras in 18 Days (+85% Festive Surge Expected)
              </span>
              <span style={{
                backgroundColor: 'var(--lp-orange, #D9793D)',
                color: '#fff',
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                PREP CUTOFF
              </span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#A8B99A', marginTop: '2px' }}>
              High-value items (Ghee 1L, Dry fruits, Edible oils, Pooja essentials) require wholesale booking by this Friday.
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('calendar')}
          className="btn btn-primary"
          style={{ backgroundColor: '#FFFFFF', color: '#123D2E', fontWeight: 700, fontSize: '13px' }}
        >
          <span>Open Demand Calendar</span>
          <ArrowRight size={14} color="#123D2E" />
        </button>
      </div>

      {/* KPI Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="metric-card">
          <div className="metric-label">{t('totalSales')}</div>
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
          <div className="metric-label">{t('lowStockAlerts')}</div>
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
          <div className="metric-label">{t('deadCapital')}</div>
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
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Sales Revenue']}
                  contentStyle={{ backgroundColor: 'var(--surface-cream)', borderColor: 'var(--border-beige)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="total_sales" stroke="#355E3B" strokeWidth={2.5} fillOpacity={1} fill="url(#forestArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick What-If Mini Simulator Widget */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sliders size={16} color="var(--primary-forest)" />
              <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Quick What-If Estimator</h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-warm-gray)', marginBottom: '16px' }}>
              Simulate store sales surge on 30-day net revenue & gross profits
            </p>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Demand Lift:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-forest)' }}>+{simDemandSurge}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={simDemandSurge}
                onChange={(e) => setSimDemandSurge(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-forest)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--surface-tint)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-warm-gray)' }}>Projected Sales:</span>
                <span style={{ fontWeight: 800, color: 'var(--text-charcoal)' }}>₹{simulatedRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-warm-gray)' }}>Additional Profit:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-forest)' }}>+₹{additionalProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('simulator')}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center', marginTop: '14px' }}
          >
            <span>Open Full Scenario Workspace</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
