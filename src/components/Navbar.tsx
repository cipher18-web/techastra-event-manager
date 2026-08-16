import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  ShieldCheck, 
  Calendar, 
  AlertTriangle, 
  PieChart, 
  Landmark,
  User,
  LogOut,
  LogIn,
  Cloud,
  Check
} from 'lucide-react';
import { UserProfile } from './AuthModal';

interface NavbarProps {
  activeTab: 'dashboard' | 'expenses' | 'treasurer' | 'itinerary' | 'incidents' | 'budget';
  setActiveTab: (tab: 'dashboard' | 'expenses' | 'treasurer' | 'itinerary' | 'incidents' | 'budget') => void;
  pendingCount: number;
  openIncidentsCount: number;
  isTreasurerMode: boolean;
  setIsTreasurerMode: (val: boolean) => void;
  isTreasurerAuthenticated?: boolean;
  currentUser?: UserProfile | null;
  onOpenLoginModal?: () => void;
  onLogoutUser?: () => void;
  isCloudSynced?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  openIncidentsCount,
  currentUser,
  onOpenLoginModal,
  onLogoutUser,
  isCloudSynced = true,
}) => {
  const isAdmin = currentUser?.isAdmin || false;

  return (
    <header className="sticky top-0 z-40 bg-[#faf6f0]/95 backdrop-blur-md border-b border-[#e3d7c5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Classical Italian Serif Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f0e7d8] border border-[#d4bf9f] text-[#2c3848] shadow-xs">
              <Landmark className="w-5 h-5 text-[#3c5478]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl text-[#0f172a] tracking-wider uppercase">
                  TechAstra <span className="text-xs font-sans tracking-widest px-2 py-0.5 rounded-full bg-[#3a604f]/10 text-[#3a604f] border border-[#3a604f]/20 font-medium">2026</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3a604f]/10 border border-[#3a604f]/20 text-[10px] font-medium text-[#3a604f]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3a604f] animate-pulse"></span>
                  <span>Cloud Synced</span>
                </span>
              </div>
              <p className="text-[11px] text-[#64748b] font-sans hidden sm:block tracking-wide uppercase">
                Treasury & Operations Register
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#f0e7d8]/60 p-1.5 rounded-full border border-[#e3d7c5]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === 'dashboard'
                  ? 'bg-[#3a604f] text-[#fdfbf7] shadow-xs'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#e8dfd1]/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === 'expenses'
                  ? 'bg-[#3a604f] text-[#fdfbf7] shadow-xs'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#e8dfd1]/50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Claims</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('treasurer')}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === 'treasurer'
                    ? 'bg-[#3a604f] text-[#fdfbf7] shadow-xs'
                    : 'text-[#3a604f] hover:bg-[#3a604f]/10'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Treasurer</span>
                {pendingCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-[#fdfbf7] text-[#3a604f] font-bold font-mono rounded-full text-[10px]">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === 'itinerary'
                  ? 'bg-[#3a604f] text-[#fdfbf7] shadow-xs'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#e8dfd1]/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Itinerary</span>
            </button>

            <button
              onClick={() => setActiveTab('incidents')}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === 'incidents'
                  ? 'bg-[#3a604f] text-[#fdfbf7] shadow-xs'
                  : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#e8dfd1]/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#3a604f]" />
              <span>Incidents</span>
              {openIncidentsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#e11d48] text-[#ffffff] font-bold font-mono rounded-full text-[10px]">
                  {openIncidentsCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('budget')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === 'budget'
                    ? 'bg-[#3a604f] text-[#fdfbf7] shadow-xs'
                    : 'text-[#3a604f] hover:bg-[#3a604f]/10'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Budgets</span>
              </button>
            )}
          </nav>

          {/* Right User Badge & Actions */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-[#ffffff] px-3.5 py-1.5 rounded-full border border-[#e3d7c5] shadow-xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#3a604f]/20 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#3a604f]/10 border border-[#3a604f]/20 flex items-center justify-center text-[#3a604f] shrink-0">
                    {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-[#3a604f]" /> : <User className="w-3.5 h-3.5 text-[#475569]" />}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#0f172a] max-w-[130px] truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#3a604f] font-mono tracking-wider uppercase">
                    {isAdmin ? 'Treasurer Admin' : 'Member'}
                  </div>
                </div>
                {onLogoutUser && (
                  <button
                    onClick={onLogoutUser}
                    className="p-1 text-[#64748b] hover:text-[#e11d48] hover:bg-[#f4efe6] rounded-full transition ml-1"
                    title="Log Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              onOpenLoginModal && (
                <button
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-2 px-5 py-2 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] text-xs font-semibold uppercase tracking-widest rounded-full transition shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In →</span>
                </button>
              )
            )}
          </div>
        </div>
        
        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-[#e3d7c5] text-xs scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap uppercase tracking-wider text-[11px] font-medium ${
              activeTab === 'dashboard' ? 'bg-[#3a604f] text-[#fdfbf7]' : 'text-[#475569]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap uppercase tracking-wider text-[11px] font-medium ${
              activeTab === 'expenses' ? 'bg-[#3a604f] text-[#fdfbf7]' : 'text-[#475569]'
            }`}
          >
            Claims
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('treasurer')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1 uppercase tracking-wider text-[11px] font-semibold ${
                activeTab === 'treasurer' ? 'bg-[#3a604f] text-[#fdfbf7]' : 'text-[#3a604f]'
              }`}
            >
              Treasurer ({pendingCount})
            </button>
          )}
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap uppercase tracking-wider text-[11px] font-medium ${
              activeTab === 'itinerary' ? 'bg-[#3a604f] text-[#fdfbf7]' : 'text-[#475569]'
            }`}
          >
            Itinerary
          </button>
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap uppercase tracking-wider text-[11px] font-medium ${
              activeTab === 'incidents' ? 'bg-[#3a604f] text-[#fdfbf7]' : 'text-[#475569]'
            }`}
          >
            Incidents ({openIncidentsCount})
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-semibold uppercase tracking-wider text-[11px] ${
                activeTab === 'budget' ? 'bg-[#3a604f] text-[#fdfbf7]' : 'text-[#3a604f]'
              }`}
            >
              Budgets
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

