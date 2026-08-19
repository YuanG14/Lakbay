import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Route, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function friendlyAuthError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  if (code.includes('invalid-credential')) return 'The email or password is incorrect.';
  if (code.includes('email-already-in-use')) return 'That email already has a Lakbay account.';
  if (code.includes('weak-password')) return 'Use a stronger password with at least 6 characters.';
  if (code.includes('invalid-email')) return 'Enter a valid email address.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Wait a moment and try again.';
  if (code.includes('network-request-failed')) return 'Could not reach Firebase. Check your internet connection.';
  return 'Authentication failed. Please try again.';
}

export default function Auth() {
  const { user, login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (mode === 'signup' && !name.trim()) return setError('Enter your name.');
    setBusy(true);
    try {
      if (mode === 'signup') await signup(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand"><div className="brand-mark"><Route size={24}/></div><div><div className="brand-name">Lakbay</div><div className="brand-sub">Smart Trip Planner</div></div></div>
      <div className="auth-card">
        <span className="section-kicker">{mode === 'login' ? 'Welcome back' : 'Create account'}</span>
        <h1>{mode === 'login' ? 'Continue your journey' : 'Start planning smarter trips'}</h1>
        <p>{mode === 'login' ? 'Sign in to access your vehicles, saved trips and analytics.' : 'Your garage and trip history will sync to your Firebase account.'}</p>
        <form onSubmit={submit} className="auth-form" noValidate>
          {mode === 'signup' && <label><span>Name</span><div className="input-shell"><UserRound size={18}/><input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"/></div></label>}
          <label><span>Email</span><div className="input-shell"><Mail size={18}/><input required autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"/></div></label>
          <label><span>Password</span><div className="input-shell password-shell"><Lock size={18}/><input required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters"/><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button disabled={busy} className="primary-btn wide">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17}/></button>
        </form>
        <button type="button" className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setPassword(''); }}>
          {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
