'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import CasePeople from '@/components/cases/CasePeople';
import CaseEvidence from '@/components/cases/CaseEvidence';
import CaseTimeline from '@/components/cases/CaseTimeline';
import AddStatementForm from '@/components/cases/forms/AddStatementForm';
import { useUser } from '@/lib/UserContext';
import { generateFIRReport } from '@/lib/generateFIRReport';

export default function CaseDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const id = params.id as string;

  // Check if user can modify FIR (Admin cannot)
  const canModifyFIR = user?.role !== 'Admin';

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('redirectTab') || 'overview');

  // Refresh Triggers
  const [peopleKey, setPeopleKey] = useState(0);
  const [evidenceKey, setEvidenceKey] = useState(0);
  const [timelineKey, setTimelineKey] = useState(0);

  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    case_status: '',
    case_priority: '',
    summary: ''
  });

  const [actionType, setActionType] = useState('Status Change');
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Handle returned person/evidence from full pages
  const addedPersonId = searchParams.get('addedPersonId');
  const addedEvidenceId = searchParams.get('addedEvidenceId');

  // Show link person modal when returning from /persons/new
  const [showLinkPersonModal, setShowLinkPersonModal] = useState(false);
  const [newPersonToLink, setNewPersonToLink] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState({
    role: '',
    is_primary: false,
    statement: ''
  });
  const [linkingPerson, setLinkingPerson] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await fetch(`/api/cases/${id}`);
        if (!res.ok) throw new Error('Failed to load case');
        const data = await res.json();
        setCaseData(data.data);
        setEditForm({
          case_status: data.data.case_status,
          case_priority: data.data.case_priority,
          summary: data.data.description || data.data.summary
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCase();
  }, [id]);

  // Handle when person is added from /persons/new page
  useEffect(() => {
    if (addedPersonId) {
      setNewPersonToLink(addedPersonId);
      setShowLinkPersonModal(true);
      // Clear the URL param
      router.replace(`/cases/${id}?redirectTab=people`, { scroll: false });
    }
  }, [addedPersonId, id, router]);

  // Handle when evidence is added from /evidence/new page
  useEffect(() => {
    if (addedEvidenceId) {
      // Evidence is already linked via case_id in the form, just refresh
      setEvidenceKey(prev => prev + 1);
      setTimelineKey(prev => prev + 1);
      setActiveTab('evidence');
      // Clear the URL param
      router.replace(`/cases/${id}?redirectTab=evidence`, { scroll: false });
    }
  }, [addedEvidenceId, id, router]);

  const handleLinkNewPerson = async () => {
    if (!newPersonToLink || !linkForm.role) return;

    setLinkingPerson(true);
    try {
      const res = await fetch(`/api/cases/${id}/persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_id: parseInt(newPersonToLink),
          role: linkForm.role,
          is_primary: linkForm.is_primary,
          statement: linkForm.statement || null
        })
      });

      if (res.ok) {
        setPeopleKey(prev => prev + 1);
        setTimelineKey(prev => prev + 1);
        setActiveTab('people');
        setShowLinkPersonModal(false);
        setNewPersonToLink(null);
        setLinkForm({ role: '', is_primary: false, statement: '' });
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to link person');
      }
    } catch (err) {
      console.error(err);
      alert('Error linking person to case');
    } finally {
      setLinkingPerson(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        setCaseData((prev: any) => ({ ...prev, ...editForm }));
        setTimelineKey(prev => prev + 1); // Refresh timeline
        setShowEditModal(false);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating case');
    } finally {
      setUpdating(false);
    }
  };

  const handleFormSuccess = (type: string) => {
    if (type === 'person') {
      setPeopleKey(prev => prev + 1);
      setTimelineKey(prev => prev + 1);
      // Redirect to people tab to see changes?
      setActiveTab('people');
    } else if (type === 'evidence') {
      setEvidenceKey(prev => prev + 1);
      setTimelineKey(prev => prev + 1);
      setActiveTab('evidence');
    } else if (type === 'statement') {
      setPeopleKey(prev => prev + 1);
      setTimelineKey(prev => prev + 1);
      setActiveTab('people');
    }
    setShowEditModal(false);
  };

  // Helper to load image as base64
  const loadImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  };

  const handleDownloadReport = async () => {
    setGeneratingPDF(true);
    try {
      // Load report data and images in parallel
      const [res, logoBase64, emblemBase64] = await Promise.all([
        fetch(`/api/cases/${id}/report`),
        loadImageAsBase64('/logo.png').catch(() => undefined),
        loadImageAsBase64('/Emblem_of_Nepal.svg').catch(() => undefined),
      ]);
      if (!res.ok) throw new Error('Failed to fetch report data');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to load report data');
      await generateFIRReport({ ...json.data, logoBase64, emblemBase64 });
    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert(err.message || 'Failed to generate PDF report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c2340]"></div>
    </div>
  );

  if (error || !caseData) return (
    <div className="p-8 text-center text-red-700 bg-red-50 rounded-3xl border border-red-200">
      Error: {error || 'Case not found'}
    </div>
  );

  return (
    <>
      {/* Breadcrumb Back */}
      <div className="mb-6 flex justify-between items-center">
        <Link href="/dashboard" className="text-[#0c2340] hover:text-[#1e3a5f] flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] p-8 rounded-3xl shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 p-32 bg-[#d4a853]/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-[#d4a853]/20 text-[#d4a853] rounded-lg text-xs font-bold uppercase tracking-wider border border-[#d4a853]/30">
                {caseData.crime_type}
              </span>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${caseData.case_priority === 'Critical' ? 'bg-red-500/30 text-red-200 border-red-400/30' :
                caseData.case_priority === 'High' ? 'bg-orange-500/30 text-orange-200 border-orange-400/30' :
                  'bg-green-500/30 text-green-200 border-green-400/30'
                }`}>
                {caseData.case_priority} Priority
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">FIR #{caseData.fir_no}</h1>
            <p className="text-slate-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m8-2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {caseData.station_name} ({caseData.station_code})
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 ${caseData.case_status === 'Registered' ? 'bg-blue-100 text-blue-700 border-blue-200' :
              caseData.case_status === 'Closed' ? 'bg-green-100 text-green-700 border-green-200' :
                'bg-yellow-100 text-yellow-700 border-yellow-200'
              }`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              {caseData.case_status}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadReport}
                disabled={generatingPDF}
                className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {generatingPDF ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Download FIR
                  </>
                )}
              </button>

              {canModifyFIR && (
                <button
                  onClick={() => {
                    setActionType('Status Change'); // default
                    setShowEditModal(true);
                  }}
                  className="px-4 py-2 bg-[#d4a853] hover:bg-[#c49843] text-[#0c2340] rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Modify FIR
                </button>
              )}
            </div>

            <span className="text-xs text-slate-300 mt-1">
              Reported: {new Date(caseData.fir_date_time).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto bg-white rounded-t-xl">
        {['overview', 'people', 'evidence', 'timeline'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${activeTab === tab
              ? 'border-[#0c2340] text-[#0c2340]'
              : 'border-transparent text-slate-500 hover:text-[#1e3a5f] hover:border-slate-300'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content - Force refresh by using keys */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
                <h3 className="text-lg font-semibold text-[#0c2340] mb-4">Incident Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">Location</label>
                    <p className="text-[#1e3a5f] mt-1">{caseData.incident_location}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">Date & Time</label>
                    <p className="text-[#1e3a5f] mt-1">{new Date(caseData.incident_date_time).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">Description</label>
                    <p className="text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">{caseData.summary}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
                <h3 className="text-lg font-semibold text-[#0c2340] mb-4">Case Attributes</h3>
                <p className="text-sm text-slate-500">No additional attributes set.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'people' && (
          <CasePeople key={peopleKey} caseId={parseInt(id)} />
        )}

        {activeTab === 'evidence' && (
          <CaseEvidence key={evidenceKey} caseId={parseInt(id)} />
        )}

        {activeTab === 'timeline' && (
          <CaseTimeline key={timelineKey} caseId={parseInt(id)} />
        )}
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-[#0c2340] mb-4">Modify FIR</h3>

            {/* Action Type Selector */}
            <div className="mb-6">
              <label className="block text-xs text-slate-500 font-bold uppercase mb-2">Select Action Type</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#1e3a5f] focus:ring-2 focus:ring-[#0c2340]/30 focus:border-[#0c2340]"
              >
                <option value="Status Change">Status / Details Update</option>
                <option value="Create New Person">Create & Link New Person</option>
                <option value="Add Evidence">Add Evidence</option>
                <option value="Add Supplementary Statement">Add Supplementary Statement</option>
              </select>
            </div>

            {actionType === 'Status Change' && (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs text-slate-500 font-bold uppercase">Status</span>
                    <select
                      value={editForm.case_status}
                      onChange={e => setEditForm({ ...editForm, case_status: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#1e3a5f] focus:ring-2 focus:ring-[#0c2340]/30 focus:border-[#0c2340]"
                    >
                      <option value="Registered">Registered</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Charge Sheet Filed">Charge Sheet Filed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs text-slate-500 font-bold uppercase">Priority</span>
                    <select
                      value={editForm.case_priority}
                      onChange={e => setEditForm({ ...editForm, case_priority: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#1e3a5f] focus:ring-2 focus:ring-[#0c2340]/30 focus:border-[#0c2340]"
                    >
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                      <option value="Low">Low</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs text-slate-500 font-bold uppercase">Incident Summary</span>
                  <textarea
                    value={editForm.summary}
                    onChange={e => setEditForm({ ...editForm, summary: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[#1e3a5f] h-32 resize-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-[#0c2340]"
                  />
                </label>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-[#0c2340]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2 bg-[#0c2340] hover:bg-[#1e3a5f] text-white rounded-lg text-sm font-bold shadow-lg disabled:opacity-50"
                  >
                    {updating ? 'Saving...' : 'Update Status'}
                  </button>
                </div>
              </form>
            )}

            {actionType === 'Create New Person' && (
              <div className="space-y-4">
                <p className="text-slate-600 text-sm">
                  You will be redirected to the full person creation page with all fields including location, photo upload, and more.
                </p>
                <div className="bg-[#0c2340]/10 border border-[#0c2340]/20 rounded-xl p-4">
                  <h4 className="text-[#0c2340] font-medium mb-2">What happens next:</h4>
                  <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                    <li>Create a new person with full details</li>
                    <li>Return to this case automatically</li>
                    <li>Link the person with role & statement</li>
                  </ol>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-[#0c2340]"
                  >
                    Cancel
                  </button>
                  <Link
                    href={`/persons/new?returnTo=/cases/${id}`}
                    className="px-6 py-2 bg-[#0c2340] hover:bg-[#1e3a5f] text-white rounded-lg text-sm font-bold shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Go to Create Person
                  </Link>
                </div>
              </div>
            )}

            {actionType === 'Add Evidence' && (
              <div className="space-y-4">
                <p className="text-slate-600 text-sm">
                  You will be redirected to the full evidence logging page with file upload, collection details, and more.
                </p>
                <div className="bg-[#d4a853]/10 border border-[#d4a853]/20 rounded-xl p-4">
                  <h4 className="text-[#0c2340] font-medium mb-2">Full Evidence Form includes:</h4>
                  <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                    <li>File/Media upload with preview</li>
                    <li>Collection location & date</li>
                    <li>Officer assignment</li>
                    <li>Detailed description</li>
                  </ul>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-[#0c2340]"
                  >
                    Cancel
                  </button>
                  <Link
                    href={`/evidence/new?returnTo=/cases/${id}&caseId=${id}`}
                    className="px-6 py-2 bg-[#d4a853] hover:bg-[#c49843] text-[#0c2340] rounded-lg text-sm font-bold shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Go to Log Evidence
                  </Link>
                </div>
              </div>
            )}

            {actionType === 'Add Supplementary Statement' && (
              <AddStatementForm
                caseId={parseInt(id)}
                onSuccess={() => handleFormSuccess('statement')}
                onCancel={() => setShowEditModal(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* Link Person Modal - shown when returning from /persons/new */}
      {showLinkPersonModal && newPersonToLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0c2340]">Person Created!</h3>
                <p className="text-sm text-slate-500">Now link them to this case</p>
              </div>
            </div>

            <div className="bg-[#0c2340]/10 border border-[#0c2340]/20 rounded-xl p-3 mb-4">
              <p className="text-xs text-[#1e3a5f]">Person ID: <span className="font-mono text-[#0c2340] font-bold">{newPersonToLink}</span></p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-xs text-slate-500 font-bold uppercase">Role in Case <span className="text-red-500">*</span></span>
                <select
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[#1e3a5f] focus:ring-2 focus:ring-[#0c2340]/30 focus:border-[#0c2340] outline-none"
                  value={linkForm.role}
                  onChange={e => setLinkForm({ ...linkForm, role: e.target.value })}
                >
                  <option value="">Select Role...</option>
                  <option value="Complainant">Complainant</option>
                  <option value="Accused">Accused</option>
                  <option value="Suspect">Suspect</option>
                  <option value="Witness">Witness</option>
                  <option value="Victim">Victim</option>
                </select>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-300 bg-slate-50 text-[#0c2340] focus:ring-[#0c2340]/50"
                  checked={linkForm.is_primary}
                  onChange={e => setLinkForm({ ...linkForm, is_primary: e.target.checked })}
                />
                <span className="text-[#1e3a5f] text-sm">Mark as Primary Person</span>
              </label>

              <label className="block">
                <span className="text-xs text-slate-500 font-bold uppercase">Initial Statement (Optional)</span>
                <textarea
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[#1e3a5f] focus:ring-2 focus:ring-[#0c2340]/30 focus:border-[#0c2340] outline-none h-24 resize-none"
                  placeholder="Enter initial statement or testimony..."
                  value={linkForm.statement}
                  onChange={e => setLinkForm({ ...linkForm, statement: e.target.value })}
                />
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowLinkPersonModal(false);
                    setNewPersonToLink(null);
                    setLinkForm({ role: '', is_primary: false, statement: '' });
                  }}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-[#0c2340]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkNewPerson}
                  disabled={linkingPerson || !linkForm.role}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-lg disabled:opacity-50"
                >
                  {linkingPerson ? 'Linking...' : 'Link to Case'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
