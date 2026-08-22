import React, { useState } from 'react';
import {
  Plus,
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoveUp,
  MoveDown,
  Sparkles,
  Plane,
  Train,
  Car,
  CheckCircle2,
  Circle,
  Share2,
  Edit3,
  Layers,
  AlertTriangle,
  Compass,
  Navigation,
  Sun,
  ShieldCheck,
  Tag,
  Download,
  FileText
} from 'lucide-react';
import { Trip, TripStop, TripActivity, SmartSuggestion, ViewType } from '../types';
import { calculateDurationDays, formatDate, formatTime } from '../utils/dateUtils';
import { calculateTripFinancials } from '../utils/budgetCalculations';
import { formatCurrency, SupportedCurrency } from '../utils/currency';
import { AddStopModal } from './AddStopModal';
import { AddActivityModal } from './AddActivityModal';
import { RouteMapVisualizer } from './RouteMapVisualizer';

interface ItineraryBuilderProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onOpenSmartSuggestions: () => void;
  suggestions: SmartSuggestion[];
  onOpenShareModal: () => void;
  onOpenExportModal?: () => void;
  onNavigateToView: (view: ViewType) => void;
  currency?: SupportedCurrency;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({
  trip,
  onUpdateTrip,
  onOpenSmartSuggestions,
  suggestions,
  onOpenShareModal,
  onOpenExportModal,
  onNavigateToView,
  currency = 'INR',
}) => {
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [activeStopForActivity, setActiveStopForActivity] = useState<TripStop | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string>(trip.stops[0]?.id || '');
  const [expandedStops, setExpandedStops] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    trip.stops.forEach((s) => (map[s.id] = true));
    return map;
  });

  const financials = calculateTripFinancials(trip);
  const totalActivitiesCount = trip.stops.reduce((acc, s) => acc + s.activities.length, 0);
  const selectedStop = trip.stops.find((s) => s.id === selectedStopId) || trip.stops[0];

  const toggleExpand = (stopId: string) => {
    setExpandedStops((prev) => ({ ...prev, [stopId]: !prev[stopId] }));
  };

  // Reorder Stops Up/Down
  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= trip.stops.length) return;

    const newStops = [...trip.stops];
    const [moved] = newStops.splice(index, 1);
    newStops.splice(targetIdx, 0, moved);
    newStops.forEach((s, idx) => (s.orderIndex = idx));

    onUpdateTrip({ ...trip, stops: newStops });
  };

  // Move Activity Up/Down within a Stop
  const handleMoveActivity = (stopId: string, actIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? actIdx - 1 : actIdx + 1;
    const stop = trip.stops.find((s) => s.id === stopId);
    if (!stop || targetIdx < 0 || targetIdx >= stop.activities.length) return;

    const newActs = [...stop.activities];
    const [moved] = newActs.splice(actIdx, 1);
    newActs.splice(targetIdx, 0, moved);

    const newStops = trip.stops.map((s) => (s.id === stopId ? { ...s, activities: newActs } : s));
    onUpdateTrip({ ...trip, stops: newStops });
  };

  // Add Stop
  const handleAddStop = (newStop: TripStop) => {
    const newStops = [...trip.stops, newStop];
    newStops.forEach((s, idx) => (s.orderIndex = idx));
    setExpandedStops((prev) => ({ ...prev, [newStop.id]: true }));
    setSelectedStopId(newStop.id);
    onUpdateTrip({ ...trip, stops: newStops });
  };

  // Delete Stop
  const handleDeleteStop = (stopId: string) => {
    if (trip.stops.length <= 1) {
      alert('A trip requires at least one destination stop.');
      return;
    }
    const newStops = trip.stops.filter((s) => s.id !== stopId);
    newStops.forEach((s, idx) => (s.orderIndex = idx));
    if (selectedStopId === stopId && newStops.length > 0) {
      setSelectedStopId(newStops[0].id);
    }
    onUpdateTrip({ ...trip, stops: newStops });
  };

  // Add Activity to Stop
  const handleAddActivity = (activity: TripActivity) => {
    if (!activeStopForActivity) return;
    const newStops = trip.stops.map((stop) => {
      if (stop.id === activeStopForActivity.id) {
        return {
          ...stop,
          activities: [...stop.activities, activity],
        };
      }
      return stop;
    });
    onUpdateTrip({ ...trip, stops: newStops });
  };

  // Delete Activity
  const handleDeleteActivity = (stopId: string, activityId: string) => {
    const newStops = trip.stops.map((stop) => {
      if (stop.id === stopId) {
        return {
          ...stop,
          activities: stop.activities.filter((a) => a.id !== activityId),
        };
      }
      return stop;
    });
    onUpdateTrip({ ...trip, stops: newStops });
  };

  // Toggle Activity Completion
  const handleToggleActivity = (stopId: string, activityId: string) => {
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

  const getTransportIcon = (type?: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-3.5 h-3.5" />;
      case 'train':
        return <Train className="w-3.5 h-3.5" />;
      default:
        return <Car className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. Top Itinerary Header Card */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#C2410C] bg-[#FFF7ED] px-3 py-1 rounded-full border border-[#FED7AA]">
              {trip.status} Itinerary
            </span>
            <span className="text-xs text-[#78716C] font-mono">
              {formatDate(trip.startDate, 'medium')} — {formatDate(trip.endDate, 'medium')}
            </span>
          </div>

          <h1 className="font-editorial-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1917] tracking-tight">
            {trip.title}
          </h1>

          <p className="text-xs sm:text-sm text-[#78716C] max-w-2xl leading-relaxed">
            {trip.description}
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {suggestions.length > 0 && (
            <button
              onClick={onOpenSmartSuggestions}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA] text-xs font-bold transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#C2410C]" />
              <span>{suggestions.length} Smart Suggestions</span>
            </button>
          )}

          <button
            id="builder-export-btn"
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F5F4F0] text-[#1C1917] border border-[#E7E5E4] text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Export itinerary to PDF or JSON for offline access"
          >
            <Download className="w-4 h-4 text-[#C2410C]" />
            <span>Export (PDF / JSON)</span>
          </button>

          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFFFFF] hover:bg-[#F5F4F0] text-[#1C1917] border border-[#E7E5E4] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#78716C]" />
            <span>Publish & Share</span>
          </button>

          <button
            id="add-stop-primary-btn"
            onClick={() => setIsAddStopOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination Stop</span>
          </button>
        </div>
      </div>

      {/* Mode View Switcher Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none p-1.5 bg-[#F5F4F0] rounded-2xl border border-[#E7E5E4]">
        <button
          onClick={() => onNavigateToView('itinerary-builder')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#1C1917] text-white shadow-xs"
        >
          <Layers className="w-3.5 h-3.5 text-[#C2410C]" />
          <span>Builder & Stops</span>
        </button>
        <button
          onClick={() => onNavigateToView('itinerary-day')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-all"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Day-wise Itinerary</span>
        </button>
        <button
          onClick={() => onNavigateToView('timeline')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-all"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timeline Flow</span>
        </button>
        <button
          onClick={() => onNavigateToView('budget')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-all"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Cost & Budget Breakdown</span>
        </button>
        <button
          onClick={() => onNavigateToView('map-route')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-white transition-all"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Interactive Route Map</span>
        </button>
      </div>

      {/* 2. Premium Split Layout: Left Timeline (7 cols) + Right Map/Summary Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Interactive Itinerary Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial-serif text-2xl font-bold text-[#1C1917]">
              Destination Stops & Day Timelines
            </h2>
            <span className="text-xs font-semibold text-[#78716C]">
              {trip.stops.length} Cities • {totalActivitiesCount} Experiences
            </span>
          </div>

          {/* Stops List */}
          <div className="space-y-6">
            {trip.stops.map((stop, stopIndex) => {
              const isExpanded = expandedStops[stop.id] ?? true;
              const isSelected = selectedStopId === stop.id;
              const stopDays = calculateDurationDays(stop.arrivalDate, stop.departureDate);

              return (
                <div
                  key={stop.id}
                  id={`builder-stop-${stop.id}`}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`bg-[#FFFFFF] rounded-3xl border transition-all overflow-hidden shadow-xs ${
                    isSelected ? 'border-[#C2410C] ring-2 ring-[#C2410C]/20 shadow-md' : 'border-[#E7E5E4]'
                  }`}
                >
                  {/* Visually Distinct City Section Header */}
                  <div className="relative h-44 sm:h-48 overflow-hidden bg-[#1C1917]">
                    <img
                      src={stop.imageUrl || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80'}
                      alt={stop.cityName}
                      className="w-full h-full object-cover opacity-65"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/40 to-transparent"></div>

                    {/* Top Stop Badge & Controls */}
                    <div className="absolute top-4 inset-x-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#C2410C] text-[10px] font-bold uppercase tracking-wider border border-[#C2410C]/40">
                          STOP 0{stopIndex + 1}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                          {stop.country}
                        </span>
                      </div>

                      {/* Reorder & Delete Stop */}
                      <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-xl p-1 border border-white/10 text-white">
                        <button
                          disabled={stopIndex === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveStop(stopIndex, 'up');
                          }}
                          className="p-1 hover:text-[#C2410C] disabled:opacity-30 disabled:hover:text-white"
                          title="Move Stop Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={stopIndex === trip.stops.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveStop(stopIndex, 'down');
                          }}
                          className="p-1 hover:text-[#C2410C] disabled:opacity-30 disabled:hover:text-white"
                          title="Move Stop Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-[1px] h-3 bg-white/20 mx-0.5"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove ${stop.cityName} from itinerary?`)) {
                              handleDeleteStop(stop.id);
                            }
                          }}
                          className="p-1 hover:text-rose-400"
                          title="Delete Stop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom City Name & Duration */}
                    <div className="absolute bottom-4 inset-x-4 flex items-end justify-between text-white">
                      <div>
                        <h3 className="font-editorial-serif text-3xl font-bold tracking-tight">
                          {stop.cityName}
                        </h3>
                        <p className="text-xs text-stone-300 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C2410C]" />
                          <span>
                            {formatDate(stop.arrivalDate, 'short')} → {formatDate(stop.departureDate, 'short')} ({stopDays} Days)
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(stop.id);
                        }}
                        className="p-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-all"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Stop Body & Timeline Content */}
                  {isExpanded && (
                    <div className="p-6 space-y-6">
                      {/* Stay & Transport Summary Banner */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Accommodation */}
                        <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-[#E7E5E4] space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block">
                            Stay / Accommodation
                          </span>
                          <p className="font-semibold text-[#1C1917] truncate">
                            {stop.accommodationName || `${stop.cityName} Heritage Retreat`}
                          </p>
                          <p className="text-[11px] text-[#C2410C] font-semibold">
                            {formatCurrency(stop.accommodationCost, currency)} total stay
                          </p>
                        </div>

                        {/* Transport */}
                        <div className="p-3.5 bg-[#FBFBFA] rounded-2xl border border-[#E7E5E4] space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1">
                            {getTransportIcon(stop.transportToStop?.type)}
                            <span>Transit to {stop.cityName}</span>
                          </span>
                          <p className="font-semibold text-[#1C1917] truncate">
                            {stop.transportToStop?.carrier || 'High-Speed Express Transit'}
                          </p>
                          <p className="text-[11px] text-[#78716C]">
                            {formatCurrency(stop.transportToStop?.cost || 45, currency)} •{' '}
                            {stop.transportToStop?.departureTime || '10:00 AM'}
                          </p>
                        </div>
                      </div>

                      {/* Activities Timeline */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C]">
                            Scheduled Experiences ({stop.activities.length})
                          </span>

                          <button
                            id={`add-activity-btn-${stop.id}`}
                            onClick={() => setActiveStopForActivity(stop)}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#C2410C] hover:underline"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Experience</span>
                          </button>
                        </div>

                        {stop.activities.length > 0 ? (
                          <div className="space-y-3 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-[#E7E5E4]">
                            {stop.activities.map((act, actIdx) => (
                              <div
                                key={act.id}
                                className={`relative pl-12 group transition-all`}
                              >
                                {/* Timeline Dot */}
                                <button
                                  onClick={() => handleToggleActivity(stop.id, act.id)}
                                  className={`absolute left-4 top-4 -translate-x-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                                    act.completed
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'bg-white border-[#C2410C] hover:bg-[#FFF7ED]'
                                  }`}
                                  title={act.completed ? 'Mark pending' : 'Mark completed'}
                                >
                                  {act.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </button>

                                {/* Activity Card */}
                                <div className="p-4 rounded-2xl border border-[#E7E5E4] bg-white hover:border-[#C2410C]/60 hover:shadow-sm transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                  {/* Thumbnail & Title */}
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    {act.imageUrl && (
                                      <img
                                        src={act.imageUrl}
                                        alt={act.title}
                                        className="w-14 h-14 rounded-xl object-cover border border-[#E7E5E4] shrink-0"
                                      />
                                    )}
                                    <div className="min-w-0 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md bg-[#F5F4F0] text-[#1C1917] font-mono text-[11px] font-bold">
                                          {act.time || '10:00'}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C2410C]">
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

                                  {/* Cost & Reorder Controls */}
                                  <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                                    <span className="font-editorial-serif font-bold text-base text-[#1C1917]">
                                      {formatCurrency(act.cost || 0, currency)}
                                    </span>

                                    <div className="flex items-center gap-1 text-[#78716C]">
                                      <button
                                        disabled={actIdx === 0}
                                        onClick={() => handleMoveActivity(stop.id, actIdx, 'up')}
                                        className="p-1 hover:text-[#1C1917] disabled:opacity-20"
                                        title="Move Activity Up"
                                      >
                                        <MoveUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        disabled={actIdx === stop.activities.length - 1}
                                        onClick={() => handleMoveActivity(stop.id, actIdx, 'down')}
                                        className="p-1 hover:text-[#1C1917] disabled:opacity-20"
                                        title="Move Activity Down"
                                      >
                                        <MoveDown className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteActivity(stop.id, act.id)}
                                        className="p-1 hover:text-rose-600 ml-1"
                                        title="Delete Activity"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center border-2 border-dashed border-[#E7E5E4] rounded-2xl space-y-2">
                            <Compass className="w-6 h-6 text-[#C2410C] mx-auto opacity-70" />
                            <p className="text-xs font-semibold text-[#1C1917]">
                              No experiences scheduled in {stop.cityName} yet.
                            </p>
                            <button
                              onClick={() => setActiveStopForActivity(stop)}
                              className="text-xs font-bold text-[#C2410C] hover:underline"
                            >
                              + Add First Experience
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Persistent Floating Add Stop Button */}
          <button
            onClick={() => setIsAddStopOpen(true)}
            className="w-full py-4 rounded-3xl border-2 border-dashed border-[#C2410C]/40 bg-[#FFF7ED]/40 hover:bg-[#FFF7ED] text-[#C2410C] font-bold text-xs transition-all flex items-center justify-center gap-2 hover:shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Another Destination Stop</span>
          </button>
        </div>

        {/* RIGHT: Destination / Map / Summary Sticky Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* 1. Mini Route Visualizer Map */}
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C]">
                  Route Map
                </span>
                <h3 className="font-editorial-serif text-xl font-bold text-[#1C1917]">
                  Geographic Path
                </h3>
              </div>
              <button
                onClick={() => onNavigateToView('map-route')}
                className="text-xs font-bold text-[#C2410C] hover:underline"
              >
                Expand View →
              </button>
            </div>

            {/* Visualizer Frame */}
            <div className="h-64 rounded-2xl overflow-hidden border border-[#E7E5E4]">
              <RouteMapVisualizer stops={trip.stops} />
            </div>

            {/* Quick Stop Switcher Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {trip.stops.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStopId(s.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedStopId === s.id
                      ? 'bg-[#1C1917] text-white shadow-xs'
                      : 'bg-[#F5F4F0] text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  {idx + 1}. {s.cityName}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Selected Destination Highlights & Weather Advisory */}
          {selectedStop && (
            <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7E5E4] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#C2410C]">
                    Stop Spotlight
                  </span>
                  <h4 className="font-editorial-serif text-2xl font-bold text-[#1C1917]">
                    {selectedStop.cityName}, {selectedStop.country}
                  </h4>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center font-bold text-xs">
                  {selectedStop.activities.length}
                </div>
              </div>

              {/* Local Travel Tips */}
              <div className="space-y-2.5 text-xs text-[#78716C]">
                <div className="flex items-start gap-2.5">
                  <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Optimal weather window. Comfortable morning breeze, perfect for palace photography.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Dress modestly for temples and historical havelis. Carry electronic ticket copies.
                  </span>
                </div>
              </div>

              {/* Quick Add Activity Button */}
              <button
                onClick={() => setActiveStopForActivity(selectedStop)}
                className="w-full py-2.5 bg-[#F5F4F0] hover:bg-[#C2410C] hover:text-white text-[#1C1917] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Experience to {selectedStop.cityName}</span>
              </button>
            </div>
          )}

          {/* 3. Budget Meter */}
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7E5E4] p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1C1917]">
              <span>Itinerary Budget Allocated</span>
              <span className="text-[#C2410C]">
                {formatCurrency(financials.totalEstimatedCost, currency)} /{' '}
                {formatCurrency(trip.totalBudget, currency)}
              </span>
            </div>
            <div className="w-full h-2 bg-[#F5F4F0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#C2410C]"
                style={{ width: `${Math.min(100, financials.percentUsed)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Stop Modal */}
      {isAddStopOpen && (
        <AddStopModal
          isOpen={isAddStopOpen}
          onClose={() => setIsAddStopOpen(false)}
          onAddStop={handleAddStop}
          existingStopsCount={trip.stops.length}
        />
      )}

      {/* Add Activity Modal */}
      {activeStopForActivity && (
        <AddActivityModal
          isOpen={!!activeStopForActivity}
          onClose={() => setActiveStopForActivity(null)}
          onAddActivity={handleAddActivity}
          stop={activeStopForActivity}
        />
      )}
    </div>
  );
};
