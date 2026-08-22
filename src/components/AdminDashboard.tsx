import React from 'react';
import {
  ShieldAlert,
  Users,
  Luggage,
  TrendingUp,
  DollarSign,
  Compass,
  Activity,
  BarChart3,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Trip, User } from '../types';
import { POPULAR_DESTINATIONS, CATALOG_ACTIVITIES } from '../data/mockData';
import { formatDate } from '../utils/dateUtils';

interface AdminDashboardProps {
  trips: Trip[];
  currentUser: User | null;
  onNavigateToTrip: (trip: Trip) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  trips,
  currentUser,
  onNavigateToTrip,
}) => {
  // Aggregate platform metrics
  const totalTripsCount = trips.length + 184; // Add realistic platform volume
  const totalUsersCount = 1420;
  const avgTripBudget = Math.round(
    trips.reduce((sum, t) => sum + t.totalBudget, 0) / Math.max(1, trips.length)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white p-6 sm:p-8 rounded-md border border-[#2D2D2D] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] text-[#CC5500] mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-[#CC5500]" />
            <span>Platform Administration & Fleet Intelligence</span>
          </div>
          <h1 className="font-editorial-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            System & Fleet Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#A0A09A] mt-1">
            Real-time itinerary telemetry, destination booking trends, and financial flows
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#242424] px-3.5 py-2 rounded-xs border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-mono text-emerald-300 text-[11px] font-bold uppercase tracking-[1px]">ALL SYSTEMS LIVE</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-md border border-[#E5E4DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#71716A]">
              Registered Travelers
            </span>
            <Users className="w-4 h-4 text-[#CC5500]" />
          </div>
          <p className="font-editorial-serif text-3xl font-bold text-[#1A1A1A]">{totalUsersCount}</p>
          <p className="text-xs text-emerald-700 font-semibold">+18.4% month-over-month</p>
        </div>

        <div className="bg-white p-6 rounded-md border border-[#E5E4DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#71716A]">
              Multi-City Itineraries
            </span>
            <Luggage className="w-4 h-4 text-[#CC5500]" />
          </div>
          <p className="font-editorial-serif text-3xl font-bold text-[#1A1A1A]">{totalTripsCount}</p>
          <p className="text-xs text-[#71716A]">92% include 3+ stops</p>
        </div>

        <div className="bg-white p-6 rounded-md border border-[#E5E4DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#71716A]">
              Avg. Planned Budget
            </span>
            <DollarSign className="w-4 h-4 text-[#CC5500]" />
          </div>
          <p className="font-editorial-serif text-3xl font-bold text-[#1A1A1A]">${avgTripBudget}</p>
          <p className="text-xs text-[#71716A]">Avg. duration: 8.4 days</p>
        </div>

        <div className="bg-white p-6 rounded-md border border-[#E5E4DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#71716A]">
              Catalog Experiences
            </span>
            <Activity className="w-4 h-4 text-[#CC5500]" />
          </div>
          <p className="font-editorial-serif text-3xl font-bold text-[#1A1A1A]">{CATALOG_ACTIVITIES.length + 80}</p>
          <p className="text-xs text-[#71716A]">Across 12 worldwide hubs</p>
        </div>
      </div>

      {/* Top Destinations and Activities Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Destinations Ranking */}
        <div className="bg-white p-6 sm:p-8 rounded-md border border-[#E5E4DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial-serif text-xl font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#CC5500]" />
              <span>Top Booked Destinations</span>
            </h3>
            <span className="text-xs text-[#71716A] font-medium">Ranked by Trips</span>
          </div>

          <div className="space-y-3">
            {POPULAR_DESTINATIONS.slice(0, 5).map((dest, idx) => (
              <div
                key={dest.id}
                className="p-3 bg-[#F9F8F6] rounded-xs border border-[#E5E4DF] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-xs bg-[#1A1A1A] text-[#CC5500] font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-10 h-10 rounded-xs object-cover"
                  />
                  <div>
                    <h4 className="font-editorial-serif font-bold text-sm text-[#1A1A1A]">{dest.name}</h4>
                    <p className="text-[11px] text-[#71716A]">{dest.country} • {dest.costIndex} tier</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-editorial-serif font-bold text-sm text-[#1A1A1A]">${dest.averageDailyCost}</span>
                  <span className="text-[10px] text-[#71716A] block">Avg. Index/Day</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Activity Bookings */}
        <div className="bg-white p-6 sm:p-8 rounded-md border border-[#E5E4DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial-serif text-xl font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#CC5500]" />
              <span>Highest Rated Experiences</span>
            </h3>
            <span className="text-xs text-[#71716A] font-medium">By Review Metric</span>
          </div>

          <div className="space-y-3">
            {CATALOG_ACTIVITIES.slice(0, 5).map((act, idx) => (
              <div
                key={act.id}
                className="p-3 bg-[#F9F8F6] rounded-xs border border-[#E5E4DF] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="w-6 h-6 rounded-xs bg-[#CC5500] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <h4 className="font-editorial-serif font-bold text-sm text-[#1A1A1A] truncate">{act.title}</h4>
                    <p className="text-[11px] text-[#71716A]">
                      {act.cityName} • ★ {act.rating} ({act.reviewCount} reviews)
                    </p>
                  </div>
                </div>
                <span className="font-editorial-serif font-bold text-sm text-[#1A1A1A] shrink-0">${act.cost}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-white p-6 sm:p-8 rounded-md border border-[#E5E4DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="font-editorial-serif text-2xl font-bold text-[#1A1A1A] tracking-tight">
          Active Fleet Trips ({trips.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E4DF] bg-[#F9F8F6] text-[#71716A] uppercase text-[10px] font-bold">
                <th className="py-3 px-3">Trip Title</th>
                <th className="py-3 px-3">Dates</th>
                <th className="py-3 px-3">Destinations</th>
                <th className="py-3 px-3">Budget Target</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E4DF]">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-[#F9F8F6] transition-colors">
                  <td className="py-3 px-3 font-editorial-serif font-bold text-sm text-[#1A1A1A]">{trip.title}</td>
                  <td className="py-3 px-3 text-[#71716A]">
                    {formatDate(trip.startDate, 'short')} – {formatDate(trip.endDate, 'short')}
                  </td>
                  <td className="py-3 px-3 text-[#1A1A1A]">
                    {trip.stops.map((s) => s.cityName).join(', ')}
                  </td>
                  <td className="py-3 px-3 font-editorial-serif font-bold text-sm text-[#1A1A1A]">${trip.totalBudget}</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-[1px] bg-[#F0EDE8] text-[#1A1A1A] border border-[#E5E4DF]">
                      {trip.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigateToTrip(trip)}
                      className="text-xs font-semibold text-[#CC5500] hover:underline"
                    >
                      Inspect Itinerary →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
