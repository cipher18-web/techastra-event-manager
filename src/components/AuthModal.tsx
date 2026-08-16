import React, { useState } from 'react';
import { ShieldCheck, User, Lock, KeyRound, AlertCircle, Sparkles, CheckCircle2, Loader2, LogIn } from 'lucide-react';
import { signInWithGoogle, signInAsGuest } from '../services/firebase';

export interface UserProfile {
  name: string;
  email?: string;
  photoURL?: string;
  isAdmin: boolean;
  uid?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onLogin: (user: UserProfile) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLogin, onClose }) => {
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        // Determine if user email or displayName suggests Admin/Treasurer
        const email = user.email || '';
        const name = user.displayName || user.email?.split('@')[0] || 'TechAstra Member';
        const isTreasurerEmail =
          email.toLowerCase().includes('treasurer') ||
          email.toLowerCase().includes('admin') ||
          email.toLowerCase() === '018.cipher@gmail.com';

        onLogin({
          name,
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
          uid: user.uid,
          isAdmin: isTreasurerEmail,
        });
      }
      // If user is null, the user cancelled or closed the popup - simply stay ready
    } catch (err: any) {
      if (err?.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups or use manual pass / guest access.');
      } else if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(err.message || 'Failed to sign in with Google. Please use manual entry or guest login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const user = await signInAsGuest();
      onLogin({
        name: user?.displayName || 'Event Coordinator (Guest)',
        uid: user?.uid,
        isAdmin: false,
      });
    } catch (err: any) {
      // Fallback local guest
      onLogin({
        name: 'Event Coordinator (Guest)',
        isAdmin: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameInput.trim();
    const password = passwordInput;

    if (!name) {
      setError('Please enter your name.');
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      return;
    }

    const lowerName = name.toLowerCase();

    // Check if user is attempting Admin/Treasurer Login
    const isAdminAccountName = lowerName === 'admin';
    const isValidAdminPassword = password === 'treasure';

    if (isAdminAccountName) {
      if (isValidAdminPassword) {
        setError('');
        onLogin({
          name: name || 'Treasurer',
          isAdmin: true,
        });
      } else {
        setError('Incorrect password for administrative access.');
      }
      return;
    }

    // General User login
    setError('');
    onLogin({
      name: name,
      isAdmin: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="editorial-card bg-[#ffffff] border border-[#e3d7c5] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#f0e7d8] border border-[#e3d7c5] flex items-center justify-center text-[#3a604f] shadow-xs">
            <KeyRound className="w-5 h-5 text-[#3a604f]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#0f172a] tracking-tight">
            TechAstra 2026 Portal
          </h2>
          <p className="text-xs text-[#64748b] leading-relaxed max-w-xs mx-auto">
            Sign in with your Google account or credential pass to access real-time festival data.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-[#ffe4e6] border border-[#fda4af] rounded-2xl flex items-center gap-2 text-[#e11d48] text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-[#e11d48] shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Google Sign-in Primary Button */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 bg-[#ffffff] hover:bg-[#faf6f0] text-[#0f172a] font-semibold text-xs rounded-full border border-[#e3d7c5] transition shadow-xs flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-[#3a604f] animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>

          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-[#e3d7c5]"></div>
            <span className="text-[10px] uppercase font-semibold text-[#94a3b8] tracking-widest">or manual pass</span>
            <div className="flex-1 h-px bg-[#e3d7c5]"></div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#334155] font-semibold mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#3a604f]" />
              <span>Full Name / User ID <span className="text-[#e11d48]">*</span></span>
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f] font-sans"
            />
          </div>

          <div>
            <label className="block text-[#334155] font-semibold mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#3a604f]" />
              <span>Passcode <span className="text-[#e11d48]">*</span></span>
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter your passcode"
              className="w-full bg-[#faf6f0] border border-[#e3d7c5] rounded-xl px-3.5 py-2 text-[#0f172a] focus:outline-none focus:border-[#3a604f] font-mono"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleGuestSignIn}
              className="px-3.5 py-2.5 bg-[#faf6f0] hover:bg-[#e8dfd1] text-[#475569] font-semibold text-xs rounded-full border border-[#e3d7c5] transition"
            >
              Guest Access
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#3a604f] hover:bg-[#284735] text-[#fdfbf7] font-semibold uppercase tracking-wider rounded-full transition shadow-xs flex items-center justify-center gap-1.5 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-[#bee1d0]" />
              <span>Enter Portal →</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
