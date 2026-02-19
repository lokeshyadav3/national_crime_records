'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/UserContext';

interface PersonData {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  national_id: string | null;
  gender: string | null;
  contact_number: string | null;
  city: string | null;
  state: string | null;
  email: string | null;
  photo: string | null;
  created_at: string;
}

export default function PersonsPage() {
  const { user, loading: userLoading } = useUser();
  const [persons, setPersons] = useState<PersonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const canEdit = user?.role === 'StationAdmin' || user?.role === 'Officer';
  const canAdd = user?.role === 'StationAdmin' || user?.role === 'Officer';

  // Cascading search — auto-fetch as user types with debounce
  useEffect(() => {
    if (!search.trim()) {
      setPersons([]);
      setTotalCount(0);
      setHasSearched(false);
      return;
    }

    const debounce = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('search', search.trim());

        const response = await fetch(`/api/persons?${params.toString()}`);
        const data = await response.json();
        if (data.success) {
          setPersons(data.data || []);
          setTotalCount(data.data?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch persons:', error);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    }, 400);

    return () => clearTimeout(debounce);
  }, [search]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0c2340]">Persons</h1>
          <p className="text-slate-500 mt-1">
            {user?.role === 'Admin'
              ? 'View all persons across all stations'
              : 'Manage persons in the system'}
          </p>
        </div>
        {canAdd && (
          <Link
            href="/persons/new"
            id="add-person-btn"
            className="flex items-center gap-2 bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add New Person
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="person-search"
              placeholder="Start typing to search by name, national ID, contact, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[#0c2340] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-50"
            />
          </div>

          {/* Clear */}
          {search && (
            <button
              onClick={() => setSearch('')}
              className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-medium transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Results Count */}
        {hasSearched && !loading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {`${totalCount} person${totalCount !== 1 ? 's' : ''} found`}
          </div>
        )}

        {/* Loading indicator inline */}
        {loading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Searching...
          </div>
        )}
      </div>

      {/* Admin Info Banner */}
      {user?.role === 'Admin' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">View-Only Access</p>
            <p className="text-xs text-amber-600 mt-0.5">As an Admin, you can view all persons but cannot add or edit person records. Only Station Admins and Officers can manage person data.</p>
          </div>
        </div>
      )}

      {/* Initial State - No Search Yet */}
      {!hasSearched && !loading && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-12 text-center">
          <svg className="w-20 h-20 mx-auto mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-slate-500 font-medium text-lg">Search for persons</p>
          <p className="text-slate-400 text-sm mt-1">Start typing a name, national ID, contact number, or city to see results</p>
        </div>
      )}

      {/* Results */}
      {hasSearched && !loading && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          {persons.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-slate-500 font-medium">No persons found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Person
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      National ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {persons.map((person) => (
                    <tr key={person.id} className="hover:bg-slate-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/persons/${person.id}`}
                          className="text-sm font-medium text-[#0c2340] hover:text-[#1e3a5f] transition-colors flex items-center gap-3"
                        >
                          {person.photo ? (
                            <img src={person.photo} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                          ) : (
                            <div className="w-9 h-9 bg-gradient-to-br from-[#0c2340] to-[#1e3a5f] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              {person.first_name.charAt(0)}{person.last_name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{person.first_name} {person.middle_name || ''} {person.last_name}</p>
                            <p className="text-xs text-slate-400">{person.email || ''}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${person.gender === 'Male' ? 'bg-blue-500/20 text-[#1e3a5f] border border-blue-400/30' :
                          person.gender === 'Female' ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                            'bg-purple-100 text-purple-700 border border-purple-200'
                          }`}>
                          {person.gender || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {person.national_id || (
                          <span className="text-slate-300">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {person.contact_number || (
                          <span className="text-slate-300">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {person.city || person.state ? (
                          <span>{person.city}{person.city && person.state ? ', ' : ''}{person.state}</span>
                        ) : (
                          <span className="text-slate-300">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/persons/${person.id}`}
                            className="text-[#0c2340] hover:text-[#1e3a5f] transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                          {canEdit && (
                            <Link
                              href={`/persons/${person.id}/edit`}
                              className="text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
