import React, { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    // You can log the error to an error reporting service here
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="bg-[#1a1a2e] text-white min-h-screen flex flex-col items-center justify-center p-5 text-center">
          <div className="text-5xl mb-5">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
          <p className="text-base mb-8 max-w-sm">
            Something went wrong. Please restart the app.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 text-base bg-cyan-400 text-black rounded cursor-pointer border-none font-bold"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
