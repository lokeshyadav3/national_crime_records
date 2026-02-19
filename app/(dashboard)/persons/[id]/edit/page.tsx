"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/lib/UserContext";

type LocationData = {
    provinceList: {
        id: number;
        name: string;
        districtList: {
            id: number;
            name: string;
            municipalityList: {
                id: number;
                name: string;
            }[];
        }[];
    }[];
};

type FormState = {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    national_id: string;
    gender: string;
    contact_number: string;
    address: string;
    city: string;
    state: string;
    date_of_birth: string;
    citizenship: string;
    photo: string;
    signature: string;
};

export default function EditPersonPage() {
    const router = useRouter();
    const params = useParams();
    const personId = params.id as string;
    const { user, loading: userLoading } = useUser();

    const [form, setForm] = useState<FormState>({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        national_id: "",
        gender: "",
        contact_number: "",
        address: "",
        city: "",
        state: "",
        date_of_birth: "",
        citizenship: "Nepali",
        photo: "",
        signature: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

    // Location data
    const [locationData, setLocationData] = useState<LocationData | null>(null);
    const [districts, setDistricts] = useState<{ id: number; name: string; municipalityList: any[] }[]>([]);
    const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([]);

    // Check role-based access
    const canEdit = user?.role === 'StationAdmin' || user?.role === 'Officer';

    // Load location data
    useEffect(() => {
        fetch("/nepal_location.json")
            .then((res) => res.json())
            .then((data) => setLocationData(data))
            .catch((err) => console.error("Failed to load location data:", err));
    }, []);

    // Load person data
    useEffect(() => {
        async function fetchPerson() {
            try {
                const res = await fetch(`/api/persons/${personId}`);
                const json = await res.json();
                if (json.success && json.data) {
                    const p = json.data;
                    setForm({
                        first_name: p.first_name || "",
                        middle_name: p.middle_name || "",
                        last_name: p.last_name || "",
                        email: p.email || "",
                        national_id: p.national_id || "",
                        gender: p.gender || "",
                        contact_number: p.contact_number || "",
                        address: p.address || "",
                        city: p.city || "",
                        state: p.state || "",
                        date_of_birth: p.date_of_birth ? p.date_of_birth.split("T")[0] : "",
                        citizenship: p.citizenship || "Nepali",
                        photo: p.photo || "",
                        signature: p.signature || "",
                    });
                    if (p.photo) setPhotoPreview(p.photo);
                    if (p.signature) setSignaturePreview(p.signature);
                } else {
                    setError("Person not found");
                }
            } catch {
                setError("Failed to load person data");
            } finally {
                setLoading(false);
            }
        }
        fetchPerson();
    }, [personId]);

    // Update districts when province changes
    useEffect(() => {
        if (locationData && form.state) {
            const province = locationData.provinceList.find((p) => p.name === form.state);
            setDistricts(province?.districtList || []);
        }
    }, [form.state, locationData]);

    // Update municipalities when district/city changes
    useEffect(() => {
        if (form.city && districts.length > 0) {
            // city may hold the district name from existing data
            const district = districts.find((d) => d.name === form.city);
            setMunicipalities(district?.municipalityList || []);
        }
    }, [form.city, districts]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("category", "persons");
            try {
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const json = await res.json();
                if (json.success) {
                    setForm((prev) => ({ ...prev, photo: json.data.url }));
                } else {
                    setError(json.message || "Photo upload failed");
                }
            } catch {
                setError("Photo upload failed");
            }
        }
    }

    function clearPhoto() {
        setPhotoPreview(null);
        setForm((prev) => ({ ...prev, photo: "" }));
    }

    async function handleSignatureChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSignaturePreview(reader.result as string);
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("category", "signatures");
            try {
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const json = await res.json();
                if (json.success) {
                    setForm((prev) => ({ ...prev, signature: json.data.url }));
                } else {
                    setError(json.message || "Signature upload failed");
                }
            } catch {
                setError("Signature upload failed");
            }
        }
    }

    function clearSignature() {
        setSignaturePreview(null);
        setForm((prev) => ({ ...prev, signature: "" }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!form.first_name || !form.last_name) {
            setError("First Name and Last Name are required.");
            return;
        }
        if (!form.gender) {
            setError("Gender is required.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/persons/${personId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const json = await res.json();
            if (!res.ok || !json?.success) {
                throw new Error(json?.message || "Failed to update person");
            }

            setSuccess("Person updated successfully.");
            setTimeout(() => router.push("/persons"), 1500);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    if (userLoading || loading) {
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

    if (!canEdit) {
        return (
            <div className="max-w-2xl mx-auto mt-12 text-center">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                    <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
                    <p className="text-red-600 mb-4">Only Station Admins and Officers can edit person records.</p>
                    <Link href="/persons" className="inline-flex items-center gap-2 text-[#0c2340] hover:underline font-medium">
                        ← Back to Persons
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <Link
                    href="/persons"
                    className="flex items-center gap-2 text-slate-500 hover:text-[#0c2340] transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>
                <h1 className="text-3xl font-bold text-[#0c2340]">Edit Person</h1>
            </div>

            {/* Error / Success */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name <span className="text-red-500">*</span></label>
                            <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 text-[#0c2340]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Middle Name</label>
                            <input type="text" name="middle_name" value={form.middle_name} onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 text-[#0c2340]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                            <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 text-[#0c2340]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender <span className="text-red-500">*</span></label>
                            <select name="gender" value={form.gender} onChange={handleChange} required
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 text-[#0c2340]">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                            <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 text-[#0c2340]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
                            <input type="text" name="citizenship" value={form.citizenship} onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 text-[#0c2340]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">National ID / Citizenship No.</label>
                            <input type="text" name="national_id" value={form.national_id} onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 text-[#0c2340]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 text-[#0c2340]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input type="text" name="contact_number" value={form.contact_number} onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 text-[#0c2340]" />
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Address Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Province / State</label>
                            <select name="state" value={form.state} onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 text-[#0c2340]">
                                <option value="">Select Province</option>
                                {locationData?.provinceList.map((p) => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                            <select name="city" value={form.city} onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 text-[#0c2340]">
                                <option value="">Select District</option>
                                {districts.map((d) => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                ))}
                                {/* Keep existing value if not in the list */}
                                {form.city && !districts.find((d) => d.name === form.city) && (
                                    <option value={form.city}>{form.city}</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                            <input type="text" name="address" value={form.address} onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 text-[#0c2340]"
                                placeholder="Street address, ward, etc." />
                        </div>
                    </div>
                </div>

                {/* Photo & Signature */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Photo & Signature
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Photo */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Photo</label>
                            {photoPreview ? (
                                <div className="relative w-32 h-40 rounded-xl overflow-hidden border border-slate-200">
                                    <img src={photoPreview} alt="Person photo" className="w-full h-full object-cover" />
                                    <button type="button" onClick={clearPhoto}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-32 h-40 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#0c2340] hover:bg-slate-50 transition-all">
                                    <svg className="w-8 h-8 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="text-xs text-slate-500">Upload Photo</span>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            )}
                        </div>

                        {/* Signature */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Signature</label>
                            {signaturePreview ? (
                                <div className="relative w-48 h-24 rounded-xl overflow-hidden border border-slate-200 bg-white">
                                    <img src={signaturePreview} alt="Signature" className="w-full h-full object-contain" />
                                    <button type="button" onClick={clearSignature}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-48 h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#0c2340] hover:bg-slate-50 transition-all">
                                    <svg className="w-6 h-6 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    <span className="text-xs text-slate-500">Upload Signature</span>
                                    <input type="file" accept="image/*" onChange={handleSignatureChange} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/persons"
                        className="px-6 py-2.5 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
