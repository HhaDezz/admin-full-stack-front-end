import { Component, type ReactNode } from 'react';
import { ServerError } from '../pages/system/ServerError';

/** Catches render errors below it and shows the 500 page instead of a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode; fullScreen?: boolean; resetKey?: unknown }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(prev: { resetKey?: unknown }) {
    // Navigating elsewhere clears the error.
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.error)
      return (
        <ServerError
          fullScreen={this.props.fullScreen}
          onRetry={() => this.setState({ error: null })}
          detail={import.meta.env.DEV ? this.state.error.message : undefined}
        />
      );
    return this.props.children;
  }
}
