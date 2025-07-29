import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
            <div className="mb-4 flex justify-center">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>

            <h1 className="mb-2 text-xl font-semibold text-gray-900">Something went wrong</h1>

            <p className="mb-6 text-gray-600">
              We encountered an unexpected error. Please try refreshing the page or contact support
              if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 rounded-lg bg-gray-100 p-4 text-left">
                <h3 className="mb-2 font-medium text-gray-900">Error Details:</h3>
                <pre className="max-h-32 overflow-auto text-xs text-gray-700">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={this.handleReload}
                className="w-full"
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Refresh Page
              </Button>

              <Button variant="secondary" onClick={this.handleReset} className="w-full">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
