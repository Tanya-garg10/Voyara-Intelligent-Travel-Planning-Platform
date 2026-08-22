import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  Circle,
  Share2,
  Sparkles,
  Plane,
  Train,
  Car,
  FileText,
  ChevronRight,
  Info,
  Download
} from 'lucide-react';
import { Trip, TripActivity } from '../types';
import { calculateDurationDays, formatDate, formatTime, getDaysArray } from '../utils/dateUtils';
import { calculateTripFinancials } from '../utils/budgetCalculations';
import { formatCurrency, SupportedCurrency } from '../utils/currency';
import { ViewType } from '../types';

interface ItineraryViewProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onOpenShareModal: () => void;
  onOpenExportModal?: () => void;
  currency?: SupportedCurrency;
  onNavigateToView?: (view: ViewType) => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  trip,
  onUpdateTrip,
  onOpenShareModal,
  onOpenExportModal,
  currency = 'INR',
  onNavigateToView,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const financials = calculateTripFinancials(trip);
  const allDays = getDaysArray(trip.startDate, trip.endDate);

  // Group activities and stops by day date
  const daySchedule = allDays.map((dayDate, index) => {
    // Find matching stop(s) active on this day
    const activeStops = trip.stops.filter((s) => {
      const start = s.arrivalDate;
      const end = s.departureDate;
      return dayDate >= start && dayDate <= end;
    });

    const primaryStop = activeStops[0] || trip.stops[0];

    // Find all activities scheduled for this day across stops
    const dayActivities: { activity: TripActivity; stopId: string; cityName: string }[] = [];
    trip.stops.forEach((stop) => {
      stop.activities.forEach((act) => {
        if (act.date === dayDate) {
          dayActivities.push({ activity: act, stopId: stop.id, cityName: stop.cityName });
        }
      });
    });

    // Sort day activities chronologically by time
    dayActivities.sort((a, b) => (a.activity.time || '00:00').localeCompare(b.activity.time || '00:00'));

    const dayCost =
      dayActivities.reduce((sum, item) => sum + (item.activity.cost || 0), 0) +
      (primaryStop?.accommodationCost ? Math.round(primaryStop.accommodationCost / Math.max(1, calculateDurationDays(primaryStop.arrivalDate, primaryStop.departureDate))) : 0);

    return {
      dayNumber: index + 1,
      date: dayDate,
      cityName: primaryStop?.cityName || 'In Transit',
      country: primaryStop?.country || '',
      stop: primaryStop,
      activities: dayActivities,
      estimatedDayCost: dayCost,
    };
  });

  const toggleActivityComplete = (stopId: string, activityId: string) => {
    const newStops = trip.stops.map((stop) => {
      if (stop.id === stopId) {
        return {
          ...stop,
          activities: stop.activities.map((a) =>
            a.id === activityId ? { ...a, completed: !a.completed } : a
          ),
        };
      }
      return stop;
    });
    onUpdateTrip({ ...trip, stops: newStops });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-[#C2410C] mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Master Itinerary Schedule (Day-wise View)</span>
          </div>
          <h1 className="font-editorial-serif text-3xl font-bold text-[#1C1917] tracking-tight">{trip.title}</h1>
          <p className="text-xs text-[#78716C] mt-1">
            {financials.daysCount} Days ({formatDate(trip.startDate, 'medium')} – {formatDate(trip.endDate, 'medium')}) • {trip.stops.length} Destination Hubs
          </p>
        </div>

        {/* View mode toggle and share */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#F5F4F0] p-1 rounded-2xl border border-[#E7E5E4]">
            <button
              id="view-mode-list-btn"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-[#1C1917] shadow-xs border border-[#E7E5E4]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              id="view-mode-timeline-btn"
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-[#1C1917] shadow-xs border border-[#E7E5E4]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Timeline View</span>
            </button>
          </div>

          <button
            id="itinerary-view-export-btn"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#F5F4F0] text-[#1C1917] border border-[#E7E5E4] rounded-2xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Export itinerary to PDF or JSON for offline access"
          >
            <Download className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Export (PDF / JSON)</span>
          </button>

          <button
            id="share-day-itinerary-btn"
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-2xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-white" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Mode View Switcher Strip */}
      {onNavigateToView && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none p-1.5 bg-[#F5F4F0] rounded-2xl border border-[#E7E5E4]">
          <button
            onClick={() => onNavigateToView('itinerary-builder')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-all"
          >
            <span>Builder & Stops</span>
          </button>
          <button
            onClick={() => onNavigateToView('itinerary-day')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#1C1917] text-white shadow-xs"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Day-wise Itinerary</span>
          </button>
          <button
            onClick={() => onNavigateToView('timeline')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-all"
          >
            <span>Timeline Flow</span>
          </button>
          <button
            onClick={() => onNavigateToView('budget')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-all"
          >
            <span>Cost & Budget Breakdown</span>
          </button>
          <button
            onClick={() => onNavigateToView('map-route')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-all"
          >
            <span>Interactive Route Map</span>
          </button>
        </div>
      )}

      {/* Day Selector Quick Nav */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedDayIndex(null)}
          className={`px-3 py-1.5 rounded-xs text-xs font-semibold shrink-0 transition-colors border ${
            selectedDayIndex === null
              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
              : 'bg-white text-[#71716A] border-[#E5E4DF] hover:text-[#1A1A1A] hover:bg-[#F9F8F6]'
          }`}
        >
          All Days ({daySchedule.length})
        </button>
        {daySchedule.map((day, idx) => (
          <button
            key={day.date}
            id={`day-nav-pill-${day.dayNumber}`}
            onClick={() => setSelectedDayIndex(idx)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-semibold shrink-0 transition-colors border ${
              selectedDayIndex === idx
                ? 'bg-[#CC5500] text-white border-[#CC5500]'
                : 'bg-white text-[#71716A] border-[#E5E4DF] hover:border-[#CC5500]/50 hover:text-[#1A1A1A]'
            }`}
          >
            <span>Day {day.dayNumber}</span>
            <span className="text-[10px] opacity-75 font-normal">({day.cityName})</span>
          </button>
        ))}
      </div>

      {/* Day Cards List */}
      <div className="space-y-6">
        {daySchedule
          .filter((_, idx) => selectedDayIndex === null || selectedDayIndex === idx)
          .map((day) => (
            <div
              key={day.date}
              id={`itinerary-day-${day.dayNumber}`}
              className="bg-white rounded-md border border-[#E5E4DF] shadow-xs overflow-hidden"
            >
              {/* Day Header */}
              <div className="p-5 border-b border-[#E5E4DF] bg-[#F9F8F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xs bg-[#1A1A1A] text-white font-bold flex flex-col items-center justify-center leading-none shadow-xs">
                    <span className="text-[9px] uppercase font-bold text-[#A0A09A]">Day</span>
                    <span className="text-base font-editorial-serif">{day.dayNumber}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-editorial-serif text-lg font-bold text-[#1A1A1A] tracking-tight">
                        {formatDate(day.date, 'full')}
                      </h2>
                    </div>
                    <p className="text-xs font-semibold text-[#CC5500] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#CC5500]" />
                      {day.cityName} {day.country ? `• ${day.country}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs self-end sm:self-center">
                  <span className="bg-[#E7E5E4]/60 text-[#1C1917] px-3 py-1 rounded-full font-medium">
                    {day.activities.length} {day.activities.length === 1 ? 'experience' : 'experiences'}
                  </span>
                  <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] px-3 py-1 rounded-full font-bold">
                    {formatCurrency(day.estimatedDayCost, currency)} estimated
                  </span>
                </div>
              </div>

              {/* Day Activities & Schedule */}
              <div className="p-5 sm:p-6 space-y-4">
                {day.activities.length > 0 ? (
                  <div className="space-y-3">
                    {day.activities.map((item) => {
                      const act = item.activity;
                      return (
                        <div
                          key={act.id}
                          className={`p-4 rounded-xs border transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                            act.completed
                              ? 'bg-[#F9F8F6] border-[#E5E4DF] opacity-60'
                              : 'bg-white border-[#E5E4DF] hover:border-[#CC5500]/50 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleActivityComplete(item.stopId, act.id)}
                              className="mt-1 text-[#71716A] hover:text-[#CC5500] transition-colors shrink-0"
                            >
                              {act.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                              ) : (
                                <Circle className="w-5 h-5 text-[#E5E4DF]" />
                              )}
                            </button>

                            {/* Image if available */}
                            {act.imageUrl && (
                              <img
                                src={act.imageUrl}
                                alt={act.title}
                                className="w-16 h-16 rounded-xs object-cover shrink-0 hidden sm:block border border-[#E5E4DF]"
                              />
                            )}

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[9px] font-bold uppercase tracking-[1px] px-2 py-0.5 rounded-xs bg-[#F0EDE8] text-[#1A1A1A]">
                                  {act.category}
                                </span>
                                <span className="text-xs font-semibold text-[#CC5500] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#CC5500]" />
                                  {formatTime(act.time)}
                                </span>
                                <span className="text-xs text-[#71716A]">({act.durationMinutes} mins)</span>
                              </div>

                              <h3
                                className={`font-editorial-serif text-base font-bold text-[#1A1A1A] ${
                                  act.completed ? 'line-through text-[#71716A]' : ''
                                }`}
                              >
                                {act.title}
                              </h3>

                              <p className="text-xs text-[#71716A] flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#71716A]" />
                                {act.location}
                              </p>

                              {act.notes && (
                                <p className="text-xs text-[#1A1A1A] bg-[#F9F8F6] px-2.5 py-1 rounded-xs border border-[#E5E4DF] inline-block mt-1">
                                  💡 Note: {act.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1 shrink-0 pl-8 sm:pl-0">
                            <span className="font-editorial-serif font-bold text-sm text-[#1C1917]">
                              {act.cost > 0 ? formatCurrency(act.cost, currency) : 'Free'}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.5px] text-[#78716C]">
                              {act.completed ? 'Completed' : 'Planned'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xs bg-[#F9F8F6] border border-dashed border-[#E5E4DF]">
                    <p className="text-xs text-[#71716A] font-medium">
                      Free exploration and leisure day in {day.cityName}. No fixed bookings scheduled.
                    </p>
                  </div>
                )}

                {/* Day Notes & Accommodation reminder */}
                {day.stop && (
                  <div className="p-3 rounded-xs bg-[#F9F8F6] border border-[#E5E4DF] flex items-center justify-between text-xs text-[#71716A]">
                    <span className="flex items-center gap-1.5 font-medium text-[#1A1A1A]">
                      <FileText className="w-3.5 h-3.5 text-[#71716A]" />
                      Stay: {day.stop.accommodationName || `${day.cityName} Hotel`}
                    </span>
                    <span className="font-semibold text-[#1A1A1A]">
                      ${day.stop.accommodationCost} total stay
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
