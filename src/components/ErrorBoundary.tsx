"use client"
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearAndReload = () => {
    // Clear caches and reload
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backgroundColor: "#141619",
            color: "#f0f1f3",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "bold" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#8b8d91", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              We're sorry, but something unexpected happened. Please try reloading the page.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#22c55e",
                  color: "#141619",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.875rem",
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleClearAndReload}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "transparent",
                  color: "#f0f1f3",
                  border: "1px solid #2a2d32",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.875rem",
                }}
              >
                Clear Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;