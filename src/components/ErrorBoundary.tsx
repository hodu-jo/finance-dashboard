'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-center min-h-[100px]">
           <div className="text-center">
             <h3 className="text-red-600 dark:text-red-400 font-semibold mb-1">오류가 발생했습니다</h3>
             <p className="text-xs text-red-500 dark:text-red-300">잠시 후 다시 시도해주세요.</p>
           </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
