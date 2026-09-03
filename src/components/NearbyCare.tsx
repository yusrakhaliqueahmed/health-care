import React, { useState } from 'react';
import { SupportedLanguage, Doctor, Hospital, Pharmacy } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { PAKISTAN_CITIES, INITIAL_DOCTORS, INITIAL_HOSPITALS, INITIAL_PHARMACIES } from '../services/data';
import { voiceManager } from '../services/voice';
import { AudioPlayerControls } from './AudioPlayerControls';
import {
  MapPin,
  Stethoscope,
  Building2,
  Pill,
  Navigation,
  PhoneCall,
  Star,
  ShieldCheck,
  Search,
  Clock,
  Truck,
  Calendar,
  Languages,
  Filter,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface NearbyCareProps {
  currentLanguage: SupportedLanguage;
  initialTab?: 'doctor' | 'hospital' | 'pharmacy';
  onBookDoctor: (doctor: Doctor) => void;
}

export const NearbyCare: React.FC<NearbyCareProps> = ({
  currentLanguage,
  initialTab = 'doctor',
  onBookDoctor,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [activeTab, setActiveTab] = useState<'doctor' | 'hospital' | 'pharmacy'>(initialTab);
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [useGps, setUseGps] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Trigger GPS detection simulation
  const handleDetectLocation = () => {
    setUseGps(true);
    setSelectedCity('Multan'); // Simulating GPS pinpoint in Pakistan
    if (voiceManager.getAutoPlay()) {
      voiceManager.speak('Location detected: Nishtar Road, Multan. Showing nearest verified healthcare providers.', currentLanguage);
    }
  };

  // Filter Doctors
  const filteredDoctors = INITIAL_DOCTORS.filter((doc) => {
    const matchCity = selectedCity === 'All Cities' || doc.city.toLowerCase() === selectedCity.toLowerCase();
    const matchQuery =
      !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.languages.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCity && matchQuery;
  });

  // Filter Hospitals
  const filteredHospitals = INITIAL_HOSPITALS.filter((hosp) => {
    const matchCity = selectedCity === 'All Cities' || hosp.city.toLowerCase() === selectedCity.toLowerCase();
    const matchQuery =
      !searchQuery ||
      hosp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hosp.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCity && matchQuery;
  });

  // Filter Pharmacies
  const filteredPharmacies = INITIAL_PHARMACIES.filter((pharm) => {
    const matchCity = selectedCity === 'All Cities' || pharm.city.toLowerCase() === selectedCity.toLowerCase();
    const matchQuery =
      !searchQuery ||
      pharm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pharm.commonMedsInStock.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCity && matchQuery;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-600 text-teal-200 text-xs font-bold mb-2">
              <MapPin className="w-4 h-4" />
              <span>Location-Based Care Finder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t.findCareTitle}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
              PMDC verified specialist doctors, 24/7 emergency hospital trauma centers, and delivery pharmacies across Pakistan.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDetectLocation}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shrink-0 ${
              useGps
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-teal-900 hover:bg-teal-50'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>{useGps ? 'GPS Active (Multan)' : t.useMyLocation}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        {/* City Dropdown */}
        <div className="w-full sm:w-56 shrink-0">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 min-h-[44px]"
          >
            {PAKISTAN_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor specialty, medicine in stock, or hospital..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 min-h-[44px]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Map View
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('doctor')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'doctor'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>{t.doctorsTab} ({filteredDoctors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hospital')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'hospital'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t.hospitalsTab} ({filteredHospitals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pharmacy')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'pharmacy'
              ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>{t.pharmaciesTab} ({filteredPharmacies.length})</span>
        </button>
      </div>

      {/* Map View Simulation */}
      {viewMode === 'map' && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800 h-80 flex items-center justify-center p-6 text-center">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative z-10 max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-teal-100 dark:border-slate-700">
            <MapPin className="w-8 h-8 text-teal-600 mx-auto mb-2 animate-bounce" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Pakistan Geolocation Navigation Radar
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active Pinpoint: {selectedCity} • Showing {activeTab === 'doctor' ? filteredDoctors.length : activeTab === 'hospital' ? filteredHospitals.length : filteredPharmacies.length} verified facilities with directions & emergency access.
            </p>
          </div>
        </div>
      )}

      {/* Tab 1: Doctors List */}
      {activeTab === 'doctor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-4">
                  <img
                    src={doc.avatarUrl}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-teal-200 dark:border-teal-800 shadow-xs shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                        {doc.name}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" title="PMDC Verified" />
                    </div>
                    <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                      {doc.specialty}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {doc.qualification} • {doc.experienceYears} yrs exp
                    </p>
                    <div className="inline-block mt-1 px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-[10px] font-mono text-teal-800 dark:text-teal-300 font-semibold">
                      {doc.pmdcNumber}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold">{doc.hospital}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{doc.address} ({doc.distance})</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Spoken: {doc.languages.join(', ')}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Consultation Fee</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                    PKR {doc.consultationFee}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${doc.phone}`}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Call Clinic"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onBookDoctor(doc)}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all min-h-[44px]"
                  >
                    Book Teleconsult
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Emergency Hospitals */}
      {activeTab === 'hospital' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredHospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 rounded-2xl overflow-hidden mb-3">
                  <img
                    src={hosp.photoUrl}
                    alt={hosp.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-sm">
                    24/7 Emergency Trauma Center
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                  {hosp.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {hosp.type} • {hosp.city}, {hosp.province}
                </p>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{hosp.address} ({hosp.distance})</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                    <span>ER Line: {hosp.phone}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={`tel:${hosp.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors min-h-[44px]"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Hospital</span>
                </a>

                <a
                  href="tel:1122"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors min-h-[44px]"
                >
                  <span>Dispatch 1122</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Pharmacies */}
      {activeTab === 'pharmacy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPharmacies.map((pharm) => (
            <div
              key={pharm.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {pharm.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {pharm.address} ({pharm.distance})
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    Open 24/7
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-semibold">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Home Delivery Available: ~{pharm.deliveryTime}</span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Common Stock:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pharm.commonMedsInStock.map((med) => (
                        <span
                          key={med}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={`tel:${pharm.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors min-h-[44px]"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Order / Call Pharmacy</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
