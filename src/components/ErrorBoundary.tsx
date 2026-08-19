import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Route } from 'lucide-react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Lakbay encountered an unexpected UI error.', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="fatal-page" role="alert">
        <div className="fatal-card">
          <div className="auth-brand fatal-brand">
            <div className="brand-mark"><Route size={24} /></div>
            <div><div className="brand-name">Lakbay</div><div className="brand-sub">Smart Trip Planner</div></div>
          </div>
          <span className="fatal-icon"><AlertTriangle size={24} /></span>
          <h1>Something went wrong</h1>
          <p>Your saved Firebase data is not affected. Reload Lakbay to start with a fresh screen.</p>
          <button className="primary-btn" onClick={() => window.location.reload()}>
            <RefreshCw size={17} /> Reload Lakbay
          </button>
        </div>
      </div>
    );
  }
}
