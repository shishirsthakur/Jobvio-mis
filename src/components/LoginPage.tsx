import React, { useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  doc,
  db,
  setDoc,
} from '../firebase';
import { Eye, EyeOff, ArrowRight, Building2, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onSuccess?: (demoUser?: { email: string; displayName: string; uid: string }) => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Load remembered email
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('jobvio_saved_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleRememberMeToggle = (checked: boolean) => {
    setRememberMe(checked);
    if (!checked) {
      localStorage.removeItem('jobvio_saved_email');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both your work email and password.');
      return;
    }

    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('jobvio_saved_email', email);
      }

      if (mode === 'signin') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Sync user doc
        try {
          await setDoc(
            doc(db, 'users', userCredential.user.uid),
            {
              uid: userCredential.user.uid,
              email: userCredential.user.email,
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {
          // ignore firestore write non-blocking
        }
        if (onSuccess) onSuccess();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        try {
          await setDoc(
            doc(db, 'users', userCredential.user.uid),
            {
              uid: userCredential.user.uid,
              email: userCredential.user.email,
              createdAt: new Date().toISOString(),
              role: 'Recruitment Consultant',
            },
            { merge: true }
          );
        } catch {
          // ignore
        }
        setSuccessMsg('Account registered successfully! Logging you in...');
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      const code = err?.code || '';
      console.error('Auth error:', err);
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. If you are new, click "Create an account" below.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please click "Sign in" instead.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters long.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnterpriseSSO = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        try {
          await setDoc(
            doc(db, 'users', res.user.uid),
            {
              uid: res.user.uid,
              email: res.user.email,
              displayName: res.user.displayName || 'Enterprise User',
              photoURL: res.user.photoURL || '',
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {
          // ignore
        }
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('SSO error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'Enterprise SSO authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Please enter your work email in the field first.');
      return;
    }
    setIsResettingPassword(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg(`Password reset email sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // One-click quick demo access helper
  const handleQuickDemoAccess = async () => {
    const demoEmail = 'recruiter@jobvio.com';
    const demoPass = 'Jobvio2026!';
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    setLoading(true);

    const demoUserObj = {
      email: demoEmail,
      displayName: 'Demo Recruiter (Admin)',
      uid: 'demo-recruiter-session',
    };

    try {
      localStorage.setItem('jobvio_demo_session', 'true');
      // Attempt Firebase auth
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      } catch (signInErr: any) {
        if (
          signInErr?.code === 'auth/user-not-found' ||
          signInErr?.code === 'auth/invalid-credential'
        ) {
          try {
            await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          } catch (createErr) {
            console.warn('Firebase user creation note:', createErr);
          }
        }
      }

      if (onSuccess) {
        onSuccess(demoUserObj);
      }
    } catch (err: any) {
      console.warn('Demo quick login fallback:', err);
      if (onSuccess) {
        onSuccess(demoUserObj);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-gray-900 antialiased selection:bg-black selection:text-white">
      {/* Top Navigation & System Status Header */}
      <header className="w-full py-5 px-6 md:px-10 flex items-center justify-between bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0778jLFPeHns5u-grCG-fBRb6zyF5oY9LHJnEfxdAXp61QRVVhqHicGY1MTIdC96a7MtOgYXWn5fdO6NOXd6fWuazXW6xV21bh-Aukj1z2QH5zpyQdCq0W3k1R_94bCLuN5m8dlld8ODbhvgW9omOrg1lAN2mM1kIEfLQAsF2G_vDlObGasTdWWMrmQQRDEIxfflSlO5q1PErbR2K8vBXUu2t_cdvruGiH5fLn1sPsdqbz2a9wc2MWXVIRkhFxeubmA"
            alt="Jobvio"
            className="h-7 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        <button
          type="button"
          onClick={handleQuickDemoAccess}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Demo Quick Access</span>
        </button>
      </header>

      {/* Main Split / Bento Architectural Layout */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 w-full">
        <div className="w-full max-w-[420px] mx-auto">
          <div className="border border-gray-200 bg-white p-8 md:p-10 shadow-xs">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-5">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIheuM1FgMCWaVDPtimgaGO4sQtOrsNxahT0VjCJiGUbfPUu9tN0uB0iQlbU-ClhnT9ZgJkKa8eCHRpbLUEagM54yX-W15Qz5Xeh6xCeqUUhDhL7weossRo0Vomuncyicug1rNF3C62UFFdO-TJc4CrhMjnOKRjPgCvYrpFsS7O9lGixu4lfBIjuHMjZPZ67ewrwlVo_5sDb7daHt-HAIN95vJyCAahy4TgBKdk9GHb6RpoH-ZWXv6Xj1Ry_Ad6w_Fnw"
                  alt="Jobvio Logo"
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="text-xl font-semibold text-black tracking-tight">
                {mode === 'signin' ? 'Sign in to Jobvio' : 'Create a Jobvio Account'}
              </h1>
              <p className="text-xs text-gray-500 mt-1.5">
                {mode === 'signin'
                  ? 'Enter your credentials to access your account'
                  : 'Register your work credentials to access the talent portal'}
              </p>
            </div>

            {/* Error or Success notification */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-none flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div className="flex-1">{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-none flex items-start gap-2 text-xs text-emerald-700 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div className="flex-1">{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label
                  htmlFor="work-email"
                  className="block text-xs font-medium text-black mb-1.5"
                >
                  Work email
                </label>
                <input
                  type="email"
                  id="work-email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full h-10 px-3 bg-white border border-gray-300 text-black text-xs placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black rounded-none transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-black"
                  >
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isResettingPassword}
                      className="text-xs text-gray-500 hover:text-black transition-colors underline underline-offset-2 cursor-pointer disabled:opacity-50"
                    >
                      {isResettingPassword ? 'Sending...' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-10 pl-3 pr-10 bg-white border border-gray-300 text-black text-xs placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black rounded-none transition-colors"
                  />
                  <button
                    type="button"
                    id="toggle-pwd-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-black transition-colors cursor-pointer"
                    title="Toggle Password Visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => handleRememberMeToggle(e.target.checked)}
                    className="h-4 w-4 rounded-none border-gray-300 text-black focus:ring-black focus:ring-offset-0"
                  />
                  <span className="text-xs text-gray-500 select-none">
                    Remember me for 30 days
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-black hover:bg-neutral-800 text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded-none mt-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <span className="relative bg-white px-3 text-xs text-gray-500">
                or continue with
              </span>
            </div>

            <button
              type="button"
              onClick={handleEnterpriseSSO}
              disabled={loading}
              className="w-full h-10 border border-gray-300 hover:border-black bg-white hover:bg-gray-50 text-black text-xs font-medium flex items-center justify-center gap-2.5 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-black rounded-none cursor-pointer disabled:opacity-60"
            >
              <Building2 className="w-4 h-4 text-gray-700" />
              <span>Continue with Enterprise SSO</span>
            </button>

            {/* Toggle Sign In / Sign Up */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
              {mode === 'signin' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-black font-semibold hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-black font-semibold hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-center text-gray-500 mt-6">
            Secured by enterprise zero-trust access protocols.
          </p>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="w-full py-6 px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between text-gray-500 text-xs gap-3 border-t border-gray-200 bg-white">
        <span className="text-xs text-gray-500">
          © 2026 Jobvio Inc. All rights reserved.
        </span>
        <div className="flex items-center gap-6 text-xs">
          <a href="#privacy" className="hover:text-black transition-colors">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:text-black transition-colors">
            Terms of Service
          </a>
          <a href="#help" className="hover:text-black transition-colors">
            Support
          </a>
        </div>
      </footer>
    </div>
  );
}
