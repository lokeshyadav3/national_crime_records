'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SessionUser } from '@/lib/types';

// Dynamic import for the chart component (no SSR)
const CrimeTypePieChart = dynamic(
    () => import('./CrimeTypePieChart'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[400px] flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading chart...
                </div>
            </div>
        )
    }
);

// Dynamic import for the map component (no SSR)
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

export default function AdminDashboard({ user, stats }: DashboardProps) {
    const [mapStatusFilter, setMapStatusFilter] = useState('all');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] p-6 rounded-3xl shadow-lg">
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-300 mt-2">Manage Police Stations & Officers</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Police Stations</div>
                            <div className="text-3xl font-bold text-[#0c2340] mt-1">{stats?.totalStations || 0}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Total Officers</div>
                            <div className="text-3xl font-bold text-[#0c2340] mt-1">{stats?.totalOfficers || 0}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">Total Cases</div>
                            <div className="text-3xl font-bold text-[#0c2340] mt-1">{stats?.totalCases || 0}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-slate-500">System Users</div>
                            <div className="text-3xl font-bold text-[#0c2340] mt-1">{stats?.totalUsers || 0}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Quick Actions */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6">
                <h2 className="text-lg font-semibold text-[#0c2340] mb-4">Administration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/stations" className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] p-4 rounded-xl flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg">
                        <div className="p-2 bg-white/10 rounded-lg text-[#d4a853]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-bold text-white">Manage Stations</div>
                            <div className="text-xs text-slate-300">Add/Edit Police Stations</div>
                        </div>
                    </Link>

                    <Link href="/officers" className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] p-4 rounded-xl flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg">
                        <div className="p-2 bg-white/10 rounded-lg text-[#d4a853]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-bold text-white">Manage Officers</div>
                            <div className="text-xs text-slate-300">Add/Edit Police Officers</div>
                        </div>
                    </Link>

                    <Link href="/persons" className="bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center gap-3 transition-colors">
                        <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-semibold text-[#0c2340]">View Persons</div>
                            <div className="text-xs text-slate-500">Browse All Records (View Only)</div>
                        </div>
                    </Link>

                    <Link href="/users" className="bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200 flex items-center gap-3 transition-colors">
                        <div className="p-2 bg-[#0c2340]/10 rounded-lg text-[#0c2340]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-semibold text-[#0c2340]">Manage Users</div>
                            <div className="text-xs text-slate-500">Create & Assign Roles</div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Cases by Crime Type - Pie Chart */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6">
                <h2 className="text-lg font-semibold text-[#0c2340] mb-4">Cases by Crime Type</h2>
                <div className="mb-2 text-xs text-slate-400">
                    {stats?.casesByCrimeType ? `${stats.casesByCrimeType.length} crime types found` : 'Loading...'}
                </div>
                {stats?.casesByCrimeType && stats.casesByCrimeType.length > 0 ? (
                    <div className="h-[400px]">
                        <CrimeTypePieChart data={stats.casesByCrimeType} />
                    </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <svg className="w-16 h-16 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p>No case data available</p>
                            <p className="text-xs mt-2">Add some cases to see the crime type distribution</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Nepal District Map - Cases Visualization */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[#0c2340]">Cases by District</h2>
                        <p className="text-sm text-slate-500 mt-1">Geographic distribution of cases across Nepal</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">Filter by Status:</span>
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
