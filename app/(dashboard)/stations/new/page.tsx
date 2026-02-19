"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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
  station_code: string;
  station_name: string;
  state_province: string;
  district: string;
  municipality: string;
  ward_no: string;
  address_line: string;
  photo: string;
  phone: string;
  email: string;
  jurisdiction_area: string;
  incharge_officer_id: string;
  established_date: string;
  is_active: boolean;
};

export default function NewStationPage() {
  const [form, setForm] = useState<FormState>({
    station_code: "",
    station_name: "",
    state_province: "",
    district: "",
    municipality: "",
    ward_no: "",
    address_line: "",
    photo: "",
    phone: "",
    email: "",
    jurisdiction_area: "",
    incharge_officer_id: "",
    established_date: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Location data
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [districts, setDistricts] = useState<{ id: number; name: string; municipalityList: any[] }[]>([]);
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([]);

  // Officers for incharge selection
  const [officers, setOfficers] = useState<any[]>([]);
  const [officerSearch, setOfficerSearch] = useState("");

  // Load location data
  useEffect(() => {
    fetch("/nepal_location.json")
      .then((res) => res.json())
      .then((data) => setLocationData(data))
      .catch((err) => console.error("Failed to load location data:", err));
  }, []);

  // Load officers for incharge selection
  useEffect(() => {
    fetch("/api/officers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOfficers(data.data);
      })
      .catch((err) => console.error("Failed to load officers:", err));
  }, []);

  // Filter officers based on search
  const filteredOfficers = officers.filter((o) => {
    const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
    const badge = (o.badge_number || "").toLowerCase();
    const searchLower = officerSearch.toLowerCase();
    return fullName.includes(searchLower) || badge.includes(searchLower);
  });

  // Update districts when province changes
  useEffect(() => {
    if (locationData && form.state_province) {
      const province = locationData.provinceList.find((p) => p.name === form.state_province);
      setDistricts(province?.districtList || []);
      setForm((prev) => ({ ...prev, district: "", municipality: "" }));
      setMunicipalities([]);
    }
  }, [form.state_province, locationData]);

  // Update municipalities when district changes
  useEffect(() => {
    if (form.district && districts.length > 0) {
      const district = districts.find((d) => d.name === form.district);
      setMunicipalities(district?.municipalityList || []);
      setForm((prev) => ({ ...prev, municipality: "" }));
    }
  }, [form.district, districts]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'stations');
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.station_code) {
      setError("Station code is required.");
      return;
    }
    if (!form.station_name) {
      setError("Station name is required.");
      return;
    }
    if (!form.state_province || !form.district) {
      setError("Province and District are required.");
      return;
    }
    if (!form.established_date) {
      setError("Established date is required.");
      return;
    }
    if (!form.jurisdiction_area.trim()) {
      setError("Jurisdiction area is required.");
      return;
    }
    if (!form.photo) {
      setError("Station photo is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/stations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to create station');
      }

      setSuccess('Police station added successfully.');
      setForm({
        station_code: "",
        station_name: "",
        state_province: "",
        district: "",
        municipality: "",
        ward_no: "",
        address_line: "",
        photo: "",
        phone: "",
        email: "",
        jurisdiction_area: "",
        incharge_officer_id: "",
        established_date: "",
        is_active: true,
      });
      setPhotoPreview(null);
    } catch (err: any) {
      setError(err?.message || "Failed to add station.");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100";

  const selectBase =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0c2340]">Add Police Station</h1>
          <p className="text-slate-500 mt-1">Register a new police station in the system</p>
        </div>
        <Link
          href="/stations"
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[#0c2340] font-medium transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Stations
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
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Station Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Station Code <span className="text-red-500">*</span></span>
                <input
                  name="station_code"
                  value={form.station_code}
                  onChange={handleChange}
                  className={inputBase}
                  required
                  placeholder="e.g., KTM-001"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Station Name <span className="text-red-500">*</span></span>
                <input
                  name="station_name"
                  value={form.station_name}
                  onChange={handleChange}
                  className={inputBase}
                  required
                  placeholder="Enter station name"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Phone</span>
                <input
                  name="phone"
                  value={form.phone}
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
                <span className="text-sm font-medium text-slate-700 mb-2">Established Date <span className="text-red-500">*</span></span>
                <input
                  type="date"
                  name="established_date"
                  value={form.established_date}
                  onChange={handleChange}
                  className={inputBase}
                  required
                />
              </label>

              <label className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-white border-slate-200 text-blue-500 focus:ring-blue-400/50"
                />
                <span className="text-sm font-medium text-slate-700">Active Station</span>
              </label>
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Province <span className="text-red-500">*</span></span>
                <select name="state_province" value={form.state_province} onChange={handleChange} className={selectBase} required>
                  <option value="" className="text-slate-500">Select Province</option>
                  {locationData?.provinceList.map((province) => (
                    <option key={province.id} value={province.name} className="text-[#1e3a5f]">
                      {province.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">District <span className="text-red-500">*</span></span>
                <select name="district" value={form.district} onChange={handleChange} className={`${selectBase} disabled:opacity-50 disabled:cursor-not-allowed`} disabled={!form.state_province} required>
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
                  placeholder="Street, Tole, Building name etc."
                />
              </label>
            </div>
          </div>

          {/* Jurisdiction */}
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Jurisdiction
            </h2>
            <label className="flex flex-col">
              <span className="text-sm font-medium text-slate-700 mb-2">Jurisdiction Area <span className="text-red-500">*</span></span>
              <textarea
                name="jurisdiction_area"
                value={form.jurisdiction_area}
                onChange={handleChange}
                className={inputBase + " h-24 resize-none"}
                placeholder="Describe the areas, wards, or localities under this station's jurisdiction..."
                required
              />
            </label>
          </div>

          {/* Incharge Officer */}
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Incharge Officer (Optional)
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                value={officerSearch}
                onChange={(e) => setOfficerSearch(e.target.value)}
                className={inputBase}
                placeholder="Search officer by name or badge number..."
              />
              <select
                name="incharge_officer_id"
                value={form.incharge_officer_id}
                onChange={handleChange}
                className={selectBase}
              >
                <option value="" className="text-slate-500">Select Incharge Officer (Optional)</option>
                {filteredOfficers.map((officer) => (
                  <option key={officer.id} value={officer.id} className="text-[#1e3a5f]">
                    {officer.first_name} {officer.last_name} - {officer.badge_number} ({officer.rank})
                  </option>
                ))}
              </select>
              {form.incharge_officer_id && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, incharge_officer_id: "" }))}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear selection
                </button>
              )}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Station Photo <span className="text-red-500">*</span>
            </h2>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-2xl border-2 border-slate-200" />
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-[#0c2340] shadow-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="flex flex-col">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="station-photo-upload" />
                  <label
                    htmlFor="station-photo-upload"
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
                  Adding Station...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Police Station
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}








