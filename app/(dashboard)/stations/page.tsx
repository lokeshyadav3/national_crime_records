'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/UserContext';

interface Province {
  id: number;
  name: string;
  districtList: { id: number; name: string; }[];
}

export default function StationsPage() {
  const { user } = useUser();
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [allDistricts, setAllDistricts] = useState<string[]>([]);

  // Admin can add/edit stations
  const canModifyStations = user?.role === 'Admin';

  // Check if filters are applied to show list
  const shouldShowList = search.trim() !== '' || districtFilter !== '';

  useEffect(() => {
    // Load Nepal locations
    fetch('/nepal_location.json')
      .then(res => res.json())
      .then(data => {
        setProvinces(data.provinceList || []);
        // Extract all districts (use Set to ensure unique values)
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
    if (shouldShowList) {
      fetchStations();
    } else {
      setStations([]);
    }
  }, [search, districtFilter]);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (districtFilter) params.append('district', districtFilter);

      const response = await fetch(`/api/stations?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setStations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0c2340]">Police Stations</h1>
          <p className="text-slate-500 mt-1">
            {canModifyStations ? 'Manage police stations across jurisdictions' : 'View police stations across jurisdictions'}
          </p>
        </div>
        {canModifyStations && (
          <Link
            href="/stations/new"
            className="flex items-center gap-2 bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Station
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
              placeholder="Search by name, code, address, municipality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100"
            />
          </div>

          {/* District Filter */}
          <div className="relative w-full md:w-64">
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
              <option value="">All Districts</option>
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
        </div>

        {/* Active Filters */}
        {(search || districtFilter) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
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
                <button onClick={() => setDistrictFilter('')} className="hover:text-red-500">×</button>
              </span>
            )}
            <button
              onClick={() => { setSearch(''); setDistrictFilter(''); }}
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
                Use the <strong>search bar</strong> to find stations, or select a <strong>District</strong> filter to view the stations list.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stations Grid */}
      {shouldShowList && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="flex items-center justify-center gap-3 text-slate-500">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading stations...
              </div>
            </div>
          ) : stations.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-500">No stations found</div>
          ) : (
            stations.map((station) => (
              <Link
                key={station.id}
                href={`/stations/${station.id}`}
                className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
              >
                {/* Station Photo - Rectangular */}
                <div className="h-32 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] relative overflow-hidden">
                  {station.photo ? (
                    <img
                      src={station.photo}
                      alt={station.station_name}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-[#d4a853] text-[#0c2340] text-xs font-bold rounded-lg shadow">
                      {station.station_code}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#0c2340] group-hover:text-[#1e3a5f] transition-colors">
                    {station.station_name}
                  </h3>
                  <div className="space-y-2 mt-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <svg className="w-4 h-4 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{station.district}, {station.state}</span>
                    </div>
                    {station.incharge_name && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-4 h-4 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{station.incharge_name} <span className="text-slate-400">({station.incharge_rank})</span></span>
                      </div>
                    )}
                    {station.contact_number && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-4 h-4 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{station.contact_number}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[#0c2340] text-sm font-medium group-hover:text-[#1e3a5f] flex items-center gap-1">
                      View Details
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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





