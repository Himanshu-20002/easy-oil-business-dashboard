'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../../../components/brand/Header';
import { Footer } from '../../../components/brand/Footer';
import { 
  Building2, Fuel, UploadCloud, FileText, CheckCircle2, 
  ArrowRight, ArrowLeft, ShieldAlert, Check, Loader2, RefreshCw 
} from 'lucide-react';

interface DocumentType {
  fileType: string;
  fileName: string;
  fileUrl: string;
  verificationStatus?: string;
  comments?: string;
}

export default function Apply() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Application and Company states
  const [formData, setFormData] = useState({
    companyName: '',
    firmType: 'Private Limited',
    gst: '',
    pan: '',
    address: '',
    district: '',
    state: '',
    pincode: '',
    contactPerson: '',
    mobile: '',
    email: '',
    productType: '',
    quantity: '',
    location: '',
    storageAvailability: false,
    existingSupplier: '',
    requirementStartDate: ''
  });

  const [uploadedDocs, setUploadedDocs] = useState<DocumentType[]>([]);
  const [applicationStatus, setApplicationStatus] = useState('draft');
  const [remarks, setRemarks] = useState<any[]>([]);

  // Fetch current application data on load
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/applications/current');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load details');
        }

        if (data.company) {
          setFormData(prev => ({
            ...prev,
            companyName: data.company.companyName || '',
            firmType: data.company.firmType || 'Private Limited',
            gst: data.company.gst || '',
            pan: data.company.pan || '',
            address: data.company.address || '',
            district: data.company.district || '',
            state: data.company.state || '',
            pincode: data.company.pincode || '',
            contactPerson: data.company.contactPerson || '',
            mobile: data.company.mobile || '',
            email: data.company.email || '',
            // Logistics
            productType: data.application?.productType || '',
            quantity: data.application?.quantity ?? '',
            location: data.application?.location || '',
            storageAvailability: data.application?.storageAvailability ?? false,
            existingSupplier: data.application?.existingSupplier || '',
            requirementStartDate: data.application?.requirementStartDate 
              ? new Date(data.application.requirementStartDate).toISOString().split('T')[0] 
              : ''
          }));
        }

        if (data.application) {
          setApplicationStatus(data.application.status || 'draft');
          setRemarks(data.application.remarks || []);
        }

        if (data.documents) {
          setUploadedDocs(data.documents);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'An error occurred loading application data.');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Upload handler for step 3
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setError('');

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('fileType', fileType);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      // Add to uploaded documents list
      const newDoc: DocumentType = {
        fileType,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        verificationStatus: 'pending'
      };

      setUploadedDocs(prev => {
        const filtered = prev.filter(d => d.fileType !== fileType);
        return [...filtered, newDoc];
      });

      setSuccess(`Uploaded ${file.name} successfully!`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Upload error');
    } finally {
      setSaving(false);
    }
  };

  const saveApplication = async (isSubmit: boolean) => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Basic validations on submit
      if (isSubmit) {
        if (!formData.companyName || !formData.gst || !formData.pan || !formData.address) {
          throw new Error('Please complete Step 1: Legal Profile before submitting');
        }
        if (!formData.productType || !formData.quantity || Number(formData.quantity) <= 0 || !formData.location || !formData.requirementStartDate) {
          throw new Error('Please complete Step 2: Logistics details before submitting');
        }
        
        // Ensure request letter and GST certificate are uploaded
        const reqLetter = uploadedDocs.find(d => d.fileType === 'request_letter');
        const gstCert = uploadedDocs.find(d => d.fileType === 'gst_certificate');
        if (!reqLetter || !gstCert) {
          throw new Error('Required documents: official request letter and GST certificate are missing!');
        }
      }

      const res = await fetch('/api/applications/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          documents: uploadedDocs,
          submit: isSubmit
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Saving failed');
      }

      setSuccess(isSubmit ? 'Application submitted successfully!' : 'Draft application saved successfully!');
      
      if (isSubmit) {
        setApplicationStatus('submitted');
        setTimeout(() => {
          router.push('/customer/dashboard');
        }, 1500);
      } else {
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving data.');
    } finally {
      setSaving(false);
    }
  };

  const getDocStatusBadge = (fileType: string) => {
    const doc = uploadedDocs.find(d => d.fileType === fileType);
    if (!doc) return <span className="text-[10px] bg-slate-100 text-slate-400 font-semibold px-2 py-0.5 rounded">Not Uploaded</span>;

    switch (doc.verificationStatus) {
      case 'verified':
        return <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded flex items-center gap-0.5 w-fit"><Check className="w-3 h-3" /> Verified</span>;
      case 'rejected':
        return (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded w-fit">Correction Required</span>
            {doc.comments && <p className="text-[10px] text-red-500 font-medium italic">* {doc.comments}</p>}
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit"><Check className="w-3 h-3" /> Uploaded</span>
            <span className="text-[10px] text-slate-500">Pending review</span>
          </div>
        );
    }
  };

  const getUploadButtonLabel = (fileType: string) => {
    return uploadedDocs.some(d => d.fileType === fileType) ? 'Replace file' : 'Upload PDF/PNG';
  };

  const getDocFileName = (fileType: string) => {
    return uploadedDocs.find(d => d.fileType === fileType)?.fileName || '';
  };

  const isLocked = applicationStatus !== 'draft' && applicationStatus !== 'correction_required';
  const submitButtonLabel = applicationStatus === 'correction_required' ? 'Update & Reapply' : 'Lock & Submit Application';
  const uploadedCount = uploadedDocs.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-iocl-blue animate-spin" />
        <p className="text-slate-500 font-bold text-sm">Loading Application Form...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Lock warning banner */}
        {isLocked && (
          <div className="mb-6 bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-wider">Edits Locked</h4>
              <p className="text-xs text-amber-700 font-medium mt-1">
                Your application is currently in the <strong className="uppercase">{applicationStatus}</strong> phase. Form modification is locked during Sales Officer review.
              </p>
            </div>
          </div>
        )}

        {/* Correction Remarks Banner */}
        {applicationStatus === 'correction_required' && remarks.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-slate-900 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-blue-900">Correction Requested by Sales Officer</h4>
            </div>
            <div className="text-xs font-semibold bg-white p-3 rounded-xl border border-blue-100 text-slate-700">
              <p className="font-bold text-slate-900 mb-1">{remarks[remarks.length - 1].authorName}:</p>
              <p className="italic">&ldquo;{remarks[remarks.length - 1].text}&rdquo;</p>
            </div>
            <p className="text-[11px] text-slate-600 mt-3">Please update the required fields or re-upload your documents, then click <strong>Update &amp; Reapply</strong> on the final step.</p>
          </div>
        )}

        {/* Wizard Progress Steps */}
        <div className="mb-8 bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`rounded-3xl border px-4 py-3 ${step === 1 ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full grid place-items-center font-bold text-sm ${step === 1 ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}`}>1</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] font-semibold">Step 1</p>
                  <p className="text-sm font-bold">Legal Profile</p>
                </div>
              </div>
            </div>
            <div className={`rounded-3xl border px-4 py-3 ${step === 2 ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full grid place-items-center font-bold text-sm ${step === 2 ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}`}>2</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] font-semibold">Step 2</p>
                  <p className="text-sm font-bold">Logistics Details</p>
                </div>
              </div>
            </div>
            <div className={`rounded-3xl border px-4 py-3 ${step === 3 ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full grid place-items-center font-bold text-sm ${step === 3 ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}`}>3</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] font-semibold">Step 3</p>
                  <p className="text-sm font-bold">Compliance Uploads</p>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-1 items-center justify-center">
                <span className={`text-[10px] uppercase tracking-[0.24em] font-semibold ${step === 3 ? 'text-blue-100' : 'text-slate-500'}`}>{uploadedCount}/3 uploaded</span>
              </div>
            </div>
            <div className={`rounded-3xl border px-4 py-3 ${step === 4 ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full grid place-items-center font-bold text-sm ${step === 4 ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}`}>4</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] font-semibold">Step 4</p>
                  <p className="text-sm font-bold">Review & Submit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-xs font-semibold">
            {success}
          </div>
        )}

        {/* Form Body Container */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-10 mb-6">
          
          {/* STEP 1: LEGAL PROFILE */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <Building2 className="w-6 h-6 text-iocl-blue" />
                <h3 className="text-xl font-extrabold text-slate-900">Step 1: Legal Profile & Corporate Address</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Registered Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    disabled={isLocked}
                    value={formData.companyName}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 disabled:bg-slate-100"
                    placeholder="e.g. Apex Industrial Fuels Ltd"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Firm Constitution Type</label>
                  <select
                    name="firmType"
                    disabled={isLocked}
                    value={formData.firmType}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 disabled:bg-slate-100"
                  >
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Private Limited">Private Limited</option>
                    <option value="Public Limited">Public Limited</option>
                    <option value="LLP">LLP</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">GSTIN Number</label>
                  <input
                    type="text"
                    name="gst"
                    disabled={isLocked}
                    value={formData.gst}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 uppercase disabled:bg-slate-100"
                    placeholder="15-digit GSTIN"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">PAN Card Number</label>
                  <input
                    type="text"
                    name="pan"
                    disabled={isLocked}
                    value={formData.pan}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 uppercase disabled:bg-slate-100"
                    placeholder="10-digit PAN"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider mb-4">Corporate Office Address</h4>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Office Address</label>
                    <input
                      type="text"
                      name="address"
                      disabled={isLocked}
                      value={formData.address}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 disabled:bg-slate-100"
                      placeholder="Plot, Street, building name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">District</label>
                    <input
                      type="text"
                      name="district"
                      disabled={isLocked}
                      value={formData.district}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 disabled:bg-slate-100"
                      placeholder="District"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      disabled={isLocked}
                      value={formData.state}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 disabled:bg-slate-100"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      disabled={isLocked}
                      value={formData.pincode}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 disabled:bg-slate-100"
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOGISTICS DETAILS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <Fuel className="w-6 h-6 text-iocl-blue" />
                <h3 className="text-xl font-extrabold text-slate-900">Step 2: Logistics & Fuel Requirements</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Product Category</label>
                  <select
                    name="productType"
                    disabled={isLocked}
                    value={formData.productType}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 disabled:bg-slate-100"
                  >
                    <option value="" disabled>Select Fuel Category</option>
                    <option value="HSD">High Speed Diesel (HSD)</option>
                    <option value="LDO">Light Diesel Oil (LDO)</option>
                    <option value="Bitumen">Bitumen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Monthly Required Quantity (in Litres/Metric Tonnes)</label>
                  <input
                    type="number"
                    name="quantity"
                    disabled={isLocked}
                    value={formData.quantity}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 disabled:bg-slate-100"
                    min="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Proposed Delivery Location / Depot</label>
                  <input
                    type="text"
                    name="location"
                    disabled={isLocked}
                    value={formData.location}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 disabled:bg-slate-100"
                    placeholder="Depot or facility delivery point"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Requirement Commencement Date</label>
                  <input
                    type="date"
                    name="requirementStartDate"
                    disabled={isLocked}
                    value={formData.requirementStartDate}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Existing Supplier (if any)</label>
                  <input
                    type="text"
                    name="existingSupplier"
                    disabled={isLocked}
                    value={formData.existingSupplier}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-iocl-blue focus:border-transparent text-sm font-medium text-slate-800 disabled:bg-slate-100"
                    placeholder="e.g. BPCL, HPCL, Private Retailers"
                  />
                </div>

                <div className="flex items-center pt-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="storageAvailability"
                      disabled={isLocked}
                      checked={formData.storageAvailability}
                      onChange={handleChange}
                      className="w-5 h-5 rounded text-iocl-blue border-slate-300 focus:ring-iocl-blue"
                    />
                    <span className="text-xs font-bold text-slate-700 select-none">Do you have explosive storage license and ready storage facilities?</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: COMPLIANCE DOCUMENTS */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <UploadCloud className="w-6 h-6 text-iocl-blue" />
                <h3 className="text-xl font-extrabold text-slate-900">Step 3: Document Compliance</h3>
              </div>

              <div className="space-y-6">
                {/* Request Letter */}
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <h4 className="font-extrabold text-sm text-slate-800">1. Official B2B Request Letter (Mandatory)</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Duly signed letter on official company letterhead detailing fuel requirements, monthly demands, and key stakeholders.</p>
                    <div className="mt-2">{getDocStatusBadge('request_letter')}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!isLocked ? (
                      <>
                        <label className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer text-xs font-bold transition-colors shadow-sm">
                          <UploadCloud className="w-4 h-4" />
                          {getUploadButtonLabel('request_letter')}
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileUpload(e, 'request_letter')}
                            className="hidden"
                          />
                        </label>
                        {getDocFileName('request_letter') ? (
                          <p className="text-[11px] text-slate-500 italic">Uploaded file: {getDocFileName('request_letter')}</p>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">Accepted formats: PDF, PNG</p>
                        )}
                      </>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Edits Locked</span>
                    )}
                  </div>
                </div>

                {/* GSTIN Certificate */}
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <h4 className="font-extrabold text-sm text-slate-800">2. GSTIN Registration Certificate (Mandatory)</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Scanned official copy of GST certificate showing corporate legal registration details.</p>
                    <div className="mt-2">{getDocStatusBadge('gst_certificate')}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!isLocked ? (
                      <>
                        <label className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer text-xs font-bold transition-colors shadow-sm">
                          <UploadCloud className="w-4 h-4" />
                          {getUploadButtonLabel('gst_certificate')}
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileUpload(e, 'gst_certificate')}
                            className="hidden"
                          />
                        </label>
                        {getDocFileName('gst_certificate') ? (
                          <p className="text-[11px] text-slate-500 italic">Uploaded file: {getDocFileName('gst_certificate')}</p>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">Accepted formats: PDF, PNG</p>
                        )}
                      </>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Edits Locked</span>
                    )}
                  </div>
                </div>

                {/* PAN Card */}
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="max-w-md">
                    <h4 className="font-extrabold text-sm text-slate-800">3. Corporate PAN Card Copy</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">Scanned copy of corporate permanent account number card.</p>
                    <div className="mt-2">{getDocStatusBadge('pan_card')}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!isLocked ? (
                      <>
                        <label className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer text-xs font-bold transition-colors shadow-sm">
                          <UploadCloud className="w-4 h-4" />
                          {getUploadButtonLabel('pan_card')}
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileUpload(e, 'pan_card')}
                            className="hidden"
                          />
                        </label>
                        {getDocFileName('pan_card') ? (
                          <p className="text-[11px] text-slate-500 italic">Uploaded file: {getDocFileName('pan_card')}</p>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">Accepted formats: PDF, PNG</p>
                        )}
                      </>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Edits Locked</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <FileText className="w-6 h-6 text-iocl-blue" />
                <h3 className="text-xl font-extrabold text-slate-900">Step 4: Final Summary Review</h3>
              </div>

              <div className="space-y-6">
                {/* Corporate Info */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h4 className="font-extrabold text-sm text-iocl-blue uppercase tracking-wider">Corporate & Legal Information</h4>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-bold uppercase tracking-[0.24em] text-blue-700 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs font-medium">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Company Name</p>
                      <p className="text-slate-800 text-sm font-bold mt-0.5">{formData.companyName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Firm Type</p>
                      <p className="text-slate-800 text-sm font-semibold mt-0.5">{formData.firmType}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">GSTIN Number</p>
                      <p className="text-slate-800 text-sm font-semibold mt-0.5">{formData.gst}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">PAN Number</p>
                      <p className="text-slate-800 text-sm font-semibold mt-0.5">{formData.pan}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Contact Person</p>
                      <p className="text-slate-800 text-sm font-semibold mt-0.5">{formData.contactPerson || formData.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Full Address</p>
                      <p className="text-slate-800 text-sm font-semibold mt-0.5">{formData.address}, {formData.district}, {formData.state} - {formData.pincode}</p>
                    </div>
                  </div>
                </div>

                {/* Logistics Info */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h4 className="font-extrabold text-sm text-iocl-blue uppercase tracking-wider">Fuel Logistics & Quantities</h4>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-bold uppercase tracking-[0.24em] text-blue-700 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-xs font-medium">
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Product Type</p>
                      <p className="text-slate-800 text-sm font-bold mt-0.5">
                        {formData.productType
                          ? formData.productType === 'HSD'
                            ? 'High Speed Diesel (HSD)'
                            : formData.productType === 'LDO'
                              ? 'Light Diesel Oil (LDO)'
                              : 'Bitumen'
                          : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Monthly Required Volume</p>
                      <p className="text-slate-800 text-sm font-bold mt-0.5">
                        {formData.quantity && Number(formData.quantity) > 0 ? `${Number(formData.quantity).toLocaleString()} Litres/MT` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Storage Facility Availability</p>
                      <p className="text-slate-800 text-sm font-semibold mt-0.5">{formData.storageAvailability ? 'Yes, ready storage license' : 'No facility'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Proposed Delivery Location</p>
                      <p className="text-slate-800 text-sm font-semibold mt-0.5">{formData.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Commencement Date</p>
                      <p className="text-slate-800 text-sm font-semibold mt-0.5">{formData.requirementStartDate || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Existing Supplier</p>
                      <p className="text-slate-800 text-sm font-semibold mt-0.5">{formData.existingSupplier || 'None'}</p>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h4 className="font-extrabold text-sm text-iocl-blue uppercase tracking-wider">Uploaded Compliance Documents</h4>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="text-xs font-bold uppercase tracking-[0.24em] text-blue-700 hover:text-blue-900"
                      >
                        Update uploads
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {['request_letter', 'gst_certificate', 'pan_card'].map((type) => {
                      const doc = uploadedDocs.find(d => d.fileType === type);
                      return (
                        <div key={type} className="flex justify-between items-center text-xs border-b border-slate-200/50 pb-2">
                          <div>
                            <span className="font-bold text-slate-700 capitalize">{type.replace('_', ' ')}: </span>
                            <span className="text-slate-500 italic">{doc?.fileName || 'No upload'}</span>
                          </div>
                          <div>{getDocStatusBadge(type)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {!isLocked && (
                <button
                  type="button"
                  onClick={() => saveApplication(false)}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-iocl-blue/40 text-iocl-blue hover:bg-iocl-blue/5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Save Draft
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-white font-extrabold text-xs iocl-gradient-orange shadow-md hover:brightness-110 active:brightness-95 uppercase tracking-wider transition-all"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                !isLocked && (
                  <button
                    type="button"
                    onClick={() => saveApplication(true)}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-white font-extrabold text-xs bg-green-600 hover:bg-green-700 shadow-md uppercase tracking-wider transition-all"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {submitButtonLabel}
                  </button>
                )
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
