import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Settings,
  Heart,
  Globe,
  DollarSign,
  Bell,
  Trash2,
  Check,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { User } from '../types';
import { POPULAR_DESTINATIONS } from '../data/mockData';

interface ProfileViewProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onResetSampleData: () => void;
  onNavigateToDestinations: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onResetSampleData,
  onNavigateToDestinations,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [currency, setCurrency] = useState(currentUser.preferences.currency);
  const [language, setLanguage] = useState(currentUser.preferences.language);
  const [budgetAlerts, setBudgetAlerts] = useState(currentUser.preferences.budgetAlerts);
  const [role, setRole] = useState(currentUser.role);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const savedDestList = POPULAR_DESTINATIONS.filter((d) =>
    currentUser.savedDestinations.includes(d.id)
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name,
      email,
      role,
      preferences: {
        ...currentUser.preferences,
        currency,
        language,
        budgetAlerts,
      },
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleRemoveSavedDest = (destId: string) => {
    onUpdateUser({
      ...currentUser,
      savedDestinations: currentUser.savedDestinations.filter((id) => id !== destId),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-md border border-[#E5E4DF] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-xs object-cover border-2 border-[#CC5500] shadow-xs"
            />
            <span className="absolute -bottom-1 -right-1 p-1 bg-[#1A1A1A] text-[#CC5500] rounded-xs text-[10px]">
              <Settings className="w-3 h-3" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-editorial-serif text-3xl font-bold text-[#1A1A1A] tracking-tight">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-[1px] bg-[#F0EDE8] text-[#1A1A1A] border border-[#E5E4DF]">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-[#71716A] mt-0.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#71716A]" />
              {currentUser.email}
            </p>
          </div>
        </div>

        {isSavedNotice && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xs text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Profile Saved Successfully</span>
          </div>
        )}
      </div>

      {/* Profile & Settings Form */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-md border border-[#E5E4DF] shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-6">
        <div>
          <h2 className="font-editorial-serif text-2xl font-bold text-[#1A1A1A] tracking-tight">Account & Travel Preferences</h2>
          <p className="text-xs text-[#71716A] mt-1">Configure your default currency, localization, and system permissions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1.5">Full Name</label>
            <input
              id="profile-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs font-medium text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#CC5500]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1.5">Email Address</label>
            <input
              id="profile-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs font-medium text-[#1A1A1A] focus:bg-white focus:outline-none focus:border-[#CC5500]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1.5">Preferred Currency</label>
            <select
              id="profile-currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#CC5500]"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="JPY">JPY (¥) - Japanese Yen</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1.5">Language</label>
            <select
              id="profile-language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#CC5500]"
            >
              <option value="English">English</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
              <option value="German">Deutsch</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Japanese">日本語 (Japanese)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1.5">Role Mode (For Demo)</label>
            <select
              id="profile-role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
              className="w-full px-3.5 py-2.5 bg-[#F0EDE8] border border-[#E5E4DF] rounded-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#CC5500]"
            >
              <option value="user">Standard Traveler (User)</option>
              <option value="admin">Administrator (Unlocks Admin Dashboard)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              id="profile-alerts-checkbox"
              type="checkbox"
              checked={budgetAlerts}
              onChange={(e) => setBudgetAlerts(e.target.checked)}
              className="w-4 h-4 accent-[#CC5500] rounded-xs border-[#E5E4DF]"
            />
            <label htmlFor="profile-alerts-checkbox" className="font-semibold text-[#1A1A1A] cursor-pointer">
              Enable Real-time Budget & Overlap Warnings
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            id="save-profile-btn"
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#CC5500] hover:bg-[#B34A00] text-white rounded-xs text-xs font-semibold transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Saved Destinations Wishlist */}
      <div className="bg-white p-6 sm:p-8 rounded-md border border-[#E5E4DF] shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial-serif text-2xl font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#CC5500] fill-current" />
            <span>Saved Destinations Wishlist ({savedDestList.length})</span>
          </h2>
          <button
            onClick={onNavigateToDestinations}
            className="text-xs font-semibold text-[#CC5500] hover:underline"
          >
            Browse More →
          </button>
        </div>

        {savedDestList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {savedDestList.map((dest) => (
              <div
                key={dest.id}
                className="p-3 bg-[#F9F8F6] rounded-xs border border-[#E5E4DF] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-10 h-10 rounded-xs object-cover shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-editorial-serif font-bold text-sm text-[#1A1A1A] truncate">{dest.name}</p>
                    <p className="text-[10px] text-[#71716A]">{dest.country}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSavedDest(dest.id)}
                  className="text-[#71716A] hover:text-[#CC5500] p-1 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#71716A] italic">No saved destinations yet in your collection.</p>
        )}
      </div>

      {/* Reset State Option */}
      <div className="bg-[#F0EDE8] p-6 rounded-md border border-[#E5E4DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <h3 className="font-editorial-serif text-lg font-bold text-[#1A1A1A]">Reset Demo Travel State</h3>
          <p className="text-[#71716A] mt-0.5">
            Restore sample Rajasthan, Japan, and European multi-city demo trips
          </p>
        </div>
        <button
          id="reset-sample-data-btn"
          type="button"
          onClick={onResetSampleData}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#F9F8F6] text-[#1A1A1A] border border-[#E5E4DF] rounded-xs font-semibold transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#CC5500]" />
          <span>Restore Sample Data</span>
        </button>
      </div>
    </div>
  );
};
