import React, { useState, useEffect } from 'react';
import { X, Wrench, AlertTriangle, Check, Save } from 'lucide-react';
import { IncidentNote, IncidentSeverity, IncidentStatus, EventDay } from '../types/techastra';

interface EditIncidentModalProps {
  incident: IncidentNote | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedIncident: IncidentNote) => void;
}

const CATEGORIES: ('Technical/AV' | 'Logistics' | 'Catering' | 'Schedule/Delay' | 'Finance/UPI' | 'Security')[] = [
  'Technical/AV',
  'Logistics',
  'Catering',
  'Schedule/Delay',
  'Finance/UPI',
  'Security',
];

const SEVERITIES: IncidentSeverity[] = ['minor', 'major', 'critical'];
const STATUSES: IncidentStatus[] = ['open', 'investigating', 'resolved'];

export const EditIncidentModal: React.FC<EditIncidentModalProps> = ({
  incident,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('major');
  const [category, setCategory] = useState<'Technical/AV' | 'Logistics' | 'Catering' | 'Schedule/Delay' | 'Finance/UPI' | 'Security'>('Technical/AV');
  const [day, setDay] = useState<EventDay>('Day 1');
  const [customDay, setCustomDay] = useState('');
  const [location, setLocation] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [description, setDescription] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [financialImpact, setFinancialImpact] = useState<string>('0');
  const [status, setStatus] = useState<IncidentStatus>('open');

  useEffect(() => {
    if (incident) {
      setTitle(incident.title || '');
      setSeverity(incident.severity || 'major');
      setCategory(incident.category || 'Technical/AV');
      
      if (['Day 1', 'Day 2', 'Day 3'].includes(incident.day)) {
        setDay(incident.day);
        setCustomDay('');
      } else {
        setDay('CUSTOM');
        setCustomDay(incident.day || '');
      }

      setLocation(incident.location || '');
      setReportedBy(incident.reportedBy || '');
      setDescription(incident.description || '');
      setCorrectiveAction(incident.correctiveAction || '');
      setFinancialImpact(String(incident.financialImpact ?? 0));
      setStatus(incident.status || 'open');
    }
  }, [incident, isOpen]);

  if (!isOpen || !incident) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !reportedBy.trim()) return;

    const finalDay = day === 'CUSTOM' ? (customDay.trim() || 'Day 1') : day;

    const updated: IncidentNote = {
      ...incident,
      title: title.trim(),
      severity,
      category,
      day: finalDay,
      location: location.trim(),
      reportedBy: reportedBy.trim(),
      description: description.trim(),
      correctiveAction: correctiveAction.trim(),
      financialImpact: Number(financialImpact) || 0,
      status,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#ffffff] border border-[#e3d7c5] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e3d7c5] flex items-center justify-between bg-[#faf6f0]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#3a604f]/10 text-[#3a604f] rounded-2xl border border-[#3a604f]/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#0f172a]">
                Edit Incident Note & Corrective Action
              </h3>
              <p className="text-xs text-[#64748b]">
                Incident Reference: <span className="font-mono font-medium text-[#3a604f]">{incident.id}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#e8dfd1] text-[#64748b] hover:text-[#0f172a] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Status & Severity Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#334155] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                Incident Status
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#faf6f0] p-1 rounded-xl border border-[#e3d7c5]">
                {STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-1.5 rounded-lg font-semibold uppercase text-[10px] transition ${
                      status === st
                        ? st === 'resolved'
                          ? 'bg-[#3a604f] text-[#ffffff] shadow-xs'
                          : st === 'investigating'
                          ? 'bg-[#2c5282] text-[#ffffff] shadow-xs'
                          : 'bg-[#d97706] text-[#ffffff] shadow-xs'
                        : 'text-[#64748b] hover:text-[#0f172a]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1 uppercase tracking-wider text-[11px]">
                Severity Level
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#faf6f0] p-1 rounded-xl border border-[#e3d7c5]">
                {SEVERITIES.map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-1.5 rounded-lg font-semibold uppercase text-[10px] transition ${
                      severity === sev
                        ? sev === 'critical'
                          ? 'bg-[#e11d48] text-[#ffffff] shadow-xs'
                          : sev === 'major'
                          ? 'bg-[#d97706] text-[#ffffff] shadow-xs'
                          : 'bg-[#3a604f] text-[#ffffff] shadow-xs'
                        : 'text-[#64748b] hover:text-[#0f172a]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[#334155] font-semibold mb-1">Incident Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Main Stage Audio Feedback & Mic Cutout"
              className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] font-medium focus:outline-none focus:border-[#3a604f]"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#334155] font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1">Location / Venue Zone</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Auditorium, CS Lab 2"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              />
            </div>
          </div>

          {/* Day & Reporter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#334155] font-semibold mb-1">Event Day</label>
              <div className="flex gap-2">
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                >
                  <option value="Day 1">Day 1</option>
                  <option value="Day 2">Day 2</option>
                  <option value="Day 3">Day 3</option>
                  <option value="CUSTOM">Custom Day...</option>
                </select>
                {day === 'CUSTOM' && (
                  <input
                    type="text"
                    value={customDay}
                    onChange={(e) => setCustomDay(e.target.value)}
                    placeholder="e.g. Prep Day"
                    className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3 py-2 text-[#0f172a]"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1">Reported By *</label>
              <input
                type="text"
                required
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                placeholder="e.g. Vikram S. (Operations Lead)"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#334155] font-semibold mb-1">Failure Description & Root Cause *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail what happened, impact on attendees/schedule, and root cause..."
              className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl p-3 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
            />
          </div>

          {/* Corrective Action Taken & Financial Impact */}
          <div className="bg-[#faf6f0] border border-[#e3d7c5] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-[#3a604f] font-semibold">
              <Wrench className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-bold text-[#0f172a]">
                Corrective Option / Action Plan
              </span>
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1">
                Corrective Action Taken & Prevention Strategy
              </label>
              <textarea
                rows={2}
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                placeholder="Describe the solution applied (e.g. Replaced faulty XLR cable with backup audio line, assigned dedicated stage volunteer)..."
                className="w-full bg-[#ffffff] border border-[#e3d7c5] rounded-xl p-3 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              />
            </div>

            <div>
              <label className="block text-[#334155] font-semibold mb-1">Extra Financial Cost (₹ INR)</label>
              <input
                type="number"
                value={financialImpact}
                onChange={(e) => setFinancialImpact(e.target.value)}
                placeholder="0"
                className="w-full bg-[#ffffff] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] font-serif font-bold text-sm focus:outline-none focus:border-[#3a604f]"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#e3d7c5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#64748b] hover:text-[#0f172a] font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold uppercase tracking-wider text-xs rounded-full shadow-xs transition"
            >
              <Save className="w-4 h-4 text-[#bee1d0]" />
              <span>Save Incident Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
