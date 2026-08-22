import React from 'react';
import {
  Compass,
  Sparkles,
  Plus,
  Calendar,
  MapPin,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Heart,
  Luggage,
  Clock,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Navigation
} from 'lucide-react';
import { Trip, User, Destination, ViewType } from '../types';
import { POPULAR_DESTINATIONS } from '../data/mockData';
import { calculateDurationDays, formatDate } from '../utils/dateUtils';
import { calculateTripFinancials } from '../utils/budgetCalculations';
import { formatCurrency, SupportedCurrency } from '../utils/currency';

interface DashboardViewProps {
  currentUser: User | null;
  trips: Trip[];
  activeTrip: Trip | null;
  onSelectTrip: (trip: Trip) => void;
  onOpenCreateTrip: () => void;
  onNavigate: (view: ViewType) => void;
  onToggleSaveDestination: (destId: string) => void;
  currency?: SupportedCurrency;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  trips,
  activeTrip,
  onSelectTrip,
  onOpenCreateTrip,
  onNavigate,
  onToggleSaveDestination,
  currency = 'INR',
}) => {
  const upcomingTrips = trips.filter((t) => t.status === 'upcoming' || t.status === 'planning');
  const heroTrip = activeTrip || upcomingTrips[0] || trips[0];
  const heroFinancials = heroTrip ? calculateTripFinancials(heroTrip) : null;

  // Calculate days remaining
  const calculateDaysRemaining = (startDateStr: string) => {
    try {
      const today = new Date();
      const start = new Date(startDateStr);
      const diffTime = start.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 14;
    }
  };

  const daysRemaining = heroTrip ? calculateDaysRemaining(heroTrip.startDate) : 0;

  // Stats across all trips
  const totalDaysTraveled = trips.reduce(
    (sum, t) => sum + (t ? calculateDurationDays(t.startDate, t.endDate) : 0),
    0
  );
  const totalCitiesExplored = new Set(
    trips.flatMap((t) => (t?.stops || []).map((s) => (s?.cityName || '').toLowerCase()))
  ).size;
  const totalExperiencesBooked = trips.reduce(
    (sum, t) => sum + (t?.stops || []).reduce((sSum, stop) => sSum + (stop?.activities || []).length, 0),
    0
  );
  const totalBudgetManagedUSD = trips.reduce((sum, t) => sum + (t?.totalBudget || 1000), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-in fade-in duration-300">
      {/* 1. Hero Section: "Where will you go next?" & Large Immersive Destination Card */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#C2410C]">
              Voyara Journey Planner
            </span>
            <h1 className="font-editorial-serif text-4xl sm:text-6xl font-normal tracking-tight text-[#1C1917] mt-1">
              Where will you go next?
            </h1>
          </div>

          <button
            id="hero-start-new-trip-cta"
            onClick={onOpenCreateTrip}
            className="self-start sm:self-auto flex items-center gap-2 bg-[#C2410C] hover:bg-[#9A3412] active:scale-98 text-white px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Itinerary</span>
          </button>
        </div>

        {/* Large Immersive Destination Card */}
        {heroTrip && heroFinancials ? (
          <div className="relative group overflow-hidden rounded-3xl border border-[#E7E5E4] shadow-xl bg-[#1C1917] min-h-[440px] sm:min-h-[500px] flex flex-col justify-between p-6 sm:p-12 transition-all">
            {/* Full-bleed destination photography */}
            <img
              src={heroTrip.coverImage || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=85'}
              alt={heroTrip.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#1C1917]/80 via-transparent to-transparent"></div>

            {/* Top Badges */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-[#FFFFFF]/90 backdrop-blur-md text-[#1C1917] text-xs font-bold shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C2410C] animate-pulse"></span>
                  Upcoming Expedition
                </span>

                {daysRemaining > 0 && (
                  <span className="px-3 py-1 rounded-full bg-[#C2410C] text-white text-xs font-bold shadow-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>In {daysRemaining} Days</span>
                  </span>
                )}
              </div>

              {/* Stops Count Pill */}
              <span className="px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-xs font-medium border border-white/10">
                {(heroTrip.stops || []).length} Destinations • {heroFinancials.daysCount} Days
              </span>
            </div>

            {/* Bottom Hero Details */}
            <div className="relative z-10 space-y-5 max-w-3xl pt-16">
              {/* Route Connecting Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-white/80 font-medium">
                {(heroTrip.stops || []).map((stop, i) => (
                  <React.Fragment key={stop.id}>
                    <span className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-md text-white font-semibold">
                      {stop.cityName}
                    </span>
                    {i < (heroTrip.stops || []).length - 1 && (
                      <span className="text-white/40 font-bold">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="space-y-2">
                <h2 className="font-editorial-serif text-3xl sm:text-5xl lg:text-6xl text-white font-bold tracking-tight leading-tight drop-shadow-sm">
                  {heroTrip.title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 max-w-2xl leading-relaxed">
                  {heroTrip.description}
                </p>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  id="hero-continue-planning-btn"
                  onClick={() => {
                    onSelectTrip(heroTrip);
                    onNavigate('itinerary-builder');
                  }}
                  className="flex items-center gap-2.5 bg-white hover:bg-stone-100 active:scale-98 text-[#1C1917] px-6 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-xl hover:shadow-2xl group/btn"
                >
                  <span>Continue Planning Itinerary</span>
                  <ArrowRight className="w-4 h-4 text-[#C2410C] group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    onSelectTrip(heroTrip);
                    onNavigate('budget');
                  }}
                  className="flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/20 px-5 py-3.5 rounded-2xl text-xs font-semibold transition-all"
                >
                  <DollarSign className="w-4 h-4 text-[#C2410C]" />
                  <span>
                    Budget: {formatCurrency(heroFinancials.totalEstimatedCost, currency)} /{' '}
                    {formatCurrency(heroTrip.totalBudget, currency)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* 2. Lifetime Travel Statistics (Airbnb/Apple inspired minimal stats bar) */}
      <section className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C2410C]" /> Total Days
            </span>
            <div className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
              {totalDaysTraveled} <span className="text-base text-[#78716C] font-sans font-normal">days</span>
            </div>
            <p className="text-[11px] text-[#78716C]">Traversed across itineraries</p>
          </div>

          <div className="space-y-1 border-l border-[#E7E5E4] pl-6 sm:pl-8">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C2410C]" /> Cities Explored
            </span>
            <div className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
              {totalCitiesExplored} <span className="text-base text-[#78716C] font-sans font-normal">cities</span>
            </div>
            <p className="text-[11px] text-[#78716C]">Unique global destinations</p>
          </div>

          <div className="space-y-1 border-l border-[#E7E5E4] pl-6 sm:pl-8">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" /> Experiences
            </span>
            <div className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
              {totalExperiencesBooked} <span className="text-base text-[#78716C] font-sans font-normal">spots</span>
            </div>
            <p className="text-[11px] text-[#78716C]">Activities scheduled</p>
          </div>

          <div className="space-y-1 border-l border-[#E7E5E4] pl-6 sm:pl-8">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#C2410C]" /> Managed Budget
            </span>
            <div className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#C2410C]">
              {formatCurrency(totalBudgetManagedUSD, currency, { compact: true })}
            </div>
            <p className="text-[11px] text-[#78716C]">Allocated travel funds</p>
          </div>
        </div>
      </section>

      {/* 3. Upcoming Trips & Budget Overview (Grid) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upcoming Trips Carousel / Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C]">
                Your Journeys
              </span>
              <h3 className="font-editorial-serif text-2xl font-bold text-[#1C1917]">
                Upcoming & Saved Trips
              </h3>
            </div>

            <button
              onClick={() => onNavigate('my-trips')}
              className="text-xs font-bold text-[#C2410C] hover:underline flex items-center gap-1"
            >
              <span>View All ({trips.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {trips.map((trip) => {
              const fin = calculateTripFinancials(trip);
              const isSelected = heroTrip?.id === trip.id;
              return (
                <div
                  key={trip.id}
                  onClick={() => onSelectTrip(trip)}
                  className={`group relative overflow-hidden rounded-2xl border bg-white p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row gap-5 items-start sm:items-center ${
                    isSelected
                      ? 'border-[#C2410C] shadow-md ring-1 ring-[#C2410C]'
                      : 'border-[#E7E5E4] hover:border-stone-300 hover:shadow-sm'
                  }`}
                >
                  <div className="relative w-full sm:w-36 h-28 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                    <img
                      src={trip.coverImage}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white font-semibold">
                      {trip.stops.length} stops
                    </span>
                  </div>

                  <div className="grow min-w-0 space-y-1.5 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#C2410C]">
                        {trip.status}
                      </span>
                      <span className="text-xs font-mono text-[#78716C]">
                        {formatDate(trip.startDate, 'short')}
                      </span>
                    </div>

                    <h4 className="font-editorial-serif font-bold text-lg text-[#1C1917] group-hover:text-[#C2410C] transition-colors truncate">
                      {trip.title}
                    </h4>

                    {/* Progress & Budget Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#78716C]">Estimated Cost</span>
                        <span className="font-semibold text-[#1C1917]">
                          {formatCurrency(fin.totalEstimatedCost, currency)} /{' '}
                          {formatCurrency(trip.totalBudget, currency)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#C2410C] transition-all duration-500"
                          style={{ width: `${Math.min(100, fin.percentUsed)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTrip(trip);
                        onNavigate('itinerary-builder');
                      }}
                      className="p-2.5 rounded-xl bg-[#F5F4F0] hover:bg-[#C2410C] hover:text-white text-[#1C1917] transition-all"
                      title="Open Builder"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Budget Overview & Recent Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Trip Budget Card */}
          {heroFinancials && heroTrip && (
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C]">
                    Financial Analytics
                  </span>
                  <h4 className="font-editorial-serif text-xl font-bold text-[#1C1917]">
                    Trip Budget Pulse
                  </h4>
                </div>
                <button
                  onClick={() => onNavigate('budget')}
                  className="text-xs font-bold text-[#C2410C] hover:underline"
                >
                  Full Breakdown →
                </button>
              </div>

              {/* Big Budget Stat */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#78716C]">Total Estimated</span>
                  <div className="font-editorial-serif text-3xl font-bold text-[#1C1917]">
                    {formatCurrency(heroFinancials.totalEstimatedCost, currency)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#78716C]">Remaining Buffer</span>
                  <div
                    className={`font-editorial-serif text-2xl font-bold ${
                      heroFinancials.isOverBudget ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {heroFinancials.isOverBudget
                      ? `-${formatCurrency(Math.abs(heroFinancials.remainingBudget), currency)}`
                      : formatCurrency(heroFinancials.remainingBudget, currency)}
                  </div>
                </div>
              </div>

              {/* Category Breakdown Bars */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-[#78716C]">
                    <span>Accommodations</span>
                    <span className="text-[#1C1917]">
                      {formatCurrency(heroFinancials.breakdown.accommodation, currency)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1C1917] rounded-full"
                      style={{
                        width: `${Math.min(100, (heroFinancials.breakdown.accommodation / heroFinancials.totalEstimatedCost) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-[#78716C]">
                    <span>Transport & Transit</span>
                    <span className="text-[#1C1917]">
                      {formatCurrency(heroFinancials.breakdown.transport, currency)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C2410C] rounded-full"
                      style={{
                        width: `${Math.min(100, (heroFinancials.breakdown.transport / heroFinancials.totalEstimatedCost) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-[#78716C]">
                    <span>Experiences & Sightseeing</span>
                    <span className="text-[#1C1917]">
                      {formatCurrency(heroFinancials.breakdown.activities, currency)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F5F4F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full"
                      style={{
                        width: `${Math.min(100, (heroFinancials.breakdown.activities / heroFinancials.totalEstimatedCost) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Timeline Feed */}
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 shadow-xs space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C] block">
              Recent Curation Log
            </span>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#C2410C] mt-1.5 shrink-0"></span>
                <div>
                  <p className="font-semibold text-[#1C1917]">
                    VIP Sunrise at Taj Mahal scheduled
                  </p>
                  <p className="text-[11px] text-[#78716C]">Agra • 05:45 AM slot confirmed</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-stone-300 mt-1.5 shrink-0"></span>
                <div>
                  <p className="font-semibold text-[#1C1917]">Gatimaan Express Train added</p>
                  <p className="text-[11px] text-[#78716C]">Delhi to Agra • Executive Coach</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-stone-300 mt-1.5 shrink-0"></span>
                <div>
                  <p className="font-semibold text-[#1C1917]">Itinerary generated & shared</p>
                  <p className="text-[11px] text-[#78716C]">Public link created for travelers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Recommended Destinations (Travel Magazine Style) */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E7E5E4] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#C2410C]">
              Curated Escapes
            </span>
            <h3 className="font-editorial-serif text-3xl font-bold text-[#1C1917]">
              Recommended Destinations
            </h3>
          </div>
          <button
            onClick={() => onNavigate('destinations')}
            className="text-xs font-bold text-[#C2410C] hover:underline flex items-center gap-1"
          >
            <span>Explore All 12+ Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Magazine Destination Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {POPULAR_DESTINATIONS.slice(0, 4).map((dest) => {
            const isSaved = currentUser?.savedDestinations?.includes(dest.id);
            return (
              <div
                key={dest.id}
                onClick={() => onNavigate('destinations')}
                className="group cursor-pointer rounded-2xl border border-[#E7E5E4] bg-white overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSaveDestination(dest.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                      isSaved
                        ? 'bg-[#C2410C] text-white'
                        : 'bg-black/40 hover:bg-black/60 text-white'
                    }`}
                    title={isSaved ? 'Saved to Wishlist' : 'Save Destination'}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block">
                      {dest.country}
                    </span>
                    <h4 className="font-editorial-serif text-xl font-bold">{dest.name}</h4>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-[#78716C] line-clamp-2 leading-relaxed">
                    {dest.shortDescription}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E7E5E4] text-xs">
                    <div>
                      <span className="text-[10px] text-[#78716C] block">Avg Daily</span>
                      <span className="font-semibold font-editorial-serif text-sm text-[#1C1917]">
                        {formatCurrency(dest.averageDailyCost, currency)}
                        <span className="text-[10px] text-[#78716C] font-normal"> /day</span>
                      </span>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#C2410C]">
                      {dest.bestTimeToVisit.split('&')[0]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
