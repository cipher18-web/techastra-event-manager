import React from 'react';
import { X, Download, ZoomIn, ZoomOut, FileText, CheckCircle } from 'lucide-react';
import { ExpenseItem } from '../types/techastra';
import { formatRupees } from '../utils/formatters';

interface ReceiptModalProps {
  expense: ExpenseItem | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ expense, onClose }) => {
  const [zoom, setZoom] = React.useState(1);

  if (!expense) return null;

  const handleDownload = () => {
    if (!expense.receiptUrl) return;
    const a = document.createElement('a');
    a.href = expense.receiptUrl;
    a.download = `TechAstra_Receipt_${expense.id}_${expense.vendor}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-stone-100 font-serif font-bold text-base flex items-center gap-2">
                {expense.title}
              </h3>
              <p className="text-xs text-stone-400">
                Vendor: <span className="text-stone-200">{expense.vendor}</span> • Claimed by: <span className="text-stone-200">{expense.claimedBy}</span> ({formatRupees(expense.amount)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((prev) => Math.min(prev + 0.25, 2.5))}
              className="p-1.5 bg-stone-800 text-stone-300 hover:text-stone-100 rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.75))}
              className="p-1.5 bg-stone-800 text-stone-300 hover:text-stone-100 rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 bg-stone-800 text-stone-300 hover:text-stone-100 rounded-lg transition"
              title="Download Receipt Image"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-stone-800 text-stone-400 hover:text-stone-100 rounded-lg transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-6 bg-stone-950 flex flex-col md:flex-row gap-6 items-center md:items-start justify-center">
          {/* Image Display */}
          <div className="flex-1 min-h-[300px] w-full flex items-center justify-center overflow-auto rounded-xl bg-stone-900 border border-stone-800 p-4">
            {expense.receiptUrl ? (
              <img
                src={expense.receiptUrl}
                alt={`Receipt for ${expense.title}`}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                className="max-h-[60vh] object-contain transition-transform duration-150 rounded"
              />
            ) : (
              <div className="text-center text-stone-500 py-12">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No receipt image attached to this expense.</p>
              </div>
            )}
          </div>

          {/* AI Verification Side Card */}
          {expense.aiVerification && (
            <div className="w-full md:w-80 bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="font-semibold text-stone-300 uppercase font-mono tracking-wider text-[11px]">
                  Gemini AI Audit Report
                </span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded font-mono">
                  {Math.round((expense.aiVerification.confidence || 0.95) * 100)}% Match
                </span>
              </div>

              <div className="space-y-1.5 text-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-400">OCR Vendor:</span>
                  <span className="font-medium text-stone-200">{expense.aiVerification.detectedVendor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">OCR Total:</span>
                  <span className="font-mono font-medium text-emerald-400">{formatRupees(expense.aiVerification.detectedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Invoice Date:</span>
                  <span>{expense.aiVerification.detectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Policy Score:</span>
                  <span className="font-semibold text-amber-300">{expense.aiVerification.autoApprovalScore}/100</span>
                </div>
              </div>

              <div className="mt-2 bg-stone-950 p-2.5 rounded-lg border border-stone-800 space-y-1">
                <p className="font-medium text-stone-300 text-[11px]">Item Line Scan:</p>
                <ul className="list-disc list-inside text-stone-400 text-[11px] space-y-0.5">
                  {expense.aiVerification.detectedItems.map((item, idx) => (
                    <li key={idx} className="truncate">{item}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1 mt-1">
                <p className="font-medium text-stone-300 text-[11px]">Policy Checks:</p>
                {expense.aiVerification.policyNotes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-stone-400 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 flex justify-between items-center text-xs text-stone-400">
          <span>TechAstra Expense ID: {expense.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-medium transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
