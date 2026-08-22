import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Compass,
  Star,
  DollarSign,
  Heart,
  Plus,
  Filter,
  Check,
  Sparkles,
  ExternalLink,
  Sun,
  X,
  ArrowRight,
  Globe2
} from 'lucide-react';
import { Destination, Trip, User, ViewType } from '../types';
import { POPULAR_DESTINATIONS } from '../data/mockData';
import { formatCurrency, SupportedCurrency } from '../utils/currency';

interface DestinationExplorerProps {
  onAddDestinationToTrip: (dest: Destination) => void;
  activeTrip: Trip | null;
  currentUser: User | null;
  onToggleSaveDestination: (destId: string) => void;
  currency?: SupportedCurrency;
  onNavigate?: (view: ViewType) => void;
}

export const DestinationExplorer: React.FC<DestinationExplorerProps> = ({
  onAddDestinationToTrip,
  activeTrip,
  currentUser,
  onToggleSaveDestination,
  currency = 'INR',
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [selectedCostIndex, setSelectedCostIndex] = useState('All');
  const [selectedDestinationForModal, setSelectedDestinationForModal] =
    useState<Destination | null>(null);

  const continents = ['All', 'Asia', 'Europe', 'Americas'];
  const costLevels = ['All', 'budget', 'moderate', 'luxury'];

  const filteredDestinations = POPULAR_DESTINATIONS.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesContinent =
      selectedContinent === 'All' || d.continent === selectedContinent;
    const matchesCost =
      selectedCostIndex === 'All' || d.costIndex === selectedCostIndex;

    return matchesSearch && matchesContinent && matchesCost;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Search and Filters Header */}
      <div className="bg-[#FFFFFF] p-6 sm:p-10 rounded-3xl border border-[#E7E5E4] shadow-xs space-y-6">
        {/* Explore Hub Switcher Pills */}
        <div className="flex items-center gap-2 p-1 bg-[#F5F4F0] rounded-2xl w-fit border border-[#E7E5E4]">
          <button
            id="tab-explore-cities"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1C1917] text-white shadow-xs flex items-center gap-2"
          >
            <MapPin className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>1. City & Destination Search</span>
          </button>
          {onNavigate && (
            <button
              id="tab-explore-activities"
              onClick={() => onNavigate('activities')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#78716C]" />
              <span>2. Experience & Activity Search</span>
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#C2410C] flex items-center gap-1.5 mb-1">
              <Compass className="w-3.5 h-3.5" />
              Worldwide Destination Index
            </span>
            <h1 className="font-editorial-serif text-3xl sm:text-5xl font-bold text-[#1C1917] tracking-tight">
              Explore Cities & Cultural Havens
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1.5 max-w-xl">
              Filter by continent, budget tier, or travel style to curate your next multi-city journey.
            </p>
          </div>

          {activeTrip && (
            <div className="bg-[#FFF7ED] p-4 rounded-2xl border border-[#FED7AA] text-xs">
              <span className="text-[#C2410C] block text-[10px] font-bold uppercase tracking-wider">
                Active Itinerary Target:
              </span>
              <p className="font-bold text-[#1C1917] truncate max-w-[200px]">
                {activeTrip.title}
              </p>
            </div>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative w-full sm:grow">
            <Search className="w-4 h-4 text-[#78716C] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="destination-search-bar"
              type="text"
              placeholder="Search by city, country or vibe (e.g. Udaipur, Kyoto, Paris, Amalfi)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl text-xs font-medium text-[#1C1917] focus:bg-white focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] placeholder:text-[#A8A29E] shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Continent filter */}
            <select
              id="filter-continent-select"
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
              className="px-4 py-3 bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
            >
              {continents.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Continents' : c}
                </option>
              ))}
            </select>

            {/* Cost Index filter */}
            <select
              id="filter-cost-select"
              value={selectedCostIndex}
              onChange={(e) => setSelectedCostIndex(e.target.value)}
              className="px-4 py-3 bg-[#FBFBFA] border border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
            >
              {costLevels.map((l) => (
                <option key={l} value={l}>
                  {l === 'All'
                    ? 'All Budgets'
                    : `${l.charAt(0).toUpperCase() + l.slice(1)} Tier`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDestinations.map((dest) => {
          const isSaved = currentUser?.savedDestinations?.includes(dest.id);
          const alreadyInActiveTrip = activeTrip?.stops.some(
            (s) => s.cityName.toLowerCase() === dest.name.toLowerCase()
          );

          return (
            <div
              key={dest.id}
              onClick={() => setSelectedDestinationForModal(dest)}
              className="group bg-white rounded-3xl border border-[#E7E5E4] overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Hero Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                  {/* Top Wishlist Heart */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSaveDestination(dest.id);
                    }}
                    className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all ${
                      isSaved
                        ? 'bg-[#C2410C] text-white'
                        : 'bg-black/40 hover:bg-black/60 text-white'
                    }`}
                    title={isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>

                  {/* Bottom Image Overlay */}
                  <div className="absolute bottom-3.5 inset-x-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block">
                      {dest.country} • {dest.continent}
                    </span>
                    <h3 className="font-editorial-serif text-2xl font-bold">{dest.name}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <p className="text-xs text-[#78716C] line-clamp-2 leading-relaxed">
                    {dest.shortDescription}
                  </p>

                  {/* Tag Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {dest.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full bg-[#F5F4F0] text-[10px] font-semibold text-[#1C1917]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Pricing and Season Meta */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#E7E5E4] text-xs">
                    <div>
                      <span className="text-[10px] text-[#78716C] block">Average Outlay</span>
                      <span className="font-editorial-serif font-bold text-base text-[#1C1917]">
                        {formatCurrency(dest.averageDailyCost, currency)}
                        <span className="text-xs font-normal text-[#78716C]"> / day</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#78716C] block">Best Window</span>
                      <span className="font-semibold text-xs text-[#C2410C]">
                        {dest.bestTimeToVisit.split('&')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-6 pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!alreadyInActiveTrip) {
                      onAddDestinationToTrip(dest);
                    }
                  }}
                  disabled={alreadyInActiveTrip}
                  className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    alreadyInActiveTrip
                      ? 'bg-[#F5F4F0] text-[#78716C] cursor-not-allowed'
                      : 'bg-[#1C1917] hover:bg-[#C2410C] active:scale-98 text-white shadow-xs'
                  }`}
                >
                  {alreadyInActiveTrip ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>In Active Itinerary</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Itinerary</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Destination Detail Modal */}
      {selectedDestinationForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E7E5E4] overflow-hidden my-8 max-h-[85vh] flex flex-col">
            {/* Modal Image Header */}
            <div className="relative h-64 bg-stone-900 shrink-0">
              <img
                src={selectedDestinationForModal.imageUrl}
                alt={selectedDestinationForModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/40 to-transparent"></div>

              <button
                onClick={() => setSelectedDestinationForModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 inset-x-6 text-white">
                <span className="text-xs uppercase font-bold tracking-wider text-amber-300 block">
                  {selectedDestinationForModal.country} • {selectedDestinationForModal.continent}
                </span>
                <h3 className="font-editorial-serif text-3xl font-bold">
                  {selectedDestinationForModal.name}
                </h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-5 overflow-y-auto grow">
              <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
                {selectedDestinationForModal.fullDescription ||
                  selectedDestinationForModal.shortDescription}
              </p>

              {/* Highlights */}
              <div className="space-y-3">
                <h4 className="font-editorial-serif text-lg font-bold text-[#1C1917]">
                  Curator Highlights & Signature Spots
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedDestinationForModal.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#FBFBFA] rounded-2xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 bg-[#FBFBFA] border-t border-[#E7E5E4] flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-[#78716C] block">Average Outlay</span>
                <span className="font-editorial-serif font-bold text-base text-[#1C1917]">
                  {formatCurrency(selectedDestinationForModal.averageDailyCost, currency)} / day
                </span>
              </div>

              <button
                onClick={() => {
                  onAddDestinationToTrip(selectedDestinationForModal);
                  setSelectedDestinationForModal(null);
                }}
                className="px-6 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add {selectedDestinationForModal.name} to Trip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
