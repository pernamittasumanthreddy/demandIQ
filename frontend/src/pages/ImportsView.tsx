import React, { useEffect, useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ApiClient } from '../services/api';

export const ImportsView: React.FC = () => {
  const [imports, setImports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImport, setSelectedImport] = useState<any>(null);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await ApiClient.post<any>('/imports/upload/', formData);
      await loadImports();
      setSelectedImport(res);
      alert(`Import processed: ${res.valid_rows} valid records imported.`);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRollback = async (id: string) => {
    if (!confirm('Are you sure you want to rollback this import and remove its transactions?')) return;
    try {
      await ApiClient.post(`/imports/${id}/rollback/`);
      await loadImports();
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
        paddingBottom: '16px'
      }}>
        <div>
          <h1 className="editorial-title" style={{ fontSize: '28px', color: 'var(--text-charcoal)' }}>
            Sales Data Ingestion & Validation Center
          </h1>
          <p style={{ color: 'var(--text-warm-gray)', fontSize: '14px', marginTop: '4px' }}>
            Ingest POS CSV/XLSX exports, auto-map columns, detect anomalies, and track validation quality
          </p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-primary"
          >
            <Upload size={16} color="var(--surface-cream)" />
            <span>{uploading ? 'Validating File...' : 'Upload Sales File (CSV/XLSX)'}</span>
          </button>
        </div>
      </div>

      {/* Upload Instructions Card */}
      <div style={{
        backgroundColor: 'var(--surface-tint)',
        border: '1px solid var(--border-beige)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileSpreadsheet size={24} color="var(--primary-forest)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '13.5px' }}>Supported POS & Spreadsheet Formats</div>
            <div style={{ fontSize: '12px', color: 'var(--text-charcoal-subtle)' }}>
              Upload files with Date, Invoice #, Product SKU or Name, Quantity, and Selling Price. DemandIQ automatically detects columns.
            </div>
          </div>
        </div>
      </div>

      {/* Imports List & Details split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Past Imports Column */}
        <div className="card" style={{ padding: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Import History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '480px', overflowY: 'auto' }}>
            {imports.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-warm-gray)', padding: '24px 0', fontSize: '13px' }}>
                No files uploaded yet.
              </div>
            ) : (
              imports.map((imp) => {
                const isSelected = selectedImport?.id === imp.id;
                return (
                  <div
                    key={imp.id}
                    onClick={() => setSelectedImport(imp)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--primary-forest)' : 'var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--primary-forest-soft)' : 'var(--surface-cream)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{imp.filename}</span>
                      <span className={
                        imp.status === 'COMPLETED' ? 'badge badge-success' :
                        imp.status === 'HAS_ERRORS' ? 'badge badge-warning' :
                        imp.status === 'ROLLED_BACK' ? 'badge badge-neutral' :
                        'badge badge-neutral'
                      } style={{ fontSize: '10px' }}>
                        {imp.status_display}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11.5px', color: 'var(--text-warm-gray)' }}>
                      <span>{imp.valid_rows} rows imported</span>
                      <span>{imp.created_at ? imp.created_at.slice(0, 10) : ''}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Import Inspection Card */}
        <div className="card" style={{ padding: '20px' }}>
          {selectedImport ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 700 }}>{selectedImport.filename}</h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-warm-gray)', marginTop: '2px' }}>
                    Type: {selectedImport.file_type} • Status: {selectedImport.status_display}
                  </div>
                </div>
                {selectedImport.status === 'COMPLETED' && (
                  <button
                    onClick={() => handleRollback(selectedImport.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--status-error)' }}
                  >
                    <RotateCcw size={13} />
                    <span>Rollback Import</span>
                  </button>
                )}
              </div>

              {/* Statistics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--surface-tint)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-warm-gray)', fontWeight: 700 }}>TOTAL ROWS</div>
                  <div style={{ fontSize: '20px', fontWeight: 800 }}>{selectedImport.total_rows}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--status-success-bg)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--status-success)', fontWeight: 700 }}>VALID ROWS</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--status-success)' }}>{selectedImport.valid_rows}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: selectedImport.error_rows > 0 ? 'var(--status-error-bg)' : 'var(--surface-tint)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '11px', color: selectedImport.error_rows > 0 ? 'var(--status-error)' : 'var(--text-warm-gray)', fontWeight: 700 }}>ERROR ROWS</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: selectedImport.error_rows > 0 ? 'var(--status-error)' : 'inherit' }}>{selectedImport.error_rows}</div>
                </div>
              </div>

              {/* Column Mapping Preview */}
              <div>
                <h3 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '8px' }}>Detected Column Mapping</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Object.entries(selectedImport.column_mapping || {}).map(([key, val]) => (
                    <div key={key} style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-tint)', fontSize: '12px', border: '1px solid var(--border-beige)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary-forest)' }}>{key}: </span>
                      <span>{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Summary if any */}
              {selectedImport.error_summary && selectedImport.error_summary.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '8px', color: 'var(--status-error)' }}>
                    Row Validation Discrepancies
                  </h3>
                  <div className="table-container" style={{ maxHeight: '200px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Row #</th>
                          <th>Column</th>
                          <th>Validation Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedImport.error_summary.map((err: any, idx: number) => (
                          <tr key={idx}>
                            <td>Row {err.row}</td>
                            <td><code>{err.column}</code></td>
                            <td style={{ color: 'var(--status-error)' }}>{err.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-warm-gray)', padding: '60px 0' }}>
              Select an import on the left or upload a new sales file to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
