import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  PieChart as PieIcon,
  BarChart2,
  Plus,
  Calendar,
  Layers,
  Sparkles,
  Plane,
  Building,
  Activity as ActivityIcon,
  Coffee,
  ShoppingBag,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Coins,
  Globe2,
  Wallet
} from 'lucide-react';
import { Trip, CustomExpense, ExpenseCategory } from '../types';
import { calculateTripFinancials } from '../utils/budgetCalculations';
import {
  formatCurrency,
  SupportedCurrency,
  CURRENCY_RATES_FROM_USD,
  convertCurrency,
  CURRENCY_SYMBOLS
} from '../utils/currency';

interface BudgetDashboardProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
  currency?: SupportedCurrency;
  onChangeCurrency?: (c: SupportedCurrency) => void;
}

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({
  trip,
  onUpdateTrip,
  currency = 'INR',
  onChangeCurrency,
}) => {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('food');
  const [expenseAmount, setExpenseAmount] = useState<number>(35);
  const [activeTab, setActiveTab] = useState<'categories' | 'days' | 'converter'>('categories');

  const financials = calculateTripFinancials(trip);

  const categoryConfigs: {
    key: ExpenseCategory;
    label: string;
    amount: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }[] = [
    {
      key: 'accommodation',
      label: 'Accommodation & Heritage Stays',
      amount: financials.breakdown.accommodation,
      icon: <Building className="w-4 h-4 text-stone-900" />,
      color: 'text-[#1C1917]',
      bgColor: 'bg-stone-100',
    },
    {
      key: 'transport',
      label: 'Flights & Rail Transit',
      amount: financials.breakdown.transport,
      icon: <Plane className="w-4 h-4 text-[#C2410C]" />,
      color: 'text-[#C2410C]',
      bgColor: 'bg-[#FFF7ED]',
    },
    {
      key: 'activities',
      label: 'Tours & Experiences',
      amount: financials.breakdown.activities,
      icon: <ActivityIcon className="w-4 h-4 text-amber-700" />,
      color: 'text-amber-800',
      bgColor: 'bg-amber-50',
    },
    {
      key: 'food',
      label: 'Dining & Food Tastings',
      amount: financials.breakdown.food,
      icon: <Coffee className="w-4 h-4 text-orange-700" />,
      color: 'text-orange-800',
      bgColor: 'bg-orange-50',
    },
    {
      key: 'miscellaneous',
      label: 'Souvenirs & Buffer',
      amount: financials.breakdown.miscellaneous,
      icon: <ShoppingBag className="w-4 h-4 text-emerald-700" />,
      color: 'text-emerald-800',
      bgColor: 'bg-emerald-50',
    },
  ];

  const handleAdjustBudget = (newTargetUSD: number) => {
    onUpdateTrip({ ...trip, totalBudget: Math.max(100, newTargetUSD) });
  };

  const handleAddCustomExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim()) return;

    if (trip.stops.length > 0) {
      const firstStop = trip.stops[0];
      const newAct = {
        id: `exp_${Date.now()}`,
        title: expenseTitle.trim(),
        category: expenseCategory === 'food' ? ('Food' as const) : ('Shopping' as const),
        date: firstStop.arrivalDate,
        time: '13:00',
        durationMinutes: 60,
        cost: Number(expenseAmount) || 0,
        currency: 'USD',
        location: firstStop.cityName,
        notes: `Logged under ${expenseCategory}`,
      };

      const newStops = trip.stops.map((s, idx) =>
        idx === 0 ? { ...s, activities: [...s.activities, newAct] } : s
      );
      onUpdateTrip({ ...trip, stops: newStops });
    }

    setExpenseTitle('');
    setIsAddingExpense(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner & Currency Bar */}
      <div className="bg-[#FFFFFF] p-6 sm:p-10 rounded-3xl border border-[#E7E5E4] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#C2410C] flex items-center gap-1.5 mb-1">
            <Wallet className="w-3.5 h-3.5" />
            Financial Intelligence & Currency Ledger
          </span>
          <h1 className="font-editorial-serif text-3xl sm:text-5xl font-bold text-[#1C1917] tracking-tight">
            Trip Budget Ledger: {trip.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1.5 max-w-2xl leading-relaxed">
            Real-time financial management across {financials.daysCount} days and {trip.stops.length} destinations with instant currency conversion.
          </p>
        </div>

        {/* Currency Switcher & Add Expense CTA */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Pill Selector */}
          {onChangeCurrency && (
            <div className="flex items-center bg-[#F5F4F0] p-1 rounded-2xl border border-[#E7E5E4]">
              {(['INR', 'USD', 'EUR', 'GBP'] as SupportedCurrency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onChangeCurrency(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    currency === c
                      ? 'bg-white text-[#C2410C] shadow-xs'
                      : 'text-[#78716C] hover:text-[#1C1917]'
                  }`}
                >
                  {CURRENCY_SYMBOLS[c]} {c}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setIsAddingExpense(!isAddingExpense)}
            className="flex items-center gap-2 px-5 py-3 bg-[#C2410C] hover:bg-[#9A3412] active:scale-98 text-white rounded-2xl text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Expense</span>
          </button>
        </div>
      </div>

      {/* Add Custom Expense Inline Form */}
      {isAddingExpense && (
        <form
          onSubmit={handleAddCustomExpense}
          className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#C2410C]/40 shadow-lg space-y-4 animate-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
            <h3 className="font-editorial-serif text-xl font-bold text-[#1C1917]">
              Log New Expense / Buffer Item
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingExpense(false)}
              className="text-xs text-[#78716C] hover:text-[#1C1917] font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-1">
                Expense Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Traditional Rajasthani Thali Dinner"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-1">
                Category
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                className="w-full px-4 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
              >
                <option value="food">Food & Fine Dining</option>
                <option value="activities">Tours & Sightseeing</option>
                <option value="transport">Local Transit & Taxis</option>
                <option value="miscellaneous">Souvenirs & Buffer</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block mb-1">
                Estimated Cost (USD Equivalent)
              </label>
              <input
                type="number"
                min="1"
                required
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl text-xs text-[#1C1917] focus:outline-none focus:border-[#C2410C]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1C1917] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Confirm & Save Expense
            </button>
          </div>
        </form>
      )}

      {/* 2. Top Financial Pulse Cards (3 Key Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Estimated Cost */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-3xl border border-[#E7E5E4] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#C2410C]" /> Total Estimated Outlay
          </span>
          <div className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
            {formatCurrency(financials.totalEstimatedCost, currency)}
          </div>
          <p className="text-[11px] text-[#78716C]">
            Avg {formatCurrency(financials.costPerDay, currency)} / day across {financials.daysCount} days
          </p>
        </div>

        {/* Target Budget & Live Slider */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-3xl border border-[#E7E5E4] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C]">
              Allocated Trip Budget
            </span>
            <span className="text-xs font-bold text-[#C2410C]">
              {formatCurrency(trip.totalBudget, currency)}
            </span>
          </div>
          <input
            type="range"
            min={500}
            max={10000}
            step={100}
            value={trip.totalBudget}
            onChange={(e) => handleAdjustBudget(Number(e.target.value))}
            className="w-full accent-[#C2410C] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#78716C]">
            <span>$500 min</span>
            <span>Drag slider to adjust allocated funds</span>
            <span>$10,000 max</span>
          </div>
        </div>

        {/* Remaining Buffer */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-3xl border border-[#E7E5E4] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C]">
            Available Remaining Buffer
          </span>
          <div
            className={`font-editorial-serif text-3xl sm:text-4xl font-bold ${
              financials.isOverBudget ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {financials.isOverBudget
              ? `-${formatCurrency(Math.abs(financials.remainingBudget), currency)}`
              : formatCurrency(financials.remainingBudget, currency)}
          </div>
          <p className="text-[11px] text-[#78716C]">
            {financials.isOverBudget
              ? 'Warning: Estimated costs exceed allocated target budget'
              : `${Math.round(100 - financials.percentUsed)}% remaining safe headroom`}
          </p>
        </div>
      </div>

      {/* 3. Categorized Expense Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#C2410C]">
              Breakdown Analysis
            </span>
            <h3 className="font-editorial-serif text-2xl font-bold text-[#1C1917]">
              Expense Categorization
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#78716C]">
            5 Major Expense Categories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryConfigs.map((cat) => {
            const percentage =
              financials.totalEstimatedCost > 0
                ? Math.round((cat.amount / financials.totalEstimatedCost) * 100)
                : 0;

            return (
              <div
                key={cat.key}
                className="p-6 bg-white rounded-3xl border border-[#E7E5E4] shadow-xs space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${cat.bgColor}`}>{cat.icon}</div>
                    <div>
                      <h4 className="font-editorial-serif font-bold text-base text-[#1C1917]">
                        {cat.label}
                      </h4>
                      <span className="text-[10px] text-[#78716C] font-semibold">
                        {percentage}% of total
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#E7E5E4]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#78716C]">Total Allocated</span>
                    <span className={`font-bold font-editorial-serif text-lg ${cat.color}`}>
                      {formatCurrency(cat.amount, currency)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F5F4F0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#C2410C]"
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Live Multi-Currency Conversion Matrix */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FFF7ED] text-[#C2410C]">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#78716C]">
                Global Travel Rates
              </span>
              <h3 className="font-editorial-serif text-xl font-bold text-[#1C1917]">
                Live Currency Exchange Matrix
              </h3>
            </div>
          </div>
          <span className="text-xs text-[#78716C]">Real-time Forex Anchors</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {(['INR', 'USD', 'EUR', 'GBP'] as SupportedCurrency[]).map((c) => {
            const convertedTotal = convertCurrency(financials.totalEstimatedCost, 'USD', c);
            const isSelected = currency === c;
            return (
              <div
                key={c}
                onClick={() => onChangeCurrency && onChangeCurrency(c)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#C2410C] bg-[#FFF7ED]/50 ring-1 ring-[#C2410C]'
                    : 'border-[#E7E5E4] hover:bg-[#F5F4F0]'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-[#78716C]">
                  <span className="font-bold">{c}</span>
                  <span className="font-mono text-[11px]">{CURRENCY_SYMBOLS[c]}</span>
                </div>
                <div className="font-editorial-serif font-bold text-xl text-[#1C1917] mt-1">
                  {formatCurrency(convertedTotal, c, { compact: false })}
                </div>
                <span className="text-[10px] text-[#78716C] mt-0.5 block">
                  1 USD = {CURRENCY_RATES_FROM_USD[c]} {c}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
