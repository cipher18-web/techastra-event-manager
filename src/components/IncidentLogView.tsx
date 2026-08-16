import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Sparkles, 
  X, 
  FileText, 
  Wrench,
  Search,
  CheckCircle2,
  Trash2,
  Pencil,
  Check,
  CheckCircle
} from 'lucide-react';
import { IncidentNote, IncidentSeverity, IncidentStatus, EventDay } from '../types/techastra';
import { generateFailurePostMortemAI } from '../services/aiService';
import { formatRupees } from '../utils/formatters';
import { EditIncidentModal } from './EditIncidentModal';

interface IncidentLogViewProps {
  incidents: IncidentNote[];
  onAddIncident: (incident: IncidentNote) => void;
  onEditIncident?: (incident: IncidentNote) => void;
  onUpdateStatus: (id: string, status: IncidentStatus, correctiveAction?: string) => void;
  onDeleteIncident?: (id: string) => void;
}

const DEFAULT_DAYS: EventDay[] = ['Day 1', 'Day 2', 'Day 3'];

export const IncidentLogView: React.FC<IncidentLogViewProps> = ({
  incidents,
  onAddIncident,
  onEditIncident,
  onUpdateStatus,
  onDeleteIncident,
}) => {
  const allDays = Array.from(
    new Set([...DEFAULT_DAYS, ...incidents.map((i) => i.day)])
  ).filter(Boolean);

  const [showForm, setShowForm] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & inline edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<IncidentNote | null>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineCorrectiveText, setInlineCorrectiveText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartInlineEdit = (inc: IncidentNote) => {
    setInlineEditingId(inc.id);
    setInlineCorrectiveText(inc.correctiveAction || '');
  };

  const handleSaveInlineCorrective = (inc: IncidentNote) => {
    const updated: IncidentNote = {
      ...inc,
      correctiveAction: inlineCorrectiveText.trim(),
    };
    if (onEditIncident) {
      onEditIncident(updated);
    } else {
      onUpdateStatus(inc.id, inc.status, inlineCorrectiveText.trim());
    }
    setInlineEditingId(null);
    showToast('Corrective action updated successfully.');
  };

  const handleOpenFullEdit = (inc: IncidentNote) => {
    setEditingIncident(inc);
    setIsEditModalOpen(true);
  };

  const handleSaveFullEdit = (updated: IncidentNote) => {
    if (onEditIncident) {
      onEditIncident(updated);
    } else {
      onUpdateStatus(updated.id, updated.status, updated.correctiveAction);
    }
    showToast('Incident note and corrective action saved.');
  };

  // New Failure Form state
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('major');
  const [category, setCategory] = useState<'Technical/AV' | 'Logistics' | 'Catering' | 'Schedule/Delay' | 'Finance/UPI' | 'Security'>('Technical/AV');
  const [day, setDay] = useState<EventDay>('Day 1');
  const [customDay, setCustomDay] = useState<string>('');
  const [location, setLocation] = useState('Main Auditorium');
  const [reportedBy, setReportedBy] = useState('');
  const [description, setDescription] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [financialImpact, setFinancialImpact] = useState<string>('0');

  // AI Post-Mortem Report State
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !reportedBy) return;

    const finalDay = day === 'CUSTOM' ? (customDay.trim() || 'Day 1') : day;

    const newNote: IncidentNote = {
      id: `inc-${Date.now()}`,
      title,
      severity,
      category,
      timestamp: new Date().toLocaleString(),
      day: finalDay,
      location,
      reportedBy,
      description,
      status: 'open',
      correctiveAction,
      financialImpact: Number(financialImpact) || 0,
      createdAt: new Date().toISOString(),
    };

    onAddIncident(newNote);
    setShowForm(false);

    // Reset Form
    setTitle('');
    setDescription('');
    setCorrectiveAction('');
    setFinancialImpact('0');
    setCustomDay('');
  };

  const handleGenerateAiReport = async () => {
    setIsGeneratingReport(true);
    try {
      const totalCost = incidents.reduce((acc, i) => acc + (i.financialImpact || 0), 0);
      const report = await generateFailurePostMortemAI(incidents, totalCost);
      setAiReport(report);
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSev = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchesQuery =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesQuery;
  });

  const totalLeakageCost = incidents.reduce((acc, i) => acc + (i.financialImpact || 0), 0);
  const unresolvedCount = incidents.filter((i) => i.status !== 'resolved').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="editorial-card rounded-3xl p-6 md:p-8 bg-[#ffffff] border border-[#e3d7c5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3a604f]/10 border border-[#3a604f]/20 text-[#3a604f] text-[11px] font-semibold uppercase tracking-wider mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#3a604f]" />
            <span>TechAstra Operations Incident Register</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#0f172a] font-bold tracking-tight">
            Event Failures & Glitches Log
          </h1>
          <p className="text-xs text-[#64748b] mt-1 max-w-2xl leading-relaxed">
            Document AV cuts, stage delays, payment timeouts, and operational failures during TechAstra with corrective actions and AI post-mortems.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleGenerateAiReport}
            disabled={isGeneratingReport || incidents.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#faf6f0] hover:bg-[#f0e7d8] text-[#0f172a] font-semibold text-xs rounded-full border border-[#e3d7c5] transition disabled:opacity-40 uppercase tracking-wider shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#3a604f]" />
            <span>{isGeneratingReport ? 'Synthesizing...' : 'AI Incident Post-Mortem'}</span>
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold text-xs uppercase tracking-widest rounded-full transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#bee1d0]" />
            <span>Log Failure Note →</span>
          </button>
        </div>
      </div>

      {/* KPI Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="editorial-card rounded-2xl bg-[#ffffff] border border-[#e3d7c5] p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-[#64748b] font-medium block">Total Incidents Logged</span>
            <span className="text-xl font-serif font-bold text-[#0f172a]">{incidents.length} failure(s)</span>
          </div>
          <div className="p-2.5 bg-[#faf6f0] text-[#0f172a] border border-[#e3d7c5] rounded-xl">
            <FileText className="w-5 h-5 text-[#3a604f]" />
          </div>
        </div>

        <div className="editorial-card rounded-2xl bg-[#ffffff] border border-[#e3d7c5] p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-[#64748b] font-medium block">Open / Active Issues</span>
            <span className={`text-xl font-serif font-bold ${unresolvedCount > 0 ? 'text-[#d97706]' : 'text-[#3a604f]'}`}>
              {unresolvedCount} active
            </span>
          </div>
          <div className="p-2.5 bg-[#faf6f0] text-[#d97706] border border-[#e3d7c5] rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="editorial-card rounded-2xl bg-[#ffffff] border border-[#e3d7c5] p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs text-[#64748b] font-medium block">Extra Financial Cost Incurred</span>
            <span className="text-xl font-serif font-bold text-[#0f172a]">{formatRupees(totalLeakageCost)}</span>
          </div>
          <div className="p-2.5 bg-[#faf6f0] text-[#0f172a] border border-[#e3d7c5] rounded-xl">
            <span className="font-serif font-bold text-lg">₹</span>
          </div>
        </div>
      </div>

      {/* AI Post-Mortem Report Panel */}
      {aiReport && (
        <div className="editorial-card bg-[#ffffff] border border-[#e3d7c5] rounded-3xl p-6 shadow-xl relative animate-in fade-in duration-200">
          <button
            onClick={() => setAiReport(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#64748b] hover:text-[#0f172a] bg-[#faf6f0] border border-[#e3d7c5]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#0f172a] font-serif font-bold text-base mb-4">
            <Sparkles className="w-5 h-5 text-[#3a604f]" />
            <span>AI Incident Post-Mortem Synthesis</span>
          </div>

          <div className="prose prose-sm max-w-none text-[#0f172a] bg-[#faf6f0] p-5 rounded-2xl border border-[#e3d7c5] overflow-auto max-h-[60vh] font-mono leading-relaxed text-xs">
            <div whitespace-pre-wrap="true">{aiReport}</div>
          </div>
        </div>
      )}

      {/* Log Failure Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="editorial-card bg-[#ffffff] border border-[#e3d7c5] rounded-3xl p-6 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-200 text-xs"
        >
          <div className="flex items-center justify-between border-b border-[#e3d7c5] pb-3">
            <h3 className="text-base font-serif font-bold text-[#0f172a] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#3a604f]" />
              Log Event Failure Note
            </h3>
            <span className="text-[#64748b]">Record technical or operational breakdown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#334155] font-semibold mb-1">Incident Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Stage 2 Microphone Audio Dropout"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              />
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1">Severity *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3 py-2 text-[#0f172a]"
              >
                <option value="critical">Critical (Event Halted)</option>
                <option value="major">Major (Performance Impact)</option>
                <option value="minor">Minor (Low Impact)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3 py-2 text-[#0f172a]"
              >
                <option value="Technical/AV">Technical / AV</option>
                <option value="Logistics">Logistics & Infrastructure</option>
                <option value="Catering">Catering & Hospitality</option>
                <option value="Schedule/Delay">Schedule / Delay</option>
                <option value="Finance/UPI">Finance / Payment Glitch</option>
                <option value="Security">Security & Crowd Control</option>
              </select>
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1">Event Day / Date *</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as EventDay)}
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              >
                {allDays.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
                <option value="CUSTOM">+ Custom Date or Day Label...</option>
              </select>

              {day === 'CUSTOM' && (
                <input
                  type="text"
                  required
                  value={customDay}
                  onChange={(e) => setCustomDay(e.target.value)}
                  placeholder="e.g. Day 4 or Nov 20, 2026"
                  className="w-full mt-2 bg-[#ffffff] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f] animate-in fade-in"
                />
              )}
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1">Location / Venue *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Auditorium / Lab 3"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a]"
              />
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1">Reported By *</label>
              <input
                type="text"
                required
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="e.g. Vikram S. (Operations Lead)"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#334155] font-semibold mb-1">Failure Description & Root Cause *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail what happened during the event..."
              className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl p-3 text-[#0f172a]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#334155] font-semibold mb-1">Corrective Action Taken</label>
              <input
                type="text"
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                placeholder="e.g. Replaced microphone cable with spare unit"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a]"
              />
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1">Extra Financial Cost (₹ Rupees)</label>
              <input
                type="number"
                value={financialImpact}
                onChange={(e) => setFinancialImpact(e.target.value)}
                placeholder="0"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] font-serif font-bold text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#e3d7c5]">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-[#64748b] hover:text-[#0f172a] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold uppercase tracking-wider text-xs rounded-full shadow-xs transition"
            >
              Save Incident Note →
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#ffffff] border border-[#e3d7c5] rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
          {['ALL', 'critical', 'major', 'minor'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-4 py-2 rounded-full font-semibold uppercase transition whitespace-nowrap text-xs ${
                severityFilter === sev
                  ? 'bg-[#3a604f] text-[#fdfbf7] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#faf6f0]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident notes..."
            className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-full pl-9 pr-3 py-2 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
          />
        </div>
      </div>

      {/* Failures Cards Feed */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center bg-[#ffffff] border border-[#e3d7c5] rounded-3xl text-[#64748b] text-xs space-y-2 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-[#94a3b8] mx-auto opacity-60" />
            <p className="font-serif font-bold text-[#0f172a] text-sm">Clean Operational Log (No Incidents)</p>
            <p className="text-xs text-[#64748b]">
              {incidents.length === 0
                ? 'No glitches or failures logged yet. Click "Log Failure Note" if an operational issue occurs.'
                : 'No failure notes match the selected filter.'}
            </p>
          </div>
        ) : (
          filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className={`editorial-card rounded-3xl bg-[#ffffff] border p-6 shadow-xs transition space-y-3 ${
                inc.severity === 'critical'
                  ? 'border-[#e11d48]/40 bg-[#fff1f2]'
                  : inc.severity === 'major'
                  ? 'border-[#d97706]/40 bg-[#fffbeb]'
                  : 'border-[#e3d7c5]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e3d7c5] pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      inc.severity === 'critical'
                        ? 'bg-[#ffe4e6] text-[#e11d48] border border-[#fda4af]'
                        : inc.severity === 'major'
                        ? 'bg-[#fef3c7] text-[#d97706] border border-[#fde68a]'
                        : 'bg-[#faf6f0] text-[#0f172a] border border-[#e3d7c5]'
                    }`}
                  >
                    {inc.severity}
                  </span>

                  <span className="text-xs font-semibold text-[#64748b]">
                    {inc.day} • {inc.timestamp}
                  </span>

                  <span className="text-xs bg-[#faf6f0] text-[#0f172a] border border-[#e3d7c5] px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                    {inc.category}
                  </span>
                </div>

                {/* Status Toggle buttons, Full Edit & Delete */}
                <div className="flex items-center gap-1.5 text-xs flex-wrap justify-end">
                  <button
                    onClick={() => onUpdateStatus(inc.id, 'open')}
                    className={`px-3 py-1 rounded-full font-semibold transition text-xs ${
                      inc.status === 'open'
                        ? 'bg-[#d97706] text-[#ffffff] shadow-xs'
                        : 'text-[#64748b] hover:text-[#0f172a]'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => onUpdateStatus(inc.id, 'investigating')}
                    className={`px-3 py-1 rounded-full font-semibold transition text-xs ${
                      inc.status === 'investigating'
                        ? 'bg-[#2c5282] text-[#ffffff] shadow-xs'
                        : 'text-[#64748b] hover:text-[#0f172a]'
                    }`}
                  >
                    Investigating
                  </button>
                  <button
                    onClick={() => onUpdateStatus(inc.id, 'resolved')}
                    className={`px-3 py-1 rounded-full font-semibold transition text-xs ${
                      inc.status === 'resolved'
                        ? 'bg-[#3a604f] text-[#ffffff] shadow-xs'
                        : 'text-[#64748b] hover:text-[#0f172a]'
                    }`}
                  >
                    Resolved
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenFullEdit(inc)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#ffffff] hover:bg-[#faf6f0] text-[#0f172a] border border-[#e3d7c5] rounded-full text-xs font-semibold uppercase tracking-wider transition shadow-2xs ml-1"
                    title="Edit full incident details & corrective action"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#3a604f]" />
                    <span>Edit</span>
                  </button>

                  {onDeleteIncident && (
                    <button
                      onClick={() => onDeleteIncident(inc.id)}
                      className="p-1.5 bg-[#faf6f0] hover:bg-[#ffe4e6] text-[#64748b] hover:text-[#e11d48] border border-[#e3d7c5] rounded-full transition"
                      title="Delete Incident Note"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#e11d48]" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base font-serif font-bold text-[#0f172a]">{inc.title}</h3>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">{inc.description}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-[#64748b]">
                  <span>Location: <strong className="text-[#334155]">{inc.location || 'Venue'}</strong></span>
                  <span>•</span>
                  <span>Reported by: <strong className="text-[#334155]">{inc.reportedBy}</strong></span>
                </div>
              </div>

              {/* Action Taken & Cost Footer with Quick Corrective Edit Option */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#faf6f0] p-4 rounded-2xl border border-[#e3d7c5] text-xs">
                <div className="flex-1">
                  {inlineEditingId === inc.id ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#3a604f] uppercase tracking-wider flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Update Corrective Action / Resolution:</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={inlineCorrectiveText}
                          onChange={(e) => setInlineCorrectiveText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveInlineCorrective(inc);
                            if (e.key === 'Escape') setInlineEditingId(null);
                          }}
                          placeholder="e.g. Swapped audio receiver, deployed backup battery pack..."
                          className="flex-1 bg-[#ffffff] border border-[#3a604f] rounded-xl px-3 py-1.5 text-xs text-[#0f172a] focus:outline-none shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveInlineCorrective(inc)}
                          className="px-3 py-1.5 bg-[#3a604f] hover:bg-[#284735] text-[#ffffff] rounded-xl text-xs font-semibold transition flex items-center gap-1 shrink-0"
                          title="Save Corrective Option"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setInlineEditingId(null)}
                          className="p-1.5 hover:bg-[#e8dfd1] text-[#64748b] rounded-xl transition shrink-0"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 text-[#334155]">
                        <Wrench className="w-4 h-4 text-[#3a604f] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[#64748b] font-semibold">Corrective Action: </span>
                          <span className="text-[#0f172a] font-medium">
                            {inc.correctiveAction ? inc.correctiveAction : (
                              <span className="text-[#94a3b8] italic">No corrective action specified yet</span>
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStartInlineEdit(inc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ffffff] hover:bg-[#f4efe6] text-[#3a604f] border border-[#e3d7c5] rounded-full text-[11px] font-semibold uppercase tracking-wider transition shrink-0 ml-2 shadow-2xs"
                        title="Quick edit corrective option"
                      >
                        <Pencil className="w-3 h-3 text-[#3a604f]" />
                        <span>{inc.correctiveAction ? 'Change Action' : 'Add Action'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0 pl-3 border-t sm:border-t-0 sm:border-l border-[#e3d7c5] pt-2 sm:pt-0">
                  <span className="text-[#64748b] text-[10px] block font-semibold uppercase tracking-wider">Financial Impact</span>
                  <span className="font-serif font-bold text-[#0f172a] text-sm">
                    {formatRupees(inc.financialImpact || 0)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Incident Modal */}
      <EditIncidentModal
        incident={editingIncident}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingIncident(null);
        }}
        onSave={handleSaveFullEdit}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-[#ffffff] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-4 h-4 text-[#bee1d0]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
