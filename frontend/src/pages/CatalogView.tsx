import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { Product, ProductCategory } from '../types';

export const CatalogView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        ApiClient.get<any>('/catalog/products/'),
        ApiClient.get<any>('/catalog/categories/'),
      ]);
      setProducts(prodRes.results || (Array.isArray(prodRes) ? prodRes : []));
      setCategories(catRes.results || (Array.isArray(catRes) ? catRes : []));
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

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
            Product Catalog & SKU Registry
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            {products.length} registered products across {categories.length} store categories
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={16} color="var(--text-warm-gray)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
            <input
              type="text"
              placeholder="Search product name, SKU, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '200px' }}
          >
            <option value="ALL">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name / Brand</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Cost Price (₹)</th>
                <th>Selling MRP (₹)</th>
                <th>Margin (%)</th>
                <th>Current Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-warm-gray)' }}>
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>Brand: {p.brand || 'Store Brand'}</div>
                    </td>
                    <td>
                      <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{p.sku}</code>
                    </td>
                    <td>{p.category_name || 'General'}</td>
                    <td>{p.unit}</td>
                    <td>₹{Number(p.cost_price).toFixed(2)}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>₹{Number(p.selling_price).toFixed(2)}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary-forest)' }}>
                        {p.gross_margin_percent}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>
                        {p.current_stock}
                      </span>
                    </td>
                    <td>
                      <span className={
                        p.stock_status === 'OUT_OF_STOCK' ? 'badge badge-error' :
                        p.stock_status === 'LOW_STOCK' ? 'badge badge-warning' :
                        p.stock_status === 'OVERSTOCKED' ? 'badge badge-orange' :
                        'badge badge-success'
                      }>
                        {p.stock_status.replace('_', ' ')}
                      </span>
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
