import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Route,
  DollarSign,
  Clock,
  X,
  Plus,
  Sun,
  Bed,
  Compass
} from 'lucide-react';
import { SmartSuggestion, Trip } from '../types';
import { SupportedCurrency } from '../utils/currency';

interface SmartSuggestionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: SmartSuggestion[];
  onApplySuggestion: (suggestion: SmartSuggestion) => void;
  onDismissSuggestion: (id: string) => void;
  trip: Trip;
  currency?: SupportedCurrency;
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  isOpen,
  onClose,
  suggestions,
  onApplySuggestion,
  onDismissSuggestion,
  trip,
  currency = 'INR',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Insights', count: suggestions.length },
    {
      id: 'weather',
      label: 'Weather & Timing',
      count: suggestions.filter((s) => s.type === 'weather' || s.title.toLowerCase().includes('weather')).length,
    },
    {
      id: 'budget',
      label: 'Budget Optimization',
      count: suggestions.filter((s) => s.type === 'budget_alert' || s.type === 'cost_savings').length,
    },
    {
      id: 'pacing',
      label: 'Rest & Pacing',
      count: suggestions.filter((s) => s.type === 'rest_pacing' || s.type === 'warning').length,
    },
    {
      id: 'route',
      label: 'Route & Experiences',
      count: suggestions.filter((s) => s.type === 'route_order' || s.type === 'missing_activity').length,
    },
  ];

  const filtered = suggestions.filter((s) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'weather') return s.type === 'weather' || s.title.toLowerCase().includes('weather');
    if (activeCategory === 'budget') return s.type === 'budget_alert' || s.type === 'cost_savings';
    if (activeCategory === 'pacing') return s.type === 'rest_pacing' || s.type === 'warning';
    if (activeCategory === 'route') return s.type === 'route_order' || s.type === 'missing_activity';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E7E5E4] overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-[#1C1917] text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C2410C] text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#C2410C] block">
                Voyara Trip Intelligence
              </span>
              <h2 className="font-editorial-serif text-2xl font-bold tracking-tight text-white">
                Curator Recommendations
              </h2>
            </div>
          </div>

          <button
            id="close-smart-suggestions-modal-btn"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-6 sm:px-8 pt-4 pb-2 border-b border-[#E7E5E4] flex items-center gap-2 overflow-x-auto scrollbar-none bg-[#FBFBFA]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'bg-white text-[#78716C] border border-[#E7E5E4] hover:text-[#1C1917]'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Suggestions List */}
        <div className="p-6 sm:p-8 space-y-4 max-h-[60vh] overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((sug) => {
              const isWarning = sug.type === 'warning' || sug.impact === 'high';
              const isBudget = sug.type === 'budget_alert' || sug.type === 'cost_savings';

              return (
                <div
                  key={sug.id}
                  id={`suggestion-card-${sug.id}`}
                  className="p-5 rounded-2xl border border-[#E7E5E4] bg-white hover:border-[#C2410C]/50 hover:shadow-md transition-all space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-bold mt-0.5 ${
                          isWarning
                            ? 'bg-rose-100 text-rose-700'
                            : isBudget
                            ? 'bg-[#FFF7ED] text-[#C2410C]'
                            : 'bg-stone-100 text-[#1C1917]'
                        }`}
                      >
                        {isWarning ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : isBudget ? (
                          <DollarSign className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              sug.impact === 'high'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-[#FFF7ED] text-[#C2410C]'
                            }`}
                          >
                            {sug.impact || 'Recommended'}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-[#78716C]">
                            {sug.type.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="font-editorial-serif text-lg font-bold text-[#1C1917]">
                          {sug.title}
                        </h4>
                        <p className="text-xs text-[#78716C] leading-relaxed">
                          {sug.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDismissSuggestion(sug.id)}
                      className="text-[#78716C] hover:text-[#1C1917] p-1 transition-colors"
                      title="Dismiss insight"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#E7E5E4] flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => onDismissSuggestion(sug.id)}
                      className="px-4 py-2 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] rounded-xl"
                    >
                      Dismiss
                    </button>
                    <button
                      id={`apply-sug-${sug.id}`}
                      onClick={() => onApplySuggestion(sug)}
                      className="px-5 py-2 bg-[#C2410C] hover:bg-[#9A3412] active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>{sug.actionLabel || 'Accept & Add to Trip'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-editorial-serif text-xl font-bold text-[#1C1917]">
                Itinerary is Fully Optimized
              </h3>
              <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                No timing conflicts, pace alerts, or budget anomalies detected for {trip.title}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FBFBFA] border-t border-[#E7E5E4] flex items-center justify-between text-xs text-[#78716C]">
          <span>Continuous itinerary analysis based on booking pacing & weather index</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1C1917] hover:bg-black text-white font-bold rounded-xl text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
