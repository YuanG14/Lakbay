import {
  ArrowRight,
  BarChart3,
  CarFront,
  Check,
  CircleDollarSign,
  MapPinned,
  Menu,
  Route,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: MapPinned,
    title: 'Plan the real route',
    text: 'Find Philippine destinations, see the driving route, distance, and estimated travel time.',
  },
  {
    icon: CircleDollarSign,
    title: 'Know the true trip cost',
    text: 'Combine fuel, tolls, parking, food, and other expenses in one clear estimate.',
  },
  {
    icon: CarFront,
    title: 'Compare your vehicles',
    text: 'Use saved fuel-efficiency profiles to see which vehicle is the smarter choice for each trip.',
  },
  {
    icon: UsersRound,
    title: 'Split expenses fairly',
    text: 'Plan shared trips, apply driver discounts, and calculate each traveler’s contribution.',
  },
  {
    icon: BarChart3,
    title: 'Understand your spending',
    text: 'Track saved trips and see travel spending, distance, fuel use, and monthly patterns.',
  },
  {
    icon: Sparkles,
    title: 'Get useful insights',
    text: 'Lakbay turns your own trip data into simple recommendations for cheaper, smarter travel.',
  },
];

export default function Landing() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const primaryHref = user ? '/dashboard' : '/auth?mode=signup';
  const primaryLabel = user ? 'Open dashboard' : 'Start planning free';

  return (
    <div className="landing-page">
      <header className="landing-nav-wrap">
        <nav className="landing-nav" aria-label="Landing navigation">
          <Link to="/" className="landing-brand" aria-label="Lakbay home">
            <span className="landing-brand-mark"><Route size={23} /></span>
            <span><strong>Lakbay</strong><small>Smart Trip Planner</small></span>
          </Link>

          <div className="landing-links desktop-landing-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#why-lakbay">Why Lakbay</a>
          </div>

          <div className="landing-actions desktop-landing-links">
            {user ? (
              <Link className="landing-text-btn" to="/dashboard">Dashboard</Link>
            ) : (
              <Link className="landing-text-btn" to="/auth">Sign in</Link>
            )}
            <Link className="landing-primary-btn" to={primaryHref}>{primaryLabel}<ArrowRight size={17} /></Link>
          </div>

          <button className="landing-menu-btn" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="landing-mobile-menu">
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#why-lakbay" onClick={() => setMenuOpen(false)}>Why Lakbay</a>
            {user ? <Link to="/dashboard">Dashboard</Link> : <Link to="/auth">Sign in</Link>}
            <Link className="landing-primary-btn" to={primaryHref}>{primaryLabel}<ArrowRight size={17} /></Link>
          </div>
        )}
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="landing-pill"><Sparkles size={15} /> Built for road trips in the Philippines</div>
            <h1>Know what your trip will <span>really cost</span> before you leave.</h1>
            <p>Lakbay brings your route, vehicle efficiency, fuel, tolls, parking, and shared expenses together so every drive starts with a smarter plan.</p>
            <div className="landing-hero-actions">
              <Link className="landing-primary-btn large" to={primaryHref}>{primaryLabel}<ArrowRight size={18} /></Link>
              <a className="landing-secondary-btn" href="#how-it-works">See how it works</a>
            </div>
            <div className="landing-trust-row">
              <span><Check size={15} /> Free to start</span>
              <span><Check size={15} /> Philippine peso</span>
              <span><Check size={15} /> Your trips stay in your account</span>
            </div>
          </div>

          <div className="landing-preview" aria-label="Lakbay trip estimate preview">
            <div className="preview-topline"><span className="preview-dot" /> Trip estimate</div>
            <div className="preview-route">
              <div><span className="route-node start" /><p><small>FROM</small><strong>Batangas City</strong></p></div>
              <span className="route-dash" />
              <div><span className="route-node end" /><p><small>TO</small><strong>Alabang</strong></p></div>
            </div>
            <div className="preview-distance"><Route size={17} /><span>103.8 km</span><small>Estimated 1 hr 52 min</small></div>
            <div className="preview-cost-card">
              <div><small>Estimated trip cost</small><strong>₱2,360</strong></div>
              <div className="preview-breakdown">
                <span>Fuel <b>₱1,170</b></span>
                <span>Tolls <b>₱890</b></span>
                <span>Parking & extras <b>₱300</b></span>
              </div>
            </div>
            <div className="preview-split"><UsersRound size={17} /><span><strong>₱590</strong> per traveler</span><small>4 people</small></div>
          </div>
        </section>

        <section className="landing-proof-strip" aria-label="Lakbay capabilities">
          <div><strong>Route</strong><span>Distance & travel time</span></div>
          <div><strong>Garage</strong><span>Saved vehicle profiles</span></div>
          <div><strong>Expenses</strong><span>Fuel, tolls & extras</span></div>
          <div><strong>Insights</strong><span>Trip history & analytics</span></div>
        </section>

        <section className="landing-section" id="features">
          <div className="landing-section-heading">
            <span className="section-kicker">Everything in one place</span>
            <h2>More useful than a basic fuel calculator.</h2>
            <p>Lakbay follows the whole trip-planning workflow, from choosing where to go to understanding what you spent afterward.</p>
          </div>
          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, title, text }) => (
              <article className="landing-feature-card" key={title}>
                <span><Icon size={21} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-how" id="how-it-works">
          <div className="landing-how-copy">
            <span className="section-kicker">Simple workflow</span>
            <h2>Plan a drive in three steps.</h2>
            <p>No spreadsheets and no guessing between separate calculators.</p>
          </div>
          <div className="landing-steps">
            <article><b>01</b><span><MapPinned size={20} /></span><h3>Choose your route</h3><p>Search your origin and destination and let Lakbay calculate the road distance.</p></article>
            <article><b>02</b><span><CarFront size={20} /></span><h3>Add the real costs</h3><p>Select a vehicle, set fuel price, and include tolls, parking, and trip expenses.</p></article>
            <article><b>03</b><span><BarChart3 size={20} /></span><h3>Save and learn</h3><p>Save the trip to your account and build useful travel analytics over time.</p></article>
          </div>
        </section>

        <section className="landing-why" id="why-lakbay">
          <div className="landing-why-card">
            <div>
              <span className="section-kicker">Made for practical planning</span>
              <h2>Drive with a number in mind, not a guess.</h2>
              <p>Whether you are going alone, driving friends, or choosing between vehicles, Lakbay helps you see the financial side of the trip before the engine starts.</p>
              <div className="landing-security"><ShieldCheck size={20} /><span><strong>Your own account, your own data.</strong><small>Firebase authentication keeps each user’s vehicles and trips separated.</small></span></div>
            </div>
            <Link className="landing-primary-btn large" to={primaryHref}>{primaryLabel}<ArrowRight size={18} /></Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Link to="/" className="landing-brand">
          <span className="landing-brand-mark small"><Route size={19} /></span>
          <span><strong>Lakbay</strong><small>Smart Trip Planner</small></span>
        </Link>
        <p>Plan the drive. Know the cost. Share the journey.</p>
        <span>© {new Date().getFullYear()} Lakbay</span>
      </footer>
    </div>
  );
}
