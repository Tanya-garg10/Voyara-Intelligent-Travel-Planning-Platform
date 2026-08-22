import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  Download,
  Mail,
  MessageCircle,
  X,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Compass
} from 'lucide-react';
import { Trip } from '../types';
import { calculateDurationDays, formatDate } from '../utils/dateUtils';
import { calculateTripFinancials } from '../utils/budgetCalculations';
import { formatCurrency, SupportedCurrency } from '../utils/currency';
import { exportTripToJSON, exportTripToPDF } from '../utils/exportUtils';
import { FileCode, FileText } from 'lucide-react';

interface PublicShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onCloneTrip?: (trip: Trip) => void;
  onTogglePublicStatus: (isPublic: boolean) => void;
  currency?: SupportedCurrency;
}

export const PublicShareModal: React.FC<PublicShareModalProps> = ({
  isOpen,
  onClose,
  trip,
  onCloneTrip,
  onTogglePublicStatus,
  currency = 'INR',
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'preview'>('link');

  if (!isOpen) return null;

  const publicUrl = `https://voyara.travel/trip/${trip.id}`;
  const financials = calculateTripFinancials(trip);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E7E5E4] overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-[#1C1917] text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C2410C] text-white flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#C2410C] block">
                Publishing & Syndication
              </span>
              <h2 className="font-editorial-serif text-2xl font-bold tracking-tight text-white">
                Share Trip & Itinerary
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 sm:px-8 pt-4 border-b border-[#E7E5E4] bg-[#FBFBFA] flex gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'link'
                ? 'border-[#C2410C] text-[#1C1917]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Sharing Link & Permissions
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'preview'
                ? 'border-[#C2410C] text-[#1C1917]'
                : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Public Read-Only Showcase
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'link' ? (
            <>
              {/* Privacy Setting Toggle */}
              <div className="p-5 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl ${
                      trip.isPublic
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#E7E5E4] text-[#1C1917]'
                    }`}
                  >
                    {trip.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-editorial-serif text-base font-bold text-[#1C1917]">
                      {trip.isPublic ? 'Public Web Link' : 'Private (Curator Only)'}
                    </h4>
                    <p className="text-xs text-[#78716C]">
                      {trip.isPublic
                        ? 'Anyone with this link can view this curated itinerary.'
                        : 'Only you can view or modify this itinerary.'}
                    </p>
                  </div>
                </div>

                <button
                  id="toggle-public-btn"
                  onClick={() => onTogglePublicStatus(!trip.isPublic)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    trip.isPublic
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-[#E7E5E4] text-[#1C1917] hover:bg-[#D5D4CE]'
                  }`}
                >
                  {trip.isPublic ? 'Public' : 'Make Public'}
                </button>
              </div>

              {/* Link Copy Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block">
                  Public Itinerary Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="w-full px-4 py-3 bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl text-xs font-mono text-[#1C1917] select-all focus:outline-none"
                  />
                  <button
                    id="copy-share-url-btn"
                    onClick={handleCopy}
                    className="px-5 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-3">
                  Quick Share
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`Check out my trip: ${trip.title}`)}&body=${encodeURIComponent(publicUrl)}`}
                    className="p-3.5 rounded-2xl border border-[#E7E5E4] hover:border-[#C2410C] hover:bg-[#FFF7ED]/30 text-xs font-semibold text-[#1C1917] flex items-center justify-center gap-2 transition-all"
                  >
                    <Mail className="w-4 h-4 text-[#C2410C]" />
                    <span>Email Itinerary</span>
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out my trip to ${trip.title}: ${publicUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-2xl border border-[#E7E5E4] hover:border-emerald-500 hover:bg-emerald-50 text-xs font-semibold text-[#1C1917] flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Offline Export & Backup */}
              <div className="pt-4 border-t border-[#E7E5E4] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block">
                    Save Itinerary for Offline Access
                  </span>
                  <span className="text-[10px] font-semibold text-[#C2410C]">
                    No Internet Required
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => exportTripToPDF(trip, currency)}
                    className="p-3.5 rounded-2xl border border-[#E7E5E4] hover:border-[#C2410C] hover:bg-[#FFF7ED]/30 text-xs font-bold text-[#1C1917] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <FileText className="w-4 h-4 text-[#C2410C]" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => exportTripToJSON(trip, currency)}
                    className="p-3.5 rounded-2xl border border-[#E7E5E4] hover:border-[#1C1917] hover:bg-[#F5F4F0] text-xs font-bold text-[#1C1917] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <FileCode className="w-4 h-4 text-[#78716C]" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Cinematic Public Preview */
            <div className="space-y-6">
              <div className="relative rounded-3xl overflow-hidden bg-stone-900 border border-[#E7E5E4] p-6 text-white min-h-[220px] flex flex-col justify-between">
                <img
                  src={trip.coverImage}
                  alt={trip.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/50 to-transparent"></div>

                <div className="relative z-10 flex justify-between items-center text-xs">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-bold text-[#C2410C] uppercase tracking-wider">
                    Voyara Itinerary Showcase
                  </span>
                  <span className="text-stone-200">
                    {formatDate(trip.startDate, 'medium')} – {formatDate(trip.endDate, 'medium')}
                  </span>
                </div>

                <div className="relative z-10 space-y-1 pt-8">
                  <h3 className="font-editorial-serif text-2xl sm:text-3xl font-bold">
                    {trip.title}
                  </h3>
                  <p className="text-xs text-stone-200 line-clamp-2">{trip.description}</p>
                </div>
              </div>

              {/* Stop Cards */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C] block">
                  Route Highlights
                </span>
                {trip.stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1C1917] text-white flex items-center justify-center text-[10px] font-bold font-mono">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-editorial-serif font-bold text-sm text-[#1C1917]">
                          {stop.cityName}, {stop.country}
                        </h4>
                        <p className="text-[#78716C] text-[11px]">
                          {stop.activities.length} Experiences scheduled
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#C2410C]">
                      {formatCurrency(stop.accommodationCost, currency)} stay
                    </span>
                  </div>
                ))}
              </div>

              {/* Clone CTA */}
              {onCloneTrip && (
                <button
                  onClick={() => {
                    onCloneTrip(trip);
                    onClose();
                  }}
                  className="w-full py-3.5 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Clone Itinerary to My Trips</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FBFBFA] border-t border-[#E7E5E4] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#1C1917] hover:bg-black text-white text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
