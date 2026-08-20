import {
  ArrowRight,
  BarChart3,
  CarFront,
  Check,
  CircleDollarSign,
  Fuel,
  MapPinned,
  Menu,
  Route,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import InstallAppButton from '../components/pwa/InstallAppButton';
import { useAuth } from '../context/AuthContext';

const workflow = [
  { number: '01', title: 'Find the road route', text: 'Choose two Philippine places and get the driving distance and estimated travel time.' },
  { number: '02', title: 'Pick the vehicle', text: 'Use a saved fuel-efficiency profile instead of guessing how much fuel the trip will need.' },
  { number: '03', title: 'Add road costs', text: 'Include fuel price, toll segments, parking, food, and the expenses that actually matter.' },
  { number: '04', title: 'Save the trip', text: 'Keep the estimate, split it with friends, and build useful travel spending history.' },
];

const productRows = [
  { icon: MapPinned, label: 'Route', title: 'Driving distance, not straight-line distance', text: 'Use the road route as the basis of the estimate.' },
  { icon: CircleDollarSign, label: 'Expenses', title: 'Fuel, tolls, parking, and extras together', text: 'See the whole trip budget instead of one isolated cost.' },
  { icon: UsersRound, label: 'Shared trips', title: 'Know what each person should contribute', text: 'Split the trip fairly, including driver discounts.' },
  { icon: BarChart3, label: 'History', title: 'See what your driving actually costs over time', text: 'Saved trips become monthly spending and distance insights.' },
];

export default function Landing() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const primaryHref = user ? '/dashboard' : '/auth?mode=signup';
  const primaryLabel = user ? 'Open dashboard' : 'Plan a trip';

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.landing-reveal'));
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lakbay-site">
      <header className="lakbay-site-header">
        <nav className="lakbay-site-nav" aria-label="Landing navigation">
          <Link to="/" className="lakbay-site-brand" aria-label="Lakbay home">
            <span className="lakbay-site-brandmark"><Route size={23} /></span>
            <span className="lakbay-site-brandtext"><strong>Lakbay</strong><small>Smart Trip Planner</small></span>
          </Link>

          <div className="lakbay-site-links desktop-landing-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#why-lakbay">Why Lakbay</a>
          </div>

          <div className="lakbay-site-actions desktop-landing-links">
            {user ? <Link to="/dashboard">Dashboard</Link> : <Link to="/auth">Sign in</Link>}
            <Link className="lakbay-site-primary" to={primaryHref}>{primaryLabel}<ArrowRight size={17} /></Link>
          </div>

          <button
            className="lakbay-site-menu"
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="lakbay-site-mobile-menu">
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#why-lakbay" onClick={() => setMenuOpen(false)}>Why Lakbay</a>
            {user ? <Link to="/dashboard">Dashboard</Link> : <Link to="/auth">Sign in</Link>}
            <Link className="lakbay-site-primary" to={primaryHref}>{primaryLabel}<ArrowRight size={17} /></Link>
          </div>
        )}
      </header>

      <main>
        <section className="lakbay-site-hero">
          <div className="lakbay-site-hero-copy">
            <div className="lakbay-site-road-label">
              <Route size={16} /> Philippine road-trip budgeting
            </div>
            <h1>Plan the drive, <span>not just the distance.</span></h1>
            <p>
              Lakbay turns a road trip into one usable budget — route, vehicle efficiency, fuel, tolls,
              parking, extras, and the split before you leave.
            </p>

            <div className="lakbay-site-hero-actions">
              <Link className="lakbay-site-primary large" to={primaryHref}>{primaryLabel}<ArrowRight size={18} /></Link>
              <InstallAppButton />
              <a className="lakbay-site-quiet" href="#how-it-works">See the workflow</a>
            </div>

            <div className="lakbay-site-meta">
              <span><Check size={15} /> Philippine peso</span>
              <span><Check size={15} /> Saved vehicle profiles</span>
              <span><Check size={15} /> Private trip history</span>
            </div>
          </div>

          <div className="lakbay-trip-sheet" aria-label="Example Lakbay trip estimate">
            <div className="lakbay-trip-sheet-head">
              <div>
                <span>TRIP 014</span>
                <strong>Saturday drive</strong>
              </div>
              <span className="lakbay-trip-sheet-status">ESTIMATE</span>
            </div>

            <div className="lakbay-trip-route">
              <span className="lakbay-trip-route-line" aria-hidden="true" />
              <div className="lakbay-trip-stop">
                <span className="lakbay-trip-node active" />
                <small>FROM</small>
                <strong>Batangas City</strong>
              </div>
              <div className="lakbay-trip-stop">
                <span className="lakbay-trip-node" />
                <small>TO</small>
                <strong>Alabang, Muntinlupa</strong>
              </div>
            </div>

            <div className="lakbay-trip-facts">
              <div><Route size={18} /><span><small>ROAD DISTANCE</small><strong>103.8 km</strong></span></div>
              <div><CarFront size={18} /><span><small>VEHICLE</small><strong>Toyota Vios XLE</strong></span></div>
            </div>

            <div className="lakbay-trip-total">
              <span>Estimated trip cost</span>
              <strong>₱2,360</strong>
            </div>

            <div className="lakbay-trip-ledger">
              <div><span><Fuel size={16} />Fuel</span><strong>₱1,170</strong></div>
              <div><span><Route size={16} />Tolls</span><strong>₱890</strong></div>
              <div><span><CircleDollarSign size={16} />Parking + extras</span><strong>₱300</strong></div>
            </div>

            <div className="lakbay-trip-split">
              <span><UsersRound size={18} /><b>4 travelers</b></span>
              <span><b>₱590</b> each</span>
            </div>
          </div>
        </section>

        <section className="lakbay-cost-anatomy landing-reveal" aria-label="Example trip cost composition">
          <div className="lakbay-cost-anatomy-title">
            <span>Batangas City → Alabang</span>
            <strong>What makes up ₱2,360?</strong>
          </div>
          <div className="lakbay-cost-bar" aria-hidden="true">
            <span className="fuel" /><span className="toll" /><span className="other" />
          </div>
          <div className="lakbay-cost-legend">
            <span><i className="fuel" />Fuel <b>₱1,170</b></span>
            <span><i className="toll" />Tolls <b>₱890</b></span>
            <span><i className="other" />Parking & extras <b>₱300</b></span>
          </div>
        </section>

        <section className="lakbay-product-section landing-reveal" id="features">
          <div className="lakbay-section-intro">
            <span>THE PRODUCT</span>
            <h2>A trip planner that knows the car matters.</h2>
            <p>Two vehicles can drive the same road and produce different budgets. Lakbay keeps the route and the car in the same calculation.</p>
          </div>

          <div className="lakbay-product-layout">
            <div className="lakbay-garage-demo">
              <div className="lakbay-garage-demo-head">
                <span>Same trip. Different vehicle.</span>
                <small>103.8 km • ₱78/L</small>
              </div>

              <div className="lakbay-vehicle-row selected">
                <span className="lakbay-vehicle-icon"><CarFront size={20} /></span>
                <div><strong>Honda City</strong><small>16.0 km/L</small></div>
                <div className="lakbay-vehicle-cost"><small>Fuel estimate</small><strong>₱506</strong></div>
              </div>

              <div className="lakbay-vehicle-row">
                <span className="lakbay-vehicle-icon"><CarFront size={20} /></span>
                <div><strong>Toyota Vios XLE</strong><small>14.0 km/L</small></div>
                <div className="lakbay-vehicle-cost"><small>Fuel estimate</small><strong>₱578</strong></div>
              </div>

              <div className="lakbay-garage-result">
                <span>Better pick for this drive</span>
                <strong>Honda City saves about ₱72 in fuel.</strong>
              </div>
            </div>

            <div className="lakbay-product-rows">
              {productRows.map(({ icon: Icon, label, title, text }) => (
                <article key={label}>
                  <span className="lakbay-product-row-icon"><Icon size={19} /></span>
                  <div><small>{label}</small><h3>{title}</h3><p>{text}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lakbay-road-workflow landing-reveal" id="how-it-works">
          <div className="lakbay-road-workflow-inner">
            <div className="lakbay-road-workflow-head">
              <span>FROM ROUTE TO RECEIPT</span>
              <h2>Four stops. One trip budget.</h2>
            </div>

            <div className="lakbay-road-steps">
              {workflow.map((step) => (
                <article key={step.number}>
                  <div className="lakbay-road-step-number">{step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lakbay-why-section landing-reveal" id="why-lakbay">
          <div className="lakbay-why-copy">
            <span>WHY LAKBAY</span>
            <h2>Stop building the trip budget in your head.</h2>
            <p>Distance is only one part of a drive. Lakbay keeps the costs that usually get forgotten visible before you commit to the trip.</p>

            <div className="lakbay-account-note">
              <ShieldCheck size={21} />
              <div><strong>Your own account, your own trips.</strong><small>Firebase keeps each user’s vehicles and saved trip history separated.</small></div>
            </div>
          </div>

          <div className="lakbay-before-after">
            <div className="before">
              <small>WITHOUT LAKBAY</small>
              <p>“Gas is probably around ₱1,000.”</p>
              <p>“How much is toll again?”</p>
              <p>“We’ll split it later.”</p>
            </div>
            <div className="after">
              <small>WITH LAKBAY</small>
              <p><Check size={16} /> Road distance calculated</p>
              <p><Check size={16} /> Fuel + tolls + extras included</p>
              <p><Check size={16} /> ₱590 per traveler</p>
            </div>
          </div>
        </section>

        <section className="lakbay-final-cta landing-reveal">
          <div>
            <span>READY FOR THE NEXT DRIVE?</span>
            <h2>Know the number before you leave.</h2>
          </div>
          <Link className="lakbay-site-primary light" to={primaryHref}>{primaryLabel}<ArrowRight size={18} /></Link>
        </section>
      </main>

      <footer className="lakbay-site-footer">
        <Link to="/" className="lakbay-site-brand">
          <span className="lakbay-site-brandmark small"><Route size={19} /></span>
          <span className="lakbay-site-brandtext"><strong>Lakbay</strong><small>Smart Trip Planner</small></span>
        </Link>
        <p>Plan the drive. Know the cost.</p>
        <span>© {new Date().getFullYear()} Lakbay</span>
      </footer>
    </div>
  );
}
