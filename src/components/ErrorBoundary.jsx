import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
                    <div className="bg-red-50 border border-red-200 p-6 rounded-lg max-w-2xl">
                        <h2 className="text-xl font-bold text-red-700 mb-2">System Failure</h2>
                        <p className="text-sm text-red-600 mb-4">The application encountered a critical error.</p>
                        <details className="text-left bg-white p-4 border border-red-100 rounded text-xs font-mono overflow-auto max-h-64">
                            <summary className="cursor-pointer font-bold text-red-500 mb-2">Error Log</summary>
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </details>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-colors"
                        >
                            Reboot System
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
