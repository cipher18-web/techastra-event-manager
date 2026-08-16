import React, { useState } from 'react';
import { 
  Plus, 
  Upload, 
  Camera, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Eye,
  Search,
  Image as ImageIcon,
  Receipt,
  ShieldCheck,
  Trash2,
  Pencil
} from 'lucide-react';
import { BudgetItem, ExpenseCategory, ExpenseItem, PaymentMethod } from '../types/techastra';
import { analyzeReceiptWithAI } from '../services/aiService';
import { formatRupees, formatDate } from '../utils/formatters';
import { EditExpenseModal } from './EditExpenseModal';

interface ExpenseTrackerProps {
  expenses: ExpenseItem[];
  budgets?: BudgetItem[];
  onAddExpense: (expense: ExpenseItem) => void;
  onEditExpense?: (expense: ExpenseItem) => void;
  onDeleteExpense?: (id: string) => void;
  onOpenCamera: () => void;
  capturedCameraPhoto: string | null;
  onClearCapturedPhoto: () => void;
  onSelectReceipt: (expense: ExpenseItem) => void;
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

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  budgets,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onOpenCamera,
  capturedCameraPhoto,
  onClearCapturedPhoto,
  onSelectReceipt,
}) => {
  const categoryOptions = budgets && budgets.length > 0
    ? Array.from(new Set(budgets.map((b) => b.category)))
    : DEFAULT_CATEGORIES;
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Hackathon & Contests');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [vendor, setVendor] = useState('');
  const [claimedBy, setClaimedBy] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedReceiptUrl(result);
        onClearCapturedPhoto();
      };
      reader.readAsDataURL(file);
    }
  };

  const activeReceiptUrl = capturedCameraPhoto || uploadedReceiptUrl;

  const handleAIScan = async () => {
    if (!activeReceiptUrl) return;
    setIsScanning(true);
    setScanNotice(null);

    try {
      const result = await analyzeReceiptWithAI(
        activeReceiptUrl,
        Number(amount) || 2500,
        vendor || 'Detecting Vendor...',
        category
      );

      if (result.detectedVendor && result.detectedVendor !== 'Vendor Verified') {
        setVendor(result.detectedVendor);
      }
      if (result.detectedAmount && result.detectedAmount > 0) {
        setAmount(result.detectedAmount.toString());
      }
      if (result.detectedDate) {
        setDate(result.detectedDate);
      }

      setScanNotice(
        `Gemini AI receipt scan: Vendor "${result.detectedVendor}", Amount ${formatRupees(result.detectedAmount)}.`
      );
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !vendor || !claimedBy) return;

    const numAmount = Number(amount);
    const receiptToUse = activeReceiptUrl || undefined;
    const finalCategory = category === ('CUSTOM' as any) ? (customCategory.trim() || 'Miscellaneous') : category;

    let aiResult;
    if (receiptToUse) {
      aiResult = await analyzeReceiptWithAI(receiptToUse, numAmount, vendor, finalCategory);
    }

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title,
      category: finalCategory,
      amount: numAmount,
      vendor,
      date,
      claimedBy,
      claimedByRole: 'Committee Lead',
      paymentMethod,
      receiptUrl: receiptToUse,
      notes,
      status: 'Pending Approval',
      aiVerification: aiResult,
      createdAt: new Date().toISOString(),
    };

    onAddExpense(newExpense);

    // Reset Form
    setTitle('');
    setAmount('');
    setVendor('');
    setClaimedBy('');
    setNotes('');
    setUploadedReceiptUrl(null);
    onClearCapturedPhoto();
    setShowForm(false);
    setScanNotice(null);
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCategoryFilter === 'ALL' || e.category === selectedCategoryFilter;
    const matchesQuery =
      e.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      e.vendor.toLowerCase().includes(searchFilter.toLowerCase()) ||
      e.claimedBy.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 editorial-card rounded-3xl p-6 md:p-8 bg-[#ffffff] border border-[#e3d7c5] shadow-xs">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#0f172a] tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#3a604f]" />
            Reimbursement Claims &amp; Receipts
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Submit event expenses in Rupees (₹) with receipt photos for verification and treasurer disbursement.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold text-xs uppercase tracking-widest rounded-full transition shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-[#bee1d0]" />
          <span>{showForm ? 'Close Form' : 'Submit New Claim →'}</span>
        </button>
      </div>

      {/* Expense Creation Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="editorial-card bg-[#ffffff] border border-[#e3d7c5] rounded-3xl p-6 md:p-8 shadow-xs space-y-6 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#e3d7c5] pb-4">
            <h3 className="text-lg font-serif font-bold text-[#0f172a] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#3a604f]" />
              New Reimbursement Claim
            </h3>
            <span className="text-xs text-[#64748b]">All amounts in Indian Rupees (₹)</span>
          </div>

          <div className="p-3 bg-[#faf6f0] border border-[#e3d7c5] rounded-xl text-[11px] text-[#64748b] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3a604f] shrink-0" />
            <span><strong>Treasurer Review Policy:</strong> Claims enter the queue as <em>Pending Approval</em>. Funds are allocated and disbursed strictly upon Treasurer approval.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Title */}
            <div>
              <label className="block text-[#334155] font-semibold mb-1">Expense Description *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Auditorium Sound System Advance"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[#334155] font-semibold mb-1">Committee Track / Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="CUSTOM">+ Write Custom Category...</option>
              </select>

              {category === ('CUSTOM' as any) && (
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Hospitality & VIP Transport"
                  className="w-full mt-2 bg-[#ffffff] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f] animate-in fade-in"
                />
              )}
            </div>

            {/* Amount in Rupees */}
            <div>
              <label className="block text-[#334155] font-semibold mb-1">Amount (₹ Rupees) *</label>
              <input
                type="number"
                step="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] font-serif font-bold text-sm focus:outline-none focus:border-[#3a604f]"
              />
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-[#334155] font-semibold mb-1">Vendor / Store Name *</label>
              <input
                type="text"
                required
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Audium Pro Systems / GPay Merchant"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              />
            </div>

            {/* Claimed By */}
            <div>
              <label className="block text-[#334155] font-semibold mb-1">Claimant Name / Lead *</label>
              <input
                type="text"
                required
                value={claimedBy}
                onChange={(e) => setClaimedBy(e.target.value)}
                placeholder="e.g. Priya V. (Event Lead)"
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[#334155] font-semibold mb-1">Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Receipt Attachment Section */}
          <div className="p-4 bg-[#faf6f0] rounded-2xl border border-[#e3d7c5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#3a604f]" />
                Receipt Photo / Bill Attachment
              </span>
              <span className="text-[11px] text-[#64748b]">Camera / File Upload</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenCamera}
                className="flex items-center gap-2 px-4 py-2 bg-[#ffffff] hover:bg-[#f0e7d8] text-[#1e293b] border border-[#e3d7c5] rounded-full text-xs font-semibold uppercase tracking-wider transition shadow-xs"
              >
                <Camera className="w-4 h-4 text-[#3a604f]" />
                <span>Snap Photo with WebCam</span>
              </button>

              <label className="flex items-center gap-2 px-4 py-2 bg-[#ffffff] hover:bg-[#f0e7d8] text-[#1e293b] border border-[#e3d7c5] rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer transition shadow-xs">
                <Upload className="w-4 h-4 text-[#2c5282]" />
                <span>Upload Bill File</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              {activeReceiptUrl && (
                <button
                  type="button"
                  onClick={handleAIScan}
                  disabled={isScanning}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] rounded-full text-xs font-semibold uppercase tracking-wider transition shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#bee1d0]" />
                  <span>{isScanning ? 'Scanning...' : 'AI Receipt OCR'}</span>
                </button>
              )}
            </div>

            {/* Receipt Preview */}
            {activeReceiptUrl && (
              <div className="mt-3 flex items-center gap-4 bg-[#ffffff] p-3 rounded-2xl border border-[#e3d7c5]">
                <img
                  src={activeReceiptUrl}
                  alt="Receipt Preview"
                  className="w-16 h-16 object-cover rounded-xl border border-[#e3d7c5] shrink-0"
                />
                <div className="flex-1 text-xs">
                  <span className="text-[#3a604f] font-bold block">Receipt Photo Attached</span>
                  <p className="text-[#64748b] text-[11px] mt-0.5">Ready for verification upon submission.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedReceiptUrl(null);
                    onClearCapturedPhoto();
                  }}
                  className="text-xs text-[#e11d48] font-medium hover:underline px-2 py-1"
                >
                  Remove
                </button>
              </div>
            )}

            {scanNotice && (
              <div className="p-3 bg-[#ffffff] border border-[#3a604f]/30 text-[#0f172a] text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3a604f] shrink-0" />
                <span>{scanNotice}</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e3d7c5]">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-[#64748b] hover:text-[#0f172a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold text-xs uppercase tracking-widest rounded-full shadow-xs transition"
            >
              <CheckCircle2 className="w-4 h-4 text-[#bee1d0]" />
              <span>Submit Claim →</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#ffffff] border border-[#e3d7c5] rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full font-semibold uppercase tracking-wider text-[11px] transition whitespace-nowrap ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-[#3a604f] text-[#fdfbf7]'
                : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f4efe6]'
            }`}
          >
            All Categories
          </button>
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full font-semibold uppercase tracking-wider text-[11px] transition whitespace-nowrap ${
                selectedCategoryFilter === cat
                  ? 'bg-[#3a604f] text-[#fdfbf7]'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f4efe6]'
              }`}
            >
              {String(cat).split('&')[0].trim()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search vendor or title..."
            className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-full pl-9 pr-3 py-1.5 text-xs text-[#0f172a] focus:outline-none focus:border-[#3a604f]"
          />
        </div>
      </div>

      {/* Expenses List Table */}
      <div className="editorial-card rounded-3xl overflow-hidden bg-[#ffffff] border border-[#e3d7c5] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#faf6f0] text-[#64748b] uppercase tracking-widest font-semibold border-b border-[#e3d7c5] text-[10px]">
                <th className="p-4">Receipt</th>
                <th className="p-4">Description &amp; Vendor</th>
                <th className="p-4">Category Track</th>
                <th className="p-4">Claimed By</th>
                <th className="p-4">Amount (₹)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3d7c5] text-[#334155]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#64748b]">
                    <Receipt className="w-8 h-8 text-[#a39580] mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-[#0f172a] uppercase tracking-wider">No reimbursement claims found</p>
                    <p className="text-[11px] text-[#64748b] mt-1">
                      {expenses.length === 0
                        ? 'The registry is currently blank. Click "Submit New Claim" to record an expense.'
                        : 'No claims match the active category filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#faf6f0]/70 transition">
                    <td className="p-4">
                      <div
                        onClick={() => onSelectReceipt(exp)}
                        className="w-10 h-10 rounded-xl overflow-hidden bg-[#faf6f0] border border-[#e3d7c5] flex items-center justify-center cursor-pointer hover:border-[#3a604f] transition"
                      >
                        {exp.receiptUrl ? (
                          <img src={exp.receiptUrl} alt="Receipt" className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-4 h-4 text-[#64748b]" />
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-[#0f172a]">{exp.title}</div>
                      <div className="text-[11px] text-[#64748b]">
                        {exp.vendor} • <span className="font-mono text-[#334155]">{formatDate(exp.date)}</span>
                      </div>
                    </td>

                    <td className="p-4 font-medium text-[#334155]">{exp.category}</td>

                    <td className="p-4">
                      <div className="font-semibold text-[#0f172a]">{exp.claimedBy}</div>
                      <div className="text-[10px] text-[#64748b] uppercase tracking-wider">{exp.paymentMethod}</div>
                    </td>

                    <td className="p-4 font-serif font-bold text-[#0f172a] text-base">{formatRupees(exp.amount)}</td>

                    <td className="p-4">
                      <span
                        className={`inline-block font-semibold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full border ${
                          exp.status === 'Auto-Approved'
                            ? 'bg-[#3a604f]/10 text-[#3a604f] border-[#3a604f]/20'
                            : exp.status === 'Treasurer Approved'
                            ? 'bg-[#2c5282]/10 text-[#2c5282] border-[#2c5282]/20'
                            : exp.status === 'Rejected'
                            ? 'bg-[#e11d48]/10 text-[#e11d48] border-[#e11d48]/20'
                            : 'bg-[#f0e7d8] text-[#475569] border-[#e3d7c5]'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectReceipt(exp)}
                          className="p-1.5 bg-[#f4efe6] hover:bg-[#e8dfd1] text-[#1e293b] rounded-full text-xs font-semibold uppercase tracking-wider transition inline-flex items-center gap-1 border border-[#e3d7c5] px-3"
                          title="Inspect Claim Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#3a604f]" />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingExpense(exp);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 bg-[#ffffff] hover:bg-[#faf6f0] text-[#0f172a] rounded-full text-xs font-semibold uppercase tracking-wider transition inline-flex items-center gap-1 border border-[#e3d7c5] px-2.5 shadow-2xs"
                          title="Edit Reimbursement Claim"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#3a604f]" />
                          <span>Edit</span>
                        </button>
                        {onDeleteExpense && (
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1.5 bg-[#faf6f0] hover:bg-[#ffe4e6] text-[#64748b] hover:text-[#e11d48] rounded-full text-xs font-semibold transition border border-[#e3d7c5] px-2"
                            title="Delete Reimbursement Claim"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
        onSave={(updated) => {
          if (onEditExpense) {
            onEditExpense(updated);
          }
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        budgets={budgets}
      />

    </div>
  );
};
