import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "12px" }}>
            App crashed while rendering
          </h1>
          <p style={{ marginBottom: "12px" }}>
            Check the message below and send it to me.
          </p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: "12px", borderRadius: "8px" }}>
            {this.state.error?.stack || this.state.error?.message || "Unknown error"}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
