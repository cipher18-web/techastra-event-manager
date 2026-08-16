/**
 * TechAstra 2026 - Event Financial Management, Itinerary & Failures Hub
 * Powered by Firebase Firestore & Auth
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ExpenseTracker } from './components/ExpenseTracker';
import { TreasurerApproval } from './components/TreasurerApproval';
import { ItineraryView } from './components/ItineraryView';
import { IncidentLogView } from './components/IncidentLogView';
import { BudgetOverview } from './components/BudgetOverview';
import { ReceiptModal } from './components/ReceiptModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { AuthModal, UserProfile } from './components/AuthModal';

import { BudgetItem, ExpenseItem, IncidentNote, IncidentStatus, ItineraryItem } from './types/techastra';
import { sampleExpenses, sampleIncidents, sampleItinerary, sampleBudgets, initialBudgets } from './data/sampleData';
import {
  subscribeToBudgets,
  subscribeToExpenses,
  subscribeToItinerary,
  subscribeToIncidents,
  subscribeToAuth,
  saveBudgetDoc,
  deleteBudgetDoc,
  saveExpenseDoc,
  deleteExpenseDoc,
  saveItineraryDoc,
  deleteItineraryDoc,
  saveIncidentDoc,
  deleteIncidentDoc,
  checkAndSeedInitialData,
  loadSampleDatasetToFirestore,
  signOutUser,
} from './services/firebase';

const LOCAL_STORAGE_KEY_USER_PROFILE = 'techastra_user_profile_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'expenses' | 'treasurer' | 'itinerary' | 'incidents' | 'budget'
  >('dashboard');

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER_PROFILE);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => !currentUser);

  const [isTreasurerMode, setIsTreasurerMode] = useState<boolean>(true);
  const [isTreasurerAuthenticated, setIsTreasurerAuthenticated] = useState<boolean>(() => {
    try {
      return currentUser?.isAdmin === true || localStorage.getItem('techastra_treasurer_auth') === 'true';
    } catch (e) {
      return false;
    }
  });

  // State initialized with sample data fallback, then synced live via Firestore Real-Time subscriptions
  const [expenses, setExpenses] = useState<ExpenseItem[]>(sampleExpenses);
  const [budgets, setBudgets] = useState<BudgetItem[]>(sampleBudgets);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(sampleItinerary);
  const [incidents, setIncidents] = useState<IncidentNote[]>(sampleIncidents);

  // Modals state
  const [selectedReceiptExpense, setSelectedReceiptExpense] = useState<ExpenseItem | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // 1. Firebase Auth Listener
  useEffect(() => {
    const unsub = subscribeToAuth((firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        const isTreasurerEmail =
          email.toLowerCase().includes('treasurer') ||
          email.toLowerCase().includes('admin') ||
          email.toLowerCase() === '018.cipher@gmail.com';

        const profile: UserProfile = {
          name: firebaseUser.displayName || email.split('@')[0] || 'TechAstra Member',
          email: firebaseUser.email || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          uid: firebaseUser.uid,
          isAdmin: isTreasurerEmail || currentUser?.isAdmin || false,
        };

        setCurrentUser(profile);
        if (profile.isAdmin) {
          setIsTreasurerAuthenticated(true);
        }
        setIsAuthModalOpen(false);
      }
    });

    return () => unsub();
  }, []);

  // 2. Firestore Real-Time Data Subscriptions
  useEffect(() => {
    // Initial check & seed default budget schema if database is newly initialized
    checkAndSeedInitialData(initialBudgets, sampleBudgets, sampleExpenses, sampleItinerary, sampleIncidents);

    const unsubBudgets = subscribeToBudgets((data) => {
      if (data && data.length > 0) {
        setBudgets(data);
      }
    });

    const unsubExpenses = subscribeToExpenses((data) => {
      setExpenses(data);
    });

    const unsubItinerary = subscribeToItinerary((data) => {
      setItinerary(data);
    });

    const unsubIncidents = subscribeToIncidents((data) => {
      setIncidents(data);
    });

    return () => {
      unsubBudgets();
      unsubExpenses();
      unsubItinerary();
      unsubIncidents();
    };
  }, []);

  // User Auth Handlers
  const handleLoginUser = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER_PROFILE, JSON.stringify(user));
    } catch (e) {}

    if (user.isAdmin) {
      setIsTreasurerAuthenticated(true);
      try {
        localStorage.setItem('techastra_treasurer_auth', 'true');
      } catch (e) {}
      setActiveTab('treasurer');
    } else {
      setIsTreasurerAuthenticated(false);
      try {
        localStorage.removeItem('techastra_treasurer_auth');
      } catch (e) {}
      if (activeTab === 'treasurer' || activeTab === 'budget') {
        setActiveTab('dashboard');
      }
    }
    setIsAuthModalOpen(false);
  };

  const handleLogoutUser = async () => {
    try {
      await signOutUser();
    } catch (e) {}
    setCurrentUser(null);
    setIsTreasurerAuthenticated(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER_PROFILE);
      localStorage.removeItem('techastra_treasurer_auth');
    } catch (e) {}
    if (activeTab === 'treasurer' || activeTab === 'budget') {
      setActiveTab('dashboard');
    }
    setIsAuthModalOpen(true);
  };

  const handleLoginTreasurer = () => {
    setIsTreasurerAuthenticated(true);
    try {
      localStorage.setItem('techastra_treasurer_auth', 'true');
    } catch (e) {}
  };

  const handleLogoutTreasurer = () => {
    setIsTreasurerAuthenticated(false);
    try {
      localStorage.removeItem('techastra_treasurer_auth');
    } catch (e) {}
  };

  // ==================== FIRESTORE MUTATION HANDLERS ====================

  // Expenses / Claims Handlers
  const handleAddExpense = async (newExp: ExpenseItem) => {
    setExpenses((prev) => [newExp, ...prev]);
    try {
      await saveExpenseDoc(newExp);
    } catch (err) {
      console.error('Error saving expense to Firestore:', err);
    }
  };

  const handleApproveExpense = async (id: string, comment?: string) => {
    const updated = expenses.find((e) => e.id === id);
    if (!updated) return;
    const nextExp: ExpenseItem = {
      ...updated,
      status: 'Treasurer Approved',
      treasurerComment: comment || 'Approved by Treasurer',
    };
    setExpenses((prev) => prev.map((e) => (e.id === id ? nextExp : e)));
    try {
      await saveExpenseDoc(nextExp);
    } catch (err) {
      console.error('Error approving expense in Firestore:', err);
    }
  };

  const handleRejectExpense = async (id: string, comment?: string) => {
    const updated = expenses.find((e) => e.id === id);
    if (!updated) return;
    const nextExp: ExpenseItem = {
      ...updated,
      status: 'Rejected',
      treasurerComment: comment || 'Rejected by Treasurer',
    };
    setExpenses((prev) => prev.map((e) => (e.id === id ? nextExp : e)));
    try {
      await saveExpenseDoc(nextExp);
    } catch (err) {
      console.error('Error rejecting expense in Firestore:', err);
    }
  };

  const handleEditExpense = async (updatedExpense: ExpenseItem) => {
    setExpenses((prev) => prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)));
    if (selectedReceiptExpense?.id === updatedExpense.id) {
      setSelectedReceiptExpense(updatedExpense);
    }
    try {
      await saveExpenseDoc(updatedExpense);
    } catch (err) {
      console.error('Error editing expense in Firestore:', err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (selectedReceiptExpense?.id === id) {
      setSelectedReceiptExpense(null);
    }
    try {
      await deleteExpenseDoc(id);
    } catch (err) {
      console.error('Error deleting expense in Firestore:', err);
    }
  };

  const handleMarkPaidOut = async (id: string) => {
    const updated = expenses.find((e) => e.id === id);
    if (!updated) return;
    const nextExp: ExpenseItem = {
      ...updated,
      status: 'Paid Out',
      treasurerComment: updated.treasurerComment ? `${updated.treasurerComment} • Disbursed` : 'Disbursed by Treasurer',
    };
    setExpenses((prev) => prev.map((e) => (e.id === id ? nextExp : e)));
    try {
      await saveExpenseDoc(nextExp);
    } catch (err) {
      console.error('Error marking paid out in Firestore:', err);
    }
  };

  const handleBatchAutoApprove = async () => {
    const pending = expenses.filter((e) => e.status === 'Pending Approval');
    for (const exp of pending) {
      const nextExp: ExpenseItem = {
        ...exp,
        status: 'Treasurer Approved',
        treasurerComment: 'Batch Approved & Allocated by Treasurer',
      };
      await saveExpenseDoc(nextExp);
    }
  };

  // Itinerary Handlers
  const handleAddItineraryItem = async (newItem: ItineraryItem) => {
    setItinerary((prev) => [...prev, newItem]);
    try {
      await saveItineraryDoc(newItem);
    } catch (err) {
      console.error('Error saving itinerary to Firestore:', err);
    }
  };

  const handleEditItineraryItem = async (updatedItem: ItineraryItem) => {
    setItinerary((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    try {
      await saveItineraryDoc(updatedItem);
    } catch (err) {
      console.error('Error editing itinerary in Firestore:', err);
    }
  };

  const handleDeleteItineraryItem = async (id: string) => {
    setItinerary((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteItineraryDoc(id);
    } catch (err) {
      console.error('Error deleting itinerary in Firestore:', err);
    }
  };

  // Incident Handlers
  const handleAddIncident = async (newInc: IncidentNote) => {
    setIncidents((prev) => [newInc, ...prev]);
    try {
      await saveIncidentDoc(newInc);
    } catch (err) {
      console.error('Error saving incident to Firestore:', err);
    }
  };

  const handleEditIncident = async (updatedInc: IncidentNote) => {
    setIncidents((prev) => prev.map((i) => (i.id === updatedInc.id ? updatedInc : i)));
    try {
      await saveIncidentDoc(updatedInc);
    } catch (err) {
      console.error('Error editing incident in Firestore:', err);
    }
  };

  const handleDeleteIncident = async (id: string) => {
    setIncidents((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteIncidentDoc(id);
    } catch (err) {
      console.error('Error deleting incident in Firestore:', err);
    }
  };

  const handleUpdateIncidentStatus = async (
    id: string,
    status: IncidentStatus,
    correctiveAction?: string
  ) => {
    const inc = incidents.find((i) => i.id === id);
    if (!inc) return;
    const updatedInc: IncidentNote = {
      ...inc,
      status,
      correctiveAction: correctiveAction || inc.correctiveAction,
    };
    setIncidents((prev) => prev.map((i) => (i.id === id ? updatedInc : i)));
    try {
      await saveIncidentDoc(updatedInc);
    } catch (err) {
      console.error('Error updating incident status in Firestore:', err);
    }
  };

  // Budget Handlers
  const handleUpdateBudget = async (id: string, newAllocated: number) => {
    const target = budgets.find((b) => b.id === id);
    if (!target) return;
    const updated = { ...target, allocatedAmount: newAllocated };
    setBudgets((prev) => prev.map((b) => (b.id === id ? updated : b)));
    try {
      await saveBudgetDoc(updated);
    } catch (err) {
      console.error('Error updating budget in Firestore:', err);
    }
  };

  const handleSaveBudget = async (updated: BudgetItem) => {
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
    try {
      await saveBudgetDoc(updated);
    } catch (err) {
      console.error('Error saving budget in Firestore:', err);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteBudgetDoc(id);
    } catch (err) {
      console.error('Error deleting budget in Firestore:', err);
    }
  };

  const handleLoadSampleData = async () => {
    setExpenses(sampleExpenses);
    setItinerary(sampleItinerary);
    setIncidents(sampleIncidents);
    setBudgets(sampleBudgets);
    try {
      await loadSampleDatasetToFirestore(sampleBudgets, sampleExpenses, sampleItinerary, sampleIncidents);
    } catch (err) {
      console.error('Error uploading sample dataset to Firestore:', err);
    }
  };

  const pendingCount = expenses.filter((e) => e.status === 'Pending Approval').length;
  const openIncidentsCount = incidents.filter((i) => i.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#0f172a] font-sans selection:bg-[#3a604f] selection:text-[#fdfbf7] flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        openIncidentsCount={openIncidentsCount}
        isTreasurerMode={isTreasurerMode}
        setIsTreasurerMode={setIsTreasurerMode}
        isTreasurerAuthenticated={isTreasurerAuthenticated}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsAuthModalOpen(true)}
        onLogoutUser={handleLogoutUser}
        isCloudSynced={true}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            budgets={budgets}
            expenses={expenses}
            incidents={incidents}
            itinerary={itinerary}
            isAdmin={currentUser?.isAdmin || false}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenNewExpense={() => setActiveTab('expenses')}
            onOpenNewIncident={() => setActiveTab('incidents')}
            onSelectReceipt={(exp) => setSelectedReceiptExpense(exp)}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTracker
            expenses={expenses}
            budgets={budgets}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onOpenCamera={() => setIsCameraOpen(true)}
            capturedCameraPhoto={capturedPhoto}
            onClearCapturedPhoto={() => setCapturedPhoto(null)}
            onSelectReceipt={(exp) => setSelectedReceiptExpense(exp)}
          />
        )}

        {activeTab === 'treasurer' && (
          <TreasurerApproval
            expenses={expenses}
            budgets={budgets}
            onApproveExpense={handleApproveExpense}
            onRejectExpense={handleRejectExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onBatchAutoApprove={handleBatchAutoApprove}
            onSelectReceipt={(exp) => setSelectedReceiptExpense(exp)}
            isTreasurerMode={isTreasurerMode}
            isTreasurerAuthenticated={isTreasurerAuthenticated}
            onLoginSuccess={handleLoginTreasurer}
            onLogout={handleLogoutTreasurer}
            onUpdateBudget={handleUpdateBudget}
            onMarkPaidOut={handleMarkPaidOut}
          />
        )}

        {activeTab === 'itinerary' && (
          <ItineraryView
            itinerary={itinerary}
            budgets={budgets}
            expenses={expenses}
            onAddItineraryItem={handleAddItineraryItem}
            onEditItineraryItem={handleEditItineraryItem}
            onDeleteItineraryItem={handleDeleteItineraryItem}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentLogView
            incidents={incidents}
            onAddIncident={handleAddIncident}
            onEditIncident={handleEditIncident}
            onUpdateStatus={handleUpdateIncidentStatus}
            onDeleteIncident={handleDeleteIncident}
          />
        )}

        {activeTab === 'budget' && currentUser?.isAdmin && (
          <BudgetOverview
            budgets={budgets}
            expenses={expenses}
            onUpdateBudget={handleUpdateBudget}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e3d7c5] bg-[#faf6f0] py-6 text-center text-xs text-[#64748b]">
        <p>TechAstra 2026 Annual Tech Fest • Live Firestore Cloud Synchronized • Treasurer & Operations Register (₹)</p>
      </footer>

      {/* Lightbox Receipt Modal */}
      <ReceiptModal
        expense={selectedReceiptExpense}
        onClose={() => setSelectedReceiptExpense(null)}
      />

      {/* Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(photoData) => {
          setCapturedPhoto(photoData);
          setIsCameraOpen(false);
        }}
      />
      {/* Global Entry Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen || !currentUser}
        onLogin={handleLoginUser}
      />
    </div>
  );
}
