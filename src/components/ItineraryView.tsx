import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Phone,
  Search,
  X,
  Pencil,
  Trash2,
  Wallet,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { BudgetItem, EventDay, ExpenseCategory, ExpenseItem, ItineraryItem } from '../types/techastra';
import { formatRupees } from '../utils/formatters';

interface ItineraryViewProps {
  itinerary: ItineraryItem[];
  budgets?: BudgetItem[];
  expenses?: ExpenseItem[];
  onAddItineraryItem: (item: ItineraryItem) => void;
  onEditItineraryItem?: (item: ItineraryItem) => void;
  onDeleteItineraryItem?: (id: string) => void;
}

const DEFAULT_DAYS: EventDay[] = ['Day 1', 'Day 2', 'Day 3'];
const STANDARD_CATEGORIES = ['Keynote', 'Hackathon', 'Workshop', 'Esports', 'Cultural', 'Valedictory'];

export const ItineraryView: React.FC<ItineraryViewProps> = ({ 
  itinerary, 
  budgets = [],
  expenses = [],
  onAddItineraryItem,
  onEditItineraryItem,
  onDeleteItineraryItem
}) => {
  // Saved Day Dates map e.g. { "Day 1": "Nov 15, 2026", "Day 2": "Nov 16, 2026" }
  const [dayDates, setDayDates] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('techastra_day_dates_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Dynamically compile all unique days from itinerary + default days
  const allDays = Array.from(
    new Set([...DEFAULT_DAYS, ...Object.keys(dayDates), ...itinerary.map((i) => i.day)])
  ).filter(Boolean);

  const [selectedDay, setSelectedDay] = useState<EventDay>('Day 1');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDateConfigModal, setShowDateConfigModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Live Budget Metrics from Treasurer Allocations
  const totalTreasurerBudget = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);

  const totalItineraryBudget = itinerary.reduce((acc, item) => {
    if (item.allocatedBudget && item.allocatedBudget > 0) return acc + item.allocatedBudget;
    const catBudget = budgets.find((b) => b.category === item.linkedCategory);
    return acc + (catBudget ? catBudget.allocatedAmount : 0);
  }, 0);

  const dayItineraryBudget = itinerary
    .filter((i) => i.day === selectedDay)
    .reduce((acc, item) => {
      if (item.allocatedBudget && item.allocatedBudget > 0) return acc + item.allocatedBudget;
      const catBudget = budgets.find((b) => b.category === item.linkedCategory);
      return acc + (catBudget ? catBudget.allocatedAmount : 0);
    }, 0);

  // Form State
  const [title, setTitle] = useState('');
  const [dayOption, setDayOption] = useState<string>('Day 1');
  const [customDay, setCustomDay] = useState<string>('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [location, setLocation] = useState('Main Auditorium');
  const [categoryOption, setCategoryOption] = useState<string>('Workshop');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [speakerOrHost, setSpeakerOrHost] = useState('');
  const [linkedCategory, setLinkedCategory] = useState<ExpenseCategory>('Workshops & Tech Equipment');
  const [allocatedBudget, setAllocatedBudget] = useState('10000');
  const [description, setDescription] = useState('');
  const [coordinatorContact, setCoordinatorContact] = useState('');

  const handleUpdateDayDate = (dayKey: string, dateVal: string) => {
    const updated = { ...dayDates, [dayKey]: dateVal };
    setDayDates(updated);
    try {
      localStorage.setItem('techastra_day_dates_v1', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setDayOption(allDays.includes(selectedDay) ? selectedDay : allDays[0] || 'Day 1');
    setCustomDay('');
    setStartTime('09:00 AM');
    setEndTime('11:00 AM');
    setLocation('Main Auditorium');
    setCategoryOption('Workshop');
    setCustomCategory('');
    setSpeakerOrHost('');
    const defaultCat = (budgets[0]?.category as ExpenseCategory) || 'Workshops & Tech Equipment';
    const defaultAmt = budgets.find((b) => b.category === defaultCat)?.allocatedAmount || 10000;
    setLinkedCategory(defaultCat);
    setAllocatedBudget(String(defaultAmt));
    setDescription('');
    setCoordinatorContact('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: ItineraryItem) => {
    setEditingItem(item);
    setTitle(item.title);

    if (allDays.includes(item.day)) {
      setDayOption(item.day);
      setCustomDay('');
    } else {
      setDayOption('CUSTOM');
      setCustomDay(item.day);
    }

    if (STANDARD_CATEGORIES.includes(item.category)) {
      setCategoryOption(item.category);
      setCustomCategory('');
    } else {
      setCategoryOption('CUSTOM');
      setCustomCategory(item.category);
    }

    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setLocation(item.location);
    setSpeakerOrHost(item.speakerOrHost);
    setLinkedCategory(item.linkedCategory || 'Workshops & Tech Equipment');
    setAllocatedBudget(String(item.allocatedBudget || 0));
    setDescription(item.description || '');
    setCoordinatorContact(item.coordinatorContact || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !speakerOrHost) return;

    const finalDay = dayOption === 'CUSTOM' ? (customDay.trim() || 'Custom Date') : dayOption;
    const finalCategory = categoryOption === 'CUSTOM' ? (customCategory.trim() || 'General') : categoryOption;

    if (editingItem && onEditItineraryItem) {
      const updatedItem: ItineraryItem = {
        ...editingItem,
        title,
        day: finalDay,
        startTime,
        endTime,
        location,
        category: finalCategory,
        speakerOrHost,
        linkedCategory,
        allocatedBudget: Number(allocatedBudget) || 0,
        description,
        coordinatorContact: coordinatorContact || 'Organising Committee (+91 90000 00000)',
      };
      onEditItineraryItem(updatedItem);
    } else {
      const newItem: ItineraryItem = {
        id: `itin-${Date.now()}`,
        title,
        day: finalDay,
        startTime,
        endTime,
        location,
        category: finalCategory,
        speakerOrHost,
        linkedCategory,
        allocatedBudget: Number(allocatedBudget) || 0,
        description,
        coordinatorContact: coordinatorContact || 'Organising Committee (+91 90000 00000)',
        isHighlight: true,
      };
      onAddItineraryItem(newItem);
    }

    // Switch tab to the new day so user sees the newly added item
    setSelectedDay(finalDay);
    setShowAddModal(false);
    setEditingItem(null);
  };

  const dayEvents = itinerary.filter(
    (i) => i.day === selectedDay &&
    (i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     i.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
     i.speakerOrHost.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="editorial-card rounded-3xl p-6 md:p-8 bg-[#ffffff] border border-[#e3d7c5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3a604f]/10 border border-[#3a604f]/20 text-[#3a604f] text-[11px] font-semibold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#3a604f]" />
            <span>TechAstra 2026 Master Itinerary</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#0f172a] font-bold tracking-tight">
            Event Schedule & Track Allocations
          </h1>
          <p className="text-xs text-[#64748b] mt-1 max-w-2xl leading-relaxed">
            Sessions, workshops, keynotes, and hackathon schedules mapped to coordinators.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold text-xs uppercase tracking-widest rounded-full transition shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-[#bee1d0]" />
          <span>Add Itinerary Event →</span>
        </button>
      </div>

      {/* Treasurer Budget Allocation Summary Banner */}
      <div className="editorial-card rounded-3xl p-5 md:p-6 bg-[#ffffff] border border-[#e3d7c5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e3d7c5] pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#3a604f]" />
            <h2 className="text-sm font-serif font-bold text-[#0f172a] uppercase tracking-wider">
              Treasurer Department Budget Allocation & Schedule Linkage
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#3a604f]/10 text-[#3a604f] font-semibold border border-[#3a604f]/20 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Live Synced with Budgets Tab
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#faf6f0] p-4 rounded-2xl border border-[#e3d7c5]">
            <span className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider block">
              Total Treasurer Allocated Budget
            </span>
            <span className="text-xl font-serif font-bold text-[#3a604f] block mt-1">
              {formatRupees(totalTreasurerBudget)}
            </span>
            <span className="text-[10px] text-[#64748b] block mt-0.5"> Across all department track ceilings </span>
          </div>

          <div className="bg-[#faf6f0] p-4 rounded-2xl border border-[#e3d7c5]">
            <span className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider block">
              Total Itinerary Events Allocation
            </span>
            <span className="text-xl font-serif font-bold text-[#0f172a] block mt-1">
              {formatRupees(totalItineraryBudget)}
            </span>
            <span className="text-[10px] text-[#64748b] block mt-0.5"> Linked across {itinerary.length} scheduled events </span>
          </div>

          <div className="bg-[#faf6f0] p-4 rounded-2xl border border-[#e3d7c5]">
            <span className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider block">
              {selectedDay} Allocated Budget
            </span>
            <span className="text-xl font-serif font-bold text-[#2c5282] block mt-1">
              {formatRupees(dayItineraryBudget)}
            </span>
            <span className="text-[10px] text-[#64748b] block mt-0.5"> Total for sessions on {selectedDay} </span>
          </div>
        </div>

        {/* Live Department Track Pills */}
        {budgets.length > 0 && budgets.some((b) => b.allocatedAmount > 0) && (
          <div className="pt-2 border-t border-[#e3d7c5]">
            <span className="text-[11px] font-semibold text-[#334155] uppercase tracking-wider block mb-2">
              Treasurer Department Allocations:
            </span>
            <div className="flex flex-wrap gap-2">
              {budgets
                .filter((b) => b.allocatedAmount > 0)
                .map((b) => {
                  const trackItineraryTotal = itinerary
                    .filter((i) => i.linkedCategory === b.category)
                    .reduce((sum, item) => sum + (item.allocatedBudget || 0), 0);
                  return (
                    <div
                      key={b.id}
                      className="px-3 py-1.5 bg-[#faf6f0] border border-[#e3d7c5] rounded-xl text-xs flex items-center gap-2"
                    >
                      <span className="font-semibold text-[#0f172a]">{b.category}:</span>
                      <span className="font-serif font-bold text-[#3a604f]">{formatRupees(b.allocatedAmount)}</span>
                      {trackItineraryTotal > 0 && (
                        <span className="text-[10px] text-[#64748b] bg-[#ffffff] px-1.5 py-0.5 rounded-md border border-[#e3d7c5]">
                          Scheduled: {formatRupees(trackItineraryTotal)}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Day Selector & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#ffffff] border border-[#e3d7c5] rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none text-xs">
          {allDays.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-4 py-2 rounded-full font-semibold transition whitespace-nowrap text-xs flex items-center gap-1.5 ${
                selectedDay === d
                  ? 'bg-[#3a604f] text-[#fdfbf7] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#faf6f0]'
              }`}
            >
              <span>{d}</span>
              {dayDates[d] && (
                <span className={`text-[10px] font-normal ${selectedDay === d ? 'text-[#bee1d0]' : 'text-[#64748b]'}`}>
                  ({dayDates[d]})
                </span>
              )}
            </button>
          ))}

          <button
            onClick={() => setShowDateConfigModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#faf6f0] hover:bg-[#e3d7c5]/50 border border-[#e3d7c5] text-[#334155] rounded-full text-[11px] font-semibold transition whitespace-nowrap shrink-0 ml-1"
            title="Set calendar dates for Day 1, Day 2, etc."
          >
            <Calendar className="w-3.5 h-3.5 text-[#3a604f]" />
            <span>Set Dates</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search session or location..."
              className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-full pl-9 pr-3 py-2 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
            />
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold text-xs uppercase tracking-wider rounded-full transition shadow-xs whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#bee1d0]" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Timeline Schedule Cards */}
      <div className="space-y-4">
        {dayEvents.length === 0 ? (
          <div className="p-12 text-center bg-[#ffffff] border border-[#e3d7c5] rounded-3xl text-[#64748b] text-xs space-y-3 shadow-xs">
            <Calendar className="w-8 h-8 text-[#94a3b8] mx-auto opacity-60" />
            <p className="font-serif font-bold text-[#0f172a] text-sm">No events scheduled for {selectedDay}</p>
            <p className="text-xs text-[#64748b] max-w-md mx-auto leading-relaxed">
              {itinerary.length === 0
                ? 'The festival schedule is currently blank. Click below to add keynotes, hackathons, and workshops.'
                : 'No sessions match your search query for this day.'}
            </p>
            <div>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold text-xs uppercase tracking-wider rounded-full transition shadow-xs mt-1"
              >
                <Plus className="w-4 h-4 text-[#bee1d0]" />
                <span>Add Event to {selectedDay} →</span>
              </button>
            </div>
          </div>
        ) : (
          dayEvents.map((item) => (
            <div
              key={item.id}
              className="editorial-card rounded-3xl bg-[#ffffff] border border-[#e3d7c5] p-6 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full bg-[#3a604f]/10 text-[#3a604f] font-semibold border border-[#3a604f]/20 flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-[#3a604f]" />
                      {item.startTime} - {item.endTime}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-[#faf6f0] text-[#0f172a] border border-[#e3d7c5] text-[11px] font-semibold">
                      {item.category}
                    </span>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="px-3 py-1.5 bg-[#faf6f0] hover:bg-[#f0e7d8] text-[#0f172a] border border-[#e3d7c5] rounded-full text-xs font-semibold uppercase tracking-wider transition inline-flex items-center gap-1.5"
                      title="Edit Event Details"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#3a604f]" />
                      <span>Edit</span>
                    </button>
                    {onDeleteItineraryItem && (
                      <button
                        onClick={() => onDeleteItineraryItem(item.id)}
                        className="px-3 py-1.5 bg-[#faf6f0] hover:bg-[#ffe4e6] text-[#64748b] hover:text-[#e11d48] border border-[#e3d7c5] rounded-full text-xs font-semibold uppercase tracking-wider transition inline-flex items-center gap-1.5"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#e11d48]" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold text-[#0f172a]">{item.title}</h3>
                  <p className="text-xs text-[#64748b] mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748b] pt-1">
                  <span className="flex items-center gap-1.5 text-[#0f172a] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#3a604f]" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#0f172a] font-medium">
                    <User className="w-3.5 h-3.5 text-[#2c5282]" />
                    {item.speakerOrHost}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#64748b]">
                    <Phone className="w-3.5 h-3.5 text-[#3a604f]" />
                    {item.coordinatorContact}
                  </span>
                </div>
              </div>

              {item.linkedCategory && (() => {
                const categoryBudget = budgets.find((b) => b.category === item.linkedCategory);
                const treasurerAllocated = categoryBudget ? categoryBudget.allocatedAmount : 0;
                const categorySpent = expenses
                  .filter((e) => e.category === item.linkedCategory && (e.status === 'Treasurer Approved' || e.status === 'Paid Out' || e.status === 'Auto-Approved'))
                  .reduce((sum, e) => sum + e.amount, 0);

                return (
                  <div className="bg-[#faf6f0] p-4 rounded-2xl border border-[#e3d7c5] md:w-64 text-xs space-y-1.5 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#64748b] uppercase font-semibold tracking-wider block">
                        Linked Track Budget
                      </span>
                      <span className="text-[9px] bg-[#3a604f]/10 text-[#3a604f] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Treasurer Synced
                      </span>
                    </div>
                    <span className="text-[#0f172a] font-bold block truncate">{item.linkedCategory}</span>

                    <div className="space-y-1 pt-1.5 border-t border-[#e3d7c5]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">Treasurer Track Total:</span>
                        <span className="font-serif font-bold text-[#3a604f]">{formatRupees(treasurerAllocated)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">Event Allocation:</span>
                        <span className="font-serif font-bold text-[#0f172a]">
                          {formatRupees(item.allocatedBudget || treasurerAllocated)}
                        </span>
                      </div>

                      {categorySpent > 0 && (
                        <div className="flex items-center justify-between text-[11px] text-[#2563eb]">
                          <span>Track Disbursed:</span>
                          <span className="font-semibold">{formatRupees(categorySpent)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Itinerary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="editorial-card bg-[#ffffff] border border-[#e3d7c5] rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e3d7c5] pb-3">
              <h3 className="text-lg font-serif font-bold text-[#0f172a] flex items-center gap-2">
                {editingItem ? <Pencil className="w-4 h-4 text-[#3a604f]" /> : <Plus className="w-4 h-4 text-[#3a604f]" />}
                {editingItem ? 'Edit Schedule Event' : 'Add Schedule Event'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#64748b] hover:text-[#0f172a]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#334155] font-semibold mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Prompt Challenge Finals"
                  className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Event Day / Date */}
                <div>
                  <label className="block text-[#334155] font-semibold mb-1">Event Date / Day *</label>
                  <select
                    value={dayOption}
                    onChange={(e) => setDayOption(e.target.value)}
                    className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                  >
                    {allDays.map((d) => (
                      <option key={d} value={d}>
                        {d} {dayDates[d] ? `(${dayDates[d]})` : ''}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Write / Pick Custom Date or Day...</option>
                  </select>

                  {dayOption === 'CUSTOM' && (
                    <div className="mt-2 space-y-1.5 animate-in fade-in">
                      <input
                        type="text"
                        required
                        value={customDay}
                        onChange={(e) => setCustomDay(e.target.value)}
                        placeholder="e.g. Nov 15, 2026 or Day 4 (Nov 27)"
                        className="w-full bg-[#ffffff] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                      />
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[10px] text-[#64748b]">Or select date:</span>
                        <input
                          type="date"
                          onChange={(e) => {
                            if (e.target.value) {
                              const dateObj = new Date(e.target.value + 'T00:00:00');
                              const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                              setCustomDay(formatted);
                            }
                          }}
                          className="bg-[#ffffff] border border-[#e3d7c5] rounded-lg px-2 py-1 text-[11px] text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[#334155] font-semibold mb-1">Category *</label>
                  <select
                    value={categoryOption}
                    onChange={(e) => setCategoryOption(e.target.value)}
                    className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                  >
                    {STANDARD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="CUSTOM">+ Write Custom Category...</option>
                  </select>

                  {categoryOption === 'CUSTOM' && (
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Robotics Demo or Networking Dinner"
                      className="w-full mt-2 bg-[#ffffff] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f] animate-in fade-in"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#334155] font-semibold mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a]"
                  />
                </div>
                <div>
                  <label className="block text-[#334155] font-semibold mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="01:00 PM"
                    className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#334155] font-semibold mb-1">Venue / Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Auditorium Hall B"
                  className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a]"
                />
              </div>

              <div>
                <label className="block text-[#334155] font-semibold mb-1">Speaker / Host / Lead *</label>
                <input
                  type="text"
                  required
                  value={speakerOrHost}
                  onChange={(e) => setSpeakerOrHost(e.target.value)}
                  placeholder="e.g. Dr. K. Sharma"
                  className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a]"
                />
              </div>

              <div>
                <label className="block text-[#334155] font-semibold mb-1">Coordinator Contact</label>
                <input
                  type="text"
                  value={coordinatorContact}
                  onChange={(e) => setCoordinatorContact(e.target.value)}
                  placeholder="e.g. Priya V. (+91 98765 43210)"
                  className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a]"
                />
              </div>

              {/* Linked Committee Track & Budget */}
              <div className="p-4 bg-[#faf6f0] border border-[#e3d7c5] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-[#3a604f]" />
                    Linked Treasurer Department Budget
                  </span>
                  <span className="text-[10px] bg-[#3a604f]/10 text-[#3a604f] px-2 py-0.5 rounded-full font-semibold">
                    Live Synced
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#334155] font-semibold text-xs mb-1">
                      Department Track *
                    </label>
                    <select
                      value={linkedCategory}
                      onChange={(e) => {
                        const newCat = e.target.value as ExpenseCategory;
                        setLinkedCategory(newCat);
                        const matched = budgets.find((b) => b.category === newCat);
                        if (matched && matched.allocatedAmount > 0) {
                          setAllocatedBudget(String(matched.allocatedAmount));
                        }
                      }}
                      className="w-full bg-[#ffffff] border border-[#e3d7c5] rounded-xl px-3 py-2 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                    >
                      {budgets.length > 0 ? (
                        budgets.map((b) => (
                          <option key={b.id} value={b.category}>
                            {b.category} (₹{b.allocatedAmount.toLocaleString('en-IN')})
                          </option>
                        ))
                      ) : (
                        <option value="Workshops & Tech Equipment">Workshops & Tech Equipment</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#334155] font-semibold text-xs mb-1">
                      Event Allocated Budget (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={allocatedBudget}
                      onChange={(e) => setAllocatedBudget(e.target.value)}
                      placeholder="10000"
                      className="w-full bg-[#ffffff] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                    />
                  </div>
                </div>

                {/* Helper info & auto-fill button */}
                {(() => {
                  const selectedBudgetItem = budgets.find((b) => b.category === linkedCategory);
                  const treasurerAmt = selectedBudgetItem ? selectedBudgetItem.allocatedAmount : 0;
                  return (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#e3d7c5] text-[11px] text-[#64748b]">
                      <span>
                        Treasurer Track Allocation: <strong className="text-[#3a604f]">{formatRupees(treasurerAmt)}</strong>
                      </span>
                      {treasurerAmt > 0 && Number(allocatedBudget) !== treasurerAmt && (
                        <button
                          type="button"
                          onClick={() => setAllocatedBudget(String(treasurerAmt))}
                          className="px-2 py-0.5 bg-[#ffffff] hover:bg-[#e3d7c5]/50 border border-[#e3d7c5] text-[#3a604f] font-semibold rounded-lg transition"
                        >
                          ⚡ Auto-fill ₹{treasurerAmt.toLocaleString('en-IN')}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-[#334155] font-semibold mb-1">Session Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary..."
                  className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl p-3 text-[#0f172a]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e3d7c5]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[#64748b] hover:text-[#0f172a] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold uppercase tracking-wider text-xs rounded-full shadow-xs transition"
                >
                  {editingItem ? 'Update Event' : 'Save Event →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Date Configuration Modal */}
      {showDateConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#ffffff] border border-[#e3d7c5] rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowDateConfigModal(false)}
              className="absolute top-5 right-5 text-[#64748b] hover:text-[#0f172a] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3a604f]/10 text-[#3a604f] text-[11px] font-semibold uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Calendar Setup</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#0f172a]">Set Calendar Dates for Festival Days</h3>
              <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                Assign exact dates to Day 1, Day 2, Day 3, etc. You can pick dates using the calendar picker or enter any custom text.
              </p>
            </div>

            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {allDays.map((dayKey) => (
                <div key={dayKey} className="p-3.5 bg-[#faf6f0] border border-[#e3d7c5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-[#0f172a] text-xs block">{dayKey}</span>
                    <span className="text-[11px] text-[#64748b]">
                      {dayDates[dayKey] ? `Assigned Date: ${dayDates[dayKey]}` : 'No date set yet'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      onChange={(e) => {
                        if (e.target.value) {
                          const dateObj = new Date(e.target.value + 'T00:00:00');
                          const formatted = dateObj.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          });
                          handleUpdateDayDate(dayKey, formatted);
                        }
                      }}
                      className="bg-[#ffffff] border border-[#e3d7c5] rounded-xl px-2.5 py-1.5 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                    />
                    <input
                      type="text"
                      placeholder="or type e.g. Nov 15"
                      value={dayDates[dayKey] || ''}
                      onChange={(e) => handleUpdateDayDate(dayKey, e.target.value)}
                      className="w-28 bg-[#ffffff] border border-[#e3d7c5] rounded-xl px-2.5 py-1.5 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#e3d7c5]">
              <button
                onClick={() => setShowDateConfigModal(false)}
                className="px-6 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] text-xs font-semibold uppercase tracking-wider rounded-full transition shadow-xs"
              >
                Save Schedule Dates →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
