import { Trip, SmartSuggestion, Activity } from '../types';
import { CATALOG_ACTIVITIES } from '../data/mockData';
import { calculateTripFinancials } from './budgetCalculations';

export function generateSmartSuggestions(trip: Trip): SmartSuggestion[] {
  if (!trip || !trip.stops) return [];
  const suggestions: SmartSuggestion[] = [];
  const financials = calculateTripFinancials(trip);
  const stops = trip.stops || [];

  // 1. Check for overlapping activity times
  stops.forEach((stop) => {
    if (!stop) return;
    const activitiesByDate: Record<string, typeof stop.activities> = {};
    const activities = stop.activities || [];
    activities.forEach((act) => {
      if (!act) return;
      if (!activitiesByDate[act.date]) activitiesByDate[act.date] = [];
      activitiesByDate[act.date].push(act);
    });

    Object.entries(activitiesByDate).forEach(([date, acts]) => {
      for (let i = 0; i < acts.length; i++) {
        for (let j = i + 1; j < acts.length; j++) {
          const a = acts[i];
          const b = acts[j];
          if (a.time && b.time) {
            const timeToMin = (t: string) => {
              const [h, m] = t.split(':').map(Number);
              return h * 60 + m;
            };
            const startA = timeToMin(a.time);
            const endA = startA + (a.durationMinutes || 60);
            const startB = timeToMin(b.time);
            const endB = startB + (b.durationMinutes || 60);

            // Overlap check
            if ((startA >= startB && startA < endB) || (startB >= startA && startB < endA)) {
              suggestions.push({
                id: `sug_overlap_${a.id}_${b.id}`,
                tripId: trip.id,
                type: 'warning',
                impact: 'high',
                title: `Time Conflict: "${a.title}" & "${b.title}"`,
                description: `Both activities overlap on ${date} in ${stop.cityName}. Consider rescheduling "${b.title}" to start after ${Math.floor(endA / 60)}:${(endA % 60).toString().padStart(2, '0')}.`,
                actionLabel: 'Auto-Adjust Time (+2h)',
                actionType: 'resolve_overlap',
                payload: { stopId: stop.id, activityId: b.id, newTime: `${Math.floor(endA / 60)}:30` }
              });
            }
          }
        }
      }

      // Check for overly packed days
      if (acts.length >= 4) {
        suggestions.push({
          id: `sug_packed_${stop.id}_${date}`,
          tripId: trip.id,
          type: 'warning',
          impact: 'medium',
          title: `Intense Pace on ${date} in ${stop.cityName}`,
          description: `You have ${acts.length} planned activities scheduled. You may experience travel fatigue. We recommend keeping 1-2 buffer hours for local transit and spontaneous stops.`,
          actionLabel: 'Review Schedule',
          actionType: 'adjust_budget'
        });
      }
    });
  });

  // 2. Budget Alert suggestions
  if (financials.isOverBudget) {
    suggestions.push({
      id: `sug_budget_over_${trip.id}`,
      tripId: trip.id,
      type: 'budget_alert',
      impact: 'high',
      title: `Itinerary is $${Math.abs(financials.remainingBudget)} Over Budget`,
      description: `Your planned total of $${financials.totalEstimatedCost} exceeds your $${trip.totalBudget} target. You can optimize accommodation or switch to free self-guided monuments to balance expenses.`,
      actionLabel: 'Increase Budget Target',
      actionType: 'adjust_budget',
      payload: { newBudget: Math.ceil(financials.totalEstimatedCost / 100) * 100 }
    });
  }

  // 3. Expensive Day Alert
  const avgDaily = financials.costPerDay || 1;
  financials.dailySpending.forEach((d) => {
    if (d.amount > avgDaily * 1.7 && d.amount > 150) {
      suggestions.push({
        id: `sug_expensive_day_${d.date}`,
        tripId: trip.id,
        type: 'budget_alert',
        impact: 'medium',
        title: `High Expense Day: $${d.amount} on ${d.date}`,
        description: `Spending in ${d.city} on ${d.date} is 70% higher than your trip daily average ($${avgDaily}/day).`,
        actionLabel: 'Find Alternatives',
        actionType: 'budget_alternative'
      });
    }
  });

  // 4. City Route Geographic sequence check
  if (stops.length >= 3) {
    // Check for Golden Triangle pattern (Delhi -> Jaipur -> Agra -> Udaipur instead of Delhi -> Agra -> Jaipur -> Udaipur)
    const cityNames = stops.map(s => s?.cityName?.toLowerCase() || '');
    const isDelhiJaipurAgra = cityNames[0]?.includes('delhi') && cityNames[1]?.includes('jaipur') && cityNames[2]?.includes('agra');
    if (isDelhiJaipurAgra) {
      suggestions.push({
        id: `sug_route_golden_triangle`,
        tripId: trip.id,
        type: 'route_order',
        impact: 'medium',
        title: 'Optimize Golden Triangle Route Order',
        description: 'Traveling Delhi → Agra → Jaipur saves 3 hours of highway driving and enables taking the high-speed Gatimaan Express train directly to Agra first.',
        actionLabel: 'Reorder Stops (Delhi → Agra → Jaipur)',
        actionType: 'reorder_stops',
        payload: { preferredOrder: ['New Delhi', 'Agra', 'Jaipur', 'Udaipur'] }
      });
    }
  }

  // 5. Missing Signature Experience Recommendations
  stops.forEach((stop) => {
    if (!stop) return;
    const activities = stop.activities || [];
    const existingActIds = new Set(activities.map(a => a.activityId || a.title));
    const cityName = stop.cityName || '';
    const cityCatalog = CATALOG_ACTIVITIES.filter(a => a.cityName.toLowerCase() === cityName.toLowerCase() || a.cityId === stop.cityId);
    
    // Check for top-rated activity not yet in stop
    const missingTopAct = cityCatalog.find(a => !existingActIds.has(a.id) && !existingActIds.has(a.title) && a.rating >= 4.85);
    if (missingTopAct) {
      suggestions.push({
        id: `sug_rec_${stop.id}_${missingTopAct.id}`,
        tripId: trip.id,
        type: 'recommendation',
        impact: 'low',
        title: `Top Rated in ${stop.cityName}: ${missingTopAct.title}`,
        description: `Rated ${missingTopAct.rating}★ with ${missingTopAct.reviewCount}+ travelers. ${missingTopAct.description.slice(0, 100)}...`,
        actionLabel: `+ Add to ${stop.cityName} ($${missingTopAct.cost})`,
        actionType: 'add_activity',
        payload: { stopId: stop.id, activity: missingTopAct }
      });
    }
  });

  // 6. Free/Budget alternative suggestions if trip is getting costly
  if (financials.breakdown.activities > 120) {
    suggestions.push({
      id: `sug_free_alt_${trip.id}`,
      tripId: trip.id,
      type: 'optimization',
      impact: 'low',
      title: 'Pro Tip: Explore Free Walking Audio Guides & Public Bazaars',
      description: 'Many iconic bazaars and temple courtyards offer free entry with self-guided audio walks, saving up to $60 on entry tickets.',
      actionLabel: 'View Free Spots',
      actionType: 'budget_alternative'
    });
  }

  return suggestions;
}
