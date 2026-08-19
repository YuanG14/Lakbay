import { FormEvent, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPinned,
  Route,
  UserRound,
} from 'lucide-react';
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

const signupBenefits = [
  { icon: MapPinned, title: 'Keep your trip estimates', text: 'Save routes, expenses, and cost splits.' },
  { icon: CarFront, title: 'Build your garage', text: 'Reuse each vehicle’s real fuel efficiency.' },
];

export default function Auth() {
  const { user, login, signup } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

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

  function switchMode() {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setPassword('');
  }

  return (
    <div className="auth-page auth-page-refined">
      <div className="auth-brand auth-brand-wide">
        <Link to="/" className="auth-brand-home" aria-label="Lakbay landing page">
          <div className="brand-mark"><Route size={24}/></div>
          <div><div className="brand-name">Lakbay</div><div className="brand-sub">Smart Trip Planner</div></div>
        </Link>
      </div>

      <div className="auth-card auth-card-refined">
        <aside className="auth-story" aria-label="Why use Lakbay">
          <div className="auth-story-top">
            <span className="auth-story-kicker">{mode === 'signup' ? 'YOUR TRIPS, YOUR NUMBERS' : 'WELCOME BACK'}</span>
            <h2>{mode === 'signup' ? 'Start with the cost before you start the car.' : 'Pick up where your last drive left off.'}</h2>
            <p>
              {mode === 'signup'
                ? 'Lakbay keeps your route, vehicle, fuel, tolls, and shared costs together so your next drive starts with a clear budget.'
                : 'Your saved vehicles, trip estimates, and travel history are ready when you sign in.'}
            </p>
          </div>

          <div className="auth-story-list">
            {(mode === 'signup' ? signupBenefits : signupBenefits).map(({ icon: Icon, title, text }) => (
              <div className="auth-story-item" key={title}>
                <span><Icon size={18}/></span>
                <div><strong>{title}</strong><small>{text}</small></div>
              </div>
            ))}
          </div>

          <div className="auth-story-note"><Check size={15}/> Philippine peso · Private account data</div>
        </aside>

        <section className="auth-form-panel">
          <Link to="/" className="auth-back-link auth-back-link-clean">
            <ArrowLeft size={16}/>
            <span>Back to landing page</span>
          </Link>

          <div className="auth-heading">
            <span className="section-kicker">{mode === 'login' ? 'Sign in' : 'Create account'}</span>
            <h1>{mode === 'login' ? 'Continue your journey' : 'Create your Lakbay account'}</h1>
            <p>
              {mode === 'login'
                ? 'Sign in to access your garage, saved trips, and analytics.'
                : 'A few details and you can start saving smarter trip estimates.'}
            </p>
          </div>

          <form onSubmit={submit} className="auth-form auth-form-refined" noValidate>
            {mode === 'signup' && (
              <label>
                <span>Name</span>
                <div className="input-shell auth-input-shell">
                  <UserRound size={18}/>
                  <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name"/>
                </div>
              </label>
            )}

            <label>
              <span>Email</span>
              <div className="input-shell auth-input-shell">
                <Mail size={18}/>
                <input required autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"/>
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="input-shell password-shell auth-input-shell">
                <Lock size={18}/>
                <input
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17}/> : <Eye size={17}/>} 
                </button>
              </div>
            </label>

            {error && <div className="form-error" role="alert">{error}</div>}

            <button disabled={busy} className="primary-btn wide auth-submit-btn">
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              <ArrowRight size={17}/>
            </button>
          </form>

          <div className="auth-switch-row">
            <span>{mode === 'login' ? "New to Lakbay?" : 'Already have an account?'}</span>
            <button type="button" className="auth-switch" onClick={switchMode}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
