'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/lib/UserContext';

export default function OfficerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [officer, setOfficer] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'cases'>('overview');

  // Admin can edit officers
  const canModify = user?.role === 'Admin';

  useEffect(() => {
    if (!params.id) return;

    Promise.all([
      fetch(`/api/officers/${params.id}`).then(res => res.json()),
      fetch(`/api/cases?officer_id=${params.id}`).then(res => res.json()),
    ])
      .then(([officerData, casesData]) => {
        if (officerData.success) {
          setOfficer(officerData.data);
        }
        if (casesData.success) {
          setCases(casesData.data || []);
        }
      })
      .catch(error => {
        console.error('Failed to fetch officer details:', error);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg">Loading officer details...</span>
        </div>
      </div>
    );
  }

  if (!officer) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Officer Not Found</h3>
        <p className="text-slate-500 mb-6">The officer you're looking for doesn't exist or has been removed.</p>
        <Link href="/officers" className="text-[#0c2340] hover:text-[#1e3a5f] font-medium">
          ← Back to Officers
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500';
      case 'Retired': return 'bg-gray-400';
      case 'Suspended': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Retired': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Suspended': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/officers"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-[#0c2340] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Officers
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Circular Photo */}
            <div className="relative">
              {officer.photo ? (
                <img
                  src={officer.photo}
                  alt={`${officer.first_name} ${officer.last_name}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30 shadow-xl">
                  {officer.first_name?.charAt(0)}{officer.last_name?.charAt(0)}
                </div>
              )}
              {/* Status Indicator */}
              <span className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-3 border-white ${getStatusColor(officer.service_status)}`}></span>
            </div>

            {/* Officer Info */}
            <div className="text-center md:text-left text-white flex-1">
              <h1 className="text-3xl font-bold">{officer.first_name} {officer.middle_name ? officer.middle_name + ' ' : ''}{officer.last_name}</h1>
              <p className="text-[#d4a853] text-lg font-medium mt-1">{officer.badge_number}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {officer.rank}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(officer.service_status)}`}>
                  {officer.service_status}
                </span>
              </div>
            </div>

            {/* Edit Button & Quick Stats */}
            <div className="flex flex-col items-end gap-4">
              {canModify && (
                <Link
                  href={`/officers/${officer.id}/edit`}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Officer
                </Link>
              )}
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{cases.length}</p>
                  <p className="text-sm text-white/60">Assigned Cases</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {cases.filter(c => c.status === 'Closed').length}
                  </p>
                  <p className="text-sm text-white/60">Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'overview'
                ? 'text-[#0c2340]'
                : 'text-slate-500 hover:text-[#0c2340]'
                }`}
            >
              Overview
              {activeTab === 'overview' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0c2340]"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'cases'
                ? 'text-[#0c2340]'
                : 'text-slate-500 hover:text-[#0c2340]'
                }`}
            >
              Assigned Cases ({cases.length})
              {activeTab === 'cases' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0c2340]"></span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-slate-500 min-w-[140px]">Full Name:</span>
                    <span className="text-[#0c2340] font-medium">{officer.first_name} {officer.middle_name ? officer.middle_name + ' ' : ''}{officer.last_name}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-slate-500 min-w-[140px]">Badge Number:</span>
                    <span className="text-[#0c2340] font-medium">{officer.badge_number}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-slate-500 min-w-[140px]">Rank:</span>
                    <span className="text-[#0c2340] font-medium">{officer.rank}</span>
                  </div>
                  {(officer.contact_number || officer.phone) && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-500 min-w-[140px]">Phone:</span>
                      <span className="text-[#0c2340] font-medium">{officer.contact_number || officer.phone}</span>
                    </div>
                  )}
                  {officer.email && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-500 min-w-[140px]">Email:</span>
                      <span className="text-[#0c2340] font-medium">{officer.email}</span>
                    </div>
                  )}
                  {officer.gender && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-500 min-w-[140px]">Gender:</span>
                      <span className="text-[#0c2340] font-medium">{officer.gender}</span>
                    </div>
                  )}
                  {officer.signature && (
                    <div className="mt-4">
                      <span className="text-slate-500 block mb-2">Signature:</span>
                      <div className="border border-slate-200 rounded-xl p-2 bg-white inline-block">
                        <img src={officer.signature} alt="Officer Signature" className="h-16 object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Information */}
              <div>
                <h3 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Service Information
                </h3>
                <div className="space-y-4">
                  {officer.department && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-500 min-w-[140px]">Department:</span>
                      <span className="text-[#0c2340] font-medium">{officer.department}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <span className="text-slate-500 min-w-[140px]">Service Status:</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(officer.service_status)}`}>
                      {officer.service_status}
                    </span>
                  </div>
                  {(officer.date_of_joining || officer.join_date) && (
                    <div className="flex items-start gap-3">
                      <span className="text-slate-500 min-w-[140px]">Join Date:</span>
                      <span className="text-[#0c2340] font-medium">
                        {new Date(officer.date_of_joining || officer.join_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Permanent Address */}
              {(officer.state_province || officer.district || officer.municipality || officer.address_line) && (
                <div>
                  <h3 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Permanent Address
                  </h3>
                  <div className="space-y-4">
                    {officer.state_province && (
                      <div className="flex items-start gap-3">
                        <span className="text-slate-500 min-w-[140px]">Province:</span>
                        <span className="text-[#0c2340] font-medium">{officer.state_province}</span>
                      </div>
                    )}
                    {officer.district && (
                      <div className="flex items-start gap-3">
                        <span className="text-slate-500 min-w-[140px]">District:</span>
                        <span className="text-[#0c2340] font-medium">{officer.district}</span>
                      </div>
                    )}
                    {officer.municipality && (
                      <div className="flex items-start gap-3">
                        <span className="text-slate-500 min-w-[140px]">Municipality:</span>
                        <span className="text-[#0c2340] font-medium">{officer.municipality}</span>
                      </div>
                    )}
                    {officer.ward_no && (
                      <div className="flex items-start gap-3">
                        <span className="text-slate-500 min-w-[140px]">Ward No.:</span>
                        <span className="text-[#0c2340] font-medium">{officer.ward_no}</span>
                      </div>
                    )}
                    {officer.address_line && (
                      <div className="flex items-start gap-3">
                        <span className="text-slate-500 min-w-[140px]">Address:</span>
                        <span className="text-[#0c2340] font-medium">{officer.address_line}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Station Information */}
              {officer.station_id && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Assigned Station
                  </h3>
                  <Link
                    href={`/stations/${officer.station_id}`}
                    className="block bg-slate-50 rounded-2xl p-4 hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[#0c2340] font-semibold group-hover:text-[#1e3a5f] transition-colors">
                          {officer.station_name}
                        </h4>
                        <p className="text-sm text-slate-500">{officer.station_district}, {officer.station_state}</p>
                      </div>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-[#0c2340] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="space-y-4">
              {cases.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Cases Assigned</h3>
                  <p className="text-slate-500">This officer doesn't have any cases assigned yet.</p>
                </div>
              ) : (
                cases.map((caseItem) => (
                  <Link
                    key={caseItem.id}
                    href={`/cases/${caseItem.id}`}
                    className="block bg-slate-50 rounded-2xl p-4 hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${caseItem.status === 'Closed' ? 'bg-green-100' :
                        caseItem.status === 'Under Investigation' ? 'bg-blue-100' :
                          'bg-yellow-100'
                        }`}>
                        <svg className={`w-5 h-5 ${caseItem.status === 'Closed' ? 'text-green-600' :
                          caseItem.status === 'Under Investigation' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-[#d4a853]">{caseItem.fir_number}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${caseItem.status === 'Closed' ? 'bg-green-100 text-green-700' :
                            caseItem.status === 'Under Investigation' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {caseItem.status}
                          </span>
                        </div>
                        <h4 className="text-[#0c2340] font-medium group-hover:text-[#1e3a5f] transition-colors truncate">
                          {caseItem.title || caseItem.case_type}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1 truncate">{caseItem.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span>Filed: {new Date(caseItem.date_reported).toLocaleDateString()}</span>
                          {caseItem.priority && (
                            <span className={`px-2 py-0.5 rounded-full ${caseItem.priority === 'High' ? 'bg-red-50 text-red-600' :
                              caseItem.priority === 'Medium' ? 'bg-orange-50 text-orange-600' :
                                'bg-gray-50 text-gray-600'
                              }`}>
                              {caseItem.priority} Priority
                            </span>
                          )}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-[#0c2340] group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
