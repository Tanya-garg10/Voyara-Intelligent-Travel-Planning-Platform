export type ActivityCategory =
  | 'Sightseeing'
  | 'Food'
  | 'Adventure'
  | 'Culture'
  | 'Shopping'
  | 'Nature'
  | 'Nightlife';

export type TransportType = 'flight' | 'train' | 'drive' | 'bus' | 'ferry' | 'walk';

export type ExpenseCategory =
  | 'transport'
  | 'accommodation'
  | 'activities'
  | 'food'
  | 'shopping'
  | 'miscellaneous';

export interface TransportDetails {
  type: TransportType;
  carrier?: string;
  bookingRef?: string;
  departureTime?: string;
  arrivalTime?: string;
  cost: number;
  notes?: string;
}

export interface TripActivity {
  id: string;
  activityId?: string;
  title: string;
  category: ActivityCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  cost: number;
  currency: string;
  location: string;
  notes?: string;
  rating?: number;
  imageUrl?: string;
  isCustom?: boolean;
  completed?: boolean;
  address?: string;
}

export interface TripStop {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  region: string;
  arrivalDate: string; // YYYY-MM-DD
  departureDate: string; // YYYY-MM-DD
  orderIndex: number;
  accommodationName?: string;
  accommodationCost: number;
  transportToStop?: TransportDetails;
  activities: TripActivity[];
  notes?: string;
  coordinates: { lat: number; lng: number };
  imageUrl?: string;
}

export interface TripMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
}

export type TripStatus = 'planning' | 'upcoming' | 'completed';

export interface Trip {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  currency: string;
  totalBudget: number;
  status: TripStatus;
  visibility: 'private' | 'public' | 'shared';
  isPublic?: boolean;
  stops: TripStop[];
  members: TripMember[];
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  countryCode: string;
  continent: string;
  popularityScore: number; // 1-100
  costIndex: 'budget' | 'moderate' | 'luxury';
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  coordinates: { lat: number; lng: number };
  bestTimeToVisit: string;
  tags: string[];
  averageDailyCost: number; // in USD base
  topAttractions: string[];
  currency: string;
  featured?: boolean;
}

export interface Activity {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  title: string;
  category: ActivityCategory;
  cost: number;
  currency: string;
  durationMinutes: number;
  rating: number;
  reviewCount: number;
  description: string;
  imageUrl: string;
  tags: string[];
  openingHours: string;
  address: string;
  highlights?: string[];
}

export interface SmartSuggestion {
  id: string;
  tripId: string;
  type: 'warning' | 'optimization' | 'recommendation' | 'budget_alert' | 'route_order';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionLabel?: string;
  actionType?: 'reorder_stops' | 'adjust_budget' | 'add_activity' | 'resolve_overlap' | 'budget_alternative';
  payload?: any;
  dismissed?: boolean;
  suggestedActivity?: Partial<TripActivity>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  homeCity: string;
  currency: string;
  language: string;
  travelStyles: string[];
  savedDestinations: string[]; // Destination IDs
  savedActivities: string[]; // Activity IDs
  role: 'user' | 'admin';
  preferences: {
    emailNotifications: boolean;
    budgetAlerts: boolean;
    smartSuggestions: boolean;
    darkMode: boolean;
    currency: string;
    language: string;
  };
}

export interface CustomExpense {
  id: string;
  tripId: string;
  stopId?: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  notes?: string;
}

export type ViewType =
  | 'dashboard'
  | 'my-trips'
  | 'itinerary-builder'
  | 'itinerary-day'
  | 'itinerary-view'
  | 'destinations'
  | 'activities'
  | 'budget'
  | 'timeline'
  | 'map-route'
  | 'saved'
  | 'profile'
  | 'admin'
  | 'public-trip';

export type ActiveView = ViewType;
