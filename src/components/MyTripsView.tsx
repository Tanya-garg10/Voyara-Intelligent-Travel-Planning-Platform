import React, { useState } from 'react';
import {
  Luggage,
  Plus,
  Calendar,
  MapPin,
  Trash2,
  Copy,
  Share2,
  DollarSign,
  ArrowRight,
  Sparkles,
  Clock,
  Search,
  CheckCircle2,
  Download
} from 'lucide-react';
import { Trip, ViewType } from '../types';
import { calculateDurationDays, formatDate } from '../utils/dateUtils';
import { calculateTripFinancials } from '../utils/budgetCalculations';
import { formatCurrency, SupportedCurrency } from '../utils/currency';

interface MyTripsViewProps {
  trips: Trip[];
  activeTrip: Trip | null;
  onSelectTrip: (trip: Trip) => void;
  onOpenCreateTrip: () => void;
  onDeleteTrip: (tripId: string) => void;
  onDuplicateTrip: (trip: Trip) => void;
  onNavigateToBuilder: (trip: Trip) => void;
  onOpenShareModal: (trip: Trip) => void;
  onOpenExportModal?: (trip: Trip) => void;
  currency?: SupportedCurrency;
}

export const MyTripsView: React.FC<MyTripsViewProps> = ({
  trips,
  activeTrip,
  onSelectTrip,
  onOpenCreateTrip,
  onDeleteTrip,
  onDuplicateTrip,
  onNavigateToBuilder,
  onOpenShareModal,
  onOpenExportModal,
  currency = 'INR',
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTrips = trips.filter((t) => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.stops.some((s) => s.cityName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] p-6 sm:p-10 rounded-3xl border border-[#E7E5E4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#C2410C] flex items-center gap-1.5 mb-1">
            <Luggage className="w-3.5 h-3.5" />
            Curated Itineraries Archive
          </span>
          <h1 className="font-editorial-serif text-3xl sm:text-5xl font-bold text-[#1C1917] tracking-tight">
            My Travel Itineraries ({trips.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1.5 max-w-xl leading-relaxed">
            Manage, duplicate, re-sequence, and share your multi-city journeys with synchronized route mapping and live budgets.
          </p>
        </div>

        <button
          id="create-trip-from-my-trips-btn"
          onClick={onOpenCreateTrip}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#C2410C] hover:bg-[#9A3412] active:scale-98 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Journey</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'upcoming', 'planning', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                filterStatus === status
                  ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-xs'
                  : 'bg-white text-[#78716C] border-[#E7E5E4] hover:text-[#1C1917] hover:bg-[#F5F4F0]'
              }`}
            >
              {status} (
              {status === 'all'
                ? trips.length
                : trips.filter((t) => t.status === status).length}
              )
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search trips or cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#E7E5E4] rounded-full focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] text-[#1C1917] placeholder:text-[#A8A29E] shadow-xs"
          />
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.map((trip) => {
            const financials = calculateTripFinancials(trip);
            const isCurrent = activeTrip?.id === trip.id;

            return (
              <div
                key={trip.id}
                id={`trip-card-fleet-${trip.id}`}
                className={`group bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 duration-300 ${
                  isCurrent
                    ? 'border-[#C2410C] ring-2 ring-[#C2410C]/20 shadow-md'
                    : 'border-[#E7E5E4]'
                }`}
              >
                <div>
                  {/* Large Cover Image with Hover Zoom */}
                  <div className="relative h-56 overflow-hidden bg-stone-100">
                    <img
                      src={trip.coverImage}
                      alt={trip.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/30 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-[#C2410C] border border-[#C2410C]/30">
                        {trip.status}
                      </span>
                      {trip.isPublic && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-800/80 text-emerald-100 backdrop-blur-md">
                          Published
                        </span>
                      )}
                    </div>

                    {/* Bottom overlay text */}
                    <div className="absolute bottom-3.5 inset-x-4 text-white">
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {formatDate(trip.startDate, 'short')} – {formatDate(trip.endDate, 'short')} ({financials.daysCount}d)
                        </span>
                      </div>
                      <h3 className="font-editorial-serif text-2xl font-bold tracking-tight text-white line-clamp-1">
                        {trip.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-[#78716C] line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>

                    {/* Connected Route Waypoints */}
                    <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-[#E7E5E4] text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C] block mb-1.5">
                        Route Flow ({trip.stops.length} Stops)
                      </span>
                      <div className="flex flex-wrap items-center gap-1 text-xs">
                        {trip.stops.map((s, i) => (
                          <React.Fragment key={s.id}>
                            <span className="font-semibold text-[#1C1917]">{s.cityName}</span>
                            {i < trip.stops.length - 1 && (
                              <span className="text-[#C2410C] font-bold">→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Budget & Progress Indicator */}
                    <div className="space-y-1.5 pt-1 border-t border-[#E7E5E4]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#78716C]">
                          {trip.stops.reduce((sum, s) => sum + s.activities.length, 0)} Experiences
                        </span>
                        <span className="font-bold text-[#1C1917]">
                          {formatCurrency(financials.totalEstimatedCost, currency)}
                          <span className="text-[11px] font-normal text-[#78716C]">
                            {' '}
                            / {formatCurrency(trip.totalBudget, currency)}
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#F5F4F0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#C2410C] transition-all duration-500"
                          style={{ width: `${Math.min(100, financials.percentUsed)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="p-6 pt-0 space-y-3">
                  <button
                    id={`open-trip-builder-${trip.id}`}
                    onClick={() => {
                      onSelectTrip(trip);
                      onNavigateToBuilder(trip);
                    }}
                    className="w-full py-3 bg-[#1C1917] hover:bg-[#C2410C] active:scale-98 text-white rounded-2xl text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group/btn"
                  >
                    <span>Inspect & Build Itinerary</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" />
                  </button>

                  <div className="flex items-center justify-between pt-1 text-xs text-[#78716C]">
                    <div className="flex items-center gap-1.5">
                      {onOpenExportModal && (
                        <button
                          id={`export-trip-card-${trip.id}`}
                          onClick={() => onOpenExportModal(trip)}
                          className="p-2 hover:text-[#C2410C] hover:bg-[#FFF7ED] rounded-xl transition-colors cursor-pointer text-[#78716C]"
                          title="Export to PDF / JSON"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDuplicateTrip(trip)}
                        className="p-2 hover:text-[#1C1917] hover:bg-[#F5F4F0] rounded-xl transition-colors cursor-pointer"
                        title="Duplicate Trip"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenShareModal(trip)}
                        className="p-2 hover:text-[#1C1917] hover:bg-[#F5F4F0] rounded-xl transition-colors cursor-pointer"
                        title="Share Public Link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${trip.title}"?`)) {
                          onDeleteTrip(trip.id);
                        }
                      }}
                      className="p-2 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-[#78716C]"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-[#E7E5E4] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF7ED] text-[#C2410C] mx-auto flex items-center justify-center shadow-xs">
            <Luggage className="w-8 h-8" />
          </div>
          <h3 className="font-editorial-serif text-2xl font-bold text-[#1C1917]">
            No Journeys Found
          </h3>
          <p className="text-xs sm:text-sm text-[#78716C] max-w-md mx-auto">
            Ready to design your next journey? Create an itinerary from scratch with synchronized route optimization.
          </p>
          <button
            onClick={onOpenCreateTrip}
            className="px-6 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-2xl text-xs font-bold transition-all shadow-md"
          >
            Plan New Journey
          </button>
        </div>
      )}
    </div>
  );
};
