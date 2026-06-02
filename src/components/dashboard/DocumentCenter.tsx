import React, { useState } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { FileText, Download, Eye, CheckCircle, AlertTriangle, Clock, Upload, X, Loader2 } from 'lucide-react';

interface Document {
  id: string;
  _id?: string;
  name: string;
  type: 'invoice' | 'certificate' | 'document';
  status: 'verified' | 'pending' | 'expired';
  date: string;
}

interface DocumentCenterProps {
  documents?: Document[];
  onUploadDocument?: (doc: Document) => void;
}

const defaultMockDocuments: Document[] = [
  { id: '1', name: 'Invoice #231', type: 'invoice', status: 'verified', date: '2026-05-28' },
  { id: '2', name: 'GST Certificate', type: 'certificate', status: 'verified', date: '2026-05-01' },
  { id: '3', name: 'Delivery Report #ORD-001', type: 'document', status: 'verified', date: '2026-05-24' },
  { id: '4', name: 'Insurance Policy', type: 'certificate', status: 'pending', date: '2026-05-30' },
  { id: '5', name: 'KYC Document', type: 'document', status: 'verified', date: '2026-04-15' },
];

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'verified':
      return 'success';
    case 'pending':
      return 'warning';
    case 'expired':
      return 'error';
    default:
      return 'default';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'pending':
      return 'Pending';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
}

export function DocumentCenter({ documents: propDocs, onUploadDocument }: DocumentCenterProps) {
  const rawDocs = propDocs || defaultMockDocuments;
  const displayDocs = rawDocs.map((doc: any) => {
    return {
      id: doc.id || doc._id,
      _id: doc._id,
      name: doc.name || doc.fileName || 'Unnamed Document',
      type: doc.type || doc.fileType?.replace('_', ' ') || 'document',
      date: doc.date || doc.createdAt || new Date().toISOString(),
      status: doc.status || doc.verificationStatus || 'pending'
    };
  });

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<'invoice' | 'certificate' | 'document'>('document');
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    setIsUploading(true);
    setTimeout(() => {
      const uploadedDoc: Document = {
        id: String(displayDocs.length + 1),
        name: newDocName,
        type: newDocType,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      };

      if (onUploadDocument) {
        onUploadDocument(uploadedDoc);
      }
      setIsUploading(false);
      setShowUploadModal(false);
      setNewDocName('');
      setToastMessage('Document uploaded and queued for KYC verification!');
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
  };

  return (
    <div id="documents" className="mb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-2 text-xs border border-slate-700 animate-slide-in">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center font-bold text-white text-[10px]">✓</div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Document Center</h2>
          <p className="text-xs text-slate-500 mt-1">Access audit transcripts, certificates, and compliance clearances.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Document</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayDocs.map((doc) => (
                  <tr key={doc._id || doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-slate-900">{doc.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 capitalize">{doc.type}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {new Date(doc.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(doc.status)} size="sm">
                        {getStatusLabel(doc.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <a 
                          href="#"
                          onClick={(e) => { e.preventDefault(); alert(`Downloading: ${doc.name}`); }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors inline-block" 
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-slate-600" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {displayDocs.map((doc) => (
          <Card key={doc._id || doc.id}>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{doc.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(doc.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(doc.status)} size="sm">
                  {getStatusLabel(doc.status)}
                </Badge>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold transition-colors">
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button 
                  onClick={() => alert(`Downloading: ${doc.name}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Upload Regulatory / Purchase Doc</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Document Name</label>
                <input
                  type="text"
                  placeholder="e.g. GST Certificate 2026, Transport Invoice #45"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Document Type</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="invoice">Invoice Receipt</option>
                  <option value="certificate">GST/KYC Certificate</option>
                  <option value="document">Unloading / Delivery Report</option>
                </select>
              </div>

              {/* Drag/Drop Mock Zone */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50/50 cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-semibold">Click to select files or drag-and-drop</p>
                <p className="text-[10px] text-slate-400 mt-1">PDF, PNG, JPG up to 10MB</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Submit Verification'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
