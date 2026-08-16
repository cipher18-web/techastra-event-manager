export type ExpenseCategory = 
  | 'Hackathon & Contests'
  | 'Stage, AV & Auditorium'
  | 'Food & Catering'
  | 'Swag, Trophies & Kits'
  | 'Marketing & Banners'
  | 'Workshops & Tech Equipment'
  | 'Logistics & Travel'
  | 'Miscellaneous'
  | (string & {});

export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Reimbursement Claim';

export type ReimbursementStatus = 
  | 'Draft'
  | 'Pending Approval'
  | 'Auto-Approved'
  | 'Treasurer Approved'
  | 'Rejected'
  | 'Paid Out';

export interface AIVerificationResult {
  detectedVendor: string;
  detectedAmount: number;
  detectedDate: string;
  detectedItems: string[];
  legibleReceipt: boolean;
  amountMatchesClaim: boolean;
  autoApprovalScore: number; // 0 to 100
  decision: 'AUTO_APPROVED' | 'REQUIRES_TREASURER_REVIEW' | 'FLAGGED';
  confidence: number;
  policyNotes: string[];
  analyzedAt: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  claimedBy: string;
  claimedByRole: string;
  vendor: string;
  date: string;
  paymentMethod: PaymentMethod;
  receiptUrl?: string; // base64 or object URL
  notes?: string;
  status: ReimbursementStatus;
  aiVerification?: AIVerificationResult;
  treasurerComment?: string;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  category: ExpenseCategory;
  allocatedAmount: number;
  description: string;
  leadPerson: string;
}

export type EventDay = string;

export interface ItineraryItem {
  id: string;
  title: string;
  day: EventDay;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  speakerOrHost: string;
  linkedCategory?: ExpenseCategory;
  allocatedBudget: number;
  description: string;
  coordinatorContact: string;
  isHighlight?: boolean;
}

export type IncidentSeverity = 'critical' | 'major' | 'minor';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface IncidentNote {
  id: string;
  title: string;
  severity: IncidentSeverity;
  category: 'Technical/AV' | 'Logistics' | 'Catering' | 'Schedule/Delay' | 'Finance/UPI' | 'Security';
  timestamp: string;
  day: EventDay;
  location: string;
  reportedBy: string;
  description: string;
  status: IncidentStatus;
  correctiveAction?: string;
  financialImpact?: number; // monetary cost caused by failure, if any
  createdAt: string;
}

export interface EventSummaryStats {
  totalBudget: number;
  totalSpentApproved: number;
  totalPendingReimbursements: number;
  totalAutoApprovedCount: number;
  totalIncidentsOpen: number;
}
