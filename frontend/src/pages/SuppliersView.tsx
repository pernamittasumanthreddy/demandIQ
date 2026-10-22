import React, { useEffect, useState } from 'react';
import {
  Users,
  Truck,
  Phone,
  Mail,
  MapPin,
  Star,
  FileText,
  IndianRupee,
  Clock
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { Supplier } from '../types';

export const SuppliersView: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.get<any>('/suppliers/');
      setSuppliers(res.results || (Array.isArray(res) ? res : []));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-beige)',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-charcoal)' }}>
            Suppliers & Wholesale Distributors
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Manage regional distributor contracts, lead times, delivery ratings, and MOQs
          </p>
        </div>
      </div>

      {/* Supplier Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {suppliers.map((s) => (
          <div key={s.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-charcoal)' }}>
                  {s.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-orange)' }}>
                  <Star size={14} fill="currentColor" />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{s.rating}</span>
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--text-warm-gray)', marginBottom: '16px' }}>
                Contact: <strong style={{ color: 'var(--text-charcoal)' }}>{s.contact_person || 'Sales Desk'}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: 'var(--text-charcoal-subtle)' }}>
                {s.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={13} color="var(--primary-forest)" />
                    <span>{s.phone}</span>
                  </div>
                )}
                {s.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={13} color="var(--primary-forest)" />
                    <span>{s.email}</span>
                  </div>
                )}
                {s.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={13} color="var(--primary-forest)" />
                    <span>{s.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 600 }}>TYPICAL LEAD TIME</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{s.typical_lead_time_days} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 600 }}>MIN ORDER VALUE</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>₹{Number(s.min_order_amount).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 600 }}>PAYMENT TERMS</div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>{s.payment_terms}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 600 }}>CONTRACTED SKUS</div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>{s.product_count} Products</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
