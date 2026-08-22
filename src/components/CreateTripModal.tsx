import React, { useState } from 'react';
import { X, Calendar, DollarSign, Image as ImageIcon, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { Trip, TripStop } from '../types';
import { POPULAR_DESTINATIONS } from '../data/mockData';
import { SupportedCurrency, formatCurrency } from '../utils/currency';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (newTrip: Trip) => void;
  currency?: SupportedCurrency;
}

const PRESET_COVERS = [
  { label: 'Rajasthan Heritage', url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Swiss Alps', url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Parisian Romance', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Kyoto Torii Path', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Tropical Bali', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Amalfi Coast', url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80' },
];

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onCreateTrip,
  currency = 'INR',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-23');
  const [totalBudget, setTotalBudget] = useState(1500);
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [selectedInitialCity, setSelectedInitialCity] = useState('dest_delhi');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a name for your trip.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please select trip dates.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    const startCityObj =
      POPULAR_DESTINATIONS.find((d) => d.id === selectedInitialCity) ||
      POPULAR_DESTINATIONS[0];
    const initialStop: TripStop = {
      id: `stop_${Date.now()}_1`,
      cityId: startCityObj.id,
      cityName: startCityObj.name,
      country: startCityObj.country,
      region: startCityObj.region,
      arrivalDate: startDate,
      departureDate: endDate,
      orderIndex: 0,
      accommodationCost: Math.round(startCityObj.averageDailyCost * 1.5),
      imageUrl: startCityObj.imageUrl,
      coordinates: startCityObj.coordinates,
      notes: `Starting point for ${title}.`,
      activities: [],
    };

    const newTrip: Trip = {
      id: `trip_${Date.now()}`,
      title: title.trim(),
      description:
        description.trim() ||
        `An exciting multi-city journey starting in ${startCityObj.name}.`,
      coverImage: customCoverUrl.trim() || coverImage,
      startDate,
      endDate,
      currency: 'USD',
      totalBudget: Number(totalBudget) || 1200,
      status: 'planning',
      visibility: 'private',
      stops: [initialStop],
      members: [
        {
          id: 'usr_001',
          name: 'Tanya Garg',
          email: 'tanya.travels@voyara.io',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          role: 'owner',
        },
      ],
      tags: [startCityObj.name, startCityObj.country, 'Custom Journey'],
      createdAt: new Date().toISOString(),
    };

    onCreateTrip(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E7E5E4] overflow-hidden my-8">
        {/* Header Preview Banner */}
        <div className="relative h-48 bg-[#1C1917] overflow-hidden">
          <img
            src={customCoverUrl || coverImage}
            alt="Trip Cover"
            className="w-full h-full object-cover transition-all duration-500 opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/50 to-transparent"></div>

          <button
            id="close-create-trip-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 inset-x-6 flex items-end justify-between text-white">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#C2410C] block mb-1">
                New Itinerary Creation
              </span>
              <h2 className="font-editorial-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {title || 'Untitled Journey'}
              </h2>
            </div>
            <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold font-editorial-serif">
              {formatCurrency(totalBudget, currency)} Target
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl font-semibold">
              {error}
            </div>
          )}

          {/* Title & Initial City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-1">
                Journey Name *
              </label>
              <input
                id="create-trip-title-input"
                type="text"
                required
                placeholder="e.g. Royal Golden Triangle of Rajasthan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl text-xs font-semibold text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-1">
                Starting City
              </label>
              <select
                value={selectedInitialCity}
                onChange={(e) => setSelectedInitialCity(e.target.value)}
                className="w-full px-4 py-3 bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
              >
                {POPULAR_DESTINATIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}, {d.country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl text-xs font-semibold text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-1">
                Target Budget (USD)
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-1">
              Description & Notes
            </label>
            <textarea
              rows={2}
              placeholder="Describe your travel aspirations, style, or companions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl text-xs text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          {/* Cover Imagery Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block">
              Editorial Cover Photography
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_COVERS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => {
                    setCoverImage(preset.url);
                    setCustomCoverUrl('');
                  }}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                    coverImage === preset.url && !customCoverUrl
                      ? 'border-[#C2410C] ring-2 ring-[#C2410C]/30 scale-105'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#E7E5E4] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917]"
            >
              Cancel
            </button>
            <button
              id="confirm-create-trip-submit-btn"
              type="submit"
              className="px-6 py-3 bg-[#C2410C] hover:bg-[#9A3412] active:scale-98 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <span>Create Journey Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
