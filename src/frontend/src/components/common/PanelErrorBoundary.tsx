import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class PanelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Panel error boundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    // Reset boundary state first
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Call custom retry callback if provided (after a small delay to ensure state reset)
    if (this.props.onRetry) {
      setTimeout(() => {
        this.props.onRetry?.();
      }, 100);
    }
  };

  render() {
    if (this.state.hasError) {
      // Ensure we always render something visible, even if error is malformed
      const errorMessage = this.state.error?.message || 'An unexpected error occurred';
      const errorName = this.state.error?.name || 'Error';
      
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <CardTitle className="text-lg">Panel Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Rendering Error</AlertTitle>
              <AlertDescription className="text-sm space-y-2">
                <p>This panel encountered an unexpected error and could not render.</p>
                <p className="font-mono text-xs break-words">
                  <strong>{errorName}:</strong> {errorMessage}
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleRetry}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Panel
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Other admin panels remain accessible
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
