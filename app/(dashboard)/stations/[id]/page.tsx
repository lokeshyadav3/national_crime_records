'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/lib/UserContext';

interface Station {
  id: number;
  station_code: string;
  station_name: string;
  state: string;
  district: string;
  municipality: string;
  ward: string;
  address: string;
  contact_number: string;
  email: string;
  jurisdiction: string;
  photo?: string;
  incharge_officer_id?: number;
  incharge_name?: string;
  incharge_rank?: string;
}

interface Officer {
  id: number;
  badge_number: string;
  first_name: string;
  last_name: string;
  rank: string;
  department: string;
  service_status: string;
  contact_number: string;
  photo?: string;
}

interface Case {
  id: number;
  fir_number: string;
  crime_type: string;
  case_status: string;
  priority: string;
  registered_date: string;
  incident_location: string;
}

export default function StationDetailPage() {
  const params = useParams();
  const { user } = useUser();
  const stationId = params.id;

  const [station, setStation] = useState<Station | null>(null);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'officers' | 'cases'>('overview');
  const [caseFilter, setCaseFilter] = useState('all');
  const [caseSearch, setCaseSearch] = useState('');

  // Admin can edit stations and add officers
  const canModify = user?.role === 'Admin';

  useEffect(() => {
    if (!stationId) return;

    Promise.all([
      fetch(`/api/stations/${stationId}`).then(res => res.json()),
      fetch(`/api/officers?station_id=${stationId}`).then(res => res.json()),
      fetch(`/api/cases?station_id=${stationId}`).then(res => res.json()),
    ])
      .then(([stationData, officersData, casesData]) => {
        if (stationData.success) {
          setStation(stationData.data);
        }
        if (officersData.success) {
          setOfficers(officersData.data);
        }
        if (casesData.success) {
          setCases(casesData.data);
        }
      })
      .catch(error => {
        console.error('Failed to fetch station details:', error);
      })
      .finally(() => setLoading(false));
  }, [stationId]);

  const filteredCases = cases.filter(c => {
    const matchesFilter = caseFilter === 'all' || c.case_status === caseFilter;
    const matchesSearch = !caseSearch ||
      c.fir_number.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.crime_type.toLowerCase().includes(caseSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const caseCounts = {
    all: cases.length,
    Registered: cases.filter(c => c.case_status === 'Registered').length,
    'Under Investigation': cases.filter(c => c.case_status === 'Under Investigation').length,
    Closed: cases.filter(c => c.case_status === 'Closed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading station details...
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-700">Station not found</h2>
        <Link href="/stations" className="text-[#0c2340] hover:text-[#1e3a5f] mt-4 inline-block">
          ← Back to Stations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/stations" className="inline-flex items-center gap-2 text-[#0c2340] hover:text-[#1e3a5f] font-medium">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Stations
      </Link>

      {/* Station Header with Photo */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Station Photo - Rectangular Banner */}
        <div className="relative h-48 bg-gradient-to-r from-[#0c2340] to-[#1e3a5f]">
          {station.photo ? (
            <img
              src={station.photo}
              alt={station.station_name}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-24 h-24 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c2340]/90 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="px-3 py-1 bg-[#d4a853] text-[#0c2340] text-xs font-bold rounded-full">
                  {station.station_code}
                </span>
                <h1 className="text-3xl font-bold text-white mt-2">{station.station_name}</h1>
                <p className="text-slate-300 mt-1">{station.district}, {station.state}</p>
              </div>
              {canModify && (
                <Link
                  href={`/stations/${station.id}/edit`}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Station
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200">
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-[#0c2340]">{officers.length}</div>
            <div className="text-sm text-slate-500">Officers</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-[#0c2340]">{cases.length}</div>
            <div className="text-sm text-slate-500">Total Cases</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{caseCounts.Closed}</div>
            <div className="text-sm text-slate-500">Cases Closed</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px">
            {(['overview', 'officers', 'cases'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                    ? 'border-[#0c2340] text-[#0c2340]'
                    : 'border-transparent text-slate-500 hover:text-[#0c2340] hover:border-slate-300'
                  }`}
              >
                {tab} {tab === 'officers' && `(${officers.length})`} {tab === 'cases' && `(${cases.length})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#0c2340]">Station Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <svg className="w-5 h-5 text-[#0c2340] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="text-xs text-slate-500 uppercase font-medium">Location</div>
                      <div className="text-sm text-slate-700">
                        {station.municipality && `${station.municipality}, `}
                        {station.ward && `Ward ${station.ward}, `}
                        {station.district}, {station.state}
                      </div>
                    </div>
                  </div>
                  {station.address && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <svg className="w-5 h-5 text-[#0c2340] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <div className="text-xs text-slate-500 uppercase font-medium">Address</div>
                        <div className="text-sm text-slate-700">{station.address}</div>
                      </div>
                    </div>
                  )}
                  {station.contact_number && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <svg className="w-5 h-5 text-[#0c2340] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <div className="text-xs text-slate-500 uppercase font-medium">Contact</div>
                        <div className="text-sm text-slate-700">{station.contact_number}</div>
                      </div>
                    </div>
                  )}
                  {station.email && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <svg className="w-5 h-5 text-[#0c2340] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="text-xs text-slate-500 uppercase font-medium">Email</div>
                        <div className="text-sm text-slate-700">{station.email}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#0c2340]">Station In-Charge</h3>
                {station.incharge_name ? (
                  <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] flex items-center justify-center text-white text-xl font-bold">
                      {station.incharge_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-[#0c2340]">{station.incharge_name}</div>
                      <div className="text-sm text-slate-500">{station.incharge_rank}</div>
                      <Link
                        href={`/officers/${station.incharge_officer_id}`}
                        className="text-xs text-[#0c2340] hover:underline mt-1 inline-block"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-slate-500 text-center">
                    No in-charge assigned
                  </div>
                )}

                {station.jurisdiction && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-[#0c2340] mb-3">Jurisdiction</h3>
                    <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700">
                      {station.jurisdiction}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Officers Tab */}
          {activeTab === 'officers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#0c2340]">Station Officers ({officers.length})</h3>
                {canModify && (
                  <Link
                    href={`/officers/new?station_id=${stationId}`}
                    className="px-4 py-2 bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:from-[#1e3a5f] hover:to-[#2d4a6f] transition-all"
                  >
                    + Add Officer
                  </Link>
                )}
              </div>
              {officers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No officers assigned to this station</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {officers.map((officer) => (
                    <Link
                      key={officer.id}
                      href={`/officers/${officer.id}`}
                      className="bg-slate-50 hover:bg-slate-100 rounded-xl p-4 transition-colors flex items-center gap-4"
                    >
                      {/* Circular Officer Photo */}
                      <div className="relative flex-shrink-0">
                        {officer.photo ? (
                          <img
                            src={officer.photo}
                            alt={`${officer.first_name} ${officer.last_name}`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-md">
                            {officer.first_name?.charAt(0)}{officer.last_name?.charAt(0)}
                          </div>
                        )}
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${officer.service_status === 'Active' ? 'bg-green-500' :
                            officer.service_status === 'Suspended' ? 'bg-red-500' :
                              'bg-gray-400'
                          }`}></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#0c2340] truncate">
                          {officer.first_name} {officer.last_name}
                        </div>
                        <div className="text-xs text-slate-500">{officer.badge_number}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                          {officer.rank}
                        </span>
                      </div>
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cases Tab */}
          {activeTab === 'cases' && (
            <div>
              {/* Case Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by FIR number or crime type..."
                    value={caseSearch}
                    onChange={(e) => setCaseSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(caseCounts).map(([status, count]) => (
                    <button
                      key={status}
                      onClick={() => setCaseFilter(status)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${caseFilter === status
                          ? 'bg-[#0c2340] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {status === 'all' ? 'All' : status} ({count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Cases List */}
              {filteredCases.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No cases found</div>
              ) : (
                <div className="space-y-3">
                  {filteredCases.map((caseItem) => (
                    <Link
                      key={caseItem.id}
                      href={`/cases/${caseItem.id}`}
                      className="block bg-slate-50 hover:bg-slate-100 rounded-xl p-4 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-[#0c2340]/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold text-[#0c2340]">{caseItem.fir_number}</div>
                            <div className="text-sm text-slate-500">{caseItem.crime_type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <div className="text-xs text-slate-500">{caseItem.incident_location}</div>
                            <div className="text-xs text-slate-400">
                              {new Date(caseItem.registered_date).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${caseItem.case_status === 'Registered' ? 'bg-blue-100 text-blue-700' :
                              caseItem.case_status === 'Under Investigation' ? 'bg-yellow-100 text-yellow-700' :
                                caseItem.case_status === 'Closed' ? 'bg-green-100 text-green-700' :
                                  'bg-slate-100 text-slate-700'
                            }`}>
                            {caseItem.case_status}
                          </span>
                          {caseItem.priority === 'High' || caseItem.priority === 'Critical' ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${caseItem.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                              {caseItem.priority}
                            </span>
                          ) : null}
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
