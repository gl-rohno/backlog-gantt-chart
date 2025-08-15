import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError, createError } from '../utils/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = createError('unknown', error.message, { error, errorInfo });
    logError(appError);
    
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <h2>予期しないエラーが発生しました</h2>
            <details className="error-boundary__details">
              <summary>エラーの詳細</summary>
              <pre className="error-boundary__stack">
                {this.state.error?.stack || this.state.error?.message}
              </pre>
            </details>
            <div className="error-boundary__actions">
              <button 
                onClick={this.handleRetry}
                className="btn btn--primary"
              >
                再試行
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn btn--secondary"
              >
                ページを再読み込み
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}