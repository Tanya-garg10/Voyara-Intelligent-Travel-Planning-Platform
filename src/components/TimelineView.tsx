import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plane,
  Train,
  Car,
  CheckCircle2,
  Circle,
  DollarSign,
  Share2,
  Sparkles,
  ArrowDown,
  Sun,
  Sunrise,
  Sunset,
  Moon
} from 'lucide-react';
import { Trip, TripActivity } from '../types';
import { calculateDurationDays, formatDate, formatTime, getDaysArray } from '../utils/dateUtils';
import { calculateTripFinancials } from '../utils/budgetCalculations';
import { formatCurrency, SupportedCurrency } from '../utils/currency';

interface TimelineViewProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onOpenShareModal: () => void;
  currency?: SupportedCurrency;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  trip,
  onUpdateTrip,
  onOpenShareModal,
  currency = 'INR',
}) => {
  const financials = calculateTripFinancials(trip);
  const allDays = getDaysArray(trip.startDate, trip.endDate);

  const toggleActivity = (stopId: string, activityId: string) => {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 sm:p-10 rounded-3xl border border-[#E7E5E4] shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#C2410C] flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            Chronological Journey Stream
          </span>
          <h1 className="font-editorial-serif text-3xl sm:text-5xl font-bold text-[#1C1917] tracking-tight">
            {trip.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1.5">
            {allDays.length}-Day day-by-day expedition timeline from initial arrival to departure.
          </p>
        </div>

        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-2 px-5 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-2xl text-xs font-bold shadow-md transition-all self-start sm:self-center"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Timeline</span>
        </button>
      </div>

      {/* Timeline Stream with Journey Line */}
      <div className="relative pl-8 sm:pl-12 space-y-10 before:absolute before:left-4 sm:before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#E7E5E4]">
        {allDays.map((dateStr, dayIdx) => {
          const matchingStops = trip.stops.filter(
            (s) => dateStr >= s.arrivalDate && dateStr <= s.departureDate
          );
          const currentStop = matchingStops[0] || trip.stops[0];
          const arrivingStop = trip.stops.find(
            (s) => s.arrivalDate === dateStr && s.transportToStop
          );

          // Get activities for this day
          const dayActivities: { act: TripActivity; stopId: string }[] = [];
          trip.stops.forEach((s) => {
            s.activities.forEach((a) => {
              if (a.date === dateStr) {
                dayActivities.push({ act: a, stopId: s.id });
              }
            });
          });
          dayActivities.sort((a, b) =>
            (a.act.time || '00:00').localeCompare(b.act.time || '00:00')
          );

          return (
            <div key={dateStr} className="relative space-y-4">
              {/* Day Marker Node */}
              <div className="absolute -left-8 sm:-left-12 top-1 w-8 h-8 rounded-full bg-[#1C1917] text-[#C2410C] border-2 border-white shadow-md flex items-center justify-center text-xs font-bold z-10 font-mono">
                {dayIdx + 1 < 10 ? `0${dayIdx + 1}` : dayIdx + 1}
              </div>

              {/* Day Header Banner */}
              <div className="bg-[#1C1917] text-white p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-[#C2410C]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#C2410C]">
                    Day {dayIdx + 1} • {formatDate(dateStr, 'full')}
                  </span>
                  <h3 className="font-editorial-serif text-2xl font-bold text-white flex items-center gap-2 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#C2410C]" />
                    {currentStop?.cityName}, {currentStop?.country}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-stone-300">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>26°C Sunny</span>
                  </div>
                  <span className="font-medium text-white hidden sm:inline">
                    Stay: {currentStop?.accommodationName || `${currentStop?.cityName} Sanctuary`}
                  </span>
                </div>
              </div>

              {/* Intercity Transit Card if arriving today */}
              {arrivingStop && arrivingStop.transportToStop && (
                <div className="p-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#C2410C] text-white flex items-center justify-center shrink-0">
                      {arrivingStop.transportToStop.type === 'flight' && <Plane className="w-4 h-4" />}
                      {arrivingStop.transportToStop.type === 'train' && <Train className="w-4 h-4" />}
                      {arrivingStop.transportToStop.type === 'drive' && <Car className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C]">
                        Transit to {arrivingStop.cityName} ({arrivingStop.transportToStop.type.toUpperCase()})
                      </span>
                      <p className="font-bold text-[#1C1917]">
                        {arrivingStop.transportToStop.carrier || 'Express Service'}
                      </p>
                      <p className="text-[11px] text-[#78716C]">
                        Dep: {arrivingStop.transportToStop.departureTime || '09:00'} → Arr:{' '}
                        {arrivingStop.transportToStop.arrivalTime || '12:30'}
                      </p>
                    </div>
                  </div>
                  <span className="font-editorial-serif font-bold text-sm text-[#1C1917] bg-white px-3 py-1 rounded-xl border border-[#E7E5E4]">
                    {formatCurrency(arrivingStop.transportToStop.cost || 40, currency)}
                  </span>
                </div>
              )}

              {/* Day Activities */}
              <div className="space-y-3 pt-1">
                {dayActivities.length > 0 ? (
                  dayActivities.map(({ act, stopId }) => (
                    <div
                      key={act.id}
                      onClick={() => toggleActivity(stopId, act.id)}
                      className={`p-4 rounded-2xl border bg-white flex items-center justify-between gap-4 transition-all cursor-pointer ${
                        act.completed
                          ? 'border-emerald-200 bg-emerald-50/40 text-[#78716C]'
                          : 'border-[#E7E5E4] hover:border-[#C2410C]/60 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            act.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-[#C2410C] bg-white'
                          }`}
                        >
                          {act.completed && <CheckCircle2 className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#1C1917]">
                              {act.time || '10:00 AM'}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-[#C2410C]">
                              {act.category}
                            </span>
                          </div>
                          <h4
                            className={`font-editorial-serif font-bold text-base text-[#1C1917] truncate ${
                              act.completed ? 'line-through text-[#78716C]' : ''
                            }`}
                          >
                            {act.title}
                          </h4>
                          <p className="text-xs text-[#78716C] truncate">
                            {act.location} • {act.durationMinutes || 90} mins
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-editorial-serif font-bold text-sm text-[#1C1917]">
                          {formatCurrency(act.cost || 0, currency)}
                        </span>
                        <span className="text-[10px] text-[#78716C] block">Est. cost</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-[#E7E5E4] bg-[#FBFBFA] text-xs text-[#78716C] flex items-center justify-between">
                    <span>Leisure and self-paced local discovery in {currentStop?.cityName}.</span>
                    <span className="text-[10px] uppercase font-bold text-[#C2410C]">Open Day</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
