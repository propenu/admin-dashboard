///src/components/common/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Page render failed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 font-semibold">
          ⚠ Something went wrong in this page.
          <button
            type="button"
            className="ml-3 rounded border border-red-300 px-2 py-1 text-sm text-red-700"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
