import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  User as UserIcon,
  Plus,
  BarChart3,
  Menu,
  X,
  Sparkles,
  Route,
  Activity as ActivityIcon,
  Luggage,
  ShieldCheck,
  ChevronDown,
  Globe2,
  SlidersHorizontal,
  LogOut,
  UserCheck
} from 'lucide-react';
import { ViewType, Trip, User } from '../types';
import { SupportedCurrency, CURRENCY_SYMBOLS } from '../utils/currency';

interface NavbarProps {
  activeView: ViewType;
  onNavigate?: (view: ViewType) => void;
  setActiveView?: (view: ViewType) => void;
  currentUser: User | null;
  activeTrip: Trip | null;
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onOpenCreateTrip: () => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  onLogout?: () => void;
  suggestionCount?: number;
  onOpenSmartSuggestions?: () => void;
  currentCurrency?: SupportedCurrency;
  onChangeCurrency?: (c: SupportedCurrency) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  setActiveView,
  currentUser,
  activeTrip,
  trips,
  onSelectTrip,
  onOpenCreateTrip,
  onOpenAuth,
  onLogout,
  suggestionCount = 0,
  onOpenSmartSuggestions,
  currentCurrency = 'INR',
  onChangeCurrency,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tripDropdownOpen, setTripDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navigate = (view: ViewType) => {
    if (onNavigate) onNavigate(view);
    else if (setActiveView) setActiveView(view);
    setMobileMenuOpen(false);
  };

  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'my-trips', label: 'My Trips', icon: <Luggage className="w-3.5 h-3.5" /> },
    { id: 'itinerary-builder', label: 'Builder', icon: <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />, badge: suggestionCount },
    { id: 'destinations', label: 'Explore', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'budget', label: 'Budget', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: 'Timeline', icon: <Calendar className="w-3.5 h-3.5" /> },
  ];

  const currencies: SupportedCurrency[] = ['INR', 'USD', 'EUR', 'GBP'];

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#E7E5E4] text-[#1C1917] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Active Trip Selector */}
          <div className="flex items-center gap-4">
            <button
              id="brand-logo-btn"
              onClick={() => navigate('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-[#C2410C] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-editorial-serif font-bold text-2xl tracking-tight text-[#1C1917]">
                Voyara<span className="text-[#C2410C]">.</span>
              </span>
            </button>

            {/* Active Trip Selector Pill */}
            {activeTrip && (
              <div className="relative hidden md:block">
                <button
                  id="active-trip-selector-btn"
                  onClick={() => setTripDropdownOpen(!tripDropdownOpen)}
                  className="flex items-center gap-2 text-xs font-semibold bg-[#FFFFFF] hover:bg-[#F5F4F0] text-[#1C1917] px-3 py-1.5 rounded-full border border-[#E7E5E4] transition-all max-w-[220px] shadow-xs"
                  title="Current Active Trip"
                >
                  <span className="w-2 h-2 rounded-full bg-[#C2410C] shrink-0 animate-pulse"></span>
                  <span className="truncate font-medium">{activeTrip.title}</span>
                  <ChevronDown className="w-3 h-3 text-[#78716C] ml-0.5 shrink-0" />
                </button>

                {tripDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E7E5E4] py-2 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2 border-b border-[#E7E5E4] flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C]">
                        Active Itinerary
                      </span>
                      <span className="text-[10px] text-[#C2410C] font-semibold">
                        {trips.length} Saved
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                      {trips.map((t) => (
                        <button
                          key={t.id}
                          id={`switch-trip-${t.id}`}
                          onClick={() => {
                            onSelectTrip(t);
                            setTripDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-[#FBFBFA] transition-colors ${
                            t.id === activeTrip.id
                              ? 'bg-[#FFF7ED] text-[#1C1917] font-bold border-l-3 border-[#C2410C]'
                              : 'text-[#78716C]'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className="truncate text-[#1C1917] font-semibold">{t.title}</p>
                            <p className="text-[10px] text-[#78716C]">
                              {(t.stops || []).length} stops • {t.startDate}
                            </p>
                          </div>
                          {t.id === activeTrip.id && (
                            <span className="text-[10px] bg-[#C2410C] text-white px-2 py-0.5 rounded-full font-bold">
                              Current
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-[#E7E5E4] pt-2 px-3 pb-1">
                      <button
                        id="dropdown-new-trip-btn"
                        onClick={() => {
                          setTripDropdownOpen(false);
                          onOpenCreateTrip();
                        }}
                        className="w-full text-center py-2 text-xs text-[#C2410C] font-bold hover:bg-[#FFF7ED] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Plan New Journey
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#FFFFFF] px-2 py-1 rounded-full border border-[#E7E5E4] shadow-xs">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => navigate(item.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1C1917] text-white shadow-xs'
                      : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F4F0]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="ml-1 px-1.5 py-0.2 bg-[#C2410C] text-white text-[9px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Right Controls Area */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Currency Selector */}
            <div className="relative">
              <button
                id="currency-selector-btn"
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 text-xs font-semibold bg-[#FFFFFF] hover:bg-[#F5F4F0] text-[#1C1917] px-2.5 py-1.5 rounded-xl border border-[#E7E5E4] transition-all shadow-xs"
                title="Change Currency"
              >
                <span className="text-[#C2410C] font-bold">{CURRENCY_SYMBOLS[currentCurrency]}</span>
                <span>{currentCurrency}</span>
                <ChevronDown className="w-3 h-3 text-[#78716C]" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-[#E7E5E4] py-1.5 z-50 animate-in fade-in">
                  <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#78716C]">
                    Currency
                  </div>
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        if (onChangeCurrency) onChangeCurrency(c);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#F5F4F0] ${
                        currentCurrency === c ? 'text-[#C2410C] font-bold bg-[#FFF7ED]' : 'text-[#1C1917]'
                      }`}
                    >
                      <span>{c}</span>
                      <span className="font-mono text-xs">{CURRENCY_SYMBOLS[c]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Suggestions Trigger */}
            {suggestionCount > 0 && onOpenSmartSuggestions && (
              <button
                id="smart-insights-nav-btn"
                onClick={onOpenSmartSuggestions}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA] text-xs font-bold transition-all shadow-xs"
                title="View Smart Trip Insights"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C2410C] animate-spin-slow" />
                <span>{suggestionCount} Insights</span>
              </button>
            )}

            {/* Plan Journey Button */}
            <button
              id="header-plan-trip-cta"
              onClick={onOpenCreateTrip}
              className="flex items-center gap-1.5 bg-[#C2410C] hover:bg-[#9A3412] active:scale-98 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Plan Journey</span>
            </button>

            {/* User Profile or Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-[#E7E5E4] bg-white hover:bg-[#F5F4F0] transition-all"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-[#E7E5E4]"
                  />
                  <ChevronDown className="w-3 h-3 text-[#78716C] mr-1 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E7E5E4] py-2 z-50 animate-in fade-in">
                    <div className="px-4 py-2.5 border-b border-[#E7E5E4]">
                      <p className="text-xs font-bold text-[#1C1917] truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-[#78716C] truncate">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#1C1917] hover:bg-[#F5F4F0] flex items-center gap-2 font-medium"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[#78716C]" /> Traveler Profile
                      </button>

                      <button
                        onClick={() => {
                          if (onOpenAuth) onOpenAuth('login');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#1C1917] hover:bg-[#F5F4F0] flex items-center gap-2 font-medium"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#C2410C]" /> Switch Curator Persona
                      </button>

                      <button
                        onClick={() => {
                          navigate('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#1C1917] hover:bg-[#F5F4F0] flex items-center gap-2 font-medium"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-[#78716C]" /> Admin Analytics
                      </button>
                    </div>

                    {onLogout && (
                      <div className="border-t border-[#E7E5E4] pt-1 px-1">
                        <button
                          onClick={() => {
                            onLogout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-600" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => (onOpenAuth ? onOpenAuth('login') : null)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#1C1917] bg-[#FFFFFF] hover:bg-[#F5F4F0] px-3.5 py-2 rounded-xl border border-[#E7E5E4] transition-all shadow-xs"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#78716C]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F4F0] rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7E5E4] bg-[#FFFFFF] px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-4">
          {activeTrip && (
            <div className="p-3.5 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA]">
              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#C2410C] block">
                Active Itinerary
              </span>
              <p className="text-sm font-editorial-serif font-bold text-[#1C1917] truncate">
                {activeTrip.title}
              </p>
              <p className="text-xs text-[#78716C]">
                {activeTrip.stops.length} stops • {activeTrip.startDate} to {activeTrip.endDate}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-link-${item.id}`}
                  onClick={() => navigate(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-3 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-[#1C1917] text-white'
                      : 'text-[#78716C] hover:bg-[#F5F4F0] bg-[#FBFBFA] border border-[#E7E5E4]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="ml-auto px-1.5 py-0.5 bg-[#C2410C] text-white text-[9px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E7E5E4] flex items-center justify-between">
            <button
              onClick={() => navigate('profile')}
              className="text-xs text-[#78716C] hover:text-[#1C1917] font-semibold"
            >
              Profile & Preferences
            </button>
            <button
              onClick={() => navigate('admin')}
              className="text-xs text-[#C2410C] font-bold"
            >
              Admin Metrics →
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar for one-thumb quick switching */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E7E5E4] py-1.5 px-3 flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive ? 'text-[#C2410C] font-bold' : 'text-[#78716C]'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-[#FFF7ED]' : ''}`}>{item.icon}</div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
