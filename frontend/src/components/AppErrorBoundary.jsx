import React from 'react';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Page rendering failed:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="route-error-state">
        <span><AlertTriangle size={28} /></span>
        <h2>This page could not be displayed</h2>
        <p>The application is still running. Return to the dashboard and try again.</p>
        <div>
          <button className="btn btn-ghost" onClick={() => window.history.back()}><ArrowLeft size={16} /> Back</button>
          <a className="btn" href="/"><Home size={16} /> Dashboard</a>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
