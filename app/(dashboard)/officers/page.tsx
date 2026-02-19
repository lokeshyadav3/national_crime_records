'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/UserContext';

interface Province {
  id: number;
  name: string;
  districtList: { id: number; name: string; }[];
}

export default function OfficersPage() {
  const { user } = useUser();
  const [officers, setOfficers] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [filteredStations, setFilteredStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [stationFilter, setStationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [allDistricts, setAllDistricts] = useState<string[]>([]);

  // Admin can add/edit officers
  const canModifyOfficers = user?.role === 'Admin';

  // Check if filters are applied to show list
  const shouldShowList = search.trim() !== '' || (districtFilter !== '' && stationFilter !== '');

  useEffect(() => {
    // Load Nepal locations
    fetch('/nepal_location.json')
      .then(res => res.json())
      .then(data => {
        setProvinces(data.provinceList || []);
        const districtSet = new Set<string>();
        (data.provinceList || []).forEach((province: Province) => {
          province.districtList.forEach(district => {
            districtSet.add(district.name);
          });
        });
        setAllDistricts(Array.from(districtSet).sort());
      })
      .catch(err => console.error('Failed to load locations:', err));
  }, []);

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    // Filter stations by district (case-insensitive)
    if (districtFilter) {
      const filtered = stations.filter(s => s.district?.toLowerCase() === districtFilter.toLowerCase());
      setFilteredStations(filtered);
      // Reset station filter if current station is not in the filtered list
      if (stationFilter && !filtered.some(s => s.id.toString() === stationFilter)) {
        setStationFilter('');
      }
    } else {
      setFilteredStations(stations);
    }
  }, [districtFilter, stations]);

  useEffect(() => {
    if (shouldShowList) {
      fetchOfficers();
    } else {
      setOfficers([]);
    }
  }, [search, stationFilter, statusFilter, districtFilter]);

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      const data = await response.json();
      if (data.success) {
        setStations(data.data);
        setFilteredStations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    }
  };

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (stationFilter) params.append('station_id', stationFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/officers?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setOfficers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch officers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0c2340]">Officers</h1>
          <p className="text-slate-500 mt-1">
            {canModifyOfficers ? 'Manage police officers in the system' : 'View police officers in the system'}
          </p>
        </div>
        {canModifyOfficers && (
          <Link
            href="/officers/new"
            className="flex items-center gap-2 bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add New Officer
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, badge number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100"
            />
          </div>

          {/* District Filter */}
          <div className="relative w-full md:w-56">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100 appearance-none cursor-pointer"
            >
              <option value="">Select District</option>
              {allDistricts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Station Filter */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              disabled={!districtFilter}
              className={`w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100 appearance-none cursor-pointer ${!districtFilter ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Select Station</option>
              {filteredStations.map((station) => (
                <option key={station.id} value={station.id}>{station.station_name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative w-full md:w-48">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100 appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
              <option value="Retired">Retired</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(search || districtFilter || stationFilter || statusFilter) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 flex-wrap">
            <span className="text-sm text-slate-500">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0c2340]/10 text-[#0c2340] rounded-full text-sm">
                Search: {search}
                <button onClick={() => setSearch('')} className="hover:text-red-500">×</button>
              </span>
            )}
            {districtFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0c2340]/10 text-[#0c2340] rounded-full text-sm">
                District: {districtFilter}
                <button onClick={() => { setDistrictFilter(''); setStationFilter(''); }} className="hover:text-red-500">×</button>
              </span>
            )}
            {stationFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0c2340]/10 text-[#0c2340] rounded-full text-sm">
                Station: {filteredStations.find(s => s.id.toString() === stationFilter)?.station_name}
                <button onClick={() => setStationFilter('')} className="hover:text-red-500">×</button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0c2340]/10 text-[#0c2340] rounded-full text-sm">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('')} className="hover:text-red-500">×</button>
              </span>
            )}
            <button 
              onClick={() => { setSearch(''); setDistrictFilter(''); setStationFilter(''); setStatusFilter(''); }}
              className="text-sm text-red-500 hover:text-red-700 ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Instruction message when no filters */}
        {!shouldShowList && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 text-slate-500 bg-slate-50 p-4 rounded-xl">
              <svg className="w-6 h-6 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">
                Use the <strong>search bar</strong> to find officers, or select both <strong>District</strong> and <strong>Station</strong> filters to view the officers list.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Officers Grid - Card Layout with Circular Photos */}
      {shouldShowList && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="flex items-center justify-center gap-3 text-slate-500">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading officers...
              </div>
            </div>
          ) : officers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-500">No officers found</div>
          ) : (
            officers.map((officer) => (
              <Link
                key={officer.id}
              href={`/officers/${officer.id}`}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
            >
              {/* Circular Photo */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  {officer.photo ? (
                    <img 
                      src={officer.photo} 
                      alt={`${officer.first_name} ${officer.last_name}`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-lg group-hover:border-[#0c2340]/20 transition-all"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] flex items-center justify-center text-white text-2xl font-bold border-4 border-slate-100 shadow-lg group-hover:border-[#0c2340]/20 transition-all">
                      {officer.first_name?.charAt(0)}{officer.last_name?.charAt(0)}
                    </div>
                  )}
                  {/* Status Indicator */}
                  <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${
                    officer.service_status === 'Active' ? 'bg-green-500' :
                    officer.service_status === 'Retired' ? 'bg-gray-400' :
                    officer.service_status === 'Suspended' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}></span>
                </div>

                {/* Officer Info */}
                <h3 className="text-lg font-semibold text-[#0c2340] mt-4 group-hover:text-[#1e3a5f] transition-colors">
                  {officer.first_name} {officer.last_name}
                </h3>
                <p className="text-sm text-[#d4a853] font-medium">{officer.badge_number}</p>
                
                <span className="mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {officer.rank}
                </span>

                {/* Station Info */}
                <div className="mt-4 pt-4 border-t border-slate-100 w-full">
                  <div className="flex items-center justify-center gap-2 text-slate-600 text-sm">
                    <svg className="w-4 h-4 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{officer.station_name || 'Not Assigned'}</span>
                  </div>
                  {officer.department && (
                    <p className="text-xs text-slate-400 mt-1">{officer.department}</p>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    officer.service_status === 'Active' ? 'bg-green-100 text-green-700' :
                    officer.service_status === 'Retired' ? 'bg-gray-100 text-gray-700' :
                    officer.service_status === 'Suspended' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {officer.service_status}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
        </div>
      )}
    </div>
  );
}



