'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser } from '@/lib/UserContext';

interface CaseInfo {
    case_id: number;
    fir_no: string;
    crime_type: string;
    case_status: string;
    fir_date_time: string;
    role: string;
    station_name: string;
}

interface PersonData {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    date_of_birth: string | null;
    gender: string | null;
    citizenship: string | null;
    national_id: string | null;
    contact_number: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    photo: string | null;
    signature: string | null;
    created_at: string;
    cases: CaseInfo[];
}

export default function PersonViewPage() {
    const params = useParams();
    const { user, loading: userLoading } = useUser();
    const personId = params.id as string;

    const [person, setPerson] = useState<PersonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const canEdit = user?.role === 'StationAdmin' || user?.role === 'Officer';

    useEffect(() => {
        async function fetchPerson() {
            try {
                const res = await fetch(`/api/persons/${personId}`);
                if (!res.ok) throw new Error('Failed to load person');
                const data = await res.json();
                if (data.success) {
                    setPerson(data.data);
                } else {
                    throw new Error(data.message || 'Person not found');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (personId) fetchPerson();
    }, [personId]);

    if (userLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-3 text-slate-500">
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading person details...
                </div>
            </div>
        );
    }

    if (error || !person) {
        return (
            <div className="p-8 text-center text-red-700 bg-red-50 rounded-3xl border border-red-200">
                <svg className="w-12 h-12 mx-auto mb-3 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="font-medium text-lg">{error || 'Person not found'}</p>
                <Link href="/persons" className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 mt-4 text-sm font-medium">
                    ← Back to Persons
                </Link>
            </div>
        );
    }

    const fullName = [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ');
    const initials = `${person.first_name.charAt(0)}${person.last_name.charAt(0)}`;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Registered': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Under Investigation': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Charge Sheet Filed': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Closed': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'Complainant': return 'bg-blue-500/20 text-blue-700 border-blue-300';
            case 'Accused': return 'bg-red-500/20 text-red-700 border-red-300';
            case 'Suspect': return 'bg-orange-500/20 text-orange-700 border-orange-300';
            case 'Witness': return 'bg-purple-500/20 text-purple-700 border-purple-300';
            case 'Victim': return 'bg-pink-500/20 text-pink-700 border-pink-300';
            default: return 'bg-slate-100 text-slate-700 border-slate-300';
        }
    };

    return (
        <>
            {/* Breadcrumb Back */}
            <div className="mb-6 flex justify-between items-center">
                <Link href="/persons" className="text-[#0c2340] hover:text-[#1e3a5f] flex items-center gap-2 text-sm transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Persons
                </Link>
            </div>

            {/* Hero Header Card */}
            <div className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] p-8 rounded-3xl shadow-2xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 p-32 bg-[#d4a853]/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    {/* Avatar / Photo */}
                    <div className="flex-shrink-0">
                        {person.photo ? (
                            <img
                                src={person.photo}
                                alt={fullName}
                                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
                            />
                        ) : (
                            <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-[#d4a853] to-[#c49843] rounded-2xl flex items-center justify-center text-[#0c2340] text-3xl md:text-4xl font-bold border-4 border-white/20 shadow-xl">
                                {initials}
                            </div>
                        )}
                    </div>

                    {/* Name & Quick Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${person.gender === 'Male' ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' :
                                    person.gender === 'Female' ? 'bg-pink-500/20 text-pink-200 border-pink-400/30' :
                                        'bg-purple-500/20 text-purple-200 border-purple-400/30'
                                }`}>
                                {person.gender || 'N/A'}
                            </span>
                            {person.national_id && (
                                <span className="px-3 py-1 bg-[#d4a853]/20 text-[#d4a853] rounded-lg text-xs font-bold uppercase tracking-wider border border-[#d4a853]/30">
                                    ID: {person.national_id}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{fullName}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm">
                            {person.contact_number && (
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {person.contact_number}
                                </span>
                            )}
                            {person.email && (
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {person.email}
                                </span>
                            )}
                            {(person.city || person.state) && (
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {[person.city, person.state].filter(Boolean).join(', ')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-3">
                        {canEdit && (
                            <Link
                                href={`/persons/${person.id}/edit`}
                                id="edit-person-btn"
                                className="px-5 py-2.5 bg-[#d4a853] hover:bg-[#c49843] text-[#0c2340] rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg hover:scale-[1.02]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Person
                            </Link>
                        )}
                        <span className="text-xs text-slate-400">
                            Registered: {new Date(person.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Personal Information */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
                        <h3 className="text-lg font-semibold text-[#0c2340] mb-5 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                            <InfoField label="First Name" value={person.first_name} />
                            <InfoField label="Middle Name" value={person.middle_name} />
                            <InfoField label="Last Name" value={person.last_name} />
                            <InfoField label="Gender" value={person.gender} />
                            <InfoField label="Date of Birth" value={person.date_of_birth ? new Date(person.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} />
                            <InfoField label="Nationality" value={person.citizenship} />
                            <InfoField label="National ID / Citizenship No." value={person.national_id} />
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
                        <h3 className="text-lg font-semibold text-[#0c2340] mb-5 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Contact & Address
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                            <InfoField label="Phone" value={person.contact_number} />
                            <InfoField label="Email" value={person.email} />
                            <InfoField label="Province / State" value={person.state} />
                            <InfoField label="District / City" value={person.city} />
                            <div className="sm:col-span-2">
                                <InfoField label="Address" value={person.address} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Photo & Signature */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
                        <h3 className="text-lg font-semibold text-[#0c2340] mb-5 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Photo & Signature
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Photo</label>
                                {person.photo ? (
                                    <img
                                        src={person.photo}
                                        alt={fullName}
                                        className="w-32 h-40 rounded-xl object-cover border border-slate-200 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-32 h-40 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-xs">No photo</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Signature</label>
                                {person.signature ? (
                                    <img
                                        src={person.signature}
                                        alt="Signature"
                                        className="w-48 h-24 rounded-xl object-contain border border-slate-200 bg-white shadow-sm p-2"
                                    />
                                ) : (
                                    <div className="w-48 h-24 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                                        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        <span className="text-xs">No signature</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg">
                        <h3 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Quick Stats
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm text-slate-600">Total Cases</span>
                                <span className="text-lg font-bold text-[#0c2340]">{person.cases?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm text-slate-600">Active Cases</span>
                                <span className="text-lg font-bold text-amber-600">
                                    {person.cases?.filter(c => c.case_status !== 'Closed').length || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm text-slate-600">Closed Cases</span>
                                <span className="text-lg font-bold text-green-600">
                                    {person.cases?.filter(c => c.case_status === 'Closed').length || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Associated Cases Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-[#0c2340] flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Associated Cases
                        {person.cases && person.cases.length > 0 && (
                            <span className="ml-2 px-2.5 py-0.5 bg-[#0c2340]/10 text-[#0c2340] rounded-full text-xs font-bold">
                                {person.cases.length}
                            </span>
                        )}
                    </h3>
                </div>

                {!person.cases || person.cases.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-slate-500 font-medium">No associated cases</p>
                        <p className="text-slate-400 text-sm mt-1">This person is not linked to any cases yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">FIR No.</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Crime Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Station</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {person.cases.map((c) => (
                                    <tr key={`${c.case_id}-${c.role}`} className="hover:bg-slate-50 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/cases/${c.case_id}`}
                                                className="text-sm font-bold text-[#0c2340] hover:text-[#1e3a5f] transition-colors"
                                            >
                                                {c.fir_no}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {c.crime_type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(c.role)}`}>
                                                {c.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 w-fit ${getStatusColor(c.case_status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                {c.case_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {c.station_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(c.fir_date_time).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/cases/${c.case_id}`}
                                                className="text-[#0c2340] hover:text-[#1e3a5f] transition-colors flex items-center gap-1 text-sm font-medium"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

/* Reusable Info Field Component */
function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <label className="text-xs text-slate-500 uppercase font-bold tracking-wide">{label}</label>
            <p className="text-[#1e3a5f] mt-1 font-medium">
                {value || <span className="text-slate-300 font-normal italic">Not provided</span>}
            </p>
        </div>
    );
}
