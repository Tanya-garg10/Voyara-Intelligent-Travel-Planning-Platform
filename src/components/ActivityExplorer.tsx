import React, { useState } from 'react';
import {
  Search,
  Activity as ActivityIcon,
  Clock,
  DollarSign,
  Star,
  Plus,
  MapPin,
  Filter,
  Check,
  Compass,
  Sparkles
} from 'lucide-react';
import { Activity, ActivityCategory, Trip, TripActivity, ViewType } from '../types';
import { CATALOG_ACTIVITIES } from '../data/mockData';
import { formatCurrency, SupportedCurrency } from '../utils/currency';

interface ActivityExplorerProps {
  activeTrip: Trip | null;
  onAddActivityToTrip: (activity: Activity, targetStopId: string) => void;
  currency?: SupportedCurrency;
  onNavigate?: (view: ViewType) => void;
}

const CATEGORIES: ('All' | ActivityCategory)[] = [
  'All',
  'Sightseeing',
  'Food',
  'Adventure',
  'Culture',
  'Shopping',
  'Nature',
  'Nightlife',
];

export const ActivityExplorer: React.FC<ActivityExplorerProps> = ({
  activeTrip,
  onAddActivityToTrip,
  currency = 'INR',
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ActivityCategory>('All');
  const [maxCost, setMaxCost] = useState(250);
  const [selectedCity, setSelectedCity] = useState('All');
  const [targetStopModalActivity, setTargetStopModalActivity] = useState<Activity | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string>(activeTrip?.stops[0]?.id || '');

  // Unique cities from catalog
  const uniqueCities = ['All', ...Array.from(new Set(CATALOG_ACTIVITIES.map((a) => a.cityName)))];

  const filteredActivities = CATALOG_ACTIVITIES.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesCity = selectedCity === 'All' || a.cityName === selectedCity;
    const matchesCost = a.cost <= maxCost;

    return matchesSearch && matchesCategory && matchesCity && matchesCost;
  });

  const handleConfirmAdd = () => {
    if (!targetStopModalActivity || !selectedStopId) return;
    onAddActivityToTrip(targetStopModalActivity, selectedStopId);
    setTargetStopModalActivity(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      {/* Header & Filter Card */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-xs space-y-5">
        {/* Explore Hub Switcher Pills */}
        <div className="flex items-center gap-2 p-1 bg-[#F5F4F0] rounded-2xl w-fit border border-[#E7E5E4]">
          {onNavigate && (
            <button
              id="tab-explore-cities-from-act"
              onClick={() => onNavigate('destinations')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-all flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-[#78716C]" />
              <span>1. City & Destination Search</span>
            </button>
          )}
          <button
            id="tab-explore-activities-active"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1C1917] text-white shadow-xs flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>2. Experience & Activity Search</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] text-[#78716C] mb-1">
              <ActivityIcon className="w-3.5 h-3.5 text-[#C2410C]" />
              <span>Curated Excursion Catalog</span>
            </div>
            <h1 className="font-editorial-serif text-3xl font-bold text-[#1C1917] tracking-tight">
              Discover Bespoke Experiences
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1">
              Filter by category, rating, duration, and financial index to craft an unforgettable itinerary
            </p>
          </div>

          {activeTrip && (
            <div className="bg-[#FFF7ED] p-3.5 rounded-2xl border border-[#FED7AA] text-xs">
              <span className="text-[#C2410C] block text-[10px] font-bold uppercase tracking-wider">
                Target Itinerary:
              </span>
              <p className="font-bold text-[#1C1917]">{activeTrip.title}</p>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-[#71716A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-activities-input"
              type="text"
              placeholder="Search tours, sunrise walks, food trails, temples, museums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs text-xs font-medium text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#CC5500] placeholder:text-[#71716A]"
            />
          </div>

          <div>
            <select
              id="filter-activity-city-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#CC5500]"
            >
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city === 'All' ? 'All Cities' : city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`cat-filter-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xs text-[11px] font-bold uppercase tracking-[1px] shrink-0 transition-all border ${
                selectedCategory === cat
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#71716A] border-[#E5E4DF] hover:border-[#CC5500]/50 hover:text-[#1A1A1A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredActivities.map((act) => {
          return (
            <div
              key={act.id}
              id={`activity-card-${act.id}`}
              className="group bg-white rounded-md border border-[#E5E4DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={act.imageUrl}
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/30 to-transparent"></div>

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-[1px] bg-[#1A1A1A]/80 backdrop-blur-md text-[#CC5500] border border-[#CC5500]/40">
                      {act.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 bg-[#1A1A1A]/80 backdrop-blur-md px-2 py-0.5 rounded-xs text-[10px] font-bold text-[#CC5500] flex items-center gap-1 border border-white/10">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{act.rating}</span>
                    <span className="text-[9px] text-[#E5E4DF]/70">({act.reviewCount})</span>
                  </div>

                  <div className="absolute bottom-3 inset-x-4 text-white">
                    <span className="text-[11px] text-[#CC5500] font-medium flex items-center gap-1 mb-0.5">
                      <MapPin className="w-3 h-3" />
                      {act.cityName}, {act.country}
                    </span>
                    <h3 className="font-editorial-serif text-lg font-bold leading-tight text-white">{act.title}</h3>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-[#71716A] line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E7E5E4]">
                    <div className="flex items-center gap-1 text-[#78716C]">
                      <Clock className="w-3.5 h-3.5 text-[#C2410C]" />
                      <span>{act.durationMinutes} mins</span>
                    </div>
                    <span className="font-editorial-serif font-bold text-sm text-[#1C1917]">
                      {formatCurrency(act.cost, currency)}
                    </span>
                  </div>

                  {act.highlights && (
                    <div className="space-y-1 pt-1">
                      {act.highlights.slice(0, 2).map((h, i) => (
                        <div key={i} className="text-[11px] text-[#71716A] flex items-start gap-1.5">
                          <span className="text-[#CC5500] font-bold">•</span>
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  id={`add-catalog-act-btn-${act.id}`}
                  onClick={() => setTargetStopModalActivity(act)}
                  className="w-full py-2.5 bg-[#1A1A1A] hover:bg-[#CC5500] text-white rounded-xs text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Trip Itinerary</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Select Target Stop Modal */}
      {targetStopModalActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-md p-6 max-w-md w-full shadow-2xl border border-[#E5E4DF] space-y-4">
            <h3 className="font-editorial-serif text-xl font-bold text-[#1A1A1A]">
              Add "{targetStopModalActivity.title}" to Trip
            </h3>
            <p className="text-xs text-[#71716A]">
              Select which city stop and destination day to insert this activity into:
            </p>

            {activeTrip ? (
              <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A]">Target City Stop</label>
                <select
                  value={selectedStopId || activeTrip.stops[0]?.id}
                  onChange={(e) => setSelectedStopId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs text-xs font-medium text-[#1A1A1A] focus:border-[#CC5500] focus:outline-none"
                >
                  {activeTrip.stops.map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {stop.cityName} ({stop.arrivalDate} to {stop.departureDate})
                    </option>
                  ))}
                </select>

                <div className="p-3 bg-[#F0EDE8] rounded-xs border-l-3 border-[#CC5500] text-xs">
                  <span className="font-semibold text-[#1A1A1A]">Activity Cost:</span> ${targetStopModalActivity.cost} USD
                  <br />
                  <span className="font-semibold text-[#1A1A1A]">Estimated Duration:</span> {targetStopModalActivity.durationMinutes} mins
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-600">No active trip selected. Please create or open a trip first.</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTargetStopModalActivity(null)}
                className="px-4 py-2 text-xs font-semibold text-[#71716A] hover:text-[#1A1A1A]"
              >
                Cancel
              </button>
              <button
                disabled={!activeTrip}
                onClick={handleConfirmAdd}
                className="px-5 py-2 bg-[#CC5500] hover:bg-[#B34A00] text-white rounded-xs text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors"
              >
                Confirm Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
