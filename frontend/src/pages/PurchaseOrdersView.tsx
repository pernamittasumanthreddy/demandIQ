import React, { useEffect, useState } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle,
  Truck,
  PackageCheck,
  Eye,
  IndianRupee,
  Clock,
  X
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { PurchaseOrder, Supplier, Product } from '../types';

export const PurchaseOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  // Form states for PO creation
  const [supplierId, setSupplierId] = useState('');
  const [poNumber, setPoNumber] = useState(`PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [orderItems, setOrderItems] = useState<{ product: string; quantity_ordered: number; unit_cost: number }[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [posRes, suppRes, prodRes] = await Promise.all([
        ApiClient.get<any>('/procurement/orders/'),
        ApiClient.get<any>('/suppliers/'),
        ApiClient.get<any>('/catalog/products/'),
      ]);
      setOrders(posRes.results || (Array.isArray(posRes) ? posRes : []));
      const sList = suppRes.results || (Array.isArray(suppRes) ? suppRes : []);
      setSuppliers(sList);
      if (sList.length > 0 && !supplierId) setSupplierId(sList[0].id);
      setProducts(prodRes.results || (Array.isArray(prodRes) ? prodRes : []));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await ApiClient.post(`/procurement/orders/${id}/approve/`);
      await loadAll();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleIssue = async (id: string) => {
    try {
      await ApiClient.post(`/procurement/orders/${id}/issue/`);
      await loadAll();
    } catch (err: any) {
      alert(`Issue error: ${err.message}`);
    }
  };

  const handleReceive = async (id: string) => {
    const challan = prompt('Enter supplier delivery challan / invoice number:', `DC-${Date.now().toString().slice(-6)}`);
    if (!challan) return;
    try {
      const res = await ApiClient.post<any>(`/procurement/orders/${id}/receive/`, { delivery_challan: challan });
      alert(res.message);
      await loadAll();
    } catch (err: any) {
      alert(`Receiving error: ${err.message}`);
    }
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert('Please add at least one line item to this purchase order.');
      return;
    }
    try {
      await ApiClient.post('/procurement/orders/', {
        supplier: supplierId,
        po_number: poNumber,
        items: orderItems,
      });
      setShowCreateModal(false);
      setOrderItems([]);
      await loadAll();
    } catch (err: any) {
      alert(`Create PO failed: ${err.message}`);
    }
  };

  const addItemRow = () => {
    if (products.length === 0) return;
    const p = products[0];
    setOrderItems([...orderItems, { product: p.id, quantity_ordered: 10, unit_cost: Number(p.cost_price) }]);
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
            Procurement & Purchase Orders
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Lifecycle workflow: Draft → Reviewed → Approved → Issued → Atomic Goods Receipt into Stock
          </p>
        </div>
        <button
          onClick={() => {
            setPoNumber(`PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
            setShowCreateModal(true);
            if (orderItems.length === 0) addItemRow();
          }}
          className="btn btn-primary"
        >
          <Plus size={16} color="var(--surface-cream)" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* Purchase Orders Table */}
      <div className="card" style={{ padding: '20px' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Items Count</th>
                <th>Total Value (₹)</th>
                <th>Status</th>
                <th>Workflow Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-warm-gray)' }}>
                    No purchase orders created yet. Click "Create Purchase Order" or convert from Reorder Suggestions.
                  </td>
                </tr>
              ) : (
                orders.map((po) => (
                  <tr key={po.id}>
                    <td>
                      <code style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{po.po_number}</code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{po.supplier_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)' }}>Branch: {po.branch_name}</div>
                    </td>
                    <td>{po.order_date}</td>
                    <td>{po.item_count} Lines</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>₹{Number(po.total_amount).toLocaleString('en-IN')}</span>
                    </td>
                    <td>
                      <span className={
                        po.status === 'RECEIVED' ? 'badge badge-success' :
                        po.status === 'ORDERED' ? 'badge badge-orange' :
                        po.status === 'APPROVED' ? 'badge badge-sage' :
                        'badge badge-neutral'
                      }>
                        {po.status_display}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {po.status === 'DRAFT' && (
                          <button
                            onClick={() => handleApprove(po.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--primary-forest)' }}
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                        )}
                        {po.status === 'APPROVED' && (
                          <button
                            onClick={() => handleIssue(po.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--accent-orange)' }}
                          >
                            <Truck size={13} /> Issue to Supplier
                          </button>
                        )}
                        {po.status === 'ORDERED' && (
                          <button
                            onClick={() => handleReceive(po.id)}
                            className="btn btn-primary btn-sm"
                          >
                            <PackageCheck size={13} /> Receive Goods
                          </button>
                        )}
                        {po.status === 'RECEIVED' && (
                          <span style={{ fontSize: '12px', color: 'var(--status-success)', fontWeight: 600 }}>
                            Stock Updated ✓
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Purchase Order Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(48, 47, 43, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="card" style={{ width: '640px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>New Purchase Order</h2>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePo}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">PO Code</label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Select Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="form-select"
                    required
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label">Order Items</label>
                  <button type="button" onClick={addItemRow} className="btn btn-secondary btn-sm">
                    + Add Product
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {orderItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select
                        value={item.product}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const found = products.find((p) => p.id === pId);
                          const copy = [...orderItems];
                          copy[idx].product = pId;
                          if (found) copy[idx].unit_cost = Number(found.cost_price);
                          setOrderItems(copy);
                        }}
                        className="form-select"
                        style={{ flex: 2 }}
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} [{p.sku}]</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity_ordered}
                        onChange={(e) => {
                          const copy = [...orderItems];
                          copy[idx].quantity_ordered = parseInt(e.target.value) || 1;
                          setOrderItems(copy);
                        }}
                        className="form-input"
                        style={{ flex: 1 }}
                        required
                      />

                      <input
                        type="number"
                        step="any"
                        placeholder="Cost"
                        value={item.unit_cost}
                        onChange={(e) => {
                          const copy = [...orderItems];
                          copy[idx].unit_cost = parseFloat(e.target.value) || 0;
                          setOrderItems(copy);
                        }}
                        className="form-input"
                        style={{ flex: 1 }}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--status-error)' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
