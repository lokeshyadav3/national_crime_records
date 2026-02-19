"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/lib/UserContext';

interface PersonToAdd {
  id?: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  national_id?: string;
  role: string;
  is_primary: boolean;
  statement: string;
  isNew: boolean;
}

interface EvidenceToAdd {
  id?: number;
  evidence_code?: string;
  evidence_type: string;
  description: string;
  collection_date?: string;
}

export default function NewCasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdCaseId, setCreatedCaseId] = useState<number | null>(null);
  const [createdFirNo, setCreatedFirNo] = useState<string>('');

  const [stations, setStations] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);

  const [form, setForm] = useState({
    station_id: "",
    officer_id: "",
    crime_type: "",
    crime_section: "",
    incident_date: "",
    incident_location: "",
    incident_district: "Kathmandu",
    incident_description: "",
    priority: "Medium",
  });

  // Complainant (single, required)
  const [complainant, setComplainant] = useState<PersonToAdd | null>(null);
  const [complainantSearch, setComplainantSearch] = useState('');
  const [complainantResults, setComplainantResults] = useState<any[]>([]);
  const [isSearchingComplainant, setIsSearchingComplainant] = useState(false);

  // Other persons (multiple, optional)
  const [personSearch, setPersonSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [otherPersons, setOtherPersons] = useState<PersonToAdd[]>([]);

  // Evidence
  const [evidenceList, setEvidenceList] = useState<EvidenceToAdd[]>([]);

  // Restore state on mount
  useEffect(() => {
    const savedCaseId = sessionStorage.getItem('pendingCaseId');
    const savedFirNo = sessionStorage.getItem('pendingFirNo');
    const savedComplainant = sessionStorage.getItem('pendingComplainant');
    const savedOtherPersons = sessionStorage.getItem('pendingOtherPersons');
    const savedEvidence = sessionStorage.getItem('pendingEvidence');
    const savedStep = sessionStorage.getItem('pendingStep');
    const returnedPersonId = searchParams.get('addedPersonId');
    const returnedPersonType = searchParams.get('personType');
    const returnedEvidenceId = searchParams.get('addedEvidenceId');

    if (savedCaseId) {
      setCreatedCaseId(parseInt(savedCaseId));
      setCreatedFirNo(savedFirNo || '');
      setStep(parseInt(savedStep || '2'));
    }
    if (savedComplainant) {
      setComplainant(JSON.parse(savedComplainant));
    }
    if (savedOtherPersons) {
      setOtherPersons(JSON.parse(savedOtherPersons));
    }
    if (savedEvidence) {
      setEvidenceList(JSON.parse(savedEvidence));
    }

    // Handle return from /persons/new
    if (returnedPersonId) {
      fetchAndAddPerson(parseInt(returnedPersonId), returnedPersonType === 'complainant');
      window.history.replaceState({}, '', '/cases/new');
    }

    if (returnedEvidenceId) {
      fetchAndAddEvidence(parseInt(returnedEvidenceId));
      window.history.replaceState({}, '', '/cases/new');
    }
  }, [searchParams]);

  const fetchAndAddPerson = async (personId: number, isComplainant: boolean) => {
    try {
      const res = await fetch(`/api/persons/${personId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const person = data.data;
        const newPerson: PersonToAdd = {
          id: person.id,
          first_name: person.first_name,
          middle_name: person.middle_name,
          last_name: person.last_name,
          national_id: person.national_id,
          role: isComplainant ? 'Complainant' : 'Accused',
          is_primary: isComplainant,
          statement: '',
          isNew: false
        };

        if (isComplainant) {
          // Only set if not already set
          setComplainant(prev => prev?.id === person.id ? prev : newPerson);
        } else {
          // Check if person already exists in the list
          setOtherPersons(prev => {
            const exists = prev.some(p => p.id === person.id);
            if (exists) return prev;
            return [...prev, newPerson];
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch added person:', err);
    }
  };

  const fetchAndAddEvidence = async (evidenceId: number) => {
    try {
      const res = await fetch(`/api/evidence/${evidenceId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const evidence = data.data;
        const evidId = evidence.id || evidence.evidence_id;

        // Check if evidence already exists in the list
        setEvidenceList(prev => {
          const exists = prev.some(e => e.id === evidId);
          if (exists) return prev;
          return [...prev, {
            id: evidId,
            evidence_code: evidence.evidence_code,
            evidence_type: evidence.evidence_type,
            description: evidence.description,
            collection_date: evidence.collected_date_time
          }];
        });
      }
    } catch (err) {
      console.error('Failed to fetch added evidence:', err);
    }
  };

  const saveCurrentState = (currentStep: number) => {
    if (createdCaseId) {
      sessionStorage.setItem('pendingCaseId', createdCaseId.toString());
      sessionStorage.setItem('pendingFirNo', createdFirNo);
    }
    sessionStorage.setItem('pendingComplainant', JSON.stringify(complainant));
    sessionStorage.setItem('pendingOtherPersons', JSON.stringify(otherPersons));
    sessionStorage.setItem('pendingEvidence', JSON.stringify(evidenceList));
    sessionStorage.setItem('pendingStep', currentStep.toString());
  };

  const clearSessionState = () => {
    sessionStorage.removeItem('pendingCaseId');
    sessionStorage.removeItem('pendingFirNo');
    sessionStorage.removeItem('pendingComplainant');
    sessionStorage.removeItem('pendingOtherPersons');
    sessionStorage.removeItem('pendingEvidence');
    sessionStorage.removeItem('pendingStep');
  };

  const navigateToNewPerson = (isComplainant: boolean) => {
    saveCurrentState(2);
    router.push(`/persons/new?returnTo=/cases/new&personType=${isComplainant ? 'complainant' : 'other'}`);
  };

  const navigateToNewEvidence = () => {
    saveCurrentState(3);
    router.push(`/evidence/new?returnTo=/cases/new&caseId=${createdCaseId}`);
  };

  useEffect(() => {
    fetch("/api/stations")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStations(data.data);
          // Auto-set station for Officer and StationAdmin
          if (user && user.station_id && (user.role === 'Officer' || user.role === 'StationAdmin')) {
            setForm(prev => ({ ...prev, station_id: String(user.station_id) }));
          }
        }
      })
      .catch(err => console.error(err));
  }, [user]);

  useEffect(() => {
    if (!form.station_id) {
      setOfficers([]);
      setForm(prev => (prev.officer_id ? { ...prev, officer_id: '' } : prev));
      return;
    }

    // Station changed: clear selected officer and fetch new list
    setForm(prev => (prev.officer_id ? { ...prev, officer_id: '' } : prev));

    const controller = new AbortController();
    fetch(`/api/officers?station_id=${encodeURIComponent(form.station_id)}`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOfficers(data.data || []);
          // Auto-select the officer if the logged-in user is an Officer
          if (user && user.officer_id && user.role === 'Officer') {
            setForm(prev => ({ ...prev, officer_id: String(user.officer_id) }));
          }
        }
        else setOfficers([]);
      })
      .catch(err => {
        if (err?.name === 'AbortError') return;
        console.error(err);
      });

    return () => controller.abort();
  }, [form.station_id, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step 1: Submit Case
  const handleSubmitCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    console.log('Submitting case form:', form);

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('Case submission response:', data);

      if (!data.success) {
        throw new Error(data.message || "Failed to register FIR");
      }

      setCreatedCaseId(data.data.id);
      setCreatedFirNo(data.data.fir_number);
      sessionStorage.setItem('pendingCaseId', data.data.id.toString());
      sessionStorage.setItem('pendingFirNo', data.data.fir_number);
      setSuccess(`FIR ${data.data.fir_number} registered! Now add the complainant.`);
      setStep(2);
    } catch (err: any) {
      console.error('Submit case error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search for complainant
  const handleComplainantSearch = async () => {
    if (complainantSearch.length < 2) return;
    setIsSearchingComplainant(true);
    try {
      const res = await fetch(`/api/persons/search?q=${encodeURIComponent(complainantSearch.trim())}`);
      const data = await res.json();
      if (data.success) setComplainantResults(data.data || []);
    } finally {
      setIsSearchingComplainant(false);
    }
  };

  const selectComplainant = (person: any) => {
    setComplainant({
      id: person.id,
      first_name: person.first_name,
      middle_name: person.middle_name,
      last_name: person.last_name,
      national_id: person.national_id,
      role: 'Complainant',
      is_primary: true,
      statement: '',
      isNew: false
    });
    setComplainantResults([]);
    setComplainantSearch('');
  };

  // Search for other persons
  const handlePersonSearch = async () => {
    if (personSearch.length < 2) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/persons/search?q=${encodeURIComponent(personSearch.trim())}`);
      const data = await res.json();
      if (data.success) setSearchResults(data.data || []);
    } finally {
      setIsSearching(false);
    }
  };

  const addOtherPerson = (person: any, role: string) => {
    if (complainant?.id === person.id) {
      alert('This person is already the complainant.');
      return;
    }
    if (otherPersons.find(p => p.id === person.id)) {
      alert('This person is already added.');
      return;
    }
    setOtherPersons(prev => [...prev, {
      id: person.id,
      first_name: person.first_name,
      middle_name: person.middle_name,
      last_name: person.last_name,
      national_id: person.national_id,
      role: role,
      is_primary: false,
      statement: '',
      isNew: false
    }]);
    setSearchResults([]);
    setPersonSearch('');
  };

  const removeOtherPerson = (index: number) => {
    setOtherPersons(prev => prev.filter((_, i) => i !== index));
  };

  const removeEvidence = (index: number) => {
    setEvidenceList(prev => prev.filter((_, i) => i !== index));
  };

  // Step 2: Submit persons
  const handleSubmitPersons = async () => {
    if (!createdCaseId) return;
    if (!complainant) {
      setError('Please add a complainant before continuing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Link complainant
      await fetch(`/api/cases/${createdCaseId}/persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_id: complainant.id,
          role: 'Complainant',
          is_primary: true,
          statement: complainant.statement
        })
      });

      // Link other persons
      for (const person of otherPersons) {
        await fetch(`/api/cases/${createdCaseId}/persons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            person_id: person.id,
            role: person.role,
            is_primary: false,
            statement: person.statement
          })
        });
      }

      setSuccess('Persons linked! Now add evidence.');
      setStep(3);
      saveCurrentState(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    clearSessionState();
    router.push(`/cases/${createdCaseId}`);
  };

  const inputBase = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100";
  const selectBase = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100 cursor-pointer";

  const getStepTitle = () => {
    if (step === 1) return 'Step 1: Case Details';
    if (step === 2) return 'Step 2: Add Persons Involved';
    return 'Step 3: Add Evidence';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0c2340]">Register New FIR</h1>
          <p className="text-slate-500 mt-1">{getStepTitle()}</p>
          {createdFirNo && <p className="text-green-600 text-sm mt-1">FIR: {createdFirNo}</p>}
        </div>
        <Link href="/cases" className="px-4 py-2 bg-white hover:bg-slate-100 rounded-xl text-[#0c2340] transition-all border border-slate-200">
          Back to Cases
        </Link>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${step >= s ? 'text-[#0c2340]' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-[#0c2340] text-white' : 'bg-slate-200 text-slate-500'}`}>{s}</div>
              <span className="text-xs font-medium hidden sm:inline">{s === 1 ? 'Case' : s === 2 ? 'Persons' : 'Evidence'}</span>
            </div>
            {i < 2 && <div className="flex-1 h-0.5 bg-slate-200"><div className={`h-full bg-[#0c2340] transition-all ${step > s ? 'w-full' : 'w-0'}`}></div></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-200 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 border border-green-200 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {success}
          </div>
        )}

        {/* STEP 1: Case Details */}
        {step === 1 && (
          <form onSubmit={handleSubmitCase} className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-[#0c2340] mb-4">Case Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">Police Station *</label>
                  <select
                    name="station_id"
                    value={form.station_id}
                    onChange={handleChange}
                    className={selectBase + ((user && user.station_id && user.role !== 'Admin') ? ' opacity-70 cursor-not-allowed' : '')}
                    disabled={!!(user && user.station_id && user.role !== 'Admin')}
                    required
                  >
                    <option value="" className="text-[#1e3a5f]">Select Station</option>
                    {stations.map(s => <option key={s.id} value={s.id} className="text-[#1e3a5f]">{s.station_name}</option>)}
                  </select>
                  {user && user.station_id && user.role !== 'Admin' && (
                    <p className="text-xs text-slate-500 mt-1">Auto-assigned to your station</p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">Registering Officer *</label>
                  <select
                    name="officer_id"
                    value={form.officer_id}
                    onChange={handleChange}
                    className={selectBase + ((user && user.officer_id && user.role === 'Officer') ? ' opacity-70 cursor-not-allowed' : '')}
                    disabled={!form.station_id || !!(user && user.officer_id && user.role === 'Officer')}
                    required
                  >
                    <option value="" className="text-[#1e3a5f]">{form.station_id ? 'Select Officer' : 'Select Station First'}</option>
                    {officers.map(o => <option key={o.id} value={o.id} className="text-[#1e3a5f]">{o.first_name} {o.last_name} ({o.rank})</option>)}
                  </select>
                  {user && user.officer_id && user.role === 'Officer' && (
                    <p className="text-xs text-slate-500 mt-1">Auto-assigned as registering officer</p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">Crime Type *</label>
                  <input name="crime_type" value={form.crime_type} onChange={handleChange} className={inputBase} required placeholder="e.g. Theft, Fraud, Assault" />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">Priority *</label>
                  <select name="priority" value={form.priority} onChange={handleChange} className={selectBase}>
                    <option value="Low" className="text-[#1e3a5f]">Low</option>
                    <option value="Medium" className="text-[#1e3a5f]">Medium</option>
                    <option value="High" className="text-[#1e3a5f]">High</option>
                    <option value="Critical" className="text-[#1e3a5f]">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#0c2340] mb-4">Incident Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">Date & Time *</label>
                  <input type="datetime-local" name="incident_date" value={form.incident_date} onChange={handleChange} className={inputBase} required />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">District</label>
                  <input name="incident_district" value={form.incident_district} onChange={handleChange} className={inputBase} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-700 text-sm font-medium mb-2">Location *</label>
                  <input name="incident_location" value={form.incident_location} onChange={handleChange} className={inputBase} required placeholder="Address or landmark" />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Description *</label>
                <textarea name="incident_description" value={form.incident_description} onChange={handleChange} className={inputBase + " h-32 resize-none"} required placeholder="Detailed account..." />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button type="submit" disabled={loading} className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50">
                {loading ? 'Registering...' : 'Continue to Add Persons →'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Add Persons (Separated UI) */}
        {step === 2 && (
          <div className="space-y-8">
            {/* COMPLAINANT SECTION */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 rounded-2xl border border-yellow-200">
              <h2 className="text-lg font-semibold text-[#0c2340] mb-2 flex items-center gap-2">
                <span className="text-yellow-600">★</span>
                Complainant (Required)
              </h2>
              <p className="text-slate-500 text-sm mb-4">The person who is filing this FIR</p>

              {complainant ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-700 font-bold text-lg">
                        {complainant.first_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[#0c2340] font-semibold">{complainant.first_name} {complainant.middle_name} {complainant.last_name}</p>
                        <p className="text-slate-500 text-sm">ID: {complainant.national_id || 'N/A'}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full border border-yellow-200">★ Complainant</span>
                      </div>
                    </div>
                    <button onClick={() => setComplainant(null)} className="text-red-500 hover:text-red-500 p-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="mt-4">
                    <label className="block text-slate-700 text-sm font-medium mb-2">Complainant's Statement</label>
                    <textarea
                      value={complainant.statement}
                      onChange={(e) => setComplainant({ ...complainant, statement: e.target.value })}
                      className={inputBase + " h-24 resize-none"}
                      placeholder="Record the complainant's statement about the incident..."
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      value={complainantSearch}
                      onChange={(e) => setComplainantSearch(e.target.value)}
                      placeholder="Search by name or ID..."
                      className={inputBase}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleComplainantSearch())}
                    />
                    <button onClick={handleComplainantSearch} disabled={isSearchingComplainant} className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-xl transition-colors">
                      {isSearchingComplainant ? '...' : 'Search'}
                    </button>
                    <button onClick={() => navigateToNewPerson(true)} className="px-6 py-3 bg-yellow-50 hover:bg-yellow-500/30 text-yellow-700 border border-yellow-200 rounded-xl transition-colors whitespace-nowrap">
                      + New
                    </button>
                  </div>
                  {complainantResults.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {complainantResults.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-200 cursor-pointer" onClick={() => selectComplainant(p)}>
                          <div>
                            <p className="text-[#0c2340] font-medium">{p.first_name} {p.middle_name} {p.last_name}</p>
                            <p className="text-xs text-slate-500">ID: {p.national_id || 'N/A'}</p>
                          </div>
                          <button className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm">Select</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* OTHER PERSONS SECTION */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h2 className="text-lg font-semibold text-[#0c2340] mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Other Persons Involved (Optional)
              </h2>
              <p className="text-slate-500 text-sm mb-4">Accused, Victims, Witnesses, Suspects</p>

              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={personSearch}
                  onChange={(e) => setPersonSearch(e.target.value)}
                  placeholder="Search by name or ID..."
                  className={inputBase}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handlePersonSearch())}
                />
                <button onClick={handlePersonSearch} disabled={isSearching} className="px-6 py-3 bg-[#0c2340] hover:bg-[#1e3a5f] text-[#0c2340] rounded-xl transition-colors">
                  {isSearching ? '...' : 'Search'}
                </button>
                <button onClick={() => navigateToNewPerson(false)} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-[#0c2340] rounded-xl transition-colors whitespace-nowrap">
                  + New
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Search Results:</p>
                  {searchResults.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-200">
                      <div>
                        <p className="text-[#0c2340] font-medium">{p.first_name} {p.middle_name} {p.last_name}</p>
                        <p className="text-xs text-slate-500">ID: {p.national_id || 'N/A'}</p>
                      </div>
                      <div className="flex gap-2">
                        <select className="bg-slate-50 text-[#0c2340] text-sm px-2 py-1 rounded border border-slate-200" id={`role-${p.id}`} defaultValue="Accused">
                          <option>Accused</option><option>Suspect</option><option>Victim</option><option>Witness</option>
                        </select>
                        <button onClick={() => addOtherPerson(p, (document.getElementById(`role-${p.id}`) as HTMLSelectElement).value)} className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm">Add</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {otherPersons.length > 0 && (
                <div className="space-y-3 mt-4">
                  <p className="text-[#0c2340] font-medium">Added Persons ({otherPersons.length})</p>
                  {otherPersons.map((person, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${person.role === 'Accused' ? 'bg-red-50 text-red-500' :
                            person.role === 'Suspect' ? 'bg-orange-50 text-orange-700' :
                              person.role === 'Victim' ? 'bg-blue-50 text-blue-700' :
                                'bg-purple-50 text-purple-700'
                            }`}>{person.first_name.charAt(0)}</div>
                          <div>
                            <p className="text-[#0c2340] font-medium">{person.first_name} {person.middle_name} {person.last_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500">Role:</span>
                              <select
                                value={person.role}
                                onChange={(e) => setOtherPersons(prev => prev.map((p, i) => i === index ? { ...p, role: e.target.value } : p))}
                                className="bg-slate-50 text-[#0c2340] text-xs px-2 py-1 rounded border border-slate-200"
                              >
                                <option>Accused</option><option>Suspect</option><option>Victim</option><option>Witness</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeOtherPerson(index)} className="text-red-500 hover:text-red-500 p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                      <div>
                        <label className="block text-slate-700 text-xs font-medium mb-1">Statement</label>
                        <textarea
                          value={person.statement}
                          onChange={(e) => setOtherPersons(prev => prev.map((p, i) => i === index ? { ...p, statement: e.target.value } : p))}
                          className={inputBase + " h-20 resize-none text-sm"}
                          placeholder={`Record ${person.first_name}'s statement...`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between">
              <button onClick={() => { saveCurrentState(3); setStep(3); }} className="px-6 py-3 bg-white hover:bg-slate-100 text-[#0c2340] rounded-xl transition-all">
                Skip to Evidence
              </button>
              <button onClick={handleSubmitPersons} disabled={loading || !complainant} className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50">
                {loading ? 'Saving...' : 'Continue to Evidence →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Add Evidence */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-[#0c2340] mb-4">Add Evidence</h2>
              <p className="text-slate-500 text-sm mb-6">Upload photos, videos, audio recordings, or documents as evidence.</p>

              <button onClick={navigateToNewEvidence} className="w-full px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 text-[#0c2340] rounded-xl transition-all flex items-center justify-center gap-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add New Evidence
              </button>

              {evidenceList.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-[#0c2340] font-medium">Evidence Added ({evidenceList.length})</p>
                  {evidenceList.map((evidence, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <p className="text-[#0c2340] font-medium">{evidence.evidence_code || `Evidence #${index + 1}`}</p>
                          <p className="text-xs text-slate-500">{evidence.evidence_type} • {evidence.description?.substring(0, 40)}...</p>
                        </div>
                      </div>
                      <button onClick={() => removeEvidence(index)} className="text-red-500 hover:text-red-500 p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-3 bg-white hover:bg-slate-100 text-[#0c2340] rounded-xl transition-all">← Back to Persons</button>
              <button onClick={handleFinish} className="bg-gradient-to-r from-green-700 to-emerald-800 hover:from-green-600 hover:to-emerald-700 text-[#0c2340] font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Complete Registration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}










