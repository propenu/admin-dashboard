///src/components/common/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Page render failed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 font-semibold">
          ⚠ Something went wrong in this page.
          <button
            type="button"
            className="ml-3 rounded border border-red-300 px-2 py-1 text-sm text-red-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
          {this.state.error?.message ? (
            <pre className="mt-3 max-w-3xl overflow-auto rounded border border-red-200 bg-red-50 p-3 text-left text-xs font-normal text-red-700 whitespace-pre-wrap">
              {String(this.state.error.message)}
              {this.state.error.stack
                ? `\n\n${String(this.state.error.stack).slice(0, 1200)}`
                : ""}
            </pre>
          ) : null}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
