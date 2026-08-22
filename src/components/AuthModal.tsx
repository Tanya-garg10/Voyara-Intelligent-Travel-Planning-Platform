import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Compass, CheckCircle2, Sparkles, Shield, Users } from 'lucide-react';
import { User } from '../types';
import { INITIAL_USER } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: User) => void;
  onSuccess?: (user: User) => void;
  initialMode?: 'login' | 'signup' | 'forgot' | 'personas';
  mode?: 'login' | 'signup' | 'forgot' | 'personas';
}

const DEMO_PERSONAS: { name: string; email: string; role: string; avatar: string; bio: string; style: string }[] = [
  {
    name: 'Tanya Garg',
    email: 'tanya.travels@voyara.io',
    role: 'Luxury & Cultural Explorer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Passionate globetrotter, culture enthusiast, and itinerary perfectionist.',
    style: 'Heritage Palaces & Fine Dining',
  },
  {
    name: 'Aarav Patel',
    email: 'aarav.p@voyara.io',
    role: 'Adventure & Scenic Trails',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Backpacker, high-altitude trekker, and transit optimizer.',
    style: 'Swiss Alps & Mountain Passes',
  },
  {
    name: 'Elena Vance',
    email: 'elena.vance@voyara.io',
    role: 'Architectural Curator',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Architect, museum lover, and culinary explorer.',
    style: 'Modern Design & European Capitals',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSuccess,
  initialMode,
  mode: propMode,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'personas'>(
    propMode || initialMode || 'login'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode with prop when opened or changed
  useEffect(() => {
    if (propMode) setMode(propMode);
    else if (initialMode) setMode(initialMode);
  }, [propMode, initialMode, isOpen]);

  // Reset errors when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSuccessCallback = (user: User) => {
    if (onLoginSuccess) onLoginSuccess(user);
    if (onSuccess) onSuccess(user);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'forgot') {
      if (!email.includes('@')) {
        setError('Please provide a valid email address.');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg(`Password reset link sent to ${email}. Check your inbox!`);
      }, 700);
      return;
    }

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: User = {
        ...INITIAL_USER,
        name:
          name.trim() ||
          (email.split('@')[0]
            ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
            : 'Traveler'),
        email: email.trim(),
      };
      handleSuccessCallback(user);
      onClose();
    }, 500);
  };

  const handleSelectPersona = (persona: (typeof DEMO_PERSONAS)[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: User = {
        ...INITIAL_USER,
        name: persona.name,
        email: persona.email,
        avatar: persona.avatar,
        bio: persona.bio,
      };
      handleSuccessCallback(user);
      onClose();
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1C1917]/75 backdrop-blur-md overflow-y-auto animate-modal-backdrop transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl bg-[#FFFFFF] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E7E5E4] overflow-hidden flex flex-col md:flex-row my-auto animate-modal-container transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#78716C] hover:text-[#1C1917] hover:scale-105 active:scale-95 transition-all shadow-xs border border-[#E7E5E4] cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Editorial Visual Side */}
        <div className="relative md:w-5/12 bg-[#1C1917] p-8 text-[#FFFFFF] flex flex-col justify-between overflow-hidden min-h-[220px] md:min-h-[520px]">
          <img
            src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1000&q=85"
            alt="Luxury Travel Experience"
            className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-35 hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/60 to-transparent"></div>

          {/* Top Stamp */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#C2410C] flex items-center justify-center text-white shadow-md">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#C2410C] block">
                  Voyara Travel Club
                </span>
                <span className="text-xs font-semibold text-stone-300">Member Pass</span>
              </div>
            </div>
          </div>

          {/* Editorial Quote & Passport Stamp */}
          <div className="relative z-10 space-y-4 my-auto">
            <p className="font-editorial-serif text-2xl sm:text-3xl leading-snug font-normal text-stone-100 italic">
              "Travel is the only expense that makes you richer."
            </p>
            <div className="pt-2 flex items-center gap-3">
              <div className="flex -space-x-2">
                {DEMO_PERSONAS.map((p, i) => (
                  <img
                    key={i}
                    src={p.avatar}
                    alt={p.name}
                    className="w-8 h-8 rounded-full border-2 border-[#1C1917] object-cover"
                  />
                ))}
              </div>
              <span className="text-xs text-stone-300 font-medium">Joined by 12,400+ curators</span>
            </div>
          </div>

          {/* Bottom Security / Trust Note */}
          <div className="relative z-10 flex items-center gap-2 text-[11px] text-stone-400 border-t border-white/10 pt-4">
            <Shield className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>End-to-end synchronized itineraries</span>
          </div>
        </div>

        {/* Right Form & Switcher Side */}
        <div className="md:w-7/12 p-6 sm:p-10 flex flex-col justify-between bg-[#FFFFFF]">
          <div>
            {/* Header Mode Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F5F4F0] rounded-xl border border-[#E7E5E4] mb-6">
              <button
                type="button"
                id="auth-tab-login-btn"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#1C1917] shadow-xs font-bold'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="auth-tab-signup-btn"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-[#1C1917] shadow-xs font-bold'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                id="auth-tab-personas-btn"
                onClick={() => {
                  setMode('personas');
                  setError('');
                }}
                className={`py-1.5 px-3 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                  mode === 'personas'
                    ? 'bg-white text-[#C2410C] shadow-xs font-bold'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Demos</span>
              </button>
            </div>

            {/* Form Body with Smooth Transition Key */}
            <div key={mode} className="animate-form-switch">
              {/* Title Section */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#C2410C]">
                    {mode === 'login' && 'Account Access'}
                    {mode === 'signup' && 'Welcome to Voyara'}
                    {mode === 'personas' && 'Curator Profiles'}
                    {mode === 'forgot' && 'Account Recovery'}
                  </span>
                </div>
                <h2 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
                  {mode === 'login' && 'Sign in to your journey'}
                  {mode === 'signup' && 'Craft your next escape'}
                  {mode === 'personas' && 'Select a Traveler Persona'}
                  {mode === 'forgot' && 'Reset your password'}
                </h2>
                <p className="text-xs text-[#78716C] mt-1">
                  {mode === 'personas'
                    ? 'Switch between demo traveler accounts to explore curated trips instantly.'
                    : 'Access your itineraries, real-time budgets, and collaborative maps.'}
                </p>
              </div>

              {/* Error & Success Messages */}
              {error && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium animate-form-switch">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2 animate-form-switch">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Personas Mode */}
              {mode === 'personas' ? (
                <div className="space-y-3">
                  {DEMO_PERSONAS.map((p, idx) => (
                    <button
                      key={p.email}
                      onClick={() => handleSelectPersona(p)}
                      className={`w-full text-left p-3.5 rounded-2xl border border-[#E7E5E4] hover:border-[#C2410C] hover:bg-[#FFF7ED]/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-3.5 group cursor-pointer animate-field-${idx + 1}`}
                    >
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-11 h-11 rounded-full object-cover border border-[#E7E5E4] shrink-0"
                      />
                      <div className="grow min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-editorial-serif font-bold text-base text-[#1C1917] group-hover:text-[#C2410C] transition-colors">
                            {p.name}
                          </h4>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#78716C] bg-[#F5F4F0] px-2 py-0.5 rounded-full">
                            {p.role.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-xs text-[#78716C] truncate mt-0.5">{p.style}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#78716C] group-hover:text-[#C2410C] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}

                  <button
                    onClick={() => setMode('login')}
                    className="w-full text-center text-xs font-semibold text-[#78716C] hover:text-[#1C1917] pt-2 cursor-pointer transition-colors"
                  >
                    ← Back to standard sign in
                  </button>
                </div>
              ) : (
                <>
                  {/* 1-Click Fast Actions */}
                  {mode !== 'forgot' && (
                    <div className="mb-5 space-y-2 animate-field-1">
                      <button
                        type="button"
                        id="demo-one-click-login-btn"
                        onClick={() => handleSelectPersona(DEMO_PERSONAS[0])}
                        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-dashed border-[#C2410C]/40 bg-[#FFF7ED]/60 hover:bg-[#FFF7ED] hover:scale-[1.01] active:scale-[0.99] text-[#1C1917] text-xs font-semibold transition-all hover:shadow-xs cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-[#C2410C]" />
                        <span>Instant 1-Click Demo Login as {INITIAL_USER.name}</span>
                      </button>

                      <div className="flex items-center my-3">
                        <div className="grow border-t border-[#E7E5E4]"></div>
                        <span className="px-3 text-[10px] uppercase tracking-[1.5px] text-[#78716C] font-bold">
                          or continue with credentials
                        </span>
                        <div className="grow border-t border-[#E7E5E4]"></div>
                      </div>
                    </div>
                  )}

                  {/* Form Fields with Staggered Cascade */}
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {mode === 'signup' && (
                      <div className="animate-field-1">
                        <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#78716C] mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            id="auth-signup-name-input"
                            type="text"
                            required
                            placeholder="e.g. Tanya Garg"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl focus:bg-white focus:outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-all text-[#1C1917] placeholder:text-[#A8A29E]"
                          />
                        </div>
                      </div>
                    )}

                    <div className={mode === 'signup' ? 'animate-field-2' : 'animate-field-1'}>
                      <label className="block text-[10px] font-bold uppercase tracking-[1px] text-[#78716C] mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="auth-email-input"
                          type="email"
                          required
                          placeholder="tanya.travels@voyara.io"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl focus:bg-white focus:outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-all text-[#1C1917] placeholder:text-[#A8A29E]"
                        />
                      </div>
                    </div>

                    {mode !== 'forgot' && (
                      <div className={mode === 'signup' ? 'animate-field-3' : 'animate-field-2'}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold uppercase tracking-[1px] text-[#78716C]">
                            Password
                          </label>
                          {mode === 'login' && (
                            <button
                              type="button"
                              id="forgot-password-link"
                              onClick={() => setMode('forgot')}
                              className="text-[11px] text-[#C2410C] hover:underline font-semibold cursor-pointer"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            id="auth-password-input"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FBFBFA] border border-[#E7E5E4] rounded-xl focus:bg-white focus:outline-none focus:border-[#C2410C] focus:ring-2 focus:ring-[#C2410C]/20 transition-all text-[#1C1917] placeholder:text-[#A8A29E]"
                          />
                        </div>
                      </div>
                    )}

                    <div className={mode === 'signup' ? 'animate-field-4' : 'animate-field-3'}>
                      <button
                        id="auth-submit-btn"
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3 px-4 bg-[#C2410C] hover:bg-[#9A3412] hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>
                              {mode === 'login' && 'Sign In to Voyara'}
                              {mode === 'signup' && 'Create Passport & Start Planning'}
                              {mode === 'forgot' && 'Send Reset Instructions'}
                            </span>
                            <ArrowRight className="w-4 h-4 text-white" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Toggle modes footer */}
          {mode !== 'personas' && (
            <div className="mt-6 pt-4 border-t border-[#E7E5E4] text-center text-xs text-[#78716C]">
              {mode === 'login' && (
                <p>
                  New to Voyara?{' '}
                  <button
                    id="switch-to-signup-btn"
                    onClick={() => {
                      setMode('signup');
                      setError('');
                    }}
                    className="text-[#C2410C] font-bold hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              )}

              {mode === 'signup' && (
                <p>
                  Already have a Voyara account?{' '}
                  <button
                    id="switch-to-login-btn"
                    onClick={() => {
                      setMode('login');
                      setError('');
                    }}
                    className="text-[#C2410C] font-bold hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              )}

              {mode === 'forgot' && (
                <button
                  id="back-to-login-btn"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-[#78716C] hover:text-[#1C1917] font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  ← Back to sign in
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
