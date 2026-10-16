import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Thai Hasi:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#121214] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-2">Etwas ist schiefgelaufen</h1>
          <p className="text-xs text-[#8E8E93] max-w-sm mb-6 leading-relaxed">
            Ein unerwarteter Fehler ist aufgetreten. Deine Vokabeln und Fortschritte sind sicher gespeichert.
          </p>
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF7A00] text-black text-xs font-semibold hover:bg-[#FF881A] transition active:scale-95 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            App neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
