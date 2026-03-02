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

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 font-semibold">
          ⚠ Something went wrong in this page.
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
