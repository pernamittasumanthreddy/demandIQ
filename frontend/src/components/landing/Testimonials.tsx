import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestimonialItem {
  name: string;
  store: string;
  category: string;
  initials: string;
  quote: string;
}

const testimonials: TestimonialItem[] = [
  {
    name: 'Rajesh Sharma',
    store: 'Krishna Kirana & Provisions, Bengaluru',
    category: 'Grocery & Provisions',
    initials: 'RS',
    quote:
      'Before DemandIQ, we had ₹75,000 stuck in slow-moving items and regularly ran out of sugar and oil on weekends. Now our reorder review takes 5 minutes on Monday morning.',
  },
  {
    name: 'Dr. Priya Sundaram',
    store: 'Lakshmi Healthcare & Pharmacy, Chennai',
    category: 'Retail Pharmacy',
    initials: 'PS',
    quote:
      'Managing 1,200 SKUs in a busy pharmacy was stressful. DemandIQ’s lead-time demand calculations and batch shelf-life warnings reduced supplier delivery delays significantly.',
  },
  {
    name: 'Amit Patel',
    store: 'Sardar General Store & Stationery, Ahmedabad',
    category: 'Stationery & General Store',
    initials: 'AP',
    quote:
      'We tested DemandIQ against our manual notebook records. The seasonal forecasts for festival seasons were remarkably accurate and saved us from over-ordering decorative inventory.',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="testimonials-section">
      <motion.div
        style={{ textAlign: 'center' }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span className="section-label">DEMONSTRATION CASE STUDIES</span>
        <h2 className="section-heading" style={{ marginTop: '8px' }}>
          Real Businesses. Real Results.
        </h2>
        <p className="section-desc" style={{ maxWidth: '640px', margin: '10px auto 0 auto' }}>
          See how Indian local shops optimize working capital and keep high-demand items in stock.
        </p>
      </motion.div>

      <div className="testimonials-grid">
        {testimonials.map((item, index) => (
          <motion.div
            key={item.name}
            className="testimonial-card"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="testimonial-demo-badge">Sample Retailer Case</span>
                <div className="testimonial-stars" aria-label="5 star rating">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="var(--lp-orange)" color="var(--lp-orange)" />
                  ))}
                </div>
              </div>

              <p className="testimonial-quote">“{item.quote}”</p>
            </div>

            <div className="testimonial-author">
              <div className="author-avatar">{item.initials}</div>
              <div>
                <div className="author-name">{item.name}</div>
                <div className="author-store">{item.store}</div>
                <div style={{ fontSize: '11px', color: 'var(--lp-orange)', fontWeight: 600, marginTop: '2px' }}>
                  {item.category}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
