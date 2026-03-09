'use client'

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    name: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error in " + this.props.name + ":", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            // IMPORTANT: Do NOT use <Html> from drei here — if <Html> itself is the
            // crash source, using it in the fallback creates a cascade that takes
            // down the entire Canvas.  Just render nothing and log to console.
            return null;
        }

        return this.props.children;
    }
}
