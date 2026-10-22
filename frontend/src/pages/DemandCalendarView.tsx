import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Package,
  Plus,
  Clock,
  CheckCircle2,
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';

interface FestivalEvent {
  id: string;
  name: string;
  nameHi: string;
  nameTe: string;
  date: string;
  daysRemaining: number;
  season: string;
  surgeMultiplier: number;
  leadTimeDays: number;
  affectedCategories: string[];
  keyProducts: string[];
  historicalNotes: string;
  actionItems: string[];
}

const defaultFestivals: FestivalEvent[] = [
  {
    id: 'diwali',
    name: 'Diwali & Dhanteras',
    nameHi: 'दीपावली और धनतेरस',
    nameTe: 'దీపావళి & ధనత్రయోదశి',
    date: 'November 2026',
    daysRemaining: 18,
    season: 'Autumn / Festival Peak',
    surgeMultiplier: 1.85,
    leadTimeDays: 24,
    affectedCategories: ['Sweets & Ghee', 'Dry Fruits', 'Edible Oils', 'Pooja Essentials'],
    keyProducts: ['Amul Cow Ghee 1L', 'Cashew W320 500g', 'Fortune Sunflower Oil 5L', 'Deepam Pooja Oil 1L', 'Sugar 5kg'],
    historicalNotes: 'Historical POS analysis shows an 85% surge in high-value gift packs and cooking oils starting 12 days prior.',
    actionItems: [
      'Lock wholesale oil & ghee bulk pricing by Day -20',
      'Order gift dry fruit packaging boxes from vendor',
      'Create front-of-store festive display corner'
    ]
  },
  {
    id: 'sankranti',
    name: 'Makar Sankranti / Pongal',
    nameHi: 'मकर संक्रांति / पोंगल',
    nameTe: 'సంక్రాంతి / పొంగల్',
    date: 'January 2027',
    daysRemaining: 84,
    season: 'Harvest Festival',
    surgeMultiplier: 1.60,
    leadTimeDays: 14,
    affectedCategories: ['Rice & Grains', 'Jaggery & Sweeteners', 'Pulses & Lentils'],
    keyProducts: ['Sona Masoori Rice 25kg', 'Organic Jaggery Block 1kg', 'Toor Dal Unpolished 1kg', 'Sesame Seeds (Til) 200g'],
    historicalNotes: 'Staples and jaggery sales double in the week leading to Bhogi and Sankranti.',
    actionItems: [
      'Increase 25kg rice bag buffer by 40%',
      'Stock clean natural jaggery blocks from rural distributors'
    ]
  },
  {
    id: 'school',
    name: 'School & College Reopening',
    nameHi: 'स्कूल व कॉलेज सत्रारंभ',
    nameTe: 'పాఠశాలల పునఃప్రారంభం',
    date: 'June 2027',
    daysRemaining: 228,
    season: 'Academic Season',
    surgeMultiplier: 2.40,
    leadTimeDays: 30,
    affectedCategories: ['Stationery', 'Beverages & Snacks'],
    keyProducts: ['Classmate 172-page Notebooks', 'Reynolds Ballpoint Pens 5-pack', 'Doms Geometry Box', 'Cello Gripper Pens'],
    historicalNotes: 'Highest stationery sales volume of the year; stockouts occur if wholesale orders delayed past May 15.',
    actionItems: [
      'Place consolidated notebook & paper order with mill distributors',
      'Bundle pens and geometry boxes for combo discount'
    ]
  },
  {
    id: 'wedding',
    name: 'Winter Wedding & Catering Season',
    nameHi: 'शीतकालीन विवाह समारोह सत्र',
    nameTe: 'శీతాకాల వివాహ వేడుకలు',
    date: 'Dec 2026 - Feb 2027',
    daysRemaining: 40,
    season: 'Catering Peak',
    surgeMultiplier: 1.50,
    leadTimeDays: 10,
    affectedCategories: ['Bulk Grains', 'Wholesale Oils', 'Spices & Condiments'],
    keyProducts: ['Basmati Classic Rice 25kg', 'Refined Sunflower Oil 15L Tin', 'Everest Kashmiri Chilli 500g', 'Tata Salt 25kg Bag'],
    historicalNotes: 'Caterers place large bulk single orders; ensure credit terms and minimum deposit upfront.',
    actionItems: [
      'Maintain minimum 15 tins of 15L oil in secondary back-room storage',
      'Verify credit limits for local caterers'
    ]
  },
  {
    id: 'ramzan',
    name: 'Eid-ul-Fitr & Ramzan Season',
    nameHi: 'ईद-उल-फ़ित्र और रमज़ान',
    nameTe: 'రంజాన్ & ఈద్-ఉల్-ఫితర్',
    date: 'March 2027',
    daysRemaining: 152,
    season: 'Religious Observance',
    surgeMultiplier: 1.90,
    leadTimeDays: 20,
    affectedCategories: ['Dates & Dry Fruits', 'Vermicelli (Seviyan)', 'Beverage Syrups'],
    keyProducts: ['Kimia Iranian Dates 500g', 'Bambino Roasted Vermicelli 400g', 'Rooh Afza 750ml', 'Whole Almonds 500g'],
    historicalNotes: 'Evening snack and date sales spike starting on Day 1 of fasting.',
    actionItems: [
      'Order fresh crop dates directly from importer',
      'Stock syrup bottles in visible chiller counter'
    ]
  }
];

export const DemandCalendarView: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedFestival, setSelectedFestival] = useState<FestivalEvent>(defaultFestivals[0]);
  const [customSurge, setCustomSurge] = useState<number>(defaultFestivals[0].surgeMultiplier);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [festivals, setFestivals] = useState<FestivalEvent[]>(defaultFestivals);
  const [newEventName, setNewEventName] = useState<string>('');
  const [newEventDays, setNewEventDays] = useState<number>(30);
  const [newEventSurge, setNewEventSurge] = useState<number>(1.5);

  const getEventName = (fest: FestivalEvent) => {
    if (language === 'hi' && fest.nameHi) return fest.nameHi;
    if (language === 'te' && fest.nameTe) return fest.nameTe;
    return fest.name;
  };

  const handleSelectFestival = (fest: FestivalEvent) => {
    setSelectedFestival(fest);
    setCustomSurge(fest.surgeMultiplier);
  };

  const handleAddCustomEvent = () => {
    if (!newEventName.trim()) return;
    const newFest: FestivalEvent = {
      id: `custom-${Date.now()}`,
      name: newEventName,
      nameHi: newEventName,
      nameTe: newEventName,
      date: `In ${newEventDays} Days`,
      daysRemaining: newEventDays,
      season: 'Local Business Event',
      surgeMultiplier: newEventSurge,
      leadTimeDays: 14,
      affectedCategories: ['Grocery & Staples', 'Snacks'],
      keyProducts: ['Sona Masoori Rice 25kg', 'Cooking Oil 1L', 'Tata Salt 1kg'],
      historicalNotes: 'Custom store-specific event or local community festival created by manager.',
      actionItems: ['Review reorder points 10 days before event', 'Alert key delivery vendors']
    };
    setFestivals([newFest, ...festivals]);
    setSelectedFestival(newFest);
    setCustomSurge(newEventSurge);
    setShowAddModal(false);
    setNewEventName('');
  };

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
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--accent-orange-soft)',
            color: 'var(--accent-orange)',
            fontSize: '12px',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            marginBottom: '8px'
          }}>
            <Sparkles size={13} />
            <span>INDIAN RETAIL INTELLIGENCE</span>
          </div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-charcoal)' }}>
            {t('calendar')}
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Anticipate seasonal demand surges, Indian festive shopping peaks, and pre-order requirements
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus size={16} color="var(--surface-cream)" />
          <span>Add Custom Event</span>
        </button>
      </div>

      {/* Main Grid: Left Timeline, Right Detail Simulator */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left: Festival List Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-charcoal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} color="var(--primary-forest)" />
            <span>Upcoming Demand Drivers ({festivals.length})</span>
          </div>

          {festivals.map((fest) => {
            const isSelected = selectedFestival.id === fest.id;
            const isUrgent = fest.daysRemaining <= 30;

            return (
              <div
                key={fest.id}
                onClick={() => handleSelectFestival(fest)}
                className="card"
                style={{
                  padding: '18px',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--primary-forest)' : isUrgent ? 'var(--accent-orange)' : 'var(--border-beige)',
                  backgroundColor: isSelected ? 'var(--surface-cream)' : 'var(--surface-cream-raised)',
                  boxShadow: isSelected ? '0 4px 16px rgba(53, 94, 59, 0.12)' : 'none',
                  transition: 'all 0.2s ease',
                  borderWidth: isSelected ? '2px' : '1px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-charcoal)', margin: 0 }}>
                        {getEventName(fest)}
                      </h3>
                      {isUrgent && (
                        <span style={{
                          backgroundColor: 'var(--accent-orange-soft)',
                          color: 'var(--accent-orange)',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          URGENT PREP
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-warm-gray)', marginTop: '4px' }}>
                      {fest.date} • {fest.season}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: isUrgent ? 'var(--accent-orange)' : 'var(--primary-forest)'
                    }}>
                      {fest.daysRemaining}d
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>remaining</div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-charcoal-subtle)' }}>
                    <TrendingUp size={13} color="var(--primary-forest)" />
                    <span>Expected Surge: <strong>+{Math.round((fest.surgeMultiplier - 1) * 100)}%</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-warm-gray)' }}>
                    <Clock size={13} />
                    <span>Lead time: {fest.leadTimeDays}d</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Festival Deep Dive & Demand Surge Simulator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--primary-forest)',
                  backgroundColor: 'var(--primary-forest-soft)',
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}>
                  EVENT INTELLIGENCE
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-charcoal)', marginTop: '6px' }}>
                  {getEventName(selectedFestival)}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-warm-gray)', marginTop: '2px' }}>
                  Trigger order cutoff: {selectedFestival.daysRemaining - selectedFestival.leadTimeDays > 0 ? `In ${selectedFestival.daysRemaining - selectedFestival.leadTimeDays} days` : 'IMMEDIATE ACTION REQUIRED'}
                </p>
              </div>

              <div style={{
                backgroundColor: 'var(--surface-cream)',
                border: '1px solid var(--border-beige)',
                borderRadius: '12px',
                padding: '10px 16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 600 }}>HISTORICAL PEAK</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-orange)' }}>
                  +{Math.round((selectedFestival.surgeMultiplier - 1) * 100)}%
                </div>
              </div>
            </div>

            <p style={{
              fontSize: '13.5px',
              color: 'var(--text-charcoal-subtle)',
              lineHeight: '1.6',
              backgroundColor: 'var(--surface-cream)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px'
            }}>
              {selectedFestival.historicalNotes}
            </p>

            {/* Interactive Surge Multiplier Slider */}
            <div style={{
              backgroundColor: 'var(--primary-forest-soft)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              border: '1px solid var(--accent-sage)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-forest)' }}>
                  Simulated Demand Surge Multiplier:
                </span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-forest)' }}>
                  +{Math.round((customSurge - 1) * 100)}% ({customSurge.toFixed(2)}x)
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={customSurge}
                onChange={(e) => setCustomSurge(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-forest)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-warm-gray)', marginTop: '4px' }}>
                <span>Baseline (1.0x)</span>
                <span>Moderate (+50%)</span>
                <span>Festival Rush (+100%)</span>
                <span>Unprecedented (+150%)</span>
              </div>
            </div>

            {/* Affected Categories & High-Impact SKUs */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-charcoal)', marginBottom: '8px' }}>
                High-Impact Store Products to Stock Early:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedFestival.keyProducts.map((p) => (
                  <span
                    key={p}
                    style={{
                      backgroundColor: 'var(--surface-cream)',
                      border: '1px solid var(--border-beige)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--primary-forest)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Package size={13} />
                    <span>{p}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Preparation Checklist */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-charcoal)', marginBottom: '10px' }}>
                Manager Procurement Checklist:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedFestival.actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '13px',
                      color: 'var(--text-charcoal-subtle)'
                    }}
                  >
                    <CheckCircle2 size={16} color="var(--primary-forest)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Event Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-charcoal)', marginBottom: '12px' }}>
              Add Store or Local Community Event
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-warm-gray)', marginBottom: '20px' }}>
              Track local temple jatharas, wedding bulk catering orders, or colony celebrations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Event Name</label>
                <input
                  type="text"
                  placeholder="e.g. Colony Ganesh Chathurthi Festival"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Days Until Event</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={newEventDays}
                    onChange={(e) => setNewEventDays(parseInt(e.target.value) || 1)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Estimated Surge (e.g. 1.6x)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="3.0"
                    value={newEventSurge}
                    onChange={(e) => setNewEventSurge(parseFloat(e.target.value) || 1.2)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleAddCustomEvent} className="btn btn-primary">
                  Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
