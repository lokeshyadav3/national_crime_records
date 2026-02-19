"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function NewUserPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [createdUser, setCreatedUser] = useState<any>(null);

    // Data for select dropdowns
    const [stations, setStations] = useState<any[]>([]);
    const [officers, setOfficers] = useState<any[]>([]);

    const [form, setForm] = useState({
        role: "Officer",
        station_id: "",
        officer_id: "",
    });

    const roles = [
        { value: "Admin", label: "Admin", description: "Full system access. No station required." },
        { value: "StationAdmin", label: "Station Admin", description: "Manages their station's officers & data. Max 2 per station." },
        { value: "Officer", label: "Officer", description: "Can manage cases & evidence." },
    ];

    // Fetch Stations
    useEffect(() => {
        fetch("/api/stations")
            .then(res => res.json())
            .then(data => {
                if (data.success) setStations(data.data);
            })
            .catch(err => console.error(err));
    }, []);

    // Fetch officers when station is selected
    const fetchOfficers = async (stationId: string) => {
        if (!stationId) {
            setOfficers([]);
            return;
        }
        try {
            const res = await fetch(`/api/officers?station_id=${stationId}`);
            const data = await res.json();
            if (data.success) setOfficers(data.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (form.station_id) {
            fetchOfficers(form.station_id);
            // Reset officer selection when station changes
            setForm(prev => ({ ...prev, officer_id: '' }));
        } else {
            setOfficers([]);
        }
    }, [form.station_id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setCreatedUser(null);

        // Validation
        if (!form.officer_id) {
            setError("Please select an officer to link with this user account.");
            return;
        }

        if (!form.role) {
            setError("Please select a role for the user.");
            return;
        }

        if (form.role !== 'Admin' && !form.station_id) {
            setError("Please select a station for non-Admin roles.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: form.role,
                    station_id: form.station_id || null,
                    officer_id: form.officer_id
                })
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to create user");
            }

            setSuccess(data.message);
            setCreatedUser(data.data);

            // Reset form
            setForm({
                role: "Officer",
                station_id: "",
                officer_id: "",
            });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputBase = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100";
    const selectBase = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#0c2340]">Create New User</h1>
                    <p className="text-slate-500 mt-1">Link an officer to create a user account with auto-generated credentials</p>
                </div>
                <Link href="/users" className="px-4 py-2 bg-white hover:bg-slate-100 rounded-xl text-[#0c2340] transition-all border border-slate-200">
                    Back to Users
                </Link>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex gap-3">
                    <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">How it works:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>Select an officer to link with this user account</li>
                            <li>Username and password will be <strong>auto-generated</strong> based on officer details</li>
                            <li>Credentials will be sent to the officer's registered email automatically</li>
                            <li>Each officer can only have <strong>one user account</strong></li>
                            <li>Each station can have maximum <strong>2 Station Admins</strong></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-200 flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 border border-green-200">
                        <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{success}</span>
                        </div>

                        {/* Show generated credentials if available */}
                        {createdUser && (
                            <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                                <p className="font-semibold text-green-800 mb-2">Generated Credentials:</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex gap-2">
                                        <span className="font-medium text-slate-600 w-24">Username:</span>
                                        <code className="bg-green-100 px-2 py-0.5 rounded">{createdUser.username}</code>
                                    </div>
                                    {createdUser.password && (
                                        <div className="flex gap-2">
                                            <span className="font-medium text-slate-600 w-24">Password:</span>
                                            <code className="bg-green-100 px-2 py-0.5 rounded">{createdUser.password}</code>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <span className="font-medium text-slate-600 w-24">Email Sent:</span>
                                        <span className={createdUser.emailSent ? 'text-green-600' : 'text-amber-600'}>
                                            {createdUser.emailSent ? `Yes (to ${createdUser.email})` : 'No - Please share credentials manually'}
                                        </span>
                                    </div>
                                </div>
                                {!createdUser.emailSent && createdUser.password && (
                                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs">
                                        <strong>Note:</strong> Email could not be sent. Please copy and share the credentials securely with the officer.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={() => { setSuccess(null); setCreatedUser(null); }}
                                className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm"
                            >
                                Create Another User
                            </button>
                            <Link
                                href="/users"
                                className="px-4 py-2 bg-white border border-green-200 hover:bg-green-50 text-green-700 rounded-lg transition-colors text-sm"
                            >
                                Back to Users List
                            </Link>
                        </div>
                    </div>
                )}

                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Station & Officer Selection */}
                        <div>
                            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Select Officer
                            </h2>
                            <p className="text-sm text-slate-500 mb-4">
                                First select a station, then choose an officer to create their user account.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-slate-700 text-sm font-medium mb-2">Station *</label>
                                    <select
                                        name="station_id"
                                        value={form.station_id}
                                        onChange={handleChange}
                                        className={selectBase}
                                        required={form.role !== 'Admin'}
                                    >
                                        <option value="" className="text-slate-500">Select Station</option>
                                        {stations.map(s => (
                                            <option key={s.id} value={s.id} className="text-[#1e3a5f]">
                                                {s.station_name} ({s.station_code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 text-sm font-medium mb-2">Officer *</label>
                                    <select
                                        name="officer_id"
                                        value={form.officer_id}
                                        onChange={handleChange}
                                        className={`${selectBase} ${!form.station_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!form.station_id}
                                        required
                                    >
                                        <option value="" className="text-slate-500">
                                            {!form.station_id ? 'Select station first' : 'Select Officer'}
                                        </option>
                                        {officers.map(o => (
                                            <option key={o.id} value={o.id} className="text-[#1e3a5f]">
                                                {o.first_name} {o.last_name} - {o.badge_number} {o.email ? `(${o.email})` : '(No email)'}
                                            </option>
                                        ))}
                                    </select>
                                    {form.station_id && officers.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-2">
                                            No officers found in this station. Please add officers first.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                User Role
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {roles.map(role => (
                                    <label
                                        key={role.value}
                                        className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            form.role === role.value
                                                ? 'border-[#0c2340] bg-[#0c2340]/5'
                                                : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role.value}
                                            checked={form.role === role.value}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <span className="font-semibold text-[#0c2340]">{role.label}</span>
                                        <span className="text-xs text-slate-500 mt-1">{role.description}</span>
                                        {form.role === role.value && (
                                            <div className="absolute top-2 right-2">
                                                <svg className="w-5 h-5 text-[#0c2340]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-slate-200 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !form.officer_id}
                                className="bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating User & Sending Credentials...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create User & Send Credentials
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
