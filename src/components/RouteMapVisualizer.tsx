import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  ArrowRight,
  Plane,
  Train,
  Car,
  Calendar,
  DollarSign,
  Activity,
  Layers,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { Trip, TripStop } from '../types';
import { calculateDurationDays, formatDate } from '../utils/dateUtils';

interface RouteMapVisualizerProps {
  trip?: Trip | null;
  stops?: TripStop[];
  onSelectStop?: (stop: TripStop) => void;
}

export const RouteMapVisualizer: React.FC<RouteMapVisualizerProps> = ({ trip, stops: propStops, onSelectStop }) => {
  const stops = propStops || trip?.stops || [];
  const [selectedStopId, setSelectedStopId] = useState<string>(stops[0]?.id || '');

  const selectedStop = stops.find((s) => s.id === selectedStopId) || stops[0] || null;

  // Calculate SVG projection coordinates from lat/lng
  // Normalize stops to fit dynamically inside the 800x450 canvas
  const lats = stops.map((s) => s.coordinates?.lat ?? 26.9);
  const lngs = stops.map((s) => s.coordinates?.lng ?? 75.8);

  const minLat = lats.length > 0 ? Math.min(...lats) : 20;
  const maxLat = lats.length > 0 ? Math.max(...lats) : 35;
  const minLng = lngs.length > 0 ? Math.min(...lngs) : 70;
  const maxLng = lngs.length > 0 ? Math.max(...lngs) : 85;

  const latSpan = Math.max(0.5, maxLat - minLat);
  const lngSpan = Math.max(0.5, maxLng - minLng);

  const projectPoint = (lat: number, lng: number) => {
    // 80px padding
    const x = 100 + ((lng - minLng) / lngSpan) * 600;
    const y = 380 - ((lat - minLat) / latSpan) * 280;
    return { x, y };
  };

  const points = stops.map((s) => ({
    ...projectPoint(s.coordinates?.lat ?? 26.9, s.coordinates?.lng ?? 75.8),
    stop: s,
  }));

  const tripTitle = trip?.title || (stops.length > 0 ? `${stops[0].cityName} Expedition` : 'Multi-City Itinerary');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] text-[#C2410C] mb-1">
            <Compass className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Interactive Cartography & Route Projection</span>
          </div>
          <h1 className="font-editorial-serif text-3xl font-bold text-[#1C1917] tracking-tight">
            Journey Map: {tripTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Multi-city transit path: {stops.map((s) => s.cityName).join(' → ') || 'No waypoints defined'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[1px] bg-[#F5F4F0] text-[#1C1917] px-3.5 py-1.5 rounded-full border border-[#E7E5E4]">
            {stops.length} Connecting Waypoints
          </span>
        </div>
      </div>

      {/* Map Canvas and Selected Stop Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Route Canvas */}
        <div className="lg:col-span-2 bg-[#1A1A1A] rounded-md p-4 sm:p-6 shadow-xl border border-[#2D2D2D] relative overflow-hidden flex flex-col justify-between min-h-[440px]">
          {/* Subtle Grid Map Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#333333_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
          <div className="absolute inset-0 bg-radial from-transparent to-[#1A1A1A]/95 pointer-events-none"></div>

          {/* Map Controls & Title Overlay */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-[#242424]/90 backdrop-blur-md px-3 py-1.5 rounded-xs border border-white/10 text-white text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#CC5500] animate-ping"></span>
              <span className="font-editorial-serif tracking-wide">Waypoint Projection</span>
            </div>

            <div className="text-[10px] text-[#A0A09A] font-mono uppercase tracking-[1px]">
              Geographic Grid Matrix
            </div>
          </div>

          {/* SVG Map Drawing */}
          <div className="relative z-10 my-auto w-full aspect-16/9">
            <svg viewBox="0 0 800 450" className="w-full h-full">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#CC5500" />
                  <stop offset="50%" stopColor="#E67E22" />
                  <stop offset="100%" stopColor="#CC5500" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting Arcs */}
              {points.map((p, idx) => {
                if (idx === points.length - 1) return null;
                const nextP = points[idx + 1];
                // Curved Bezier control point
                const midX = (p.x + nextP.x) / 2;
                const midY = (p.y + nextP.y) / 2 - 30;
                const pathD = `M ${p.x} ${p.y} Q ${midX} ${midY} ${nextP.x} ${nextP.y}`;

                return (
                  <g key={`path-${idx}`}>
                    {/* Shadow path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#CC5500"
                      strokeWidth="6"
                      strokeOpacity="0.25"
                      filter="url(#glow)"
                    />
                    {/* Animated dashed path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#routeGradient)"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                      className="animate-[dash_20s_linear_infinite]"
                    />
                  </g>
                );
              })}

              {/* City Markers & Labels */}
              {points.map((p, idx) => {
                const isSelected = selectedStop?.id === p.stop.id;
                return (
                  <g
                    key={p.stop.id}
                    onClick={() => setSelectedStopId(p.stop.id)}
                    className="cursor-pointer group"
                  >
                    {/* Outer pulse */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? '22' : '16'}
                      fill="#CC5500"
                      fillOpacity={isSelected ? '0.35' : '0.15'}
                      className="transition-all duration-300"
                    />

                    {/* Main pin circle */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? '14' : '10'}
                      fill={isSelected ? '#CC5500' : '#FFFFFF'}
                      stroke="#1A1A1A"
                      strokeWidth="3"
                      className="transition-all duration-300 group-hover:scale-125"
                    />

                    {/* Sequence Number */}
                    <text
                      x={p.x}
                      y={p.y + 4}
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : '#1A1A1A'}
                      fontSize={isSelected ? '11' : '9'}
                      fontWeight="900"
                      className="pointer-events-none"
                    >
                      {idx + 1}
                    </text>

                    {/* Label */}
                    <text
                      x={p.x}
                      y={p.y - 20}
                      textAnchor="middle"
                      fill={isSelected ? '#CC5500' : '#F9F8F6'}
                      fontSize="13"
                      fontFamily="Newsreader, serif"
                      fontWeight="700"
                      className="pointer-events-none drop-shadow-md"
                    >
                      {p.stop.cityName}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Click helper banner */}
          <div className="relative z-10 bg-[#242424]/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between text-xs text-[#E7E5E4]">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#C2410C]" />
              Click any city marker to inspect stop excursions, lodging, and schedule
            </span>
            <span className="text-[#C2410C] font-semibold font-mono text-[11px] hidden sm:inline">
              Selected: {selectedStop?.cityName || 'Waypoint'}
            </span>
          </div>
        </div>

        {/* Selected City Stop Inspector Panel */}
        {selectedStop && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E5E4] shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="relative h-36 rounded-2xl overflow-hidden shadow-xs">
                <img
                  src={selectedStop.imageUrl || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'}
                  alt={selectedStop.cityName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/30 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#C2410C]">
                    Stop Dossier
                  </span>
                  <h3 className="font-editorial-serif text-xl font-bold text-white tracking-tight">
                    {selectedStop.cityName}, {selectedStop.country}
                  </h3>
                </div>
              </div>

              {/* Dates & Duration */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E7E5E4]">
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-[1px] block">Dates</span>
                  <p className="font-semibold text-[#1C1917] mt-0.5">
                    {formatDate(selectedStop.arrivalDate, 'short')} – {formatDate(selectedStop.departureDate, 'short')}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E7E5E4]">
                  <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-[1px] block">Duration</span>
                  <p className="font-editorial-serif font-bold text-sm text-[#1C1917] mt-0.5">
                    {calculateDurationDays(selectedStop.arrivalDate, selectedStop.departureDate)} Days
                  </p>
                </div>
              </div>

              {/* Accommodation */}
              <div className="p-3.5 rounded-xl bg-[#FFF7ED] border-l-3 border-[#C2410C] text-xs">
                <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#78716C] block">
                  Accommodation
                </span>
                <p className="font-semibold text-[#1C1917] mt-0.5">
                  {selectedStop.accommodationName || `${selectedStop.cityName} Heritage Stay`}
                </p>
                <p className="text-[11px] text-[#C2410C] mt-0.5 font-editorial-serif font-bold">
                  ${selectedStop.accommodationCost} total stay spend
                </p>
              </div>

              {/* Scheduled Activities */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C] block mb-2">
                  Activities in {selectedStop.cityName} ({(selectedStop.activities || []).length})
                </span>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {(selectedStop.activities || []).length > 0 ? (
                    (selectedStop.activities || []).map((a) => (
                      <div
                        key={a.id}
                        className="p-2.5 rounded-xl bg-[#FBFBFA] border border-[#E7E5E4] flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-[#1C1917] truncate">{a.title}</p>
                          <p className="text-[10px] text-[#78716C]">
                            {a.category} • {a.time} • {a.durationMinutes}m
                          </p>
                        </div>
                        <span className="font-editorial-serif font-bold text-xs text-[#1C1917] shrink-0">
                          {a.cost > 0 ? `$${a.cost}` : 'Complimentary'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#78716C] italic py-2">
                      No excursions logged for this destination yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              id="switch-to-builder-from-map-btn"
              onClick={() => onSelectStop && onSelectStop(selectedStop)}
              className="w-full py-3 bg-[#1C1917] hover:bg-[#C2410C] text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Edit {selectedStop.cityName} in Builder</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C2410C]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
