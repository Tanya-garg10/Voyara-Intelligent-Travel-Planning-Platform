import React, { useState, useEffect } from 'react';
import { Trip, User, ViewType, SmartSuggestion, Destination, Activity } from './types';
import { INITIAL_TRIPS, INITIAL_USER, POPULAR_DESTINATIONS, CATALOG_ACTIVITIES } from './data/mockData';
import { generateSmartSuggestions } from './utils/smartSuggestions';
import { SupportedCurrency } from './utils/currency';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { CreateTripModal } from './components/CreateTripModal';
import { DashboardView } from './components/DashboardView';
import { ItineraryBuilder } from './components/ItineraryBuilder';
import { ItineraryView } from './components/ItineraryView';
import { BudgetDashboard } from './components/BudgetDashboard';
import { TimelineView } from './components/TimelineView';
import { RouteMapVisualizer } from './components/RouteMapVisualizer';
import { DestinationExplorer } from './components/DestinationExplorer';
import { ActivityExplorer } from './components/ActivityExplorer';
import { SmartSuggestionsPanel } from './components/SmartSuggestionsPanel';
import { PublicShareModal } from './components/PublicShareModal';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { MyTripsView } from './components/MyTripsView';
import { ExportTripModal } from './components/ExportTripModal';

const STORAGE_KEYS = {
  TRIPS: 'voyara_trips_v1',
  ACTIVE_TRIP_ID: 'voyara_active_trip_id_v1',
  USER: 'voyara_user_v1',
  CURRENCY: 'voyara_currency_v1',
};

export function App() {
  // 1. Core State
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRIPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load trips from storage', e);
    }
    return INITIAL_TRIPS;
  });

  const [activeTripId, setActiveTripId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TRIP_ID);
      if (saved && trips.some((t) => t.id === saved)) return saved;
    } catch (e) {}
    return INITIAL_TRIPS[0]?.id || '';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_USER;
  });

  const [currency, setCurrency] = useState<SupportedCurrency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY) as SupportedCurrency;
      if (saved && ['INR', 'USD', 'EUR', 'GBP'].includes(saved)) return saved;
    } catch (e) {}
    return 'INR';
  });

  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  // Modals & Drawers State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isSmartSuggestionsOpen, setIsSmartSuggestionsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetTrip, setShareTargetTrip] = useState<Trip | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTargetTrip, setExportTargetTrip] = useState<Trip | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch (e) {}
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP_ID, activeTripId);
    } catch (e) {}
  }, [activeTripId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    } catch (e) {}
  }, [currency]);

  // Derived active trip
  const activeTrip = trips.find((t) => t.id === activeTripId) || trips[0] || null;

  // Real-time suggestions for active trip
  const smartSuggestions: SmartSuggestion[] = activeTrip
    ? generateSmartSuggestions(activeTrip)
    : [];

  // Handlers
  const handleSelectTrip = (trip: Trip) => {
    setActiveTripId(trip.id);
  };

  const handleUpdateTrip = (updatedTrip: Trip) => {
    setTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
  };

  const handleCreateTrip = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);
    setActiveTripId(newTrip.id);
    setActiveView('itinerary-builder');
  };

  const handleDeleteTrip = (tripId: string) => {
    const remaining = trips.filter((t) => t.id !== tripId);
    setTrips(remaining);
    if (activeTripId === tripId && remaining.length > 0) {
      setActiveTripId(remaining[0].id);
    }
  };

  const handleDuplicateTrip = (trip: Trip) => {
    const duplicated: Trip = {
      ...trip,
      id: `trip_${Date.now()}`,
      title: `${trip.title} (Copy)`,
      status: 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTrips((prev) => [duplicated, ...prev]);
    setActiveTripId(duplicated.id);
    setActiveView('itinerary-builder');
  };

  const handleApplySuggestion = (sug: SmartSuggestion) => {
    if (!activeTrip) return;

    if (sug.type === 'route_order') {
      const idealOrder = ['Delhi', 'Agra', 'Jaipur', 'Udaipur'];
      const reordered = [...activeTrip.stops].sort((a, b) => {
        const idxA = idealOrder.indexOf(a.cityName);
        const idxB = idealOrder.indexOf(b.cityName);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return a.orderIndex - b.orderIndex;
      });

      reordered.forEach((s, idx) => (s.orderIndex = idx));
      handleUpdateTrip({ ...activeTrip, stops: reordered });
    } else if (sug.suggestedActivity) {
      const targetStop = activeTrip.stops[0];
      if (targetStop) {
        const newAct = {
          ...sug.suggestedActivity,
          id: `act_sug_${Date.now()}`,
          date: targetStop.arrivalDate,
          time: '17:00',
        };
        const updatedStops = activeTrip.stops.map((s, idx) =>
          idx === 0 ? { ...s, activities: [...s.activities, newAct] } : s
        );
        handleUpdateTrip({ ...activeTrip, stops: updatedStops });
      }
    }

    setIsSmartSuggestionsOpen(false);
  };

  // Add Destination to Active Trip Stop
  const handleAddDestinationToTrip = (dest: Destination) => {
    if (!activeTrip) {
      alert('Please select or create a trip first.');
      return;
    }

    const existingStopsCount = activeTrip.stops.length;
    const lastStop = activeTrip.stops[existingStopsCount - 1];

    const newStop = {
      id: `stop_${Date.now()}`,
      cityName: dest.name,
      country: dest.country,
      cityId: dest.id,
      imageUrl: dest.imageUrl,
      arrivalDate: lastStop ? lastStop.departureDate : activeTrip.startDate,
      departureDate: lastStop ? lastStop.departureDate : activeTrip.endDate,
      orderIndex: existingStopsCount,
      accommodationName: `${dest.name} Boutique Retreat`,
      accommodationCost: dest.averageDailyCost * 2,
      transportToStop: {
        id: `trans_${Date.now()}`,
        type: 'flight' as const,
        cost: 95,
        carrier: 'Regional Connection',
      },
      activities: [],
      coordinates: {
        lat: 25.0 + Math.random() * 10,
        lng: 75.0 + Math.random() * 10,
      },
    };

    const updatedStops = [...activeTrip.stops, newStop];
    updatedStops.forEach((s, idx) => (s.orderIndex = idx));

    handleUpdateTrip({ ...activeTrip, stops: updatedStops });
    setActiveView('itinerary-builder');
  };

  // Add Catalog Activity to Specific Stop
  const handleAddCatalogActivityToTrip = (activity: Activity, targetStopId: string) => {
    if (!activeTrip) return;

    const targetStop = activeTrip.stops.find((s) => s.id === targetStopId) || activeTrip.stops[0];
    if (!targetStop) return;

    const newAct = {
      id: `act_${Date.now()}`,
      title: activity.title,
      category: activity.category,
      date: targetStop.arrivalDate,
      time: '10:00',
      durationMinutes: activity.durationMinutes,
      cost: activity.cost,
      currency: activity.currency,
      location: `${activity.title}, ${activity.cityName}`,
      imageUrl: activity.imageUrl,
      rating: activity.rating,
      notes: activity.description,
    };

    const updatedStops = activeTrip.stops.map((s) => {
      if (s.id === targetStop.id) {
        return { ...s, activities: [...s.activities, newAct] };
      }
      return s;
    });

    handleUpdateTrip({ ...activeTrip, stops: updatedStops });
    setActiveView('itinerary-builder');
  };

  // Toggle Saved Destination in Wishlist
  const handleToggleSaveDestination = (destId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const currentSaved = currentUser.savedDestinations || [];
    const isSaved = currentSaved.includes(destId);
    const newSaved = isSaved
      ? currentSaved.filter((id) => id !== destId)
      : [...currentSaved, destId];

    setCurrentUser({ ...currentUser, savedDestinations: newSaved });
  };

  // Reset to initial sample data
  const handleResetSampleData = () => {
    if (confirm('Reset demo state to default Rajasthan & Japan travel itineraries?')) {
      localStorage.removeItem(STORAGE_KEYS.TRIPS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TRIP_ID);
      localStorage.removeItem(STORAGE_KEYS.USER);
      setTrips(INITIAL_TRIPS);
      setActiveTripId(INITIAL_TRIPS[0].id);
      setCurrentUser(INITIAL_USER);
      setActiveView('dashboard');
    }
  };

  const handleOpenShare = (trip?: Trip) => {
    setShareTargetTrip(trip || activeTrip);
    setIsShareModalOpen(true);
  };

  const handleOpenExport = (trip?: Trip) => {
    setExportTargetTrip(trip || activeTrip);
    setIsExportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#1C1917] flex flex-col font-sans selection:bg-[#C2410C] selection:text-white">
      {/* Top Main Navigation Bar */}
      <Navbar
        activeView={activeView}
        onNavigate={setActiveView}
        currentUser={currentUser}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthModalOpen(true);
        }}
        onLogout={() => setCurrentUser(null)}
        trips={trips}
        activeTrip={activeTrip}
        onSelectTrip={handleSelectTrip}
        onOpenCreateTrip={() => setIsCreateTripOpen(true)}
        suggestionCount={smartSuggestions.length}
        onOpenSmartSuggestions={() => setIsSmartSuggestionsOpen(true)}
        currentCurrency={currency}
        onChangeCurrency={setCurrency}
      />

      {/* Main View Area */}
      <main className="grow pb-24 lg:pb-16">
        {activeView === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            trips={trips}
            activeTrip={activeTrip}
            onSelectTrip={handleSelectTrip}
            onOpenCreateTrip={() => setIsCreateTripOpen(true)}
            onNavigate={setActiveView}
            onToggleSaveDestination={handleToggleSaveDestination}
            currency={currency}
          />
        )}

        {activeView === 'my-trips' && (
          <MyTripsView
            trips={trips}
            activeTrip={activeTrip}
            onSelectTrip={handleSelectTrip}
            onOpenCreateTrip={() => setIsCreateTripOpen(true)}
            onDeleteTrip={handleDeleteTrip}
            onDuplicateTrip={handleDuplicateTrip}
            onNavigateToBuilder={(trip) => {
              setActiveTripId(trip.id);
              setActiveView('itinerary-builder');
            }}
            onOpenShareModal={handleOpenShare}
            onOpenExportModal={handleOpenExport}
            currency={currency}
          />
        )}

        {activeView === 'itinerary-builder' && activeTrip && (
          <ItineraryBuilder
            trip={activeTrip}
            onUpdateTrip={handleUpdateTrip}
            onOpenSmartSuggestions={() => setIsSmartSuggestionsOpen(true)}
            suggestions={smartSuggestions}
            onOpenShareModal={() => handleOpenShare(activeTrip)}
            onOpenExportModal={() => handleOpenExport(activeTrip)}
            onNavigateToView={setActiveView}
            currency={currency}
          />
        )}

        {activeView === 'itinerary-day' && activeTrip && (
          <ItineraryView
            trip={activeTrip}
            onUpdateTrip={handleUpdateTrip}
            onOpenShareModal={() => handleOpenShare(activeTrip)}
            onOpenExportModal={() => handleOpenExport(activeTrip)}
            currency={currency}
            onNavigateToView={setActiveView}
          />
        )}

        {activeView === 'budget' && activeTrip && (
          <BudgetDashboard
            trip={activeTrip}
            onUpdateTrip={handleUpdateTrip}
            currency={currency}
            onChangeCurrency={setCurrency}
          />
        )}

        {activeView === 'timeline' && activeTrip && (
          <TimelineView
            trip={activeTrip}
            onUpdateTrip={handleUpdateTrip}
            onOpenShareModal={() => handleOpenShare(activeTrip)}
            currency={currency}
          />
        )}

        {activeView === 'map-route' && activeTrip && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <RouteMapVisualizer
              trip={activeTrip}
              stops={activeTrip.stops}
              onSelectStop={() => {
                setActiveView('itinerary-builder');
              }}
            />
          </div>
        )}

        {activeView === 'destinations' && (
          <DestinationExplorer
            onAddDestinationToTrip={handleAddDestinationToTrip}
            activeTrip={activeTrip}
            currentUser={currentUser}
            onToggleSaveDestination={handleToggleSaveDestination}
            currency={currency}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'activities' && (
          <ActivityExplorer
            activeTrip={activeTrip}
            onAddActivityToTrip={handleAddCatalogActivityToTrip}
            currency={currency}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'profile' && currentUser && (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={setCurrentUser}
            onResetSampleData={handleResetSampleData}
            onNavigateToDestinations={() => setActiveView('destinations')}
          />
        )}

        {activeView === 'admin' && (
          <AdminDashboard
            trips={trips}
            currentUser={currentUser}
            onNavigateToTrip={(t) => {
              setActiveTripId(t.id);
              setActiveView('itinerary-builder');
            }}
          />
        )}
      </main>

      {/* Global Modals & Dialogs */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authModalMode}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
      />

      <CreateTripModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
        onCreateTrip={handleCreateTrip}
        currency={currency}
      />

      {activeTrip && (
        <SmartSuggestionsPanel
          isOpen={isSmartSuggestionsOpen}
          onClose={() => setIsSmartSuggestionsOpen(false)}
          suggestions={smartSuggestions}
          onApplySuggestion={handleApplySuggestion}
          onDismissSuggestion={(sugId) => {
            setIsSmartSuggestionsOpen(false);
          }}
          trip={activeTrip}
          currency={currency}
        />
      )}

      {shareTargetTrip && (
        <PublicShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setShareTargetTrip(null);
          }}
          trip={shareTargetTrip}
          onTogglePublicStatus={(isPub) => {
            handleUpdateTrip({ ...shareTargetTrip, isPublic: isPub });
          }}
          onCloneTrip={(trip) => {
            handleDuplicateTrip(trip);
            setIsShareModalOpen(false);
          }}
          currency={currency}
        />
      )}

      {exportTargetTrip && (
        <ExportTripModal
          isOpen={isExportModalOpen}
          onClose={() => {
            setIsExportModalOpen(false);
            setExportTargetTrip(null);
          }}
          trip={exportTargetTrip}
          currentUser={currentUser}
          currency={currency}
        />
      )}
    </div>
  );
}

export default App;
