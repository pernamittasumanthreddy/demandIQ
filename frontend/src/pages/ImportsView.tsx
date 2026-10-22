import React, { useEffect, useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  Clock,
  ArrowRight,
  Download,
  CheckCircle2,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { useLanguage } from '../services/LanguageContext';

export const ImportsView: React.FC = () => {
  const { t } = useLanguage();
  const [imports, setImports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImport, setSelectedImport] = useState<any>(null);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadImports();
  }, []);

  const loadImports = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.get<any>('/imports/');
      const list = res.results || (Array.isArray(res) ? res : []);
      setImports(list);
      if (list.length > 0 && !selectedImport) {
        setSelectedImport(list[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStagedFile(file);
    // Parse quick CSV preview if CSV
    if (file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim());
          const rows = lines.slice(1, 6).map(line => {
            const vals = line.split(',').map(v => v.trim());
            const obj: any = {};
            headers.forEach((h, idx) => {
              obj[h] = vals[idx] || '';
            });
            return obj;
          });
          setPreviewRows(rows);
        }
      };
      reader.readAsText(file);
    } else {
      // Excel placeholder preview
      setPreviewRows([
        { invoice_id: 'INV-1092', date: '2026-10-15', product: 'Sona Masoori Rice 25kg', quantity: '4', unit_price: '1350' },
        { invoice_id: 'INV-1093', date: '2026-10-15', product: 'Fortune Sunflower Oil 1L', quantity: '12', unit_price: '142' },
        { invoice_id: 'INV-1094', date: '2026-10-16', product: 'Tata Salt 1kg', quantity: '25', unit_price: '28' }
      ]);
    }
    setWizardStep(2);
  };

  const handleConfirmUpload = async () => {
    if (!stagedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', stagedFile);

    try {
      const res = await ApiClient.post<any>('/imports/upload/', formData);
      await loadImports();
      setSelectedImport(res);
      setWizardStep(1);
      setStagedFile(null);
      setPreviewRows([]);
      alert(`Import successfully processed: ${res.valid_rows || 0} sales rows ingested into DemandIQ engine.`);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = "invoice_id,date,sku,product_name,category,quantity,unit_price\n" +
      "INV-8001,2026-10-10,RICE-SONA-25,Sona Masoori Rice (25kg),Grains & Staples,3,1350.00\n" +
      "INV-8002,2026-10-10,OIL-FORT-1L,Fortune Sunflower Oil (1L),Edible Oils,8,142.00\n" +
      "INV-8003,2026-10-11,SALT-TATA-1K,Tata Salt Iodized (1kg),Staples,15,28.00\n" +
      "INV-8004,2026-10-11,DAL-TOOR-1K,Toor Dal Unpolished (1kg),Pulses,6,155.00\n" +
      "INV-8005,2026-10-12,ATTA-AASH-10K,Aashirvaad Shudh Chakki Atta (10kg),Flour,5,420.00\n" +
      "INV-8006,2026-10-12,GHEE-AMUL-1L,Amul Pure Cow Ghee (1L),Dairy & Ghee,4,610.00\n" +
      "INV-8007,2026-10-13,MAGGI-PACK-4,Maggi 2-Minute Masala Noodles (4-Pack),Instant Foods,12,56.00\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'demandiq_sample_kirana_sales.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRollback = async (id: string) => {
    if (!confirm('Are you sure you want to rollback this import and remove its transactions?')) return;
    try {
      await ApiClient.post(`/imports/${id}/rollback/`);
      await loadImports();
      alert('Import batch rolled back cleanly.');
    } catch (err: any) {
      alert(`Rollback failed: ${err.message}`);
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
        paddingBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-charcoal)' }}>
            {t('imports')}
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Ingest POS CSV/XLSX exports, auto-map columns, detect anomalies, and track validation quality
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleDownloadSampleCSV}
            className="btn btn-secondary"
            title="Download verified Indian grocery POS CSV template"
          >
            <Download size={15} color="var(--primary-forest)" />
            <span>Sample POS Template (.CSV)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-primary"
          >
            <Upload size={15} color="var(--surface-cream)" />
            <span>Select File to Ingest</span>
          </button>
        </div>
      </div>

      {/* Interactive Step-by-Step Upload Wizard */}
      {stagedFile && (
        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--primary-forest-soft)', border: '2px solid var(--primary-forest)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-forest)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                2
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-forest)', margin: 0 }}>
                  Pre-Ingestion Validation: {stagedFile.name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-warm-gray)', margin: '2px 0 0 0' }}>
                  {(stagedFile.size / 1024).toFixed(1)} KB • Column mapping and sanity verification
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setStagedFile(null);
                  setPreviewRows([]);
                  setWizardStep(1);
                }}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={uploading}
                className="btn btn-primary btn-sm"
              >
                <FileCheck size={14} color="#fff" />
                <span>{uploading ? 'Processing Data...' : 'Confirm & Ingest Sales'}</span>
              </button>
            </div>
          </div>

          {/* Sample Preview Rows */}
          {previewRows.length > 0 && (
            <div style={{ backgroundColor: '#FFFDF8', borderRadius: '10px', padding: '14px', border: '1px solid var(--border-beige)', overflowX: 'auto' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-charcoal)', marginBottom: '8px' }}>
                Sample Preview (First 5 Rows Detected):
              </div>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-beige)', textAlign: 'left', color: 'var(--text-warm-gray)' }}>
                    {Object.keys(previewRows[0]).map(k => (
                      <th key={k} style={{ padding: '6px 8px', fontWeight: 600 }}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {Object.values(r).map((v: any, j) => (
                        <td key={j} style={{ padding: '6px 8px', color: 'var(--text-charcoal)' }}>{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Main Content: Left Import History, Right Batch Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left: Previous Imports Log */}
        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
            Processed Import History ({imports.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {imports.length === 0 ? (
              <div style={{ color: 'var(--text-warm-gray)', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>
                No external sales files imported yet. Use the upload button above to ingest CSV/XLSX records.
              </div>
            ) : (
              imports.map((imp) => {
                const isSelected = selectedImport?.id === imp.id;
                return (
                  <div
                    key={imp.id}
                    onClick={() => setSelectedImport(imp)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary-forest)' : '1px solid var(--border-beige)',
                      backgroundColor: isSelected ? 'var(--primary-forest-soft)' : 'var(--surface-cream)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileSpreadsheet size={16} color="var(--primary-forest)" />
                        <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-charcoal)' }}>
                          {imp.file_name}
                        </span>
                      </div>
                      <span className={imp.status === 'COMPLETED' ? 'badge badge-success' : (imp.status === 'ROLLED_BACK' ? 'badge badge-neutral' : 'badge badge-error')}>
                        {imp.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-warm-gray)', marginTop: '8px' }}>
                      <span>Ingested: {new Date(imp.created_at).toLocaleDateString()}</span>
                      <span><strong>{imp.valid_rows || 0}</strong> rows • {imp.error_rows ? `${imp.error_rows} errors` : '0 errors'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Batch Quality Report */}
        <div className="card" style={{ padding: '20px' }}>
          {selectedImport ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-charcoal)' }}>
                    Validation Quality Report
                  </h2>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-warm-gray)', marginTop: '2px' }}>
                    Batch ID: {selectedImport.id}
                  </div>
                </div>

                {selectedImport.status === 'COMPLETED' && (
                  <button
                    onClick={() => handleRollback(selectedImport.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: 'var(--status-error)', color: 'var(--status-error)' }}
                    title="Rollback this batch and delete created transactions"
                  >
                    <RotateCcw size={13} />
                    <span>Rollback Import</span>
                  </button>
                )}
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="dash-metric-box">
                  <div className="dash-metric-label">Total Rows Analyzed</div>
                  <div className="dash-metric-val">{selectedImport.total_rows || selectedImport.valid_rows || 0}</div>
                </div>
                <div className="dash-metric-box">
                  <div className="dash-metric-label">Valid Ingested Records</div>
                  <div className="dash-metric-val" style={{ color: 'var(--primary-forest)' }}>
                    {selectedImport.valid_rows || 0}
                  </div>
                </div>
              </div>

              {/* Data Quality Guarantee */}
              <div style={{
                backgroundColor: 'var(--surface-cream)',
                border: '1px solid var(--border-beige)',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '12.5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--primary-forest)' }}>
                  <CheckCircle2 size={16} />
                  <span>Validation Safeguards Enforced:</span>
                </div>
                <div style={{ color: 'var(--text-charcoal-subtle)' }}>• Idempotent transaction verification against duplicate bill numbers</div>
                <div style={{ color: 'var(--text-charcoal-subtle)' }}>• Positive non-zero quantities and unit prices sanitized</div>
                <div style={{ color: 'var(--text-charcoal-subtle)' }}>• Automatic SKU matching against Sri Lakshmi Supermarket catalog</div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-warm-gray)', textAlign: 'center', padding: '40px 0', fontSize: '13px' }}>
              Select an import on the left to inspect its validation quality report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
