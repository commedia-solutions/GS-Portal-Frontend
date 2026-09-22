import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AwsErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in AWS Dashboard:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box p={3} bgcolor="#0f172a" color="white" minHeight="100vh">
          <Typography variant="h6" color="error">
            Failed to load AWS Dashboard.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: '#94a3b8' }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}
