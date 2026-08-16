import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Search, 
  Sparkles,
  Eye,
  EyeOff,
  Check,
  Ban,
  Lock,
  Unlock,
  Building,
  DollarSign,
  Download,
  Filter,
  Layers,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  User,
  KeyRound,
  Trash2,
  Pencil
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExpenseItem, BudgetItem } from '../types/techastra';
import { formatRupees, formatDate } from '../utils/formatters';
import { EditExpenseModal } from './EditExpenseModal';

interface TreasurerApprovalProps {
  expenses: ExpenseItem[];
  budgets?: BudgetItem[];
  onApproveExpense: (id: string, comment?: string) => void;
  onRejectExpense: (id: string, comment?: string) => void;
  onEditExpense?: (expense: ExpenseItem) => void;
  onDeleteExpense?: (id: string) => void;
  onBatchAutoApprove: () => void;
  onSelectReceipt: (expense: ExpenseItem) => void;
  isTreasurerMode: boolean;
  isTreasurerAuthenticated?: boolean;
  onLoginSuccess?: () => void;
  onLogout?: () => void;
  onUpdateBudget?: (id: string, newAllocated: number) => void;
  onMarkPaidOut?: (id: string) => void;
}

export const TreasurerApproval: React.FC<TreasurerApprovalProps> = ({
  expenses,
  budgets = [],
  onApproveExpense,
  onRejectExpense,
  onEditExpense,
  onDeleteExpense,
  onBatchAutoApprove,
  onSelectReceipt,
  isTreasurerMode,
  isTreasurerAuthenticated = false,
  onLoginSuccess,
  onLogout,
  onUpdateBudget,
  onMarkPaidOut,
}) => {
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('Pending Approval');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [treasurerNote, setTreasurerNote] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesStatus = 
      filterStatus === 'ALL' ? true : e.status === filterStatus;
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.claimedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeItem =
    filteredExpenses.find((e) => e.id === selectedExpenseId) ||
    filteredExpenses[0] ||
    null;

  const pendingCount = expenses.filter((e) => e.status === 'Pending Approval').length;
  const approvedCount = expenses.filter((e) => e.status === 'Treasurer Approved' || e.status === 'Auto-Approved').length;
  const paidOutCount = expenses.filter((e) => e.status === 'Paid Out').length;
  const totalPendingVal = expenses
    .filter((e) => e.status === 'Pending Approval')
    .reduce((acc, e) => acc + e.amount, 0);
  const totalApprovedVal = expenses
    .filter((e) => e.status === 'Treasurer Approved' || e.status === 'Auto-Approved' || e.status === 'Paid Out')
    .reduce((acc, e) => acc + e.amount, 0);

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleApprove = (id: string) => {
    onApproveExpense(id, treasurerNote || 'Approved by Treasurer');
    triggerConfetti();
    showToast('Claim accepted and moved to Treasurer Approved.');
    setTreasurerNote('');
    if (filterStatus === 'Pending Approval') {
      const nextPending = filteredExpenses.find((e) => e.id !== id && e.status === 'Pending Approval');
      setSelectedExpenseId(nextPending ? nextPending.id : null);
    }
  };

  const handleReject = (id: string) => {
    onRejectExpense(id, treasurerNote || 'Declined by Treasurer');
    showToast('Claim declined by Treasurer.');
    setTreasurerNote('');
    if (filterStatus === 'Pending Approval') {
      const nextPending = filteredExpenses.find((e) => e.id !== id && e.status === 'Pending Approval');
      setSelectedExpenseId(nextPending ? nextPending.id : null);
    }
  };

  const handleDelete = (id: string) => {
    if (onDeleteExpense) {
      onDeleteExpense(id);
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      const nextItem = filteredExpenses.find((e) => e.id !== id);
      setSelectedExpenseId(nextItem ? nextItem.id : null);
      showToast('Reimbursement claim record permanently deleted.');
    }
  };

  const handleOpenEdit = (exp: ExpenseItem) => {
    setEditingExpense(exp);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updated: ExpenseItem) => {
    if (onEditExpense) {
      onEditExpense(updated);
    }
    setSelectedExpenseId(updated.id);
    showToast('Reimbursement claim updated successfully.');
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllPending = () => {
    const pendingIds = filteredExpenses
      .filter((e) => e.status === 'Pending Approval')
      .map((e) => e.id);
    if (selectedIds.length === pendingIds.length && pendingIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  const handleBulkApprove = () => {
    selectedIds.forEach((id) => onApproveExpense(id, 'Bulk Approved by Treasurer'));
    setSelectedIds([]);
    triggerConfetti();
    showToast(`Bulk approved ${selectedIds.length} claims.`);
    setSelectedExpenseId(null);
  };

  const handleBulkReject = () => {
    selectedIds.forEach((id) => onRejectExpense(id, 'Bulk Declined by Treasurer'));
    setSelectedIds([]);
    showToast(`Bulk declined ${selectedIds.length} claims.`);
    setSelectedExpenseId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Classical Calm Banner */}
      <div className="editorial-card rounded-3xl p-6 md:p-8 bg-[#ffffff] border border-[#e3d7c5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3a604f]/10 border border-[#3a604f]/20 text-[#3a604f] text-[11px] font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3a604f]" />
            <span>TechAstra Treasury Admin Panel</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#0f172a] font-bold tracking-tight">
            Treasurer Administration &amp; Disbursement Workbench
          </h1>
          <p className="text-xs text-[#64748b] mt-1 max-w-2xl leading-relaxed">
            Review, accept, or decline reimbursement claims submitted by committee leads. Control category budgets and authorize payout disbursements in Indian Rupees (₹).
          </p>
        </div>

        {/* Security / Mode Badge */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-[#faf6f0] p-3 rounded-2xl border border-[#e3d7c5] text-right">
            <span className="text-[11px] text-[#64748b] block uppercase tracking-wider font-medium">Pending Queue</span>
            <span className="text-xl font-serif font-bold text-[#0f172a]">{formatRupees(totalPendingVal)}</span>
          </div>
          {pendingCount > 0 && (
            <button
              onClick={onBatchAutoApprove}
              className="flex items-center gap-2 px-5 py-3 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] text-xs font-semibold uppercase tracking-wider rounded-full shadow-xs transition"
            >
              <Sparkles className="w-4 h-4 text-[#bee1d0]" />
              <span>Treasurer Batch Approve ({pendingCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="editorial-card rounded-2xl bg-[#ffffff] border border-[#e3d7c5] p-5 shadow-xs">
          <span className="text-xs text-[#64748b] font-medium block uppercase tracking-wider">Pending Claims</span>
          <span className="text-2xl font-serif font-bold text-[#0f172a] mt-1 block">{formatRupees(totalPendingVal)}</span>
          <span className="text-[11px] text-[#64748b] mt-1 block">{pendingCount} claims awaiting decision</span>
        </div>

        <div className="editorial-card rounded-2xl bg-[#ffffff] border border-[#e3d7c5] p-5 shadow-xs">
          <span className="text-xs text-[#64748b] font-medium block uppercase tracking-wider">Approved &amp; Disbursed</span>
          <span className="text-2xl font-serif font-bold text-[#3a604f] mt-1 block">{formatRupees(totalApprovedVal)}</span>
          <span className="text-[11px] text-[#64748b] mt-1 block">{approvedCount + paidOutCount} claims verified</span>
        </div>

        <div className="editorial-card rounded-2xl bg-[#ffffff] border border-[#e3d7c5] p-5 shadow-xs">
          <span className="text-xs text-[#64748b] font-medium block uppercase tracking-wider">Department Categories</span>
          <span className="text-2xl font-serif font-bold text-[#0f172a] mt-1 block">{budgets.length} Tracks</span>
          <span className="text-[11px] text-[#64748b] mt-1 block">Active budget allocations</span>
        </div>

        <div className="editorial-card rounded-2xl bg-[#ffffff] border border-[#e3d7c5] p-5 shadow-xs">
          <span className="text-xs text-[#64748b] font-medium block uppercase tracking-wider">Disbursement Method</span>
          <span className="text-2xl font-serif font-bold text-[#2c5282] mt-1 block">UPI / Bank</span>
          <span className="text-[11px] text-[#64748b] mt-1 block">Instant reimbursement</span>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-[#f8fafc] px-4 py-3 rounded-2xl shadow-xl border border-[#334155] text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-navigation Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#ffffff] border border-[#e3d7c5] rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs scrollbar-none">
          {['Pending Approval', 'Auto-Approved', 'Treasurer Approved', 'Paid Out', 'Rejected', 'ALL'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setFilterStatus(st);
                setSelectedExpenseId(null);
              }}
              className={`px-3.5 py-1.5 rounded-full font-semibold uppercase tracking-wider text-[11px] transition whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-[#3a604f] text-[#fdfbf7]'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f4efe6]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor, title or lead..."
            className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-full pl-9 pr-3 py-1.5 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
          />
        </div>
      </div>

      {/* Bulk Select Bar (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-[#f0e7d8] border border-[#e3d7c5] rounded-2xl p-3 flex items-center justify-between text-xs">
          <span className="text-[#0f172a] font-bold">{selectedIds.length} reimbursement claim(s) selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              className="px-4 py-1.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] rounded-full font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Selected</span>
            </button>
            <button
              onClick={handleBulkReject}
              className="px-4 py-1.5 bg-[#ffffff] hover:bg-[#ffe4e6] text-[#e11d48] border border-[#e3d7c5] rounded-full font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1"
            >
              <Ban className="w-3.5 h-3.5 text-[#e11d48]" />
              <span>Decline Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Claims Grid / Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Claims List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">
              Claims Queue ({filteredExpenses.length})
            </h3>
            {filteredExpenses.some((e) => e.status === 'Pending Approval') && (
              <button
                onClick={handleSelectAllPending}
                className="text-[11px] text-[#3a604f] font-semibold hover:underline"
              >
                Toggle Select All Pending
              </button>
            )}
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="p-10 text-center bg-[#ffffff] border border-[#e3d7c5] rounded-3xl text-[#64748b] text-xs space-y-2">
              <FileText className="w-8 h-8 text-[#a39580] mx-auto opacity-60" />
              <p className="font-semibold text-[#0f172a] uppercase tracking-wider">No reimbursement claims found</p>
              <p className="text-[11px] text-[#64748b]">
                {expenses.length === 0 
                  ? 'No claims have been submitted yet. Committee leads can submit claims from the Reimbursement tab.'
                  : 'Try adjusting your search or filter settings above.'}
              </p>
            </div>
          ) : (
            filteredExpenses.map((exp) => {
              const isSelected = activeItem?.id === exp.id;
              const isChecked = selectedIds.includes(exp.id);

              return (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExpenseId(exp.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#ffffff] border-[#3a604f] shadow-sm ring-1 ring-[#3a604f]/20'
                      : 'bg-[#ffffff] hover:bg-[#faf6f0] border-[#e3d7c5]'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {exp.status === 'Pending Approval' && (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(exp.id);
                        }}
                        className="rounded border-[#e3d7c5] text-[#3a604f] focus:ring-[#3a604f] bg-[#faf6f0]"
                      />
                    )}
                    
                    <div className="w-11 h-11 rounded-xl bg-[#faf6f0] border border-[#e3d7c5] overflow-hidden flex items-center justify-center shrink-0">
                      {exp.receiptUrl ? (
                        <img src={exp.receiptUrl} alt="Receipt thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#64748b]" />
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-[#0f172a] truncate">{exp.title}</h4>
                      <p className="text-[11px] text-[#64748b] truncate">
                        {exp.vendor} • <span className="text-[#334155]">{exp.claimedBy}</span>
                      </p>
                      <span className="text-[10px] text-[#64748b] uppercase tracking-wider">{exp.category}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <span className="text-sm font-serif font-bold text-[#0f172a] block">{formatRupees(exp.amount)}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(exp);
                        }}
                        className="p-1 rounded-full hover:bg-[#e8dfd1] text-[#64748b] hover:text-[#3a604f] transition"
                        title="Edit Claim"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <span
                        className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          exp.status === 'Auto-Approved'
                            ? 'bg-[#3a604f]/10 text-[#3a604f] border-[#3a604f]/20'
                            : exp.status === 'Treasurer Approved'
                            ? 'bg-[#2c5282]/10 text-[#2c5282] border-[#2c5282]/20'
                            : exp.status === 'Paid Out'
                            ? 'bg-[#2c5282]/10 text-[#2c5282] border-[#2c5282]/20'
                            : exp.status === 'Rejected'
                            ? 'bg-[#e11d48]/10 text-[#e11d48] border-[#e11d48]/20'
                            : 'bg-[#f0e7d8] text-[#475569] border-[#e3d7c5]'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Claim Inspection & Decision Workbench (7 cols) */}
        <div className="lg:col-span-7 editorial-card bg-[#ffffff] border border-[#e3d7c5] rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between">
          {activeItem ? (
            <div className="space-y-6">
              
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e3d7c5] gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#3a604f]">
                    <span>{activeItem.id}</span>
                    <span className="text-[#64748b]">•</span>
                    <span>{formatDate(activeItem.date)}</span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-[#0f172a] mt-1">{activeItem.title}</h2>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Vendor: <strong className="text-[#0f172a]">{activeItem.vendor}</strong> • Claimed by:{' '}
                    <strong className="text-[#0f172a]">{activeItem.claimedBy}</strong> ({activeItem.claimedByRole})
                  </p>
                  <p className="text-[11px] text-[#64748b]">
                    Payment Method: <span className="text-[#3a604f] font-semibold">{activeItem.paymentMethod}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                  <div className="text-right bg-[#faf6f0] p-4 rounded-2xl border border-[#e3d7c5]">
                    <span className="text-xs text-[#64748b] uppercase tracking-wider block font-medium">Claimed Amount</span>
                    <span className="text-2xl font-serif font-bold text-[#0f172a]">{formatRupees(activeItem.amount)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(activeItem)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#ffffff] hover:bg-[#faf6f0] text-[#0f172a] border border-[#e3d7c5] rounded-full text-xs font-semibold uppercase tracking-wider transition shadow-2xs"
                    title="Edit Claim Details"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#3a604f]" />
                    <span>Edit Claim</span>
                  </button>
                </div>
              </div>

              {/* Receipt Preview & AI OCR Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Receipt Box */}
                <div className="bg-[#faf6f0] border border-[#e3d7c5] rounded-2xl p-3 flex flex-col items-center justify-center relative min-h-[200px]">
                  {activeItem.receiptUrl ? (
                    <>
                      <img
                        src={activeItem.receiptUrl}
                        alt="Receipt Preview"
                        className="max-h-[180px] object-contain rounded-xl border border-[#e3d7c5]"
                      />
                      <button
                        onClick={() => onSelectReceipt(activeItem)}
                        className="mt-2 flex items-center gap-1 px-3 py-1 bg-[#ffffff] hover:bg-[#f0e7d8] text-[#0f172a] border border-[#e3d7c5] rounded-full text-xs font-semibold uppercase tracking-wider transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#3a604f]" />
                        <span>Inspect Full Receipt</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-[#64748b] py-6">
                      <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-xs">No receipt photo attached</span>
                    </div>
                  )}
                </div>

                {/* AI Audit Box */}
                {activeItem.aiVerification ? (
                  <div className="bg-[#faf6f0] border border-[#e3d7c5] rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#e3d7c5]">
                      <span className="font-bold text-[#0f172a] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#3a604f]" />
                        AI Audit Verification
                      </span>
                      <span className="px-2.5 py-0.5 bg-[#3a604f]/10 text-[#3a604f] font-serif font-bold rounded-full border border-[#3a604f]/20">
                        {activeItem.aiVerification.autoApprovalScore}/100
                      </span>
                    </div>

                    <div className="space-y-1 text-[#334155] text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">OCR Vendor:</span>
                        <span className="font-semibold text-[#0f172a]">{activeItem.aiVerification.detectedVendor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">OCR Total:</span>
                        <span className="font-serif font-bold text-[#3a604f]">{formatRupees(activeItem.aiVerification.detectedAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Verification:</span>
                        <span className="text-[#3a604f] font-semibold">
                          {activeItem.aiVerification.amountMatchesClaim ? 'Legible & Valid' : 'Review Required'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#e3d7c5]">
                      <ul className="space-y-1 text-[11px] text-[#64748b]">
                        {activeItem.aiVerification.policyNotes.map((note, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <Check className="w-3.5 h-3.5 text-[#3a604f] shrink-0 mt-0.5" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#faf6f0] border border-[#e3d7c5] rounded-2xl p-4 text-xs text-[#64748b] flex items-center justify-center">
                    <span>Manual verification required</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {activeItem.notes && (
                <div className="p-3 bg-[#faf6f0] rounded-2xl border border-[#e3d7c5] text-xs">
                  <span className="text-[#0f172a] font-bold block">Claimant Notes:</span>
                  <p className="text-[#334155] mt-0.5 leading-relaxed">{activeItem.notes}</p>
                </div>
              )}

              {/* Existing Treasurer Comments */}
              {activeItem.treasurerComment && (
                <div className="p-3 bg-[#faf6f0] rounded-2xl border border-[#3a604f]/30 text-xs">
                  <span className="text-[#3a604f] font-bold block">Treasurer Logged Remark:</span>
                  <p className="text-[#0f172a] mt-0.5">{activeItem.treasurerComment}</p>
                </div>
              )}

              {/* Action Controls */}
              <div className="border-t border-[#e3d7c5] pt-4 space-y-3">
                {/* Current Status Feedback Banner */}
                <div
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    activeItem.status === 'Treasurer Approved' || activeItem.status === 'Auto-Approved'
                      ? 'bg-[#3a604f]/10 border-[#3a604f]/30 text-[#3a604f]'
                      : activeItem.status === 'Paid Out'
                      ? 'bg-[#2c5282]/10 border-[#2c5282]/30 text-[#2c5282]'
                      : activeItem.status === 'Rejected'
                      ? 'bg-[#e11d48]/10 border-[#e11d48]/30 text-[#e11d48]'
                      : 'bg-[#faf6f0] border-[#e3d7c5] text-[#64748b]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {activeItem.status === 'Treasurer Approved' || activeItem.status === 'Auto-Approved' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#3a604f] shrink-0" />
                        <span><strong>Claim Approved:</strong> Funds allocated from <strong>{activeItem.category}</strong> budget.</span>
                      </>
                    ) : activeItem.status === 'Paid Out' ? (
                      <>
                        <CreditCard className="w-4 h-4 text-[#2c5282] shrink-0" />
                        <span><strong>Disbursed &amp; Settled:</strong> Payment released via <strong>{activeItem.paymentMethod}</strong>.</span>
                      </>
                    ) : activeItem.status === 'Rejected' ? (
                      <>
                        <Ban className="w-4 h-4 text-[#e11d48] shrink-0" />
                        <span><strong>Claim Declined:</strong> Marked as rejected by Treasurer.</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-[#64748b] shrink-0" />
                        <span><strong>Pending Decision:</strong> Awaiting Treasurer authorization.</span>
                      </>
                    )}
                  </div>
                  <span className="font-semibold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full bg-white/70 border border-current/20">
                    {activeItem.status}
                  </span>
                </div>

                <label className="block text-xs font-semibold text-[#0f172a]">
                  Treasurer Audit Note / Transaction Reference:
                </label>
                <input
                  type="text"
                  value={treasurerNote}
                  onChange={(e) => setTreasurerNote(e.target.value)}
                  placeholder="e.g. Verified with GST receipt. Paid via UPI Ref #998124"
                  className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                />

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {activeItem.status === 'Pending Approval' ? (
                    <>
                      <button
                        onClick={() => handleApprove(activeItem.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold uppercase tracking-wider rounded-full text-xs transition shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#bee1d0]" />
                        <span>Accept &amp; Approve Claim</span>
                      </button>

                      <button
                        onClick={() => handleReject(activeItem.id)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#ffffff] hover:bg-[#ffe4e6] text-[#e11d48] border border-[#e3d7c5] rounded-full text-xs font-semibold uppercase tracking-wider transition"
                      >
                        <Ban className="w-4 h-4 text-[#e11d48]" />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : activeItem.status === 'Treasurer Approved' || activeItem.status === 'Auto-Approved' ? (
                    <>
                      {onMarkPaidOut && (
                        <button
                          onClick={() => {
                            onMarkPaidOut(activeItem.id);
                            showToast('Claim marked as Disbursed / Paid Out.');
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold uppercase tracking-wider rounded-full text-xs transition shadow-xs"
                        >
                          <CreditCard className="w-4 h-4 text-[#bee1d0]" />
                          <span>Mark Disbursed / Paid Out</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleReject(activeItem.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ffffff] hover:bg-[#ffe4e6] text-[#e11d48] border border-[#e3d7c5] rounded-full text-xs font-semibold uppercase tracking-wider transition"
                        title="Revert decision and decline claim"
                      >
                        <Ban className="w-4 h-4 text-[#e11d48]" />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : activeItem.status === 'Rejected' ? (
                    <button
                      onClick={() => handleApprove(activeItem.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold uppercase tracking-wider rounded-full text-xs transition shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#bee1d0]" />
                      <span>Reconsider &amp; Accept Claim</span>
                    </button>
                  ) : (
                    <div className="flex-1 text-xs text-[#64748b] font-medium py-2">
                      Claim finalized and disbursed.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(activeItem)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#ffffff] hover:bg-[#faf6f0] text-[#0f172a] border border-[#e3d7c5] rounded-full text-xs font-semibold uppercase tracking-wider transition shadow-2xs"
                    title="Edit Claim Details"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#3a604f]" />
                    <span>Edit</span>
                  </button>

                  {onDeleteExpense && (
                    <button
                      onClick={() => handleDelete(activeItem.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ffffff] hover:bg-[#ffe4e6] text-[#e11d48] border border-[#e3d7c5] rounded-full text-xs font-semibold transition"
                      title="Permanently Delete Claim Record"
                    >
                      <Trash2 className="w-4 h-4 text-[#e11d48]" />
                      <span>Delete Record</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-[#64748b] text-xs">
              Select a claim from the list to review receipt details and approve/decline.
            </div>
          )}
        </div>

      </div>

      {/* Edit Claim Modal */}
      <EditExpenseModal
        expense={editingExpense}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveEdit}
        budgets={budgets}
      />

    </div>
  );
};
