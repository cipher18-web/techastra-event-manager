import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  signInAnonymously,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { BudgetItem, ExpenseItem, ItineraryItem, IncidentNote } from '../types/techastra';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific database ID if configured
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Auth Actions
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/user-cancelled'
    ) {
      // User simply closed the popup window - not a system failure
      return null;
    }
    console.warn('Firebase Google Sign-in info:', error?.message || error);
    throw error;
  }
};

export const signInAsGuest = async (): Promise<{ uid: string; displayName: string } | null> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    // If anonymous auth is not enabled in Firebase Console (admin-restricted-operation),
    // return a client guest profile seamlessly
    return {
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      displayName: 'Event Coordinator (Guest)',
    };
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch (error: any) {
    console.warn('Firebase sign-out info:', error?.message || error);
  }
};

export const subscribeToAuth = (callback: (user: User | null) => void): Unsubscribe => {
  return onAuthStateChanged(auth, callback);
};

// ==================== FIRESTORE DATA SUBSCRIBERS ====================

// Clean undefined fields before writing to Firestore
const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        clean[key] = sanitizeForFirestore(obj[key]);
      }
    }
    return clean;
  }
  return obj;
};

// 1. Budgets
export const subscribeToBudgets = (
  callback: (budgets: BudgetItem[]) => void,
  onError?: (error: any) => void
): Unsubscribe => {
  const colRef = collection(db, 'budgets');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: BudgetItem[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<BudgetItem, 'id'>) });
      });
      callback(items);
    },
    (error) => {
      console.warn('Firestore subscribeToBudgets note:', error?.message || error);
      if (onError) onError(error);
    }
  );
};

export const saveBudgetDoc = async (budget: BudgetItem): Promise<void> => {
  const docRef = doc(db, 'budgets', budget.id);
  await setDoc(docRef, sanitizeForFirestore(budget), { merge: true });
};

export const deleteBudgetDoc = async (id: string): Promise<void> => {
  const docRef = doc(db, 'budgets', id);
  await deleteDoc(docRef);
};

export const batchSaveBudgets = async (budgets: BudgetItem[]): Promise<void> => {
  const batch = writeBatch(db);
  for (const b of budgets) {
    const ref = doc(db, 'budgets', b.id);
    batch.set(ref, sanitizeForFirestore(b), { merge: true });
  }
  await batch.commit();
};

// 2. Expenses / Claims
export const subscribeToExpenses = (
  callback: (expenses: ExpenseItem[]) => void,
  onError?: (error: any) => void
): Unsubscribe => {
  const colRef = collection(db, 'expenses');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ExpenseItem[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<ExpenseItem, 'id'>) });
      });
      // Sort newest created first
      items.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
      callback(items);
    },
    (error) => {
      console.warn('Firestore subscribeToExpenses note:', error?.message || error);
      if (onError) onError(error);
    }
  );
};

export const saveExpenseDoc = async (expense: ExpenseItem): Promise<void> => {
  const docRef = doc(db, 'expenses', expense.id);
  await setDoc(docRef, sanitizeForFirestore(expense), { merge: true });
};

export const deleteExpenseDoc = async (id: string): Promise<void> => {
  const docRef = doc(db, 'expenses', id);
  await deleteDoc(docRef);
};

// 3. Itinerary / Schedule
export const subscribeToItinerary = (
  callback: (itinerary: ItineraryItem[]) => void,
  onError?: (error: any) => void
): Unsubscribe => {
  const colRef = collection(db, 'itinerary');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ItineraryItem[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<ItineraryItem, 'id'>) });
      });
      // Sort by day and startTime
      items.sort((a, b) => {
        if (a.day !== b.day) return a.day.localeCompare(b.day);
        return a.startTime.localeCompare(b.startTime);
      });
      callback(items);
    },
    (error) => {
      console.warn('Firestore subscribeToItinerary note:', error?.message || error);
      if (onError) onError(error);
    }
  );
};

export const saveItineraryDoc = async (item: ItineraryItem): Promise<void> => {
  const docRef = doc(db, 'itinerary', item.id);
  await setDoc(docRef, sanitizeForFirestore(item), { merge: true });
};

export const deleteItineraryDoc = async (id: string): Promise<void> => {
  const docRef = doc(db, 'itinerary', id);
  await deleteDoc(docRef);
};

// 4. Incidents & Corrective Actions
export const subscribeToIncidents = (
  callback: (incidents: IncidentNote[]) => void,
  onError?: (error: any) => void
): Unsubscribe => {
  const colRef = collection(db, 'incidents');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: IncidentNote[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as Omit<IncidentNote, 'id'>) });
      });
      items.sort((a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime());
      callback(items);
    },
    (error) => {
      console.warn('Firestore subscribeToIncidents note:', error?.message || error);
      if (onError) onError(error);
    }
  );
};

export const saveIncidentDoc = async (incident: IncidentNote): Promise<void> => {
  const docRef = doc(db, 'incidents', incident.id);
  await setDoc(docRef, sanitizeForFirestore(incident), { merge: true });
};

export const deleteIncidentDoc = async (id: string): Promise<void> => {
  const docRef = doc(db, 'incidents', id);
  await deleteDoc(docRef);
};

// 5. Initial Seeding Helper
export const checkAndSeedInitialData = async (
  initialBudgetsList: BudgetItem[],
  sampleBudgetsList: BudgetItem[],
  sampleExpensesList: ExpenseItem[],
  sampleItineraryList: ItineraryItem[],
  sampleIncidentsList: IncidentNote[]
): Promise<void> => {
  try {
    const budgetsSnap = await getDocs(collection(db, 'budgets'));
    if (budgetsSnap.empty) {
      console.log('Seeding initial budget categories to Firestore...');
      const batch = writeBatch(db);
      for (const b of initialBudgetsList) {
        batch.set(doc(db, 'budgets', b.id), sanitizeForFirestore(b));
      }
      await batch.commit();
    }
  } catch (err) {
    console.error('Error during Firestore initial check & seed:', err);
  }
};

// Load full sample dataset to Firestore
export const loadSampleDatasetToFirestore = async (
  sampleBudgetsList: BudgetItem[],
  sampleExpensesList: ExpenseItem[],
  sampleItineraryList: ItineraryItem[],
  sampleIncidentsList: IncidentNote[]
): Promise<void> => {
  const batch = writeBatch(db);

  for (const b of sampleBudgetsList) {
    batch.set(doc(db, 'budgets', b.id), sanitizeForFirestore(b), { merge: true });
  }
  for (const e of sampleExpensesList) {
    batch.set(doc(db, 'expenses', e.id), sanitizeForFirestore(e), { merge: true });
  }
  for (const it of sampleItineraryList) {
    batch.set(doc(db, 'itinerary', it.id), sanitizeForFirestore(it), { merge: true });
  }
  for (const inc of sampleIncidentsList) {
    batch.set(doc(db, 'incidents', inc.id), sanitizeForFirestore(inc), { merge: true });
  }

  await batch.commit();
};
