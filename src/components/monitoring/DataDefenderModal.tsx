import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Radio,
  PowerOff,
} from "lucide-react";
import { vars } from "../../ui/toast/themeBridge";
import { PREMIUM_DIALOG_PAPER_SX, PREMIUM_ACTION_BUTTON_SX } from "../../ui/styles";
import {
  resolveDataDefenderTarget,
  connectDataDefenderBackend,
  disconnectDataDefenderBackend,
  getDataDefenderBackendStatus,
  openDataDefender,
  getDataDefenderUrl,
  type DataDefenderSessionData,
} from "../../services/monitoring/dataDefenderService";
import type { ActivePass } from "../../types/monitoring/dashboard";
import type { GroundStation } from "../../types/topologyTypes";
import toast from "react-hot-toast";

interface DataDefenderModalProps {
  open: boolean;
  onClose: () => void;
  pass?: ActivePass | GroundStation | any;
}

export const DataDefenderModal: React.FC<DataDefenderModalProps> = ({
  open,
  onClose,
  pass,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);
  const [sessionData, setSessionData] = useState<DataDefenderSessionData | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [popupBlocked, setPopupBlocked] = useState<boolean>(false);

  const target = resolveDataDefenderTarget(pass);
  const isSD2 = target.passType === "SD2";

  // Check backend session status asynchronously when modal opens (non-blocking)
  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    setConnectionError(null);
    setPopupBlocked(false);

    const checkStatus = async () => {
      try {
        const res = await getDataDefenderBackendStatus(8080);
        if (isMounted && res.connected && res.data) {
          setSessionData(res.data);
        } else if (isMounted) {
          setSessionData(null);
        }
      } catch {
        if (isMounted) setSessionData(null);
      }
    };

    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [open, target.receiverInstanceId]);

  const handleCopyCommand = async () => {
    if (!target.command) {
      toast.error("No SSM command available for this ground station.");
      return;
    }
    try {
      await navigator.clipboard.writeText(target.command);
      setCopied(true);
      toast.success("SSM Command copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy command:", err);
      toast.error("Failed to copy command to clipboard.");
    }
  };

  const handleConnect = async () => {
    if (!target.isValid) {
      toast.error(target.errorMessage || "Invalid ground station target.");
      return;
    }

    // Immediately open window tab synchronously from user click to bypass Chrome popup blocker
    let dataDefenderWindow: Window | null = null;
    try {
      dataDefenderWindow = window.open("about:blank", "_blank");
      if (!dataDefenderWindow || dataDefenderWindow.closed || typeof dataDefenderWindow.closed === "undefined") {
        setPopupBlocked(true);
      }
    } catch (popupErr) {
      console.warn("Popup blocked by browser:", popupErr);
      setPopupBlocked(true);
      dataDefenderWindow = null;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const res = await connectDataDefenderBackend(target);

      if (res.success && res.data) {
        setSessionData(res.data);
        const destinationUrl = res.data.url || getDataDefenderUrl(pass) || "http://localhost:8080";
        
        if (dataDefenderWindow && !dataDefenderWindow.closed) {
          dataDefenderWindow.location.href = destinationUrl;
        } else {
          setPopupBlocked(true);
        }

        toast.success(`DataDefender SSM tunnel established on port ${res.data.localPort}!`);
      } else {
        if (dataDefenderWindow && !dataDefenderWindow.closed) {
          dataDefenderWindow.close();
        }
        const errMsg = res.error || "Failed to establish SSM port-forwarding session.";
        setConnectionError(errMsg);
        toast.error(errMsg);
      }
    } catch (err: any) {
      if (dataDefenderWindow && !dataDefenderWindow.closed) {
        dataDefenderWindow.close();
      }
      const errMsg = err.message || "An unexpected error occurred while connecting.";
      setConnectionError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const res = await disconnectDataDefenderBackend(8080);
      if (res.success) {
        setSessionData(null);
        setConnectionError(null);
        setPopupBlocked(false);
        toast.success("DataDefender SSM session disconnected.");
      } else {
        toast.error(res.error || "Failed to disconnect session.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error disconnecting session.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleOpenExistingTab = () => {
    openDataDefender(sessionData?.url || "http://localhost:8080");
  };

  const isCurrentTargetConnected = Boolean(
    sessionData &&
    sessionData.status === "connected" &&
    sessionData.receiverInstanceId === target.receiverInstanceId
  );

  const isOtherTargetConnected = Boolean(
    sessionData &&
    sessionData.status === "connected" &&
    sessionData.receiverInstanceId !== target.receiverInstanceId
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          ...PREMIUM_DIALOG_PAPER_SX,
          bgcolor: "#0B1218",
          border: `1px solid ${vars.border}`,
          borderRadius: "12px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.85)",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${vars.border}`,
          bgcolor: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: "8px",
              bgcolor: isCurrentTargetConnected
                ? "rgba(16, 185, 129, 0.12)"
                : "rgba(56, 189, 248, 0.12)",
              color: isCurrentTargetConnected ? "#10B981" : "#38BDF8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isCurrentTargetConnected ? <Radio size={18} /> : <Terminal size={18} />}
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 900, color: vars.text, letterSpacing: "0.03em" }}>
                Connect to DataDefender
              </Typography>
              {isCurrentTargetConnected && (
                <Chip
                  label="CONNECTED"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 9.5,
                    fontWeight: 900,
                    bgcolor: "rgba(16, 185, 129, 0.15)",
                    color: "#10B981",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                  }}
                />
              )}
            </Box>
            <Typography sx={{ fontSize: 11, color: vars.textDim, mt: 0.2 }}>
              AWS Systems Manager (SSM) Port-Forwarding Session
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: vars.textDim, "&:hover": { color: vars.text } }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 2.2, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Popup Blocked Notification */}
        {popupBlocked && (
          <Alert
            severity="warning"
            sx={{
              bgcolor: "rgba(245, 158, 11, 0.12)",
              color: "#FBBF24",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              fontSize: 12,
              fontWeight: 600,
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleOpenExistingTab}
                sx={{ fontWeight: 800, textTransform: "none", fontSize: 11 }}
              >
                Open Tab
              </Button>
            }
          >
            Popup window was blocked by your browser. Click "Open Tab" to launch DataDefender.
          </Alert>
        )}

        {/* Warning or Error Banners */}
        {connectionError ? (
          <Alert
            severity="error"
            icon={<AlertTriangle size={18} />}
            sx={{
              bgcolor: "rgba(239, 68, 68, 0.12)",
              color: "#F87171",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {connectionError}
          </Alert>
        ) : !target.isValid ? (
          <Alert
            severity="error"
            icon={<AlertTriangle size={18} />}
            sx={{
              bgcolor: "rgba(239, 68, 68, 0.12)",
              color: "#F87171",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {target.errorMessage || "Receiver EC2 is not configured for this ground station."}
          </Alert>
        ) : target.receiverStatus === "STOPPED" || target.receiverStatus === "OFFLINE" ? (
          <Alert
            severity="warning"
            icon={<AlertTriangle size={18} />}
            sx={{
              bgcolor: "rgba(245, 158, 11, 0.12)",
              color: "#FBBF24",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Receiver EC2 is stopped. Start the instance in AWS before initiating the SSM session.
          </Alert>
        ) : isOtherTargetConnected ? (
          <Alert
            severity="info"
            sx={{
              bgcolor: "rgba(245, 158, 11, 0.12)",
              color: "#FBBF24",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              fontSize: 11.5,
              fontWeight: 600,
            }}
          >
            Port 8080 is currently connected to <strong>{sessionData?.groundStation} ({sessionData?.stationId})</strong>. Disconnect it below to switch to this ground station.
          </Alert>
        ) : isCurrentTargetConnected ? (
          <Box
            sx={{
              p: 1.2,
              borderRadius: "8px",
              bgcolor: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ShieldCheck size={16} color="#10B981" style={{ flexShrink: 0 }} />
            <Typography sx={{ fontSize: 11.5, color: "#34D399", lineHeight: 1.4, fontWeight: 600 }}>
              SSM Tunnel is active on <strong>localhost:8080</strong> (Remote Receiver: {sessionData?.receiverInstanceId}).
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              p: 1.2,
              borderRadius: "8px",
              bgcolor: "rgba(56, 189, 248, 0.05)",
              border: "1px solid rgba(56, 189, 248, 0.15)",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ShieldCheck size={16} color="#38BDF8" style={{ flexShrink: 0 }} />
            <Typography sx={{ fontSize: 11.5, color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.4 }}>
              Clicking <strong>Connect & Open</strong> starts the background AWS SSM port forwarding tunnel using your <strong>{target.accountType}</strong> credentials and opens DataDefender at <strong>localhost:8080</strong>.
            </Typography>
          </Box>
        )}

        {/* Target Details Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.2,
            p: 1.5,
            borderRadius: "8px",
            bgcolor: "rgba(255, 255, 255, 0.02)",
            border: `1px solid ${vars.borderWeak}`,
          }}
        >
          {/* Ground Station */}
          <Box>
            <Typography sx={{ fontSize: 10, color: vars.textDim, textTransform: "uppercase", fontWeight: 700 }}>
              Ground Station
            </Typography>
            <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: vars.text, mt: 0.2 }}>
              {target.groundStation}
            </Typography>
          </Box>

          {/* Pass / Station */}
          <Box>
            <Typography sx={{ fontSize: 10, color: vars.textDim, textTransform: "uppercase", fontWeight: 700 }}>
              Station / Pass
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.2 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: vars.text }}>
                {target.stationId}
              </Typography>
              <Chip
                label={isSD2 ? "SD2 / GS2" : "SD1 / GS1"}
                size="small"
                sx={{
                  height: 18,
                  fontSize: 9.5,
                  fontWeight: 900,
                  bgcolor: isSD2 ? "rgba(234, 179, 8, 0.15)" : "rgba(59, 130, 246, 0.15)",
                  color: isSD2 ? "#FACC15" : "#60A5FA",
                  border: `1px solid ${isSD2 ? "rgba(234, 179, 8, 0.3)" : "rgba(59, 130, 246, 0.3)"}`,
                }}
              />
            </Box>
          </Box>

          {/* AWS Account Isolation */}
          <Box>
            <Typography sx={{ fontSize: 10, color: vars.textDim, textTransform: "uppercase", fontWeight: 700 }}>
              AWS Account Isolation
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: isSD2 ? "#FACC15" : "#60A5FA",
                mt: 0.2,
              }}
            >
              {target.accountType} Account ({isSD2 ? "GS2/SD2 Dedicated" : "GS1/SD1 Dedicated"})
            </Typography>
          </Box>

          {/* AWS Region */}
          <Box>
            <Typography sx={{ fontSize: 10, color: vars.textDim, textTransform: "uppercase", fontWeight: 700 }}>
              AWS Region
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#38BDF8", fontFamily: "monospace", mt: 0.2 }}>
              {target.awsRegion || "Not Configured"}
            </Typography>
          </Box>

          {/* Receiver EC2 Instance */}
          <Box>
            <Typography sx={{ fontSize: 10, color: vars.textDim, textTransform: "uppercase", fontWeight: 700 }}>
              Receiver EC2 Target
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: target.receiverInstanceId ? vars.text : "#EF4444",
                fontFamily: "monospace",
                mt: 0.2,
              }}
            >
              {target.receiverInstanceId || "Not Configured"}
            </Typography>
          </Box>

          {/* Port Forwarding Target */}
          <Box>
            <Typography sx={{ fontSize: 10, color: vars.textDim, textTransform: "uppercase", fontWeight: 700 }}>
              Port Forwarding
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#10B981", fontFamily: "monospace", mt: 0.2 }}>
              8080 (Local) → 80 (Remote)
            </Typography>
          </Box>
        </Box>

        {/* SSM Command Code Box */}
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: "#38BDF8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              AWS SSM Port-Forwarding Command (Reference)
            </Typography>
            {target.isValid && (
              <Button
                size="small"
                onClick={handleCopyCommand}
                startIcon={copied ? <Check size={12} /> : <Copy size={12} />}
                sx={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  textTransform: "none",
                  py: 0.2,
                  px: 0.8,
                  minHeight: 22,
                  color: copied ? "#10B981" : "#38BDF8",
                  bgcolor: copied ? "rgba(16, 185, 129, 0.12)" : "rgba(56, 189, 248, 0.08)",
                  border: `1px solid ${copied ? "rgba(16, 185, 129, 0.3)" : "rgba(56, 189, 248, 0.25)"}`,
                  borderRadius: "4px",
                  "&:hover": {
                    bgcolor: "rgba(56, 189, 248, 0.18)",
                  },
                }}
              >
                {copied ? "Copied" : "Copy Command"}
              </Button>
            )}
          </Box>

          <Box
            sx={{
              p: 1.4,
              borderRadius: "8px",
              bgcolor: "#05090E",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              position: "relative",
              overflowX: "auto",
            }}
          >
            <Typography
              component="pre"
              sx={{
                fontSize: 11.5,
                fontFamily: "Consolas, Monaco, monospace",
                color: target.isValid ? "#E2E8F0" : "rgba(255, 255, 255, 0.35)",
                m: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                userSelect: "all",
              }}
            >
              {target.command || "# No Receiver EC2 configured for this ground station"}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${vars.border}`,
          bgcolor: "rgba(255, 255, 255, 0.02)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Button
          size="small"
          onClick={onClose}
          sx={{
            color: vars.textDim,
            fontSize: 11.5,
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { color: vars.text },
          }}
        >
          Close
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Disconnect Button (shown if any session is active) */}
          {sessionData && (
            <Button
              size="small"
              variant="outlined"
              onClick={handleDisconnect}
              disabled={isDisconnecting || isConnecting}
              startIcon={isDisconnecting ? <CircularProgress size={12} color="inherit" /> : <PowerOff size={13} />}
              sx={{
                color: "#EF4444",
                borderColor: "rgba(239, 68, 68, 0.35)",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "none",
                px: 1.4,
                height: 32,
                borderRadius: "6px",
                "&:hover": {
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                  borderColor: "#EF4444",
                },
              }}
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </Button>
          )}

          {/* If current target is connected, allow opening tab directly */}
          {isCurrentTargetConnected ? (
            <Button
              size="small"
              variant="contained"
              onClick={handleOpenExistingTab}
              endIcon={<ExternalLink size={14} />}
              sx={{
                ...PREMIUM_ACTION_BUTTON_SX,
                bgcolor: "#10B981",
                "&:hover": {
                  bgcolor: "#059669",
                },
                fontSize: 11.5,
                fontWeight: 800,
                textTransform: "none",
                px: 1.8,
                height: 32,
                borderRadius: "6px",
              }}
            >
              Open DataDefender Tab
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              onClick={handleConnect}
              disabled={!target.isValid || isConnecting || isDisconnecting}
              startIcon={
                isConnecting ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <Radio size={14} />
                )
              }
              endIcon={!isConnecting ? <ExternalLink size={14} /> : undefined}
              sx={{
                ...PREMIUM_ACTION_BUTTON_SX,
                fontSize: 11.5,
                fontWeight: 800,
                textTransform: "none",
                px: 1.8,
                height: 32,
                borderRadius: "6px",
              }}
            >
              {isConnecting
                ? "Establishing SSM Tunnel..."
                : isOtherTargetConnected
                ? "Switch & Connect"
                : "Connect & Open DataDefender"}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
