"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function NewEvidencePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const preselectedCaseId = searchParams.get('caseId');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [mediaPreview, setMediaPreview] = useState<{ url: string; type: string; name: string } | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Data for selects
    const [cases, setCases] = useState<any[]>([]);
    const [officers, setOfficers] = useState<any[]>([]);

    const [form, setForm] = useState({
        case_id: preselectedCaseId || "",
        evidence_type: "Physical",
        description: "",
        collection_date: "",
        collection_location: "",
        collected_by: "",
        file_path: "",
    });

    useEffect(() => {
        // Fetch cases for the dropdown
        fetch("/api/cases")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setCases(data.data);
                }
            })
            .catch((err) => console.error(err));

        // Fetch officers for collected_by dropdown
        fetch("/api/officers")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setOfficers(data.data);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    // Set case_id from URL param when cases load
    useEffect(() => {
        if (preselectedCaseId && form.case_id !== preselectedCaseId) {
            setForm(prev => ({ ...prev, case_id: preselectedCaseId }));
        }
    }, [preselectedCaseId]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const fileType = file.type.split('/')[0]; // 'image', 'video', 'audio'
            setMediaPreview({ url, type: fileType, name: file.name });
            setSelectedFile(file);
            // file_path will be set after actual upload in handleSubmit
        }
    };

    const clearFile = () => {
        if (mediaPreview?.url) {
            URL.revokeObjectURL(mediaPreview.url);
        }
        setMediaPreview(null);
        setSelectedFile(null);
        setForm((prev) => ({ ...prev, file_path: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        if (!form.case_id) {
            setError("Please select a valid Case / FIR Number.");
            setLoading(false);
            return;
        }

        if (!form.description) {
            setError("Description is required.");
            setLoading(false);
            return;
        }

        if (!form.collection_date) {
            setError("Collection date is required.");
            setLoading(false);
            return;
        }

        try {
            // If there's a file selected, upload it first
            let uploadedFilePath = form.file_path;
            if (selectedFile) {
                const uploadForm = new FormData();
                uploadForm.append('file', selectedFile);
                uploadForm.append('category', 'evidence');
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadForm });
                const uploadData = await uploadRes.json();
                if (!uploadData.success) {
                    throw new Error(uploadData.message || 'Failed to upload file');
                }
                uploadedFilePath = uploadData.data.url;
            }

            const res = await fetch("/api/evidence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, file_path: uploadedFilePath }),
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to add evidence");
            }

            const newEvidenceId = data.data?.id || data.data?.evidence_id;

            // If we came from case creation wizard, redirect back
            if (returnTo) {
                router.push(`${returnTo}?addedEvidenceId=${newEvidenceId}`);
                return;
            }

            setSuccess("Evidence logged successfully!");
            setForm({
                case_id: preselectedCaseId || "",
                evidence_type: "Physical",
                description: "",
                collection_date: "",
                collection_location: "",
                collected_by: "",
                file_path: "",
            });
            clearFile();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputBase =
        "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100";

    const selectBase =
        "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";

    // Render media preview based on file type
    const renderMediaPreview = () => {
        if (!mediaPreview) {
            return (
                <div className="w-32 h-32 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            );
        }

        return (
            <div className="relative">
                {mediaPreview.type === 'image' && (
                    <img src={mediaPreview.url} alt="Preview" className="w-32 h-32 object-cover rounded-2xl border-2 border-slate-200" />
                )}
                {mediaPreview.type === 'video' && (
                    <video src={mediaPreview.url} className="w-32 h-32 object-cover rounded-2xl border-2 border-slate-200" />
                )}
                {mediaPreview.type === 'audio' && (
                    <div className="w-32 h-32 bg-purple-50 border-2 border-purple-200 rounded-2xl flex flex-col items-center justify-center">
                        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <span className="text-xs text-purple-600 mt-1 truncate max-w-[90%]">Audio</span>
                    </div>
                )}
                {!['image', 'video', 'audio'].includes(mediaPreview.type) && (
                    <div className="w-32 h-32 bg-blue-50 border-2 border-blue-200 rounded-2xl flex flex-col items-center justify-center">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs text-blue-600 mt-1">File</span>
                    </div>
                )}
                <button
                    type="button"
                    onClick={clearFile}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-[#0c2340] shadow-lg transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#0c2340]">Log Evidence</h1>
                    <p className="text-slate-500 mt-1">
                        {returnTo ? 'Add evidence for the new case' : 'Record new evidence for an existing case'}
                    </p>
                </div>
                <Link
                    href={returnTo || "/cases"}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[#0c2340] font-medium transition-all duration-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {returnTo ? 'Back to Case' : 'Back to Cases'}
                </Link>
            </div>

            {/* Form Card */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 mb-6">
                        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 mb-6">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Case & Evidence Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Case & Evidence Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 mb-2">Case / FIR Number <span className="text-red-500">*</span></span>
                                <select
                                    name="case_id"
                                    value={form.case_id}
                                    onChange={handleChange}
                                    className={selectBase}
                                    required
                                    disabled={!!preselectedCaseId}
                                >
                                    <option value="" className="text-slate-500">Select Case</option>
                                    {cases.map((c) => (
                                        <option key={c.case_id || c.id} value={c.case_id || c.id} className="text-[#1e3a5f]">
                                            {c.fir_no || c.fir_number} - {c.crime_type}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 mb-2">Evidence Type <span className="text-red-500">*</span></span>
                                <select
                                    name="evidence_type"
                                    value={form.evidence_type}
                                    onChange={handleChange}
                                    className={selectBase}
                                >
                                    <option value="Physical" className="text-[#1e3a5f]">Physical Object</option>
                                    <option value="Digital" className="text-[#1e3a5f]">Digital / Electronic</option>
                                    <option value="Document" className="text-[#1e3a5f]">Document</option>
                                    <option value="Forensic" className="text-[#1e3a5f]">Forensic Sample</option>
                                    <option value="Photo" className="text-[#1e3a5f]">Photograph</option>
                                    <option value="Video" className="text-[#1e3a5f]">Video Recording</option>
                                    <option value="Audio" className="text-[#1e3a5f]">Audio Recording</option>
                                    <option value="Other" className="text-[#1e3a5f]">Other</option>
                                </select>
                            </label>

                            <label className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 mb-2">Collection Date & Time <span className="text-red-500">*</span></span>
                                <input
                                    type="datetime-local"
                                    name="collection_date"
                                    value={form.collection_date}
                                    onChange={handleChange}
                                    className={inputBase}
                                    required
                                />
                            </label>

                            <label className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700 mb-2">Collected By (Officer)</span>
                                <select
                                    name="collected_by"
                                    value={form.collected_by}
                                    onChange={handleChange}
                                    className={selectBase}
                                >
                                    <option value="" className="text-slate-500">Select Officer (Optional)</option>
                                    {officers.map((o) => (
                                        <option key={o.id} value={o.id} className="text-[#1e3a5f]">
                                            {o.first_name} {o.last_name} ({o.rank})
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col sm:col-span-2">
                                <span className="text-sm font-medium text-slate-700 mb-2">Collection Location</span>
                                <input
                                    type="text"
                                    name="collection_location"
                                    value={form.collection_location}
                                    onChange={handleChange}
                                    className={inputBase}
                                    placeholder="Where was the evidence found/collected?"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            Description
                        </h2>
                        <label className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700 mb-2">Evidence Description <span className="text-red-500">*</span></span>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className={inputBase + " h-32 resize-none"}
                                placeholder="Describe the evidence in detail..."
                                required
                            />
                        </label>
                    </div>

                    {/* Media Upload */}
                    <div>
                        <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Media Attachment (Optional)
                        </h2>
                        <div className="flex items-start gap-6">
                            <div className="flex-shrink-0">
                                {renderMediaPreview()}
                            </div>
                            <div className="flex-1">
                                <label className="flex flex-col">
                                    <input
                                        type="file"
                                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="evidence-upload"
                                    />
                                    <label
                                        htmlFor="evidence-upload"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-[#0c2340] cursor-pointer transition-all duration-300"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        {mediaPreview ? "Change File" : "Upload Media"}
                                    </label>
                                    <p className="text-xs text-slate-400 mt-2">
                                        📷 Photos • 🎥 Videos • 🎵 Audio • 📄 Documents (Max 50MB)
                                    </p>
                                    {mediaPreview && (
                                        <p className="text-xs text-green-600 mt-1 truncate">
                                            ✓ {mediaPreview.name}
                                        </p>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-lg hover:scale-[1.01]"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging Evidence...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    {returnTo ? 'Add Evidence & Return' : 'Log Evidence'}
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}








