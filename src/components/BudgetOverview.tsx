import React, { useState } from 'react';
import { 
  PieChart, 
  User, 
  Edit3, 
  Check, 
  X,
  Plus,
  Trash2,
  Building,
  Briefcase
} from 'lucide-react';
import { BudgetItem, ExpenseItem } from '../types/techastra';
import { formatRupees } from '../utils/formatters';

interface BudgetOverviewProps {
  budgets: BudgetItem[];
  expenses: ExpenseItem[];
  onUpdateBudget: (id: string, newAllocated: number) => void;
  onSaveBudget?: (budget: BudgetItem) => void;
  onDeleteBudget?: (id: string) => void;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budgets,
  expenses,
  onUpdateBudget,
  onSaveBudget,
  onDeleteBudget,
}) => {
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form Fields
  const [categoryName, setCategoryName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [leadPerson, setLeadPerson] = useState<string>('');
  const [allocatedAmount, setAllocatedAmount] = useState<string>('');

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setCategoryName('');
    setDescription('');
    setLeadPerson('');
    setAllocatedAmount('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: BudgetItem) => {
    setEditingItem(b);
    setCategoryName(b.category);
    setDescription(b.description || '');
    setLeadPerson(b.leadPerson || '');
    setAllocatedAmount(b.allocatedAmount.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const amountNum = Number(allocatedAmount) || 0;

    if (editingItem) {
      const updated: BudgetItem = {
        ...editingItem,
        category: categoryName.trim(),
        description: description.trim(),
        leadPerson: leadPerson.trim() || 'Committee Lead',
        allocatedAmount: amountNum,
      };
      if (onSaveBudget) {
        onSaveBudget(updated);
      } else {
        onUpdateBudget(updated.id, amountNum);
      }
    } else {
      const newItem: BudgetItem = {
        id: `b-${Date.now()}`,
        category: categoryName.trim(),
        description: description.trim(),
        leadPerson: leadPerson.trim() || 'Committee Lead',
        allocatedAmount: amountNum,
      };
      if (onSaveBudget) {
        onSaveBudget(newItem);
      }
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const totalAllocated = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="editorial-card rounded-3xl p-6 md:p-8 bg-[#ffffff] border border-[#e3d7c5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3a604f]/10 border border-[#3a604f]/20 text-[#3a604f] text-[11px] font-semibold uppercase tracking-wider mb-2">
            <PieChart className="w-3.5 h-3.5 text-[#3a604f]" />
            <span>TechAstra Departmental Budget Allocations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#0f172a] font-bold tracking-tight">
            Department Budget Ceilings (₹)
          </h1>
          <p className="text-xs text-[#64748b] mt-1 max-w-2xl leading-relaxed">
            Configure department tracks, edit scope of work, assign leads, and set budget ceilings. Money is allocated strictly when the Treasurer approves expense claims.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold text-xs uppercase tracking-widest rounded-full transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#bee1d0]" />
            <span>Add Department →</span>
          </button>

          <div className="bg-[#faf6f0] p-4 rounded-2xl border border-[#e3d7c5] text-right w-full sm:w-auto">
            <span className="text-[11px] text-[#64748b] block font-medium uppercase tracking-wider">Total Event Allocated Budget</span>
            <span className="text-2xl font-serif font-bold text-[#0f172a]">{formatRupees(totalAllocated)}</span>
          </div>
        </div>
      </div>

      {/* Categories Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((b) => {
          const categorySpent = expenses
            .filter(
              (e) =>
                e.category === b.category &&
                (e.status === 'Auto-Approved' || e.status === 'Treasurer Approved' || e.status === 'Paid Out')
            )
            .reduce((acc, e) => acc + e.amount, 0);

          const categoryPending = expenses
            .filter((e) => e.category === b.category && e.status === 'Pending Approval')
            .reduce((acc, e) => acc + e.amount, 0);

          const remaining = b.allocatedAmount - categorySpent;
          const percentUsed = b.allocatedAmount > 0 
            ? Math.min(100, Math.round((categorySpent / b.allocatedAmount) * 100)) 
            : 0;

          return (
            <div
              key={b.id}
              className="editorial-card rounded-3xl bg-[#ffffff] border border-[#e3d7c5] p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-serif font-bold text-[#0f172a]">{b.category}</h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(b)}
                      className="p-1.5 text-[#0f172a] hover:text-[#3a604f] bg-[#faf6f0] hover:bg-[#f0e7d8] border border-[#e3d7c5] rounded-full transition inline-flex items-center gap-1 text-xs px-2.5 font-semibold uppercase tracking-wider"
                      title="Edit Department Name & Work"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#3a604f]" />
                      <span>Edit</span>
                    </button>
                    {onDeleteBudget && (
                      <button
                        onClick={() => onDeleteBudget(b.id)}
                        className="p-1.5 text-[#64748b] hover:text-[#e11d48] bg-[#faf6f0] hover:bg-[#ffe4e6] border border-[#e3d7c5] rounded-full transition px-2"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#64748b] leading-relaxed min-h-[36px]">{b.description || 'No work description specified.'}</p>
              </div>

              {/* Allocation Value & Stats */}
              <div className="bg-[#faf6f0] p-4 rounded-2xl border border-[#e3d7c5] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748b] font-medium">Allocated Ceiling:</span>
                  <span className="text-base font-serif font-bold text-[#0f172a]">{formatRupees(b.allocatedAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-[#334155]">
                  <span className="text-[#64748b]">Approved Spent:</span>
                  <span className="font-serif font-bold text-[#3a604f]">{formatRupees(categorySpent)}</span>
                </div>

                {categoryPending > 0 && (
                  <div className="flex items-center justify-between text-[#334155]">
                    <span className="text-[#64748b]">Pending Claims:</span>
                    <span className="font-serif font-bold text-[#2c5282]">{formatRupees(categoryPending)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-[#e3d7c5] pt-2">
                  <span className="text-[#64748b] font-medium">Remaining Balance:</span>
                  <span
                    className={`font-serif font-bold ${
                      remaining < 0 ? 'text-[#e11d48]' : 'text-[#0f172a]'
                    }`}
                  >
                    {formatRupees(remaining)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] text-[#64748b] mb-1 font-medium">
                  <span>Utilization</span>
                  <span className="font-serif font-bold text-[#0f172a]">{percentUsed}%</span>
                </div>
                <div className="w-full bg-[#f0e7d8] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      percentUsed > 90
                        ? 'bg-[#e11d48]'
                        : percentUsed > 75
                        ? 'bg-[#d97706]'
                        : 'bg-[#3a604f]'
                    }`}
                    style={{ width: `${percentUsed}%` }}
                  />
                </div>
              </div>

              {/* Committee Lead */}
              <div className="text-[11px] text-[#64748b] flex items-center justify-between pt-1 border-t border-[#e3d7c5]">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#3a604f]" />
                  <span>Lead: <strong className="text-[#0f172a]">{b.leadPerson || 'Committee Lead'}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="editorial-card bg-[#ffffff] border border-[#e3d7c5] rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e3d7c5] pb-3">
              <h3 className="text-lg font-serif font-bold text-[#0f172a] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#3a604f]" />
                {editingItem ? 'Edit Department & Work Scope' : 'Add New Department Track'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#64748b] hover:text-[#0f172a]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#334155] font-semibold mb-1">
                  Department / Track Name <span className="text-[#e11d48]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Stage, AV & Auditorium or Hackathon & Contests"
                  className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                />
              </div>

              <div>
                <label className="block text-[#334155] font-semibold mb-1">
                  Work &amp; Scope Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the responsibilities and scope of work covered by this department (e.g., LED walls, line arrays, stage lighting)"
                  className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#334155] font-semibold mb-1">
                    Department Lead / Contact
                  </label>
                  <input
                    type="text"
                    value={leadPerson}
                    onChange={(e) => setLeadPerson(e.target.value)}
                    placeholder="e.g. Rahul Sharma (Tech Lead)"
                    className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                  />
                </div>

                <div>
                  <label className="block text-[#334155] font-semibold mb-1">
                    Allocated Budget Ceiling (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={allocatedAmount}
                    onChange={(e) => setAllocatedAmount(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] font-serif font-bold text-sm focus:outline-none focus:border-[#3a604f]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#e3d7c5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-[#64748b] hover:text-[#0f172a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold uppercase tracking-wider text-xs rounded-full shadow-xs transition"
                >
                  {editingItem ? 'Update Department' : 'Save Department →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

