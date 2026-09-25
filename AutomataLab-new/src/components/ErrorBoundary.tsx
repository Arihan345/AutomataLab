import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './ui/Button';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center',
            background: 'var(--bg)', color: 'var(--text-1)',
          }}
        >
          <p style={{ fontSize: 24, color: 'var(--text-3)' }}>✕</p>
          <h1 style={{ fontSize: 20, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, maxWidth: 420, lineHeight: 1.5 }}>
            An unexpected error crashed this view. Reloading the page will get you back to a working state.
          </p>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text-3)', maxWidth: 480, wordBreak: 'break-word' }}>
            {this.state.error.message}
          </p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
