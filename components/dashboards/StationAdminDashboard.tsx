'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SessionUser } from '@/lib/types';

// Dynamic import for map (no SSR)
const NepalDistrictMap = dynamic(
  () => import('./NepalDistrictMap'),
  {
    ssr: false, loading: () => (
      <div className="h-[400px] bg-slate-100 rounded-2xl flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading map...
        </div>
      </div>
    )
  }
);

interface DashboardProps {
  user: SessionUser;
  stats: any;
}

interface StationInfo {
  id: number;
  station_code: string;
  station_name: string;
  state_province: string;
  district: string;
  municipality: string;
  ward_no: string;
  address_line: string;
  phone: string;
  email: string;
  jurisdiction_area: string;
  established_date: string;
  is_active: boolean;
  photo: string;
  incharge_name: string;
  incharge_rank: string;
  incharge_contact: string;
}

interface OfficerInfo {
  id: number;
  first_name: string;
  last_name: string;
  badge_number: string;
  rank: string;
  contact_number: string;
  email: string;
  service_status: string;
  photo: string;
  department: string;
}

export default function StationAdminDashboard({ user, stats }: DashboardProps) {
  const [station, setStation] = useState<StationInfo | null>(null);
  const [officers, setOfficers] = useState<OfficerInfo[]>([]);
  const [loadingStation, setLoadingStation] = useState(true);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [mapStatusFilter, setMapStatusFilter] = useState('all');

  useEffect(() => {
    if (!user.station_id) return;

    Promise.all([
      fetch(`/api/stations/${user.station_id}`).then(res => res.json()),
      fetch(`/api/officers?station_id=${user.station_id}`).then(res => res.json()),
    ])
      .then(([stationData, officersData]) => {
        if (stationData.success) setStation(stationData.data);
        if (officersData.success) setOfficers(officersData.data || []);
      })
      .catch(err => console.error('Failed to load station data:', err))
      .finally(() => {
        setLoadingStation(false);
        setLoadingOfficers(false);
      });
  }, [user.station_id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] p-6 rounded-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Station Admin Dashboard</h1>
            <p className="text-slate-300 mt-2">
              {station ? station.station_name : `Station ID: ${user.station_id}`}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl">
            <div className="w-10 h-10 bg-[#d4a853] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user.username}</p>
              <p className="text-slate-300 text-xs">Station Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Station Details Card */}
      {loadingStation ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading station details...
          </div>
        </div>
      ) : station ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-[#0c2340] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Station Details
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Station Photo */}
              <div className="flex-shrink-0">
                {station.photo ? (
                  <img src={station.photo} alt={station.station_name} className="w-40 h-40 object-cover rounded-2xl border-2 border-slate-200" />
                ) : (
                  <div className="w-40 h-40 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Station Info Grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium">Station Code</p>
                  <p className="text-sm font-semibold text-[#0c2340] mt-1">{station.station_code}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium">Station Name</p>
                  <p className="text-sm font-semibold text-[#0c2340] mt-1">{station.station_name}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium">Province</p>
                  <p className="text-sm font-semibold text-[#0c2340] mt-1">{station.state_province || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium">District</p>
                  <p className="text-sm font-semibold text-[#0c2340] mt-1">{station.district || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium">Municipality</p>
                  <p className="text-sm font-semibold text-[#0c2340] mt-1">{station.municipality || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium">Phone</p>
                  <p className="text-sm font-semibold text-[#0c2340] mt-1">{station.phone || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium">Email</p>
                  <p className="text-sm font-semibold text-[#0c2340] mt-1">{station.email || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium">Jurisdiction</p>
                  <p className="text-sm font-semibold text-[#0c2340] mt-1">{station.jurisdiction_area || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium">Established</p>
                  <p className="text-sm font-semibold text-[#0c2340] mt-1">{station.established_date ? new Date(station.established_date).toLocaleDateString() : '-'}</p>
                </div>
                {station.incharge_name && (
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                    <p className="text-xs text-amber-600 font-medium">Station Incharge</p>
                    <p className="text-sm font-semibold text-[#0c2340] mt-1">{station.incharge_rank} {station.incharge_name}</p>
                  </div>
                )}
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 font-medium">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full ${station.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {station.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Station Cases</div>
              <div className="text-3xl font-bold text-[#0c2340] mt-1">{stats?.totalCases || 0}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500">Station Officers</div>
              <div className="text-3xl font-bold text-[#0c2340] mt-1">{stats?.totalOfficers || 0}</div>
            </div>
          </div>
        </div>

        {stats?.casesByStatus?.slice(0, 2).map((item: any) => (
          <div key={item.status} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">{item.status}</div>
                <div className="text-3xl font-bold text-[#0c2340] mt-1">{parseInt(item.count)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6">
        <h2 className="text-lg font-semibold text-[#0c2340] mb-4">Station Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/officers" className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] p-4 rounded-xl flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg">
            <div className="p-2 bg-white/10 rounded-lg text-[#d4a853]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <div className="font-bold text-white">Manage Officers</div>
              <div className="text-xs text-slate-300">View & Edit Officer Details</div>
            </div>
          </Link>

          <Link href="/officers/new" className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] p-4 rounded-xl flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg">
            <div className="p-2 bg-white/10 rounded-lg text-[#d4a853]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </div>
            <div>
              <div className="font-bold text-white">Add Officer</div>
              <div className="text-xs text-slate-300">Register New Officer</div>
            </div>
          </Link>

          <Link href="/cases" className="bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center gap-3 transition-colors">
            <div className="p-2 bg-[#0c2340]/10 rounded-lg text-[#0c2340]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <div className="font-semibold text-[#0c2340]">View Cases</div>
              <div className="text-xs text-slate-500">Station Case Records</div>
            </div>
          </Link>

          <Link href="/persons" className="bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center gap-3 transition-colors">
            <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <div>
              <div className="font-semibold text-[#0c2340]">Manage Persons</div>
              <div className="text-xs text-slate-500">View & Edit Person Records</div>
            </div>
          </Link>

          <Link href="/persons/new" className="bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center gap-3 transition-colors">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </div>
            <div>
              <div className="font-semibold text-[#0c2340]">Add Person</div>
              <div className="text-xs text-slate-500">Register New Person</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Officers at this Station */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0c2340] flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Station Officers ({officers.length})
          </h2>
          <Link href="/officers/new" className="text-sm font-medium text-[#0c2340] hover:text-[#1e3a5f] flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add Officer
          </Link>
        </div>
        {loadingOfficers ? (
          <div className="p-8 text-center text-slate-500">Loading officers...</div>
        ) : officers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No officers assigned to this station yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Badge</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {officers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      {officer.photo ? (
                        <img src={officer.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#0c2340]">{officer.first_name} {officer.last_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{officer.badge_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{officer.rank}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{officer.department || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{officer.contact_number || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${officer.service_status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {officer.service_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/officers/${officer.id}`} className="text-[#0c2340] hover:text-[#1e3a5f] text-sm font-medium">View</Link>
                        <Link href={`/officers/${officer.id}/edit`} className="text-amber-600 hover:text-amber-700 text-sm font-medium">Edit</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Cases */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-[#0c2340]">Recent Station Cases</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">FIR No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentCases?.length > 0 ? stats.recentCases.map((caseItem: any) => (
                <tr key={caseItem.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-[#0c2340]">{caseItem.fir_number}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{caseItem.crime_type}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#0c2340]/10 text-[#0c2340]">
                      {caseItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${caseItem.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      caseItem.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        caseItem.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                      }`}>
                      {caseItem.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(caseItem.registered_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <Link href={`/cases/${caseItem.id}`} className="text-[#0c2340] hover:text-[#1e3a5f] font-medium">Details</Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No cases found for this station.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nepal District Map */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340]">Cases by District</h2>
            <p className="text-sm text-slate-500 mt-1">Geographic distribution of cases across Nepal</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Filter:</span>
            <select
              value={mapStatusFilter}
              onChange={(e) => setMapStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30"
            >
              <option value="all">All Cases</option>
              <option value="Registered">Registered</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Charge Sheet Filed">Charge Sheet Filed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="p-4">
          <NepalDistrictMap
            casesByDistrict={stats?.casesByDistrict || []}
            statusFilter={mapStatusFilter}
          />
        </div>
      </div>
    </div>
  );
}
