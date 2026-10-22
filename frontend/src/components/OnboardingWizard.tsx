import React, { useState } from 'react';
import {
  Sparkles,
  Store,
  Globe,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldCheck
} from 'lucide-react';
import { useLanguage, Language } from '../services/LanguageContext';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (settings: any) => void;
  initialBusinessName?: string;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialBusinessName = 'Sri Lakshmi Supermarket & Kirana'
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [step, setStep] = useState<number>(1);

  // Form State
  const [storeName, setStoreName] = useState<string>(initialBusinessName);
  const [branchName, setBranchName] = useState<string>('Main Counter - Branch 1');
  const [storeType, setStoreType] = useState<string>('kirana');
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const [safetyPolicy, setSafetyPolicy] = useState<'conservative' | 'balanced' | 'lean'>('balanced');
  const [leadTimeBuffer, setLeadTimeBuffer] = useState<number>(3);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 2) {
      setLanguage(selectedLang);
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete({
        storeName,
        branchName,
        storeType,
        language: selectedLang,
        safetyPolicy,
        leadTimeBuffer
      });
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card" style={{ maxWidth: '640px', padding: '32px', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-warm-gray)',
            cursor: 'pointer',
            padding: '4px'
          }}
          aria-label="Close setup wizard"
        >
          <X size={20} />
        </button>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: step >= s ? 'var(--primary-forest)' : 'var(--surface-cream)',
                color: step >= s ? '#FFFFFF' : 'var(--text-warm-gray)',
                border: step >= s ? 'none' : '1px solid var(--border-beige)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < 4 && (
                <div style={{
                  width: '40px',
                  height: '2px',
                  backgroundColor: step > s ? 'var(--primary-forest)' : 'var(--border-subtle)'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Store Profile */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-forest)', marginBottom: '4px' }}>
                <Store size={18} />
                <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.04em' }}>STEP 1 OF 4</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-charcoal)' }}>
                Tell us about your retail business
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-warm-gray)', marginTop: '4px' }}>
                DemandIQ tailors its safety stock formulas to your specific retail category.
              </p>
            </div>

            <div>
              <label className="form-label">Store / Business Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="form-input"
                placeholder="e.g. Sri Lakshmi Supermarket"
              />
            </div>

            <div>
              <label className="form-label">Main Branch / Outlet</label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="form-input"
                placeholder="e.g. Counter 1 - Market Road"
              />
            </div>

            <div>
              <label className="form-label">Store Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                {[
                  { id: 'kirana', label: 'Kirana & Grocery', desc: 'FMCG, pulses, oils, packaged goods' },
                  { id: 'pharmacy', label: 'Pharmacy & Medical', desc: 'Batch tracking, expiry, critical medicines' },
                  { id: 'stationery', label: 'Stationery & General', desc: 'Books, school supplies, seasonal spikes' },
                  { id: 'wholesale', label: 'Wholesale Distributor', desc: 'Bulk packaging, trade credit, large MOQ' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setStoreType(item.id)}
                    style={{
                      border: storeType === item.id ? '2px solid var(--primary-forest)' : '1px solid var(--border-beige)',
                      backgroundColor: storeType === item.id ? 'var(--primary-forest-soft)' : 'var(--surface-cream)',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-charcoal)' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', marginTop: '3px' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Language & Local Settings */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-forest)', marginBottom: '4px' }}>
                <Globe size={18} />
                <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.04em' }}>STEP 2 OF 4</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-charcoal)' }}>
                Language & Regional Settings
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-warm-gray)', marginTop: '4px' }}>
                Select your preferred operating language for stock briefings and reorder alerts.
              </p>
            </div>

            <div>
              <label className="form-label">Operating Language</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '6px' }}>
                {[
                  { code: 'en' as Language, title: 'English', script: 'Standard English' },
                  { code: 'hi' as Language, title: 'हिन्दी (Hindi)', script: 'देवनागरी लिपि' },
                  { code: 'te' as Language, title: 'తెలుగు (Telugu)', script: 'తెలుగు లిపి' },
                ].map((l) => (
                  <div
                    key={l.code}
                    onClick={() => setSelectedLang(l.code)}
                    style={{
                      border: selectedLang === l.code ? '2px solid var(--primary-forest)' : '1px solid var(--border-beige)',
                      backgroundColor: selectedLang === l.code ? 'var(--primary-forest-soft)' : 'var(--surface-cream)',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-charcoal)' }}>{l.title}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-warm-gray)', marginTop: '4px' }}>{l.script}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--surface-cream)',
              border: '1px solid var(--border-beige)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-charcoal)' }}>
                Currency & Financial Calendar
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-charcoal-subtle)' }}>
                • Default Currency: <strong>₹ Indian Rupee (INR)</strong> with Indian numbering system (Lakhs & Crores)
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-charcoal-subtle)' }}>
                • Financial Reporting Year: <strong>1 April - 31 March (FY)</strong>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Safety Stock & Forecasting Policy */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-forest)', marginBottom: '4px' }}>
                <Sliders size={18} />
                <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.04em' }}>STEP 3 OF 4</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-charcoal)' }}>
                Stock Optimization Strategy
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-warm-gray)', marginTop: '4px' }}>
                Choose how aggressively DemandIQ plans safety buffers against supplier delays.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  id: 'conservative',
                  title: 'Zero Stockout Priority (98% Service Level)',
                  desc: 'Higher safety stock buffer. Ensures you never turn a customer away on high-demand essentials.'
                },
                {
                  id: 'balanced',
                  title: 'Balanced Kirana Policy (95% Service Level) — Recommended',
                  desc: 'Optimal balance between avoiding stockouts and freeing up working capital.'
                },
                {
                  id: 'lean',
                  title: 'High Turnover / Lean Capital (90% Service Level)',
                  desc: 'Minimal stock holding. Ideal for stores with daily supplier delivery or limited shelf space.'
                }
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSafetyPolicy(p.id as any)}
                  style={{
                    border: safetyPolicy === p.id ? '2px solid var(--primary-forest)' : '1px solid var(--border-beige)',
                    backgroundColor: safetyPolicy === p.id ? 'var(--primary-forest-soft)' : 'var(--surface-cream)',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-charcoal)' }}>{p.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-warm-gray)', marginTop: '4px' }}>{p.desc}</div>
                </div>
              ))}
            </div>

            <div>
              <label className="form-label">
                Default Supplier Lead Time Buffer: <strong>{leadTimeBuffer} Days</strong>
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={leadTimeBuffer}
                onChange={(e) => setLeadTimeBuffer(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-forest)', cursor: 'pointer' }}
              />
            </div>
          </div>
        )}

        {/* Step 4: Ready to Launch */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-forest-soft)',
              color: 'var(--primary-forest)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-charcoal)' }}>
                Your Store is Configured!
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-warm-gray)', maxWidth: '440px', margin: '8px auto 0 auto' }}>
                We’ve initialized DemandIQ with your store settings. Sri Lakshmi Supermarket demonstration data is pre-loaded with 180 days of POS records.
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--surface-cream)',
              border: '1px solid var(--border-beige)',
              borderRadius: '14px',
              padding: '16px',
              textAlign: 'left',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '13px'
            }}>
              <div>
                <span style={{ color: 'var(--text-warm-gray)' }}>Store:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-charcoal)' }}>{storeName}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-warm-gray)' }}>Language:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-charcoal)' }}>
                  {selectedLang === 'hi' ? 'हिन्दी (Hindi)' : selectedLang === 'te' ? 'తెలుగు (Telugu)' : 'English'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-warm-gray)' }}>Category:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-charcoal)', textTransform: 'capitalize' }}>{storeType}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-warm-gray)' }}>Stock Buffer:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-charcoal)' }}>{leadTimeBuffer} Days Safety Buffer</div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-beige)'
        }}>
          {step > 1 ? (
            <button onClick={handleBack} className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button onClick={handleNext} className="btn btn-primary">
            <span>{step === 4 ? 'Launch DemandIQ Dashboard' : 'Continue'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
