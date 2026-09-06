import React, { useState } from 'react';
import { Doctor, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import {
  Video,
  PhoneCall,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

interface TeleconsultBookingModalProps {
  doctor: Doctor | null;
  currentLanguage: SupportedLanguage;
  onClose: () => void;
  onConfirm: (bookingDetails: any) => void;
}

export const TeleconsultBookingModal: React.FC<TeleconsultBookingModalProps> = ({
  doctor,
  currentLanguage,
  onClose,
  onConfirm,
}) => {
  if (!doctor) return null;

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('04:30 PM');
  const [consultType, setConsultType] = useState<'video' | 'voice'>('video');
  const [patientName, setPatientName] = useState('Patient');
  const [phone, setPhone] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    onConfirm({
      doctorId: doctor.id,
      doctorName: doctor.name,
      date,
      timeSlot,
      consultType,
      patientName,
      phone,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={doctor.avatarUrl}
              alt={doctor.name}
              className="w-14 h-14 rounded-2xl object-cover border border-teal-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {doctor.name}
              </h3>
              <p className="text-xs text-teal-600 font-bold">{doctor.specialty}</p>
              <p className="text-[10px] text-slate-400">PMDC #{doctor.pmdcNumber} • Fee: PKR {doctor.consultationFee}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isBooked ? (
          <div className="p-6 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Teleconsultation Confirmed!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Appointment scheduled for {date} at {timeSlot}. A secure video room link and SMS confirmation have been dispatched.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConsultType('video')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${
                  consultType === 'video'
                    ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 text-teal-800 dark:text-teal-200'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video Call</span>
              </button>

              <button
                type="button"
                onClick={() => setConsultType('voice')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold ${
                  consultType === 'voice'
                    ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 text-teal-800 dark:text-teal-200'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>Audio Call</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option>02:00 PM</option>
                  <option>03:30 PM</option>
                  <option>04:30 PM</option>
                  <option>06:00 PM</option>
                  <option>08:00 PM</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mobile Number (SMS confirmation)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XX-XXXXXXX"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                Confirm Appointment (PKR {doctor.consultationFee})
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
