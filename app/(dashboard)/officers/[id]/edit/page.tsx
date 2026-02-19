"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";


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
  rank: string;
  badge_number: string;
  station_id: string;
  department: string;
  contact_number: string;
  email: string;
  gender: string;
  date_of_joining: string;
  service_status: string;
  state_province: string;
  district: string;
  municipality: string;
  ward_no: string;
  address_line: string;
  photo: string;
};

export default function EditOfficerPage() {
  const params = useParams();
  const router = useRouter();
  const officerId = params.id;

  const [form, setForm] = useState<FormState>({
    first_name: "",
    middle_name: "",
    last_name: "",
    rank: "",
    badge_number: "",
    station_id: "",
    department: "",
    contact_number: "",
    email: "",
    gender: "",
    date_of_joining: "",
    service_status: "Active",
    state_province: "",
    district: "",
    municipality: "",
    ward_no: "",
    address_line: "",
    photo: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [officerName, setOfficerName] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Stations data
  const [stations, setStations] = useState<Array<{ id: number; station_name: string; station_code: string }>>([]);

  // Location data for permanent address
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [districts, setDistricts] = useState<{ id: number; name: string; municipalityList: any[] }[]>([]);
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([]);

  // Rank options
  const ranks = [
    "Constable",
    "Head Constable",
    "Assistant Sub-Inspector",
    "Sub-Inspector",
    "Inspector",
    "Deputy Superintendent",
    "Superintendent",
    "Senior Superintendent",
    "Deputy Inspector General",
    "Inspector General",
  ];

  // Load stations
  useEffect(() => {
    fetch("/api/stations")
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data) {
          setStations(json.data);
        }
      })
      .catch((err) => console.error("Failed to load stations:", err));
  }, []);

  // Load location data for permanent address
  useEffect(() => {
    fetch("/nepal_location.json")
      .then((res) => res.json())
      .then((data) => setLocationData(data))
      .catch((err) => console.error("Failed to load location data:", err));
  }, []);

  // Fuzzy match location names (handles case + "PROVINCE" suffix differences)
  function fuzzyMatchName(dbName: string, jsonName: string): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/\s*province\s*/gi, '').trim();
    return normalize(dbName) === normalize(jsonName);
  }

  // Update districts when province/locationData changes
  useEffect(() => {
    if (locationData && form.state_province) {
      const province = locationData.provinceList.find((p) => fuzzyMatchName(form.state_province, p.name));
      if (province) {
        setDistricts(province.districtList || []);
        if (form.state_province !== province.name) {
          setForm((prev) => ({ ...prev, state_province: province.name }));
        }
      }
    }
  }, [form.state_province, locationData]);

  // Update municipalities when district changes
  useEffect(() => {
    if (form.district && districts.length > 0) {
      const district = districts.find((d) => fuzzyMatchName(form.district, d.name));
      if (district) {
        setMunicipalities(district.municipalityList || []);
        if (form.district !== district.name) {
          setForm((prev) => ({ ...prev, district: district.name }));
        }
      }
    }
  }, [form.district, districts]);

  // Load officer data
  useEffect(() => {
    if (officerId) {
      fetchOfficer();
    }
  }, [officerId]);

  async function fetchOfficer() {
    try {
      const res = await fetch(`/api/officers/${officerId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const officer = json.data;
        setOfficerName(`${officer.rank || ''} ${officer.first_name} ${officer.last_name}`.trim());
        setSignature(officer.signature || null);
        if (officer.signature) setSignaturePreview(officer.signature);
        const photoData = officer.photo || "";
        if (photoData) setPhotoPreview(photoData);
        setForm({
          first_name: officer.first_name || "",
          middle_name: officer.middle_name || "",
          last_name: officer.last_name || "",
          rank: officer.rank || "",
          badge_number: officer.badge_number || "",
          station_id: officer.station_id?.toString() || "",
          department: officer.department || "",
          contact_number: officer.contact_number || "",
          email: officer.email || "",
          gender: officer.gender || "",
          date_of_joining: officer.date_of_joining ? officer.date_of_joining.split('T')[0] : "",
          service_status: officer.service_status || "Active",
          state_province: officer.state_province || "",
          district: officer.district || "",
          municipality: officer.municipality || "",
          ward_no: officer.ward_no?.toString() || "",
          address_line: officer.address_line || "",
          photo: photoData,
        });
      } else {
        setError("Officer not found");
      }
    } catch (err) {
      setError("Failed to load officer data");
    } finally {
      setLoading(false);
    }
  }

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
      formData.append('file', file);
      formData.append('category', 'officers');
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const json = await res.json();
        if (json.success) {
          setForm((prev) => ({ ...prev, photo: json.data.url }));
        } else {
          setError(json.message || 'Photo upload failed');
        }
      } catch {
        setError('Photo upload failed');
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
      formData.append('file', file);
      formData.append('category', 'signatures');
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const json = await res.json();
        if (json.success) {
          setSignature(json.data.url);
        } else {
          setError(json.message || 'Signature upload failed');
        }
      } catch {
        setError('Signature upload failed');
      }
    }
  }

  function clearSignature() {
    setSignaturePreview(null);
    setSignature(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.first_name || !form.last_name) {
      setError("First Name and Last Name are required.");
      return;
    }
    if (!form.rank) {
      setError("Rank is required.");
      return;
    }
    if (!form.station_id) {
      setError("Station assignment is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/officers/${officerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, signature }),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to update officer');
      }

      setSuccess('Officer updated successfully.');
      setTimeout(() => {
        router.push(`/officers/${officerId}`);
      }, 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update officer.";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  const inputBase =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#1e3a5f] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100";

  const selectBase =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%230c2340%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0c2340] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500">Loading officer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0c2340]">Edit Officer</h1>
          <p className="text-slate-500 mt-1">Update details for {officerName}</p>
        </div>
        <Link
          href={`/officers/${officerId}`}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] font-medium transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Officer
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
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">First Name <span className="text-red-500">*</span></span>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className={inputBase}
                  required
                  placeholder="First name"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Middle Name</span>
                <input
                  name="middle_name"
                  value={form.middle_name}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Middle name (optional)"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Last Name <span className="text-red-500">*</span></span>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className={inputBase}
                  required
                  placeholder="Last name"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Phone</span>
                <input
                  name="contact_number"
                  value={form.contact_number}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Enter phone number"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Enter email address"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Gender</span>
                <select name="gender" value={form.gender} onChange={handleChange} className={selectBase}>
                  <option value="" className="text-slate-500">Select Gender</option>
                  <option value="Male" className="text-[#1e3a5f]">Male</option>
                  <option value="Female" className="text-[#1e3a5f]">Female</option>
                  <option value="Other" className="text-[#1e3a5f]">Other</option>
                </select>
              </label>
            </div>
          </div>

          {/* Service Information */}
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Service Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Badge Number</span>
                <input
                  name="badge_number"
                  value={form.badge_number}
                  className={inputBase + " bg-slate-100 cursor-not-allowed"}
                  disabled
                  placeholder="Badge number"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Rank <span className="text-red-500">*</span></span>
                <select name="rank" value={form.rank} onChange={handleChange} className={selectBase} required>
                  <option value="" className="text-slate-500">Select Rank</option>
                  {ranks.map((rank) => (
                    <option key={rank} value={rank} className="text-[#1e3a5f]">
                      {rank}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Department/Unit</span>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="e.g., Crime Investigation"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Join Date</span>
                <input
                  type="date"
                  name="date_of_joining"
                  value={form.date_of_joining}
                  onChange={handleChange}
                  className={inputBase}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Service Status</span>
                <select name="service_status" value={form.service_status} onChange={handleChange} className={selectBase}>
                  <option value="Active" className="text-[#1e3a5f]">Active</option>
                  <option value="Inactive" className="text-[#1e3a5f]">Inactive</option>
                  <option value="Suspended" className="text-[#1e3a5f]">Suspended</option>
                  <option value="Retired" className="text-[#1e3a5f]">Retired</option>
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Assigned Station <span className="text-red-500">*</span></span>
                <select name="station_id" value={form.station_id} onChange={handleChange} className={selectBase} required>
                  <option value="" className="text-slate-500">Select Station</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id} className="text-[#1e3a5f]">
                      {station.station_name} ({station.station_code})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Permanent Address */}
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Permanent Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Province</span>
                <select name="state_province" value={form.state_province} onChange={(e) => { setForm((prev) => ({ ...prev, state_province: e.target.value, district: '', municipality: '' })); setDistricts([]); setMunicipalities([]); }} className={selectBase}>
                  <option value="" className="text-slate-500">Select Province</option>
                  {locationData?.provinceList.map((province) => (
                    <option key={province.id} value={province.name} className="text-[#1e3a5f]">
                      {province.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">District</span>
                <select name="district" value={form.district} onChange={(e) => { setForm((prev) => ({ ...prev, district: e.target.value, municipality: '' })); setMunicipalities([]); }} className={`${selectBase} disabled:opacity-50 disabled:cursor-not-allowed`} disabled={!form.state_province}>
                  <option value="" className="text-slate-500">Select District</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.name} className="text-[#1e3a5f]">
                      {district.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Municipality</span>
                <select name="municipality" value={form.municipality} onChange={handleChange} className={`${selectBase} disabled:opacity-50 disabled:cursor-not-allowed`} disabled={!form.district}>
                  <option value="" className="text-slate-500">Select Municipality</option>
                  {municipalities.map((muni) => (
                    <option key={muni.id} value={muni.name} className="text-[#1e3a5f]">
                      {muni.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Ward No.</span>
                <input
                  name="ward_no"
                  type="number"
                  min="1"
                  max="33"
                  value={form.ward_no}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Ward"
                />
              </label>
            </div>

            <div className="mt-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Address Line</span>
                <textarea
                  name="address_line"
                  value={form.address_line}
                  onChange={handleChange}
                  className={inputBase + " h-20 resize-none"}
                  placeholder="Street, Tole, House No. etc."
                />
              </label>
            </div>
          </div>

          {/* Signature */}
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Officer Signature <span className="text-red-500">*</span>
            </h2>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {signaturePreview ? (
                  <div className="relative">
                    <img src={signaturePreview} alt="Signature Preview" className="w-64 h-24 object-contain rounded-xl border-2 border-slate-200 bg-white" />
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-64 h-24 bg-white border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                    <span className="text-slate-400 text-sm">No signature</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="flex flex-col">
                  <input type="file" accept="image/png,image/jpeg" onChange={handleSignatureChange} className="hidden" id="officer-signature-upload-edit" />
                  <label
                    htmlFor="officer-signature-upload-edit"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-[#0c2340] cursor-pointer transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {signaturePreview ? "Change Signature" : "Upload Signature"}
                  </label>
                  <p className="text-xs text-slate-400 mt-2">PNG, JPG (transparent background preferred)</p>
                </label>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Officer Photo <span className="text-red-500">*</span>
            </h2>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-2xl border-2 border-slate-200" />
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="flex flex-col">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="officer-photo-upload-edit" />
                  <label
                    htmlFor="officer-photo-upload-edit"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-[#0c2340] cursor-pointer transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {photoPreview ? "Change Photo" : "Choose Photo"}
                  </label>
                  <p className="text-xs text-slate-400 mt-2">JPG, PNG, GIF. Max 5MB</p>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex gap-4">
            <Link
              href={`/officers/${officerId}`}
              className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-[#0c2340] font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#0c2340] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#2d4a6f] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-lg hover:scale-[1.01]"
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
