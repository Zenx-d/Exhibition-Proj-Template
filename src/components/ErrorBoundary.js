'use client';

import React from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You could also log the error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 rounded-[2.5rem] bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-center my-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-6">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Component Fault
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 font-medium">
            A rendering exception occurred in this specific module. The rest of the platform remains operational.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
          >
            <RotateCcw size={14} /> Attempt Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
