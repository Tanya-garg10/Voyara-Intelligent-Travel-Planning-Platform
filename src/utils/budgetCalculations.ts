import { Trip, ExpenseCategory } from '../types';
import { calculateDurationDays } from './dateUtils';

export interface TripFinancials {
  totalBudget: number;
  totalEstimatedCost: number;
  remainingBudget: number;
  percentUsed: number;
  isOverBudget: boolean;
  costPerDay: number;
  daysCount: number;
  breakdown: {
    transport: number;
    accommodation: number;
    activities: number;
    food: number;
    miscellaneous: number;
  };
  dailySpending: { date: string; amount: number; city: string }[];
  cityCosts: { cityName: string; total: number; percentage: number }[];
  warnings: string[];
}

export function calculateTripFinancials(trip: Trip): TripFinancials {
  if (!trip) {
    return {
      totalBudget: 0,
      totalEstimatedCost: 0,
      remainingBudget: 0,
      percentUsed: 0,
      isOverBudget: false,
      costPerDay: 0,
      daysCount: 1,
      breakdown: {
        transport: 0,
        accommodation: 0,
        activities: 0,
        food: 0,
        miscellaneous: 0,
      },
      dailySpending: [],
      cityCosts: [],
      warnings: [],
    };
  }

  const daysCount = calculateDurationDays(trip.startDate, trip.endDate) || 1;
  
  let transportTotal = 0;
  let accommodationTotal = 0;
  let activitiesTotal = 0;

  const dailyMap: Record<string, { amount: number; city: string }> = {};
  const cityMap: Record<string, number> = {};

  const stops = trip.stops || [];

  stops.forEach((stop) => {
    if (!stop) return;
    // Accommodation
    const stopAccom = stop.accommodationCost || 0;
    accommodationTotal += stopAccom;
    cityMap[stop.cityName || 'Destination'] = (cityMap[stop.cityName || 'Destination'] || 0) + stopAccom;

    // Transport to stop
    if (stop.transportToStop) {
      const transCost = stop.transportToStop.cost || 0;
      transportTotal += transCost;
      cityMap[stop.cityName || 'Destination'] = (cityMap[stop.cityName || 'Destination'] || 0) + transCost;
      
      const arrivalD = stop.arrivalDate || trip.startDate;
      if (!dailyMap[arrivalD]) dailyMap[arrivalD] = { amount: 0, city: stop.cityName || 'Destination' };
      dailyMap[arrivalD].amount += transCost;
    }

    // Activities
    const activities = stop.activities || [];
    activities.forEach((act) => {
      if (!act) return;
      const actCost = act.cost || 0;
      activitiesTotal += actCost;
      cityMap[stop.cityName || 'Destination'] = (cityMap[stop.cityName || 'Destination'] || 0) + actCost;

      const actDate = act.date || stop.arrivalDate || trip.startDate;
      if (!dailyMap[actDate]) dailyMap[actDate] = { amount: 0, city: stop.cityName || 'Destination' };
      dailyMap[actDate].amount += actCost;
    });
  });

  // Food baseline estimate based on days and destinations ($35/day baseline per person if not specified)
  const foodEstimate = Math.round(daysCount * 38);
  const miscEstimate = Math.round(daysCount * 15);

  const totalEstimatedCost = transportTotal + accommodationTotal + activitiesTotal + foodEstimate + miscEstimate;
  const totalBudget = trip.totalBudget || (totalEstimatedCost * 1.15);
  const remainingBudget = totalBudget - totalEstimatedCost;
  const percentUsed = Math.min(100, Math.round((totalEstimatedCost / (totalBudget || 1)) * 100));
  const isOverBudget = totalEstimatedCost > totalBudget;
  const costPerDay = Math.round(totalEstimatedCost / (daysCount || 1));

  // City costs array
  const cityCosts = Object.entries(cityMap).map(([cityName, total]) => ({
    cityName,
    total,
    percentage: Math.round((total / (totalEstimatedCost || 1)) * 100),
  }));

  // Daily spending array sorted by date
  const dailySpending = Object.entries(dailyMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, data]) => ({
      date,
      amount: data.amount + 53, // include avg daily food + misc for that day
      city: data.city,
    }));

  // Smart Warnings
  const warnings: string[] = [];
  if (isOverBudget) {
    warnings.push(`Planned itinerary exceeds allocated budget by ${Math.abs(remainingBudget)} ${trip.currency || 'USD'}.`);
  }
  if (accommodationTotal > totalBudget * 0.45) {
    warnings.push(`Accommodation accounts for ${Math.round((accommodationTotal / totalBudget) * 100)}% of your budget (recommendation is ≤ 40%).`);
  }
  if (transportTotal > totalBudget * 0.35) {
    warnings.push(`Transit and intercity transfers are higher than usual at ${Math.round((transportTotal / totalBudget) * 100)}% of budget.`);
  }

  return {
    totalBudget,
    totalEstimatedCost,
    remainingBudget,
    percentUsed,
    isOverBudget,
    costPerDay,
    daysCount,
    breakdown: {
      transport: transportTotal,
      accommodation: accommodationTotal,
      activities: activitiesTotal,
      food: foodEstimate,
      miscellaneous: miscEstimate,
    },
    dailySpending,
    cityCosts,
    warnings,
  };
}
