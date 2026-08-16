import React from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Receipt,
  PieChart,
  Landmark,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BudgetItem, ExpenseItem, IncidentNote, ItineraryItem } from '../types/techastra';
import { formatRupees } from '../utils/formatters';

interface DashboardProps {
  budgets: BudgetItem[];
  expenses: ExpenseItem[];
  incidents: IncidentNote[];
  itinerary: ItineraryItem[];
  isAdmin?: boolean;
  onNavigateTab: (tab: 'dashboard' | 'expenses' | 'treasurer' | 'itinerary' | 'incidents' | 'budget') => void;
  onOpenNewExpense: () => void;
  onOpenNewIncident: () => void;
  onSelectReceipt: (expense: ExpenseItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  budgets,
  expenses,
  incidents,
  itinerary,
  isAdmin = false,
  onNavigateTab,
  onOpenNewExpense,
  onOpenNewIncident,
  onSelectReceipt,
}) => {
  // Calculations
  const totalBudget = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);

  const totalSpentApproved = expenses
    .filter((e) => e.status === 'Auto-Approved' || e.status === 'Treasurer Approved' || e.status === 'Paid Out')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalPending = expenses
    .filter((e) => e.status === 'Pending Approval')
    .reduce((acc, e) => acc + e.amount, 0);

  const autoApprovedCount = expenses.filter((e) => e.status === 'Auto-Approved').length;
  const autoApprovalRate = expenses.length > 0 ? Math.round((autoApprovedCount / expenses.length) * 100) : 0;

  const remainingBudget = totalBudget - totalSpentApproved;
  const budgetUtilizationPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpentApproved / totalBudget) * 100)) : 0;

  const openIncidents = incidents.filter((i) => i.status !== 'resolved');

  // Chart Data: Category Allocated vs Spent
  const categoryChartData = budgets.map((b) => {
    const categorySpent = expenses
      .filter((e) => e.category === b.category && (e.status === 'Auto-Approved' || e.status === 'Treasurer Approved' || e.status === 'Paid Out'))
      .reduce((acc, e) => acc + e.amount, 0);

    const categoryPending = expenses
      .filter((e) => e.category === b.category && e.status === 'Pending Approval')
      .reduce((acc, e) => acc + e.amount, 0);

    return {
      name: b.category.split('&')[0].trim(),
      Allocated: b.allocatedAmount,
      ApprovedSpent: categorySpent,
      Pending: categoryPending,
    };
  });

  // Reimbursement Status Breakdown
  const statusCounts = {
    'Auto-Approved': expenses.filter((e) => e.status === 'Auto-Approved').length,
    'Treasurer Approved': expenses.filter((e) => e.status === 'Treasurer Approved').length,
    'Pending': expenses.filter((e) => e.status === 'Pending Approval').length,
    'Rejected': expenses.filter((e) => e.status === 'Rejected').length,
  };

  const pieData = [
    { name: 'Auto-Approved', value: statusCounts['Auto-Approved'], color: '#10b981' },
    { name: 'Treasurer Approved', value: statusCounts['Treasurer Approved'], color: '#f59e0b' },
    { name: 'Pending Review', value: statusCounts['Pending'], color: '#a855f7' },
    { name: 'Rejected', value: statusCounts['Rejected'], color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Editorial Tuscan Hero Banner & Quick Actions */}
      <div className="editorial-card rounded-3xl p-8 md:p-10 shadow-xs border border-[#e3d7c5] relative overflow-hidden bg-[#ffffff]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3a604f]/10 border border-[#3a604f]/20 text-[#3a604f] text-[11px] font-semibold uppercase tracking-widest">
              <Landmark className="w-3.5 h-3.5 text-[#3a604f]" />
              <span>TechAstra 2026 • Financial & Operations Register</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif text-[#0f172a] font-normal tracking-tight leading-tight">
              Your Private Financial <span className="italic font-light text-[#3a604f]">&amp;</span> Operations Haven
            </h1>
            <p className="text-sm text-[#475569] leading-relaxed">
              Track department budget ceilings, verify reimbursement claims, and authorize disbursements with Italian-inspired precision in Indian Rupees (₹).
            </p>
          </div>

          {/* Action Controls - Pill Buttons with Arrows */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewExpense}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold text-xs uppercase tracking-widest transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-[#bee1d0]" />
              <span>Submit Claim →</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => onNavigateTab('treasurer')}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold text-xs uppercase tracking-widest transition shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-[#bee1d0]" />
                <span>Treasurer ({expenses.filter((e) => e.status === 'Pending Approval').length}) →</span>
              </button>
            )}
            <button
              onClick={onOpenNewIncident}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#f4efe6] hover:bg-[#e8dfd1] text-[#1e293b] border border-[#e3d7c5] text-xs font-semibold uppercase tracking-widest transition"
            >
              <AlertTriangle className="w-4 h-4 text-[#3a604f]" />
              <span>Report Incident</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid - Soft Cream Cards with Thin Hairline Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Budget */}
        <div className="editorial-card rounded-2xl p-6 bg-[#ffffff]">
          <div className="flex items-center justify-between text-[#64748b] mb-3 text-[11px] font-semibold tracking-widest uppercase">
            <span>Total Event Pool</span>
            <div className="p-2 rounded-full bg-[#f0e7d8] text-[#2c3848]">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#0f172a]">{formatRupees(totalBudget)}</span>
          </div>
          <p className="text-[11px] text-[#64748b] mt-2">Allocated across committee tracks</p>
        </div>

        {/* Card 2: Approved Spend */}
        <div className="editorial-card rounded-2xl p-6 bg-[#ffffff]">
          <div className="flex items-center justify-between text-[#64748b] mb-3 text-[11px] font-semibold tracking-widest uppercase">
            <span>Approved Spent</span>
            <div className="p-2 rounded-full bg-[#3a604f]/15 text-[#3a604f]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-serif font-bold text-[#3a604f]">{formatRupees(totalSpentApproved)}</span>
            {totalBudget > 0 && (
              <span className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#3a604f]/10 text-[#3a604f] border border-[#3a604f]/20">
                {budgetUtilizationPercent}% Used
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#64748b] mt-2">Disbursed or approved claims</p>
        </div>

        {/* Card 3: Pending Claims */}
        <div className="editorial-card rounded-2xl p-6 bg-[#ffffff]">
          <div className="flex items-center justify-between text-[#64748b] mb-3 text-[11px] font-semibold tracking-widest uppercase">
            <span>Pending Review</span>
            <div className="p-2 rounded-full bg-[#f0e7d8] text-[#366698]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-serif font-bold text-[#1e293b]">{formatRupees(totalPending)}</span>
            <span className="text-xs text-[#64748b]">
              {expenses.filter((e) => e.status === 'Pending Approval').length} claim(s)
            </span>
          </div>
          <p className="text-[11px] text-[#64748b] mt-2">Awaiting Treasurer sign-off</p>
        </div>

        {/* Card 4: Open Incidents / Health */}
        <div className="editorial-card rounded-2xl p-6 bg-[#ffffff]">
          <div className="flex items-center justify-between text-[#64748b] mb-3 text-[11px] font-semibold tracking-widest uppercase">
            <span>Operational Health</span>
            <div className="p-2 rounded-full bg-[#f0e7d8] text-[#3a604f]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-bold text-[#0f172a]">
              {openIncidents.length === 0 ? 'Optimal' : `${openIncidents.length} Open`}
            </span>
            <span className="text-xs text-[#64748b]">{incidents.length} total logged</span>
          </div>
          <p className="text-[11px] text-[#64748b] mt-2">Failure notes & post-mortems</p>
        </div>
      </div>

      {/* Main Charts / Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Budget Bar Chart */}
        <div className="lg:col-span-2 editorial-card rounded-3xl p-6 md:p-8 bg-[#ffffff] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#0f172a] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3a604f]" />
                Department Budget Allocations &amp; Utilization (₹)
              </h2>
              <p className="text-xs text-[#64748b] mt-0.5">Compare allocated limits against approved expenses per track</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => onNavigateTab('budget')}
                className="text-xs text-[#3a604f] hover:underline font-semibold uppercase tracking-wider flex items-center gap-1"
              >
                <span>Manage Budgets</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {budgets.some((b) => b.allocatedAmount > 0) ? (
            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#475569', fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e3d7c5',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#0f172a',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                    formatter={(value: number) => [`${formatRupees(value)}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Allocated" fill="#d8cbb8" radius={[6, 6, 0, 0]} name="Allocated Budget" />
                  <Bar dataKey="ApprovedSpent" fill="#3a604f" radius={[6, 6, 0, 0]} name="Approved Spent" />
                  <Bar dataKey="Pending" fill="#526f9a" radius={[6, 6, 0, 0]} name="Pending Claims" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-[#e3d7c5] rounded-2xl space-y-3 bg-[#faf6f0]/60">
              <PieChart className="w-10 h-10 text-[#a39580] mx-auto opacity-60" />
              <p className="text-xs text-[#0f172a] font-semibold uppercase tracking-wider">No budget limits allocated yet</p>
              <p className="text-[11px] text-[#64748b] max-w-md mx-auto">
                Set category budgets in the Budgets tab to track limits and prevent over-spending during the event.
              </p>
              {isAdmin && (
                <button
                  onClick={() => onNavigateTab('budget')}
                  className="px-5 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] text-xs font-semibold uppercase tracking-widest rounded-full transition"
                >
                  Set Category Limits →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reimbursement Claims Distribution */}
        <div className="editorial-card rounded-3xl p-6 md:p-8 bg-[#ffffff] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-bold text-[#0f172a] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3a604f]" />
                Reimbursement Status
              </h2>
            </div>

            {expenses.length > 0 ? (
              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e3d7c5',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#0f172a',
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-[#e3d7c5] rounded-2xl space-y-2 bg-[#faf6f0]/60">
                <Receipt className="w-8 h-8 text-[#a39580] mx-auto opacity-60" />
                <p className="text-xs text-[#0f172a] font-semibold uppercase tracking-wider">No expenses submitted yet</p>
                <p className="text-[11px] text-[#64748b]">
                  Claims submitted by committee members will appear here for verification.
                </p>
              </div>
            )}
          </div>

          {expenses.length > 0 && (
            <div className="space-y-2.5 border-t border-[#e3d7c5] pt-4 text-xs">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[#334155]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[#0f172a]">{item.value} claim(s)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Submissions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Expenses List */}
        <div className="editorial-card rounded-3xl p-6 md:p-8 bg-[#ffffff]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-serif font-bold text-[#0f172a] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#3a604f]" />
              Recent Expense Claims
            </h2>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs text-[#3a604f] hover:underline font-semibold uppercase tracking-wider flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#e3d7c5] rounded-2xl text-[#64748b] text-xs space-y-2 bg-[#faf6f0]/60">
              <FileText className="w-8 h-8 text-[#a39580] mx-auto opacity-60" />
              <p className="font-semibold text-[#0f172a] uppercase tracking-wider">Clean Registry (No Expenses Logged)</p>
              <p className="text-[11px] text-[#64748b]">
                Click "Submit Claim" above to log vendors, upload receipts, and request reimbursement.
              </p>
              <button
                onClick={onOpenNewExpense}
                className="px-5 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] text-xs font-semibold uppercase tracking-widest rounded-full transition mt-2 inline-flex items-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#bee1d0]" />
                <span>Submit First Claim →</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.slice(0, 4).map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => onSelectReceipt(exp)}
                  className="p-4 bg-[#faf6f0] hover:bg-[#f0e7d8] rounded-2xl border border-[#e3d7c5] transition flex items-center justify-between gap-3 cursor-pointer shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#d4bf9f] flex items-center justify-center shrink-0 text-[#3a604f]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0f172a] line-clamp-1">{exp.title}</h4>
                      <p className="text-[11px] text-[#64748b]">
                        {exp.vendor} • <span className="text-[#334155] font-medium">{exp.claimedBy}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-serif font-bold text-[#0f172a] block">{formatRupees(exp.amount)}</span>
                    <span
                      className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        exp.status === 'Auto-Approved'
                          ? 'bg-[#3a604f]/10 text-[#3a604f] border-[#3a604f]/20'
                          : exp.status === 'Treasurer Approved'
                          ? 'bg-[#2c5282]/10 text-[#2c5282] border-[#2c5282]/20'
                          : 'bg-[#f0e7d8] text-[#475569] border-[#e3d7c5]'
                      }`}
                    >
                      {exp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule & Failures Box */}
        <div className="editorial-card rounded-3xl p-6 md:p-8 bg-[#ffffff] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-serif font-bold text-[#0f172a] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3a604f]" />
                Schedule Quick Overview
              </h2>
              <button
                onClick={() => onNavigateTab('itinerary')}
                className="text-xs text-[#3a604f] hover:underline font-semibold uppercase tracking-wider flex items-center gap-1"
              >
                <span>Itinerary</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {itinerary.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-[#e3d7c5] rounded-2xl text-[#64748b] text-xs space-y-2 bg-[#faf6f0]/60">
                <Calendar className="w-8 h-8 text-[#a39580] mx-auto opacity-60" />
                <p className="font-semibold text-[#0f172a] uppercase tracking-wider">No itinerary scheduled</p>
                <p className="text-[11px] text-[#64748b]">
                  Add keynotes, hackathons, and workshops in the Itinerary tab to build your event timeline.
                </p>
                <button
                  onClick={() => onNavigateTab('itinerary')}
                  className="px-4 py-2 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] text-xs font-semibold uppercase tracking-widest rounded-full transition"
                >
                  Add Item →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {itinerary.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3.5 bg-[#faf6f0] rounded-2xl border border-[#e3d7c5]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-serif font-bold text-[#3a604f]">{item.day} • {item.startTime}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#ffffff] text-[#475569] text-[10px] font-medium border border-[#e3d7c5]">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#0f172a]">{item.title}</h4>
                    <p className="text-[11px] text-[#64748b] mt-0.5">
                      📍 {item.location} • <span className="text-[#334155] font-medium">{item.speakerOrHost}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Open Failures Banner */}
          <div className="mt-5 p-4 bg-[#faf6f0] border border-[#e3d7c5] rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-[#334155]">
              <AlertTriangle className="w-4 h-4 text-[#3a604f] shrink-0" />
              <span>
                <strong>{openIncidents.length} failure note(s)</strong> logged
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('incidents')}
              className="text-[#3a604f] font-semibold uppercase tracking-wider hover:underline text-[11px]"
            >
              Incident Log →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
