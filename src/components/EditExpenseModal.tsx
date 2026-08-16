import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Upload, 
  Pencil, 
  FileText, 
  Building, 
  CreditCard, 
  User, 
  Calendar, 
  FileEdit,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ExpenseItem, BudgetItem, ExpenseCategory, PaymentMethod, ReimbursementStatus } from '../types/techastra';
import { formatRupees } from '../utils/formatters';

interface EditExpenseModalProps {
  expense: ExpenseItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ExpenseItem) => void;
  budgets?: BudgetItem[];
}

const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  'Hackathon & Contests',
  'Stage, AV & Auditorium',
  'Food & Catering',
  'Swag, Trophies & Kits',
  'Workshops & Tech Equipment',
  'Marketing & Banners',
  'Logistics & Travel',
  'Miscellaneous',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Bank Transfer',
  'Credit Card',
  'Cash',
  'Reimbursement Claim',
];

const STATUS_OPTIONS: ReimbursementStatus[] = [
  'Pending Approval',
  'Auto-Approved',
  'Treasurer Approved',
  'Paid Out',
  'Rejected',
  'Draft',
];

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  expense,
  isOpen,
  onClose,
  onSave,
  budgets = [],
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Hackathon & Contests');
  const [amount, setAmount] = useState<string>('');
  const [vendor, setVendor] = useState('');
  const [claimedBy, setClaimedBy] = useState('');
  const [claimedByRole, setClaimedByRole] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<ReimbursementStatus>('Pending Approval');
  const [notes, setNotes] = useState('');
  const [treasurerComment, setTreasurerComment] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = budgets && budgets.length > 0
    ? Array.from(new Set(budgets.map((b) => b.category)))
    : DEFAULT_CATEGORIES;

  useEffect(() => {
    if (expense) {
      setTitle(expense.title || '');
      setCategory(expense.category || 'Hackathon & Contests');
      setAmount(expense.amount ? String(expense.amount) : '');
      setVendor(expense.vendor || '');
      setClaimedBy(expense.claimedBy || '');
      setClaimedByRole(expense.claimedByRole || 'TechAstra Volunteer');
      setPaymentMethod(expense.paymentMethod || 'UPI');
      setDate(expense.date || new Date().toISOString().split('T')[0]);
      setStatus(expense.status || 'Pending Approval');
      setNotes(expense.notes || '');
      setTreasurerComment(expense.treasurerComment || '');
      setReceiptUrl(expense.receiptUrl);
      setError(null);
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setReceiptUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount in ₹');
      return;
    }
    if (!vendor.trim()) {
      setError('Vendor / Payee name is required');
      return;
    }
    if (!claimedBy.trim()) {
      setError('Claimant name is required');
      return;
    }

    const updated: ExpenseItem = {
      ...expense,
      title: title.trim(),
      category,
      amount: numAmount,
      vendor: vendor.trim(),
      claimedBy: claimedBy.trim(),
      claimedByRole: claimedByRole.trim() || 'Committee Lead',
      paymentMethod,
      date: date || new Date().toISOString().split('T')[0],
      status,
      notes: notes.trim(),
      treasurerComment: treasurerComment.trim() || undefined,
      receiptUrl,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#ffffff] border border-[#e3d7c5] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#e3d7c5] flex items-center justify-between bg-[#faf6f0]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#3a604f]/10 border border-[#3a604f]/20 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-[#3a604f]" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#0f172a]">Edit Reimbursement Claim</h3>
              <p className="text-[11px] text-[#64748b]">Claim ID: {expense.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#e8dfd1] text-[#64748b] hover:text-[#0f172a] transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#e11d48]/10 border border-[#e11d48]/30 rounded-2xl text-xs text-[#e11d48] flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                Claim Title / Item Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hackathon Wi-Fi AP Routers"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                Budget Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Amount & Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                Claim Amount (₹ INR) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 4500"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-xs text-[#0f172a] font-serif font-bold focus:outline-none focus:border-[#3a604f]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                Vendor / Payee Name *
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. ElectroTech Supplies Ltd"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                required
              />
            </div>
          </div>

          {/* Row 3: Claimed By & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                Claimant Lead Name *
              </label>
              <input
                type="text"
                value={claimedBy}
                onChange={(e) => setClaimedBy(e.target.value)}
                placeholder="e.g. Rohit Sharma"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                Committee Role
              </label>
              <input
                type="text"
                value={claimedByRole}
                onChange={(e) => setClaimedByRole(e.target.value)}
                placeholder="e.g. Technical Track Lead"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              />
            </div>
          </div>

          {/* Row 4: Payment Method, Date, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                Expense Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                Approval Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReimbursementStatus)}
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-xs text-[#0f172a] font-semibold focus:outline-none focus:border-[#3a604f]"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: Notes & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                Claimant Notes / Item Breakdown
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Provide purchase context, quantities or purpose..."
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl p-3 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0f172a] mb-1">
                Treasurer Audit Remark / UPI Ref
              </label>
              <textarea
                value={treasurerComment}
                onChange={(e) => setTreasurerComment(e.target.value)}
                rows={2}
                placeholder="Audit notes, disbursement reference or approval conditions..."
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl p-3 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              />
            </div>
          </div>

          {/* Row 6: Receipt Attachment */}
          <div className="p-4 bg-[#faf6f0] rounded-2xl border border-[#e3d7c5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0f172a] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#3a604f]" />
                Receipt Proof Attachment
              </span>
              {receiptUrl && (
                <button
                  type="button"
                  onClick={() => setReceiptUrl(undefined)}
                  className="text-[11px] text-[#e11d48] font-semibold hover:underline"
                >
                  Remove Receipt
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {receiptUrl ? (
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-[#e3d7c5] bg-white shrink-0">
                  <img src={receiptUrl} alt="Receipt preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl border border-dashed border-[#e3d7c5] bg-white flex items-center justify-center text-[#64748b] text-[11px] text-center p-2 shrink-0">
                  No image attached
                </div>
              )}

              <div className="flex-1 w-full space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#f0e7d8] border border-[#e3d7c5] rounded-full text-xs font-semibold text-[#0f172a] transition">
                  <Upload className="w-3.5 h-3.5 text-[#3a604f]" />
                  <span>Upload / Replace Receipt Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-[#64748b]">
                  Supported formats: PNG, JPG, WEBP. Attaching clean receipts accelerates audit clearance.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#e3d7c5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-[#faf6f0] text-[#64748b] border border-[#e3d7c5] rounded-full text-xs font-semibold uppercase tracking-wider transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] rounded-full text-xs font-semibold uppercase tracking-wider transition flex items-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4 text-[#bee1d0]" />
              <span>Save Claim Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
