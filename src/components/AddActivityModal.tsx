import React, { useState } from 'react';
import { X, Search, Clock, DollarSign, MapPin, Tag, Plus, Check } from 'lucide-react';
import { TripActivity, ActivityCategory, Activity } from '../types';
import { CATALOG_ACTIVITIES } from '../data/mockData';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddActivity: (activity: TripActivity) => void;
  cityName: string;
  cityId?: string;
  defaultDate: string;
}

const CATEGORIES: ActivityCategory[] = [
  'Sightseeing',
  'Food',
  'Adventure',
  'Culture',
  'Shopping',
  'Nature',
  'Nightlife',
];

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onAddActivity,
  cityName,
  cityId,
  defaultDate,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<Activity | null>(null);

  // Custom Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Sightseeing');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('10:00');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [cost, setCost] = useState(25);
  const [location, setLocation] = useState(cityName);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Catalog activities matching this city or general
  const cityActivities = CATALOG_ACTIVITIES.filter(
    (a) =>
      a.cityName.toLowerCase() === cityName.toLowerCase() ||
      (cityId && a.cityId === cityId) ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCatalog = (act: Activity) => {
    setSelectedCatalogItem(act);
    setTitle(act.title);
    setCategory(act.category);
    setCost(act.cost);
    setDurationMinutes(act.durationMinutes);
    setLocation(act.address || cityName);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newActivity: TripActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      activityId: selectedCatalogItem?.id,
      title: title.trim(),
      category,
      date,
      time,
      durationMinutes: Number(durationMinutes) || 60,
      cost: Number(cost) || 0,
      currency: 'USD',
      location: location.trim() || cityName,
      notes: notes.trim() || undefined,
      rating: selectedCatalogItem?.rating,
      imageUrl: selectedCatalogItem?.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
      isCustom: !selectedCatalogItem,
      completed: false,
    };

    onAddActivity(newActivity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-md shadow-2xl border border-[#E5E4DF] overflow-hidden my-8">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E4DF] bg-[#F9F8F6]">
          <div>
            <h3 className="font-editorial-serif text-xl font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#CC5500]" />
              <span>Add Experience to {cityName}</span>
            </h3>
            <p className="text-xs text-[#71716A] mt-0.5">Discover curated experiences or create a bespoke itinerary entry</p>
          </div>
          <button
            id="close-add-activity-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xs hover:bg-[#E5E4DF] text-[#71716A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#E5E4DF] bg-[#F9F8F6] p-2 gap-2">
          <button
            type="button"
            id="tab-catalog-activities-btn"
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xs transition-colors ${
              activeTab === 'catalog'
                ? 'bg-white shadow-xs text-[#1A1A1A] border border-[#E5E4DF]'
                : 'text-[#71716A] hover:text-[#1A1A1A]'
            }`}
          >
            Curated Experiences ({cityActivities.length})
          </button>
          <button
            type="button"
            id="tab-custom-activity-btn"
            onClick={() => {
              setActiveTab('custom');
              setSelectedCatalogItem(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xs transition-colors ${
              activeTab === 'custom'
                ? 'bg-white shadow-xs text-[#1A1A1A] border border-[#E5E4DF]'
                : 'text-[#71716A] hover:text-[#1A1A1A]'
            }`}
          >
            Custom Activity
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-4 max-h-[72vh] overflow-y-auto">
          {activeTab === 'catalog' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#71716A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="search-catalog-activities-input"
                  type="text"
                  placeholder={`Search top attractions in ${cityName}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] text-[#1A1A1A] placeholder:text-[#71716A]"
                />
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cityActivities.length > 0 ? (
                  cityActivities.map((act) => {
                    const isSelected = selectedCatalogItem?.id === act.id;
                    return (
                      <div
                        key={act.id}
                        id={`catalog-act-${act.id}`}
                        onClick={() => handleSelectCatalog(act)}
                        className={`flex items-center gap-3 p-2 rounded-xs border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#F0EDE8] border-[#CC5500] ring-1 ring-[#CC5500]'
                            : 'bg-white border-[#E5E4DF] hover:border-[#CC5500]/50'
                        }`}
                      >
                        <img
                          src={act.imageUrl}
                          alt={act.title}
                          className="w-12 h-12 rounded-xs object-cover shrink-0"
                        />
                        <div className="grow min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-xs bg-[#F0EDE8] text-[#1A1A1A] uppercase tracking-[1px]">
                              {act.category}
                            </span>
                            <span className="text-[10px] text-[#CC5500] font-semibold">★ {act.rating}</span>
                          </div>
                          <p className="font-editorial-serif font-bold text-sm text-[#1A1A1A] truncate">{act.title}</p>
                          <p className="text-[11px] text-[#71716A]">
                            {act.durationMinutes} mins • ${act.cost}
                          </p>
                        </div>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-xs bg-[#CC5500] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#71716A] text-center py-4 italic">
                    No catalog matches found. Switch to "Custom Activity" to add any custom spot!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Activity Title */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1">
              Activity Title <span className="text-[#CC5500]">*</span>
            </label>
            <input
              id="activity-title-input"
              type="text"
              required
              placeholder="e.g. Sunset Boat Cruise & Island Palace"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] font-medium text-[#1A1A1A]"
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1.5">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  id={`cat-chip-${cat}`}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-xs text-xs font-semibold border transition-colors ${
                    category === cat
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-[#F9F8F6] border-[#E5E4DF] text-[#71716A] hover:bg-[#F0EDE8] hover:text-[#1A1A1A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date, Time, Duration, Cost */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1">Date</label>
              <input
                id="activity-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] text-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1">Time</label>
              <input
                id="activity-time-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] text-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1">Duration (min)</label>
              <input
                id="activity-duration-input"
                type="number"
                min="15"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] text-[#1A1A1A] font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1">Cost ($)</label>
              <input
                id="activity-cost-input"
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] text-[#1A1A1A] font-semibold"
              />
            </div>
          </div>

          {/* Location & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1">Location / Address</label>
              <input
                id="activity-location-input"
                type="text"
                placeholder={`e.g. Near Lake Pichola Ghat, ${cityName}`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] text-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#71716A] mb-1">Notes / Tips</label>
              <input
                id="activity-notes-input"
                type="text"
                placeholder="e.g. Arrive 15 min early for sunset"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F9F8F6] border border-[#E5E4DF] rounded-xs focus:bg-white focus:outline-none focus:border-[#CC5500] text-[#1A1A1A]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E4DF] flex items-center justify-end gap-2">
            <button
              id="cancel-add-activity-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#71716A] hover:text-[#1A1A1A] rounded-xs"
            >
              Cancel
            </button>
            <button
              id="confirm-add-activity-btn"
              type="submit"
              className="px-5 py-2 bg-[#CC5500] hover:bg-[#B34A00] text-white text-xs font-semibold rounded-xs transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add to Day Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
