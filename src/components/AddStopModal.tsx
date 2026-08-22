import React, { useState } from 'react';
import { X, MapPin, Search, Calendar, DollarSign, Train, Plane, Car, Plus } from 'lucide-react';
import { Destination, TripStop, TransportType } from '../types';
import { POPULAR_DESTINATIONS } from '../data/mockData';

interface AddStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStop: (stop: TripStop) => void;
  existingStopsCount: number;
  tripStartDate: string;
  tripEndDate: string;
}

export const AddStopModal: React.FC<AddStopModalProps> = ({
  isOpen,
  onClose,
  onAddStop,
  existingStopsCount,
  tripStartDate,
  tripEndDate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [customCityName, setCustomCityName] = useState('');
  const [country, setCountry] = useState('');
  const [arrivalDate, setArrivalDate] = useState(tripStartDate);
  const [departureDate, setDepartureDate] = useState(tripEndDate);
  const [accommodationName, setAccommodationName] = useState('');
  const [accommodationCost, setAccommodationCost] = useState(120);
  const [transitType, setTransitType] = useState<TransportType>('train');
  const [transitCarrier, setTransitCarrier] = useState('');
  const [transitCost, setTransitCost] = useState(45);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const filteredDestinations = POPULAR_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectPreset = (dest: Destination) => {
    setSelectedDestination(dest);
    setCustomCityName(dest.name);
    setCountry(dest.country);
    setAccommodationCost(Math.round(dest.averageDailyCost * 1.8));
    setAccommodationName(`${dest.name} Boutique Heritage Stay`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const name = selectedDestination?.name || customCityName.trim();
    if (!name) return;

    const stop: TripStop = {
      id: `stop_${Date.now()}_${existingStopsCount + 1}`,
      cityId: selectedDestination?.id || `custom_${Date.now()}`,
      cityName: name,
      country: country.trim() || selectedDestination?.country || 'Destination',
      region: selectedDestination?.region || 'Region',
      arrivalDate,
      departureDate,
      orderIndex: existingStopsCount,
      accommodationName: accommodationName.trim() || undefined,
      accommodationCost: Number(accommodationCost) || 0,
      imageUrl:
        selectedDestination?.imageUrl ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      coordinates: selectedDestination?.coordinates || { lat: 25.0, lng: 75.0 },
      notes: notes.trim() || undefined,
      transportToStop: {
        type: transitType,
        carrier: transitCarrier.trim() || undefined,
        cost: Number(transitCost) || 0,
      },
      activities: [],
    };

    onAddStop(stop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-md shadow-2xl border border-[#E5E4DF] overflow-hidden my-8">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E4DF] bg-[#F9F8F6]">
          <div>
            <h3 className="font-editorial-serif text-xl font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#CC5500]" />
              <span>Add Destination Hub to Itinerary</span>
            </h3>
            <p className="text-xs text-[#71716A] mt-0.5">Select a curated destination or enter custom city details</p>
          </div>
          <button
            id="close-add-stop-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xs hover:bg-[#E5E4DF] text-[#71716A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Destination Search & Presets */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1.5">Search Curated Destinations</label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-[#71716A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-stop-destinations-input"
                type="text"
                placeholder="Search Delhi, Jaipur, Paris, Kyoto, Rome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] text-[#1A1A1A] placeholder:text-[#71716A]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 bg-[#F9F8F6] rounded-xs border border-[#E5E4DF]">
              {filteredDestinations.slice(0, 8).map((dest) => (
                <button
                  key={dest.id}
                  type="button"
                  id={`select-dest-${dest.id}`}
                  onClick={() => handleSelectPreset(dest)}
                  className={`flex items-center gap-2 p-1.5 rounded-xs border text-left transition-all ${
                    selectedDestination?.id === dest.id
                      ? 'bg-[#F0EDE8] border-[#CC5500] ring-1 ring-[#CC5500]'
                      : 'bg-white border-[#E5E4DF] hover:border-[#CC5500]/50'
                  }`}
                >
                  <img src={dest.imageUrl} alt={dest.name} className="w-8 h-8 rounded-xs object-cover" />
                  <div className="truncate">
                    <p className="font-editorial-serif font-bold text-xs text-[#1A1A1A] truncate">{dest.name}</p>
                    <p className="text-[10px] text-[#71716A] truncate">{dest.country}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* City Name & Country Input (if custom) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1">
                City / Stop Name <span className="text-[#CC5500]">*</span>
              </label>
              <input
                id="stop-city-name-input"
                type="text"
                required
                placeholder="e.g. Udaipur"
                value={customCityName}
                onChange={(e) => {
                  setCustomCityName(e.target.value);
                  setSelectedDestination(null);
                }}
                className="w-full px-3 py-2 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] font-medium text-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1">Country</label>
              <input
                id="stop-country-input"
                type="text"
                placeholder="e.g. India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] font-medium text-[#1A1A1A]"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1">Arrival Date</label>
              <input
                id="stop-arrival-date-input"
                type="date"
                required
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] text-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1">Departure Date</label>
              <input
                id="stop-departure-date-input"
                type="date"
                required
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] text-[#1A1A1A]"
              />
            </div>
          </div>

          {/* Accommodation */}
          <div className="p-3.5 bg-[#F9F8F6] rounded-xs border border-[#E5E4DF] space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] block">
              Accommodation Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <input
                  id="stop-hotel-name-input"
                  type="text"
                  placeholder="Hotel / Resort / Heritage Stay name"
                  value={accommodationName}
                  onChange={(e) => setAccommodationName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E4DF] rounded-xs focus:outline-none focus:border-[#CC5500] text-[#1A1A1A]"
                />
              </div>
              <div>
                <div className="relative">
                  <span className="text-xs text-[#71716A] absolute left-2.5 top-1/2 -translate-y-1/2">$</span>
                  <input
                    id="stop-hotel-cost-input"
                    type="number"
                    min="0"
                    placeholder="Total stay cost"
                    value={accommodationCost}
                    onChange={(e) => setAccommodationCost(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-[#E5E4DF] rounded-xs focus:outline-none focus:border-[#CC5500] text-[#1A1A1A] font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Transit to this stop */}
          <div className="p-3.5 bg-[#F9F8F6] rounded-xs border border-[#E5E4DF] space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] block">
              Transit / Transfer to this Hub
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['train', 'flight', 'drive'] as TransportType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  id={`transit-type-${t}`}
                  onClick={() => setTransitType(t)}
                  className={`py-1.5 px-2 rounded-xs text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    transitType === t
                      ? 'bg-[#CC5500] text-white border-[#CC5500] shadow-xs'
                      : 'bg-white border-[#E5E4DF] text-[#1A1A1A] hover:bg-[#F0EDE8]'
                  }`}
                >
                  {t === 'train' && <Train className="w-3.5 h-3.5" />}
                  {t === 'flight' && <Plane className="w-3.5 h-3.5" />}
                  {t === 'drive' && <Car className="w-3.5 h-3.5" />}
                  <span className="capitalize">{t}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                id="stop-transit-carrier-input"
                type="text"
                placeholder="Flight/Train/Car details"
                value={transitCarrier}
                onChange={(e) => setTransitCarrier(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E4DF] rounded-xs focus:outline-none focus:border-[#CC5500] text-[#1A1A1A]"
              />
              <div className="relative">
                <span className="text-xs text-[#71716A] absolute left-2.5 top-1/2 -translate-y-1/2">$</span>
                <input
                  id="stop-transit-cost-input"
                  type="number"
                  min="0"
                  placeholder="Transit Cost"
                  value={transitCost}
                  onChange={(e) => setTransitCost(Number(e.target.value))}
                  className="w-full pl-6 pr-2 py-1.5 text-xs bg-white border border-[#E5E4DF] rounded-xs focus:outline-none focus:border-[#CC5500] text-[#1A1A1A] font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E4DF]">
            <button
              id="cancel-add-stop-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#71716A] hover:text-[#1A1A1A] rounded-xs"
            >
              Cancel
            </button>
            <button
              id="confirm-add-stop-btn"
              type="submit"
              className="px-5 py-2 bg-[#CC5500] hover:bg-[#B34A00] text-white text-xs font-semibold rounded-xs transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Stop to Journey</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
