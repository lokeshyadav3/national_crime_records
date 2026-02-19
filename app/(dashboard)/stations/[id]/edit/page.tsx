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
  station_code: string;
  station_name: string;
  state: string;
  district: string;
  municipality: string;
  ward: string;
  address: string;
  photo: string;
  contact_number: string;
  email: string;
  jurisdiction: string;
  incharge_officer_id: string;
  established_date: string;
  is_active: boolean;
};

export default function EditStationPage() {
  const params = useParams();
  const router = useRouter();
  const stationId = params.id;

  const [form, setForm] = useState<FormState>({
    station_code: "",
    station_name: "",
    state: "",
    district: "",
    municipality: "",
    ward: "",
    address: "",
    photo: "",
    contact_number: "",
    email: "",
    jurisdiction: "",
    incharge_officer_id: "",
    established_date: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [stationName, setStationName] = useState("");

  // Location data
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [districts, setDistricts] = useState<{ id: number; name: string; municipalityList: any[] }[]>([]);
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string }[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);

  // Load location data
  useEffect(() => {
    fetch("/nepal_location.json")
      .then((res) => res.json())
      .then((data) => setLocationData(data))
      .catch((err) => console.error("Failed to load location data:", err));
  }, []);

  // Load station data
  useEffect(() => {
    if (stationId) {
      fetchStation();
      fetchOfficers();
    }
  }, [stationId]);

  // Helper: fuzzy match location names (handles case + "PROVINCE" suffix differences)
  function fuzzyMatchName(dbName: string, jsonName: string): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/\s*province\s*/gi, '').trim();
    return normalize(dbName) === normalize(jsonName);
  }

  // Update districts when province/locationData changes or when form.state is set from fetch
  useEffect(() => {
    if (locationData && form.state) {
      const province = locationData.provinceList.find((p) => fuzzyMatchName(form.state, p.name));
      if (province) {
        setDistricts(province.districtList || []);
        // If form.state doesn't exactly match JSON name, update it to match
        if (form.state !== province.name) {
          setForm((prev) => ({ ...prev, state: province.name }));
        }
      }
    }
  }, [form.state, locationData]);

  // Update municipalities when district changes
  useEffect(() => {
    if (form.district && districts.length > 0) {
      const district = districts.find((d) => fuzzyMatchName(form.district, d.name));
      if (district) {
        setMunicipalities(district.municipalityList || []);
        // If form.district doesn't exactly match JSON name, update it to match
        if (form.district !== district.name) {
          setForm((prev) => ({ ...prev, district: district.name }));
        }
      }
    }
  }, [form.district, districts]);

  async function fetchStation() {
    try {
      const res = await fetch(`/api/stations/${stationId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const station = json.data;
        setStationName(station.station_name);
        // Map DB values to the form — the fuzzy matching in useEffects will
        // auto-correct province/district names to match the JSON values
        setForm({
          station_code: station.station_code || "",
          station_name: station.station_name || "",
          state: station.state || station.state_province || "",
          district: station.district || "",
          municipality: station.municipality || "",
          ward: station.ward?.toString() || station.ward_no?.toString() || "",
          address: station.address || station.address_line || "",
          photo: station.photo || "",
          contact_number: station.contact_number || station.phone || "",
          email: station.email || "",
          jurisdiction: station.jurisdiction || station.jurisdiction_area || "",
          incharge_officer_id: station.incharge_officer_id?.toString() || "",
          established_date: station.established_date ? station.established_date.split('T')[0] : "",
          is_active: station.is_active !== false,
        });
        if (station.photo) {
          setPhotoPreview(station.photo);
        }
      } else {
        setError("Station not found");
      }
    } catch (err) {
      setError("Failed to load station data");
    } finally {
      setLoading(false);
    }
  }

  async function fetchOfficers() {
    try {
      const res = await fetch(`/api/officers?station_id=${stationId}`);
      const json = await res.json();
      if (json.success) {
        setOfficers(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load officers:", err);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleProvinceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, state: value, district: "", municipality: "" }));
    setMunicipalities([]);
  }

  function handleDistrictChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, district: value, municipality: "" }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);

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

    if (!form.station_name) {
      setError("Station name is required.");
      return;
    }
    if (!form.state || !form.district) {
      setError("Province and District are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/stations/${stationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Failed to update station');
      }

      setSuccess('Police station updated successfully.');
      setTimeout(() => {
        router.push(`/stations/${stationId}`);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to update station.");
    } finally {
      setSaving(false);
    }
  }

  const inputBase =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100";

  const selectBase =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0c2340] focus:outline-none focus:ring-2 focus:ring-[#0c2340]/30 focus:border-transparent transition-all duration-300 hover:bg-slate-100 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0c2340] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500">Loading station data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0c2340]">Edit Police Station</h1>
          <p className="text-slate-500 mt-1">Update details for {stationName}</p>
        </div>
        <Link
          href={`/stations/${stationId}`}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[#0c2340] font-medium transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Station
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
                <span className="text-sm font-medium text-slate-700 mb-2">Station Code</span>
                <input
                  name="station_code"
                  value={form.station_code}
                  onChange={handleChange}
                  className={inputBase + " bg-slate-100 cursor-not-allowed"}
                  disabled
                  placeholder="Station code"
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
                <span className="text-sm font-medium text-slate-700 mb-2">Established Date</span>
                <input
                  type="date"
                  name="established_date"
                  value={form.established_date}
                  onChange={handleChange}
                  className={inputBase}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">In-Charge Officer</span>
                <select
                  name="incharge_officer_id"
                  value={form.incharge_officer_id}
                  onChange={handleChange}
                  className={selectBase}
                >
                  <option value="">Select In-Charge Officer</option>
                  {officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.rank} {officer.first_name} {officer.last_name}
                    </option>
                  ))}
                </select>
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
                <select name="state" value={form.state} onChange={handleProvinceChange} className={selectBase} required>
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
                <select name="district" value={form.district} onChange={handleDistrictChange} className={`${selectBase} disabled:opacity-50 disabled:cursor-not-allowed`} disabled={!form.state} required>
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
                  name="ward"
                  type="number"
                  min="1"
                  max="33"
                  value={form.ward}
                  onChange={handleChange}
                  className={inputBase}
                  placeholder="Ward"
                />
              </label>
            </div>

            <div className="mt-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 mb-2">Address</span>
                <textarea
                  name="address"
                  value={form.address}
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
              <span className="text-sm font-medium text-slate-700 mb-2">Jurisdiction Area</span>
              <textarea
                name="jurisdiction"
                value={form.jurisdiction}
                onChange={handleChange}
                className={inputBase + " h-24 resize-none"}
                placeholder="Describe the areas, wards, or localities under this station's jurisdiction..."
              />
            </label>
          </div>

          {/* Photo Upload */}
          <div>
            <h2 className="text-lg font-semibold text-[#0c2340] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#0c2340]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Station Photo
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
          <div className="pt-4 flex gap-4">
            <Link
              href={`/stations/${stationId}`}
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
