// src/components/monitoring/RegionManagementModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Chip,
  Alert,
  Divider,
  MenuItem,
  Select,
} from "@mui/material";
import {
  X,
  Plus,
  Edit2,
  Radio,
  Trash2,
  RotateCcw,
  ArrowLeft,
  Server,
  ShieldCheck,
  AlertTriangle,
  Power,
  PowerOff,
} from "lucide-react";
import { vars } from "../../ui/toast/themeBridge";
import {
  PREMIUM_DIALOG_PAPER_SX,
  PREMIUM_ACTION_BUTTON_SX,
} from "../../ui/styles";
import {
  getRegions,
  createRegion,
  updateRegion,
  deleteRegion,
  getAwsRegions,
  getAwsInstances,
} from "../../services/regions/regionService";
import type {
  RegionPayload,
  AwsRegionOption,
  AwsInstanceOption,
} from "../../services/regions/regionService";

interface RegionManagementModalProps {
  open: boolean;
  onClose: () => void;
  onRegionsChanged: () => void;
  initialMode?: "list" | "add";
}

// Known AWS Region to geographic coordinate defaults
const AWS_REGION_DEFAULTS: Record<string, { name: string; code: string; lat: number; lng: number }> = {
  "us-west-2": { name: "Oregon", code: "OR", lat: 44.0, lng: -120.5 },
  "af-south-1": { name: "Cape Town", code: "CPT", lat: -33.9249, lng: 18.4241 },
  "eu-west-1": { name: "Dublin", code: "DUB", lat: 53.3498, lng: -6.2603 },
  "sa-east-1": { name: "Punta Arenas", code: "PUQ", lat: -53.15, lng: -70.9167 },
  "ap-southeast-2": { name: "Dubbo", code: "DBO", lat: -32.245, lng: 148.604 },
  "us-east-1": { name: "N. Virginia", code: "VA", lat: 38.88, lng: -77.17 },
  "us-east-2": { name: "Ohio", code: "OH", lat: 40.4173, lng: -82.9071 },
  "us-west-1": { name: "N. California", code: "CA", lat: 37.7749, lng: -122.4194 },
  "eu-central-1": { name: "Frankfurt", code: "FRA", lat: 50.1109, lng: 8.6821 },
  "eu-west-2": { name: "London", code: "LON", lat: 51.5074, lng: -0.1278 },
  "eu-north-1": { name: "Stockholm", code: "ARN", lat: 59.3293, lng: 18.0686 },
  "ap-south-1": { name: "Mumbai", code: "BOM", lat: 19.076, lng: 72.8777 },
  "ap-southeast-1": { name: "Singapore", code: "SIN", lat: 1.3521, lng: 103.8198 },
  "ap-northeast-1": { name: "Tokyo", code: "TYO", lat: 35.6762, lng: 139.6503 },
  "ap-northeast-2": { name: "Seoul", code: "ICN", lat: 37.5665, lng: 126.9780 },
  "me-south-1": { name: "Bahrain", code: "BAH", lat: 26.0667, lng: 50.5577 },
};

const FORM_FIELD_HEIGHT = "40px";

const FIELD_LABEL_SX = {
  fontSize: "11.5px",
  fontWeight: 700,
  color: "rgba(255, 255, 255, 0.85)",
  letterSpacing: "0.2px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  mb: 0.6,
};

const UNIFORM_CONTROL_SX = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    height: FORM_FIELD_HEIGHT,
    minHeight: FORM_FIELD_HEIGHT,
    bgcolor: "rgba(255, 255, 255, 0.04)",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "12.5px",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.12)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(56, 189, 248, 0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#38BDF8",
      borderWidth: "1.5px",
    },
    "& .MuiOutlinedInput-input": {
      padding: "0 12px",
      height: FORM_FIELD_HEIGHT,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiSelect-select": {
      padding: "0 12px !important",
      height: `${FORM_FIELD_HEIGHT} !important`,
      minHeight: `${FORM_FIELD_HEIGHT} !important`,
      display: "flex !important",
      alignItems: "center !important",
      boxSizing: "border-box !important",
    },
    "& .MuiSelect-icon": {
      color: "rgba(255, 255, 255, 0.5)",
      right: "8px",
    },
  },
  "& .MuiFormHelperText-root": {
    fontSize: "10px",
    color: "rgba(255, 255, 255, 0.45)",
    mt: 0.4,
    mx: 0.5,
  },
};

const MENU_PAPER_SX = {
  bgcolor: "#0C131D",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: "8px",
  maxHeight: 320,
  maxWidth: 550,
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.7)",
};

export const RegionManagementModal: React.FC<RegionManagementModalProps> = ({
  open,
  onClose,
  onRegionsChanged,
  initialMode = "list",
}) => {
  const [mode, setMode] = useState<"list" | "add" | "edit">(initialMode);
  const [regions, setRegions] = useState<RegionPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [awsRegion, setAwsRegion] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  // AWS Region Options & Loading
  const [awsRegionOptions, setAwsRegionOptions] = useState<AwsRegionOption[]>([]);
  const [loadingAwsRegions, setLoadingAwsRegions] = useState<boolean>(false);

  // EC2 Instances Discovery
  const [gs1Instances, setGs1Instances] = useState<AwsInstanceOption[]>([]);
  const [gs2Instances, setGs2Instances] = useState<AwsInstanceOption[]>([]);
  const [loadingGs1Instances, setLoadingGs1Instances] = useState<boolean>(false);
  const [loadingGs2Instances, setLoadingGs2Instances] = useState<boolean>(false);
  const [gs1InstanceError, setGs1InstanceError] = useState<string | null>(null);
  const [gs2InstanceError, setGs2InstanceError] = useState<string | null>(null);

  // GS1 / SD1 Config
  const [sd1StationId, setSd1StationId] = useState<string>("");
  const [sd1SdrInstanceId, setSd1SdrInstanceId] = useState<string>("");
  const [sd1ReceiverInstanceId, setSd1ReceiverInstanceId] = useState<string>("");

  // GS2 / SD2 Config
  const [sd2StationId, setSd2StationId] = useState<string>("");
  const [sd2SdrInstanceId, setSd2SdrInstanceId] = useState<string>("");
  const [sd2ReceiverInstanceId, setSd2ReceiverInstanceId] = useState<string>("");

  // Delete Confirmation State
  const [deletingRegion, setDeletingRegion] = useState<RegionPayload | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const loadRegionsList = async () => {
    setLoading(true);
    try {
      const data = await getRegions(true);
      setRegions(data);
    } catch (err: any) {
      setErrorMessage("Failed to load regions list.");
    } finally {
      setLoading(false);
    }
  };

  const loadAwsRegions = async () => {
    setLoadingAwsRegions(true);
    try {
      const regionList = await getAwsRegions("GS1");
      setAwsRegionOptions(regionList);
    } catch (err) {
      console.error("Failed to fetch AWS regions:", err);
    } finally {
      setLoadingAwsRegions(false);
    }
  };

  const loadInstancesForRegion = async (selectedRegion: string) => {
    if (!selectedRegion) {
      setGs1Instances([]);
      setGs2Instances([]);
      return;
    }

    setLoadingGs1Instances(true);
    setLoadingGs2Instances(true);
    setGs1InstanceError(null);
    setGs2InstanceError(null);

    try {
      const [gs1List, gs2List] = await Promise.all([
        getAwsInstances("GS1", selectedRegion).catch((err) => {
          setGs1InstanceError(err.message || "Unable to discover GS1/SD1 instances for this AWS region.");
          return [];
        }),
        getAwsInstances("GS2", selectedRegion).catch((err) => {
          setGs2InstanceError(err.message || "Unable to discover GS2/SD2 instances for this AWS region.");
          return [];
        }),
      ]);

      setGs1Instances(gs1List);
      setGs2Instances(gs2List);
    } finally {
      setLoadingGs1Instances(false);
      setLoadingGs2Instances(false);
    }
  };

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
      loadRegionsList();
      loadAwsRegions();
      if (initialMode === "add") {
        resetForm();
      }
    }
  }, [open, initialMode]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCode("");
    setAwsRegion("");
    setLatitude("");
    setLongitude("");

    setGs1Instances([]);
    setGs2Instances([]);
    setGs1InstanceError(null);
    setGs2InstanceError(null);

    setSd1StationId("");
    setSd1SdrInstanceId("");
    setSd1ReceiverInstanceId("");

    setSd2StationId("");
    setSd2SdrInstanceId("");
    setSd2ReceiverInstanceId("");

    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setMode("add");
  };

  const handleOpenEdit = (reg: RegionPayload) => {
    resetForm();
    setEditingId(reg.id || null);
    setName(reg.name || "");
    setCode(reg.code || "");
    setAwsRegion(reg.awsRegion || "");
    setLatitude(reg.latitude !== undefined ? String(reg.latitude) : "");
    setLongitude(reg.longitude !== undefined ? String(reg.longitude) : "");

    const sd1 = reg.stations?.find((s) => s.stationType === "SD1") || reg.sd1 || reg.gs1;
    const sd2 = reg.stations?.find((s) => s.stationType === "SD2") || reg.sd2 || reg.gs2;

    if (sd1) {
      setSd1StationId(sd1.stationId || `${reg.code}1`);
      setSd1SdrInstanceId(sd1.ec2SdrInstanceId || sd1.sdrInstanceId || "");
      setSd1ReceiverInstanceId(sd1.ec2ReceiverInstanceId || sd1.receiverInstanceId || "");
    } else {
      setSd1StationId("");
      setSd1SdrInstanceId("");
      setSd1ReceiverInstanceId("");
    }

    if (sd2) {
      setSd2StationId(sd2.stationId || `${reg.code}2`);
      setSd2SdrInstanceId(sd2.ec2SdrInstanceId || sd2.sdrInstanceId || "");
      setSd2ReceiverInstanceId(sd2.ec2ReceiverInstanceId || sd2.receiverInstanceId || "");
    } else {
      setSd2StationId("");
      setSd2SdrInstanceId("");
      setSd2ReceiverInstanceId("");
    }

    if (reg.awsRegion) {
      loadInstancesForRegion(reg.awsRegion);
    }

    setMode("edit");
  };

  const handleAwsRegionChange = (newAwsRegion: string) => {
    setAwsRegion(newAwsRegion);

    // Auto-populate default coordinates and code if matching standard AWS region
    const defaultMeta = AWS_REGION_DEFAULTS[newAwsRegion];
    if (defaultMeta) {
      if (!name || mode === "add") setName(defaultMeta.name);
      if (!code || mode === "add") {
        setCode(defaultMeta.code);
        if (!sd1StationId || sd1StationId.endsWith("1")) setSd1StationId(`${defaultMeta.code}1`);
        if (!sd2StationId || sd2StationId.endsWith("2")) setSd2StationId(`${defaultMeta.code}2`);
      }
      setLatitude(String(defaultMeta.lat));
      setLongitude(String(defaultMeta.lng));
    }

    // Clear previous instance selections for the old region
    setSd1SdrInstanceId("");
    setSd1ReceiverInstanceId("");
    setSd2SdrInstanceId("");
    setSd2ReceiverInstanceId("");

    // Load fresh EC2 instances for both GS1 and GS2 accounts independently
    loadInstancesForRegion(newAwsRegion);
  };

  const handleToggleActive = async (reg: RegionPayload) => {
    if (!reg.id) return;
    try {
      await updateRegion(reg.id, { isActive: !reg.isActive });
      setSuccessMessage(`Region "${reg.name}" ${!reg.isActive ? "activated" : "deactivated"} successfully.`);
      await loadRegionsList();
      onRegionsChanged();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to toggle region status.");
    }
  };

  const handlePromptDelete = (reg: RegionPayload) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setDeletingRegion(reg);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRegion || !deletingRegion.id) return;
    setDeleteLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await deleteRegion(deletingRegion.id);
      setSuccessMessage(`Ground station region "${deletingRegion.name}" deleted successfully.`);
      setDeletingRegion(null);
      await loadRegionsList();
      onRegionsChanged();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete region. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Region Details Validation (Mandatory)
    if (!name.trim()) return setErrorMessage("Region Name is required.");
    if (!awsRegion.trim()) return setErrorMessage("AWS Region is required.");
    if (!code.trim()) return setErrorMessage("Region Code is required.");
    if (!latitude.trim() || isNaN(Number(latitude)))
      return setErrorMessage("Latitude must be a valid number.");
    if (!longitude.trim() || isNaN(Number(longitude)))
      return setErrorMessage("Longitude must be a valid number.");

    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    if (latNum < -90 || latNum > 90) {
      return setErrorMessage("Latitude must be between -90 and +90 degrees.");
    }
    if (lngNum < -180 || lngNum > 180) {
      return setErrorMessage("Longitude must be between -180 and +180 degrees.");
    }

    const codeUpper = code.trim().toUpperCase();

    // 2. Station Configuration Validation
    const isGs1Configured = Boolean(sd1StationId.trim() || sd1SdrInstanceId.trim() || sd1ReceiverInstanceId.trim());
    const isGs2Configured = Boolean(sd2StationId.trim() || sd2SdrInstanceId.trim() || sd2ReceiverInstanceId.trim());

    // At least one station must be configured
    if (!isGs1Configured && !isGs2Configured) {
      return setErrorMessage("Configure at least one Ground Station (GS1/SD1 or GS2/SD2).");
    }

    // Individual Station ID requirement when section is used
    if (isGs1Configured && !sd1StationId.trim()) {
      return setErrorMessage("Complete GS1/SD1 configuration (Station ID is required) or clear the GS1 fields.");
    }
    if (isGs2Configured && !sd2StationId.trim()) {
      return setErrorMessage("Complete GS2/SD2 configuration (Station ID is required) or clear the GS2 fields.");
    }

    setSubmitting(true);
    try {
      const payload: RegionPayload = {
        name: name.trim(),
        code: codeUpper,
        awsRegion: awsRegion.trim(),
        latitude: latNum,
        longitude: lngNum,
        sd1: isGs1Configured ? {
          stationName: `${name.trim()} SD1`,
          stationId: sd1StationId.trim().toUpperCase(),
          cloudwatchNamespace: "GroundStation/SDR",
          groundStation: "GS-001",
          receiver: "IFR-1",
          ec2SdrInstanceId: sd1SdrInstanceId.trim() || undefined,
          ec2ReceiverInstanceId: sd1ReceiverInstanceId.trim() || undefined,
        } : null,
        sd2: isGs2Configured ? {
          stationName: `${name.trim()} SD2`,
          stationId: sd2StationId.trim().toUpperCase(),
          cloudwatchNamespace: "GroundStation/SDR",
          groundStation: "GS-001",
          receiver: "IFR-1",
          ec2SdrInstanceId: sd2SdrInstanceId.trim() || undefined,
          ec2ReceiverInstanceId: sd2ReceiverInstanceId.trim() || undefined,
        } : null,
      };

      if (mode === "add") {
        await createRegion(payload);
        setSuccessMessage(`Region "${name}" created successfully.`);
      } else if (mode === "edit" && editingId) {
        await updateRegion(editingId, payload);
        setSuccessMessage(`Region "${name}" updated successfully.`);
      }

      await loadRegionsList();
      onRegionsChanged();
      setTimeout(() => {
        setMode("list");
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save region configuration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          ...PREMIUM_DIALOG_PAPER_SX,
          bgcolor: "#0B1218",
          border: `1px solid ${vars.border}`,
          maxHeight: "92vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 2.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${vars.border}`,
          bgcolor: "rgba(255,255,255,0.02)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {mode !== "list" && (
            <IconButton
              size="small"
              onClick={() => setMode("list")}
              sx={{ color: vars.textDim, "&:hover": { color: vars.accent } }}
            >
              <ArrowLeft size={18} />
            </IconButton>
          )}
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 900, color: vars.text }}>
              {mode === "list"
                ? "Ground Station Regions"
                : mode === "add"
                ? "Add Ground Station Region"
                : "Edit Ground Station Region"}
            </Typography>
            <Typography sx={{ fontSize: 11, color: vars.textDim, mt: 0.2 }}>
              {mode === "list"
                ? "Configure dynamic regional monitoring nodes and EC2 instance mappings"
                : "Select AWS region, configure EC2 SDR and Receiver instances, and configure geographic location"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {mode === "list" && (
            <Button
              size="small"
              variant="contained"
              startIcon={<Plus size={14} />}
              onClick={handleOpenAdd}
              sx={{
                ...PREMIUM_ACTION_BUTTON_SX,
                height: 32,
                px: 1.8,
                fontSize: 11,
              }}
            >
              + Add Region
            </Button>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: vars.textDim, "&:hover": { color: vars.text } }}
          >
            <X size={18} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 2.5, bgcolor: "rgba(0,0,0,0.2)" }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, fontSize: 12 }}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2, fontSize: 12 }}>
            {successMessage}
          </Alert>
        )}

        {/* 1. LIST VIEW */}
        {mode === "list" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress size={28} sx={{ color: vars.accent }} />
              </Box>
            ) : regions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6, color: vars.textDim }}>
                <Radio size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
                <Typography sx={{ fontSize: 13 }}>No Ground Station Regions configured.</Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                {regions.map((reg) => {
                  const sd1 = reg.stations?.find((s) => s.stationType === "SD1") || reg.sd1 || reg.gs1;
                  const sd2 = reg.stations?.find((s) => s.stationType === "SD2") || reg.sd2 || reg.gs2;

                  return (
                    <Box
                      key={reg.id || reg.code}
                      sx={{
                        p: 1.8,
                        borderRadius: "10px",
                        bgcolor: "rgba(255,255,255,0.03)",
                        border: `1px solid ${reg.isActive ? vars.border : "rgba(239, 68, 68, 0.2)"}`,
                        opacity: reg.isActive ? 1 : 0.65,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.05)",
                          borderColor: reg.isActive ? vars.accent : "rgba(239, 68, 68, 0.4)",
                        },
                      }}
                    >
                      {/* Top Row */}
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 900, color: vars.text }}>
                              {reg.name}
                            </Typography>
                            <Chip
                              label={reg.code}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: 10,
                                fontWeight: 800,
                                bgcolor: "rgba(56, 189, 248, 0.15)",
                                color: "#38bdf8",
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontSize: 11, color: vars.textDim, fontFamily: "monospace", mt: 0.3 }}>
                            AWS: {reg.awsRegion} | ({reg.latitude?.toFixed(2)}°, {reg.longitude?.toFixed(2)}°)
                          </Typography>
                        </Box>

                        <Chip
                          label={reg.isActive ? "ACTIVE" : "INACTIVE"}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 10,
                            fontWeight: 800,
                            bgcolor: reg.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: reg.isActive ? "#10B981" : "#EF4444",
                          }}
                        />
                      </Box>

                      {/* Station Badges */}
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, pt: 0.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#A855F7" }} />
                            <Typography sx={{ fontSize: 10.5, color: "#C084FC", fontWeight: 700 }}>
                              SD1 ({sd1?.stationId || "None"}):
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: 10, color: vars.textDim, fontFamily: "monospace" }}>
                            {sd1 ? `SDR: ${sd1.ec2SdrInstanceId || sd1.sdrInstanceId || "auto"} | RX: ${sd1.ec2ReceiverInstanceId || sd1.receiverInstanceId || "auto"}` : "Not configured"}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#EAB308" }} />
                            <Typography sx={{ fontSize: 10.5, color: "#FACC15", fontWeight: 700 }}>
                              SD2 ({sd2?.stationId || "None"}):
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: 10, color: vars.textDim, fontFamily: "monospace" }}>
                            {sd2 ? `SDR: ${sd2.ec2SdrInstanceId || sd2.sdrInstanceId || "auto"} | RX: ${sd2.ec2ReceiverInstanceId || sd2.receiverInstanceId || "auto"}` : "Not configured"}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Actions */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 0.8,
                          pt: 1,
                          borderTop: `1px solid rgba(255,255,255,0.06)`,
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          size="small"
                          startIcon={<Edit2 size={12} />}
                          onClick={() => handleOpenEdit(reg)}
                          sx={{
                            color: vars.accent,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "none",
                            p: "3px 8px",
                            minWidth: 0,
                            borderRadius: "6px",
                            border: "1px solid rgba(56, 189, 248, 0.2)",
                            bgcolor: "rgba(56, 189, 248, 0.05)",
                            "&:hover": { bgcolor: "rgba(56, 189, 248, 0.15)", borderColor: "rgba(56, 189, 248, 0.4)" },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          startIcon={reg.isActive ? <PowerOff size={12} /> : <Power size={12} />}
                          onClick={() => handleToggleActive(reg)}
                          sx={{
                            color: reg.isActive ? "#F59E0B" : "#10B981",
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "none",
                            p: "3px 8px",
                            minWidth: 0,
                            borderRadius: "6px",
                            border: `1px solid ${reg.isActive ? "rgba(245, 158, 11, 0.25)" : "rgba(16, 185, 129, 0.25)"}`,
                            bgcolor: reg.isActive ? "rgba(245, 158, 11, 0.06)" : "rgba(16, 185, 129, 0.06)",
                            "&:hover": {
                              bgcolor: reg.isActive ? "rgba(245, 158, 11, 0.18)" : "rgba(16, 185, 129, 0.18)",
                              color: reg.isActive ? "#FBBF24" : "#34D399",
                              borderColor: reg.isActive ? "rgba(245, 158, 11, 0.45)" : "rgba(16, 185, 129, 0.45)",
                            },
                          }}
                        >
                          {reg.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Trash2 size={12} />}
                          onClick={() => handlePromptDelete(reg)}
                          sx={{
                            color: "#EF4444",
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "none",
                            p: "3px 8px",
                            minWidth: 0,
                            borderRadius: "6px",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                            bgcolor: "rgba(239, 68, 68, 0.06)",
                            "&:hover": {
                              bgcolor: "rgba(239, 68, 68, 0.18)",
                              borderColor: "rgba(239, 68, 68, 0.5)",
                              color: "#F87171",
                            },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* 2. ADD / EDIT FORM VIEW */}
        {(mode === "add" || mode === "edit") && (
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.8, pt: 0.5 }}>
              
              {/* SECTION 1: REGION DETAILS */}
              <Box>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#38BDF8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    mb: 1.5,
                  }}
                >
                  <Server size={14} color="#38BDF8" /> Region Details
                </Typography>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1.3fr 1.3fr 0.8fr" }, gap: 1.5 }}>
                  {/* Region Name */}
                  <Box>
                    <Typography sx={FIELD_LABEL_SX}>
                      Region Name <span style={{ color: "#EF4444" }}>*</span>
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="e.g. Oregon"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      sx={UNIFORM_CONTROL_SX}
                      required
                    />
                  </Box>

                  {/* AWS Region Dropdown */}
                  <Box>
                    <Typography sx={FIELD_LABEL_SX}>
                      AWS Region <span style={{ color: "#EF4444" }}>*</span>
                    </Typography>
                    <Select
                      size="small"
                      value={awsRegion}
                      onChange={(e) => handleAwsRegionChange(e.target.value)}
                      displayEmpty
                      sx={UNIFORM_CONTROL_SX}
                      MenuProps={{ PaperProps: { sx: MENU_PAPER_SX } }}
                      renderValue={(selectedVal) => {
                        if (!selectedVal) {
                          return <Typography sx={{ color: "rgba(255, 255, 255, 0.35)", fontSize: "12px" }}>Select AWS Region...</Typography>;
                        }
                        const opt = awsRegionOptions.find((o) => o.id === selectedVal);
                        return (
                          <Typography sx={{ fontSize: "12px", color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {opt ? opt.name : selectedVal}
                          </Typography>
                        );
                      }}
                    >
                      <MenuItem value="" disabled>
                        <Typography sx={{ color: "rgba(255, 255, 255, 0.35)", fontSize: "12px" }}>Select AWS Region...</Typography>
                      </MenuItem>
                      {loadingAwsRegions && awsRegionOptions.length === 0 ? (
                        <MenuItem value="" disabled>
                          <CircularProgress size={14} sx={{ mr: 1 }} /> Loading regions...
                        </MenuItem>
                      ) : (
                        awsRegionOptions.map((opt) => (
                          <MenuItem key={opt.id} value={opt.id} sx={{ py: 0.8, px: 1.5, fontSize: "12px" }}>
                            {opt.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </Box>

                  {/* Region Code */}
                  <Box>
                    <Typography sx={FIELD_LABEL_SX}>
                      Region Code <span style={{ color: "#EF4444" }}>*</span>
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="e.g. OR"
                      value={code}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setCode(val);
                        if (mode === "add") {
                          if (!sd1StationId || sd1StationId.endsWith("1")) setSd1StationId(`${val}1`);
                          if (!sd2StationId || sd2StationId.endsWith("2")) setSd2StationId(`${val}2`);
                        }
                      }}
                      sx={UNIFORM_CONTROL_SX}
                      required
                    />
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, mt: 1.5 }}>
                  {/* Latitude */}
                  <Box>
                    <Typography sx={FIELD_LABEL_SX}>
                      Latitude <span style={{ color: "#EF4444" }}>*</span>
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="e.g. 45.7282"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      sx={UNIFORM_CONTROL_SX}
                      required
                      helperText="Geographic North/South degrees (-90 to +90)"
                    />
                  </Box>

                  {/* Longitude */}
                  <Box>
                    <Typography sx={FIELD_LABEL_SX}>
                      Longitude <span style={{ color: "#EF4444" }}>*</span>
                    </Typography>
                    <TextField
                      size="small"
                      placeholder="e.g. -119.5312"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      sx={UNIFORM_CONTROL_SX}
                      required
                      helperText="Geographic East/West degrees (-180 to +180)"
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

              {/* SECTION 2: GROUND STATION ACCOUNT STATUS (BACKEND-MANAGED) */}
              <Box>
                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: "8px",
                    bgcolor: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ShieldCheck size={18} color="#10B981" />
                    <Box>
                      <Typography sx={{ fontSize: "12px", color: "#10B981", fontWeight: 700 }}>
                        AWS Account Configuration: Backend-Managed ✓
                      </Typography>
                      <Typography sx={{ fontSize: "10.5px", color: "rgba(255,255,255,0.6)" }}>
                        Credentials are resolved automatically by the backend.
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="ISOLATED GS1 / GS2"
                    size="small"
                    sx={{
                      fontSize: "9.5px",
                      fontWeight: 800,
                      bgcolor: "rgba(56, 189, 248, 0.15)",
                      color: "#38bdf8",
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

              {/* SECTION 3: GS1 / SD1 INSTANCES CONFIGURATION (OPTIONAL) */}
              <Box
                sx={{
                  p: 1.8,
                  borderRadius: "10px",
                  bgcolor: "rgba(168, 85, 247, 0.03)",
                  border: "1px solid rgba(168, 85, 247, 0.15)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "#A855F7", boxShadow: "0 0 8px rgba(168,85,247,0.5)" }} />
                    <Box>
                      <Typography sx={{ fontSize: "12.5px", fontWeight: 800, color: "#C084FC" }}>
                        GS1 / SD1
                      </Typography>
                      <Typography sx={{ fontSize: "10.5px", color: "rgba(255,255,255,0.5)" }}>
                        Purple Satellite (Optional)
                      </Typography>
                    </Box>
                  </Box>
                  {loadingGs1Instances && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                      <CircularProgress size={12} sx={{ color: "#C084FC" }} />
                      <Typography sx={{ fontSize: "10px", color: "#C084FC" }}>Discovering GS1 Instances...</Typography>
                    </Box>
                  )}
                </Box>

                {gs1InstanceError && (
                  <Alert severity="warning" sx={{ mb: 1.5, fontSize: "11px", py: 0.2 }}>
                    {gs1InstanceError}
                  </Alert>
                )}

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "0.8fr 1.6fr 1.6fr" }, gap: 1.5 }}>
                  {/* Station ID */}
                  <Box>
                    <Typography sx={FIELD_LABEL_SX}>Station ID</Typography>
                    <TextField
                      size="small"
                      placeholder="e.g. OR1"
                      value={sd1StationId}
                      onChange={(e) => setSd1StationId(e.target.value.toUpperCase())}
                      sx={UNIFORM_CONTROL_SX}
                    />
                  </Box>

                  {/* SDR Instance ID Dropdown */}
                  <Box>
                    <Typography sx={FIELD_LABEL_SX}>SDR Instance ID</Typography>
                    <Select
                      size="small"
                      value={sd1SdrInstanceId}
                      onChange={(e) => setSd1SdrInstanceId(e.target.value)}
                      displayEmpty
                      sx={UNIFORM_CONTROL_SX}
                      MenuProps={{ PaperProps: { sx: MENU_PAPER_SX } }}
                      renderValue={(selectedVal) => {
                        if (!selectedVal) {
                          return <Typography sx={{ color: "rgba(255, 255, 255, 0.35)", fontSize: "12px" }}>Select SDR Instance...</Typography>;
                        }
                        return (
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "#FFFFFF",
                              fontFamily: "monospace",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {selectedVal}
                          </Typography>
                        );
                      }}
                    >
                      <MenuItem value="">
                        <Typography sx={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "12px", fontStyle: "italic" }}>
                          -- None (Leave Unconfigured) --
                        </Typography>
                      </MenuItem>
                      {gs1Instances.map((inst) => (
                        <MenuItem key={inst.instanceId} value={inst.instanceId} sx={{ py: 0.8, px: 1.5, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 1.5 }}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {inst.name}
                              </Typography>
                              <Typography sx={{ fontSize: "10.5px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                                {inst.instanceId} • {inst.instanceType}
                              </Typography>
                            </Box>
                            <Chip
                              label={inst.state}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "9.5px",
                                fontWeight: 800,
                                bgcolor: inst.state === "RUNNING" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                color: inst.state === "RUNNING" ? "#10B981" : "#EF4444",
                              }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                      {sd1SdrInstanceId && !gs1Instances.some((i) => i.instanceId === sd1SdrInstanceId) && (
                        <MenuItem value={sd1SdrInstanceId}>
                          <Typography sx={{ fontSize: "12px", color: "#C084FC" }}>{sd1SdrInstanceId} (Configured)</Typography>
                        </MenuItem>
                      )}
                    </Select>
                  </Box>

                  {/* Receiver Instance ID Dropdown */}
                  <Box>
                    <Typography sx={FIELD_LABEL_SX}>Receiver Instance ID</Typography>
                    <Select
                      size="small"
                      value={sd1ReceiverInstanceId}
                      onChange={(e) => setSd1ReceiverInstanceId(e.target.value)}
                      displayEmpty
                      sx={UNIFORM_CONTROL_SX}
                      MenuProps={{ PaperProps: { sx: MENU_PAPER_SX } }}
                      renderValue={(selectedVal) => {
                        if (!selectedVal) {
                          return <Typography sx={{ color: "rgba(255, 255, 255, 0.35)", fontSize: "12px" }}>Select Receiver Instance...</Typography>;
                        }
                        return (
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "#FFFFFF",
                              fontFamily: "monospace",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {selectedVal}
                          </Typography>
                        );
                      }}
                    >
                      <MenuItem value="">
                        <Typography sx={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "12px", fontStyle: "italic" }}>
                          -- None (Leave Unconfigured) --
                        </Typography>
                      </MenuItem>
                      {gs1Instances.map((inst) => (
                        <MenuItem key={inst.instanceId} value={inst.instanceId} sx={{ py: 0.8, px: 1.5, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 1.5 }}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {inst.name}
                              </Typography>
                              <Typography sx={{ fontSize: "10.5px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                                {inst.instanceId} • {inst.instanceType}
                              </Typography>
                            </Box>
                            <Chip
                              label={inst.state}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "9.5px",
                                fontWeight: 800,
                                bgcolor: inst.state === "RUNNING" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                color: inst.state === "RUNNING" ? "#10B981" : "#EF4444",
                              }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                      {sd1ReceiverInstanceId && !gs1Instances.some((i) => i.instanceId === sd1ReceiverInstanceId) && (
                        <MenuItem value={sd1ReceiverInstanceId}>
                          <Typography sx={{ fontSize: "12px", color: "#C084FC" }}>{sd1ReceiverInstanceId} (Configured)</Typography>
                        </MenuItem>
                      )}
                    </Select>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

              {/* SECTION 4: GS2 / SD2 INSTANCES CONFIGURATION (OPTIONAL) */}
              <Box
                sx={{
                  p: 1.8,
                  borderRadius: "10px",
                  bgcolor: "rgba(234, 179, 8, 0.03)",
                  border: "1px solid rgba(234, 179, 8, 0.15)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: "#EAB308", boxShadow: "0 0 8px rgba(234,179,8,0.5)" }} />
                    <Box>
                      <Typography sx={{ fontSize: "12.5px", fontWeight: 800, color: "#FACC15" }}>
                        GS2 / SD2
                      </Typography>
                      <Typography sx={{ fontSize: "10.5px", color: "rgba(255,255,255,0.5)" }}>
                        Yellow Satellite (Optional)
                      </Typography>
                    </Box>
                  </Box>
                  {loadingGs2Instances && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                      <CircularProgress size={12} sx={{ color: "#FACC15" }} />
                      <Typography sx={{ fontSize: "10px", color: "#FACC15" }}>Discovering GS2 Instances...</Typography>
                    </Box>
                  )}
                </Box>

                {gs2InstanceError && (
                  <Alert severity="warning" sx={{ mb: 1.5, fontSize: "11px", py: 0.2 }}>
                    {gs2InstanceError}
                  </Alert>
                )}

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "0.8fr 1.6fr 1.6fr" }, gap: 1.5 }}>
                  {/* Station ID */}
                  <Box>
                    <Typography sx={FIELD_LABEL_SX}>Station ID</Typography>
                    <TextField
                      size="small"
                      placeholder="e.g. OR2"
                      value={sd2StationId}
                      onChange={(e) => setSd2StationId(e.target.value.toUpperCase())}
                      sx={UNIFORM_CONTROL_SX}
                    />
                  </Box>

                  {/* SDR Instance ID Dropdown */}
                  <Box>
                    <Typography sx={FIELD_LABEL_SX}>SDR Instance ID</Typography>
                    <Select
                      size="small"
                      value={sd2SdrInstanceId}
                      onChange={(e) => setSd2SdrInstanceId(e.target.value)}
                      displayEmpty
                      sx={UNIFORM_CONTROL_SX}
                      MenuProps={{ PaperProps: { sx: MENU_PAPER_SX } }}
                      renderValue={(selectedVal) => {
                        if (!selectedVal) {
                          return <Typography sx={{ color: "rgba(255, 255, 255, 0.35)", fontSize: "12px" }}>Select SDR Instance...</Typography>;
                        }
                        return (
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "#FFFFFF",
                              fontFamily: "monospace",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {selectedVal}
                          </Typography>
                        );
                      }}
                    >
                      <MenuItem value="">
                        <Typography sx={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "12px", fontStyle: "italic" }}>
                          -- None (Leave Unconfigured) --
                        </Typography>
                      </MenuItem>
                      {gs2Instances.map((inst) => (
                        <MenuItem key={inst.instanceId} value={inst.instanceId} sx={{ py: 0.8, px: 1.5, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 1.5 }}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {inst.name}
                              </Typography>
                              <Typography sx={{ fontSize: "10.5px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                                {inst.instanceId} • {inst.instanceType}
                              </Typography>
                            </Box>
                            <Chip
                              label={inst.state}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "9.5px",
                                fontWeight: 800,
                                bgcolor: inst.state === "RUNNING" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                color: inst.state === "RUNNING" ? "#10B981" : "#EF4444",
                              }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                      {sd2SdrInstanceId && !gs2Instances.some((i) => i.instanceId === sd2SdrInstanceId) && (
                        <MenuItem value={sd2SdrInstanceId}>
                          <Typography sx={{ fontSize: "12px", color: "#FACC15" }}>{sd2SdrInstanceId} (Configured)</Typography>
                        </MenuItem>
                      )}
                    </Select>
                  </Box>

                  {/* Receiver Instance ID Dropdown */}
                  <Box>
                    <Typography sx={FIELD_LABEL_SX}>Receiver Instance ID</Typography>
                    <Select
                      size="small"
                      value={sd2ReceiverInstanceId}
                      onChange={(e) => setSd2ReceiverInstanceId(e.target.value)}
                      displayEmpty
                      sx={UNIFORM_CONTROL_SX}
                      MenuProps={{ PaperProps: { sx: MENU_PAPER_SX } }}
                      renderValue={(selectedVal) => {
                        if (!selectedVal) {
                          return <Typography sx={{ color: "rgba(255, 255, 255, 0.35)", fontSize: "12px" }}>Select Receiver Instance...</Typography>;
                        }
                        return (
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "#FFFFFF",
                              fontFamily: "monospace",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {selectedVal}
                          </Typography>
                        );
                      }}
                    >
                      <MenuItem value="">
                        <Typography sx={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "12px", fontStyle: "italic" }}>
                          -- None (Leave Unconfigured) --
                        </Typography>
                      </MenuItem>
                      {gs2Instances.map((inst) => (
                        <MenuItem key={inst.instanceId} value={inst.instanceId} sx={{ py: 0.8, px: 1.5, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 1.5 }}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {inst.name}
                              </Typography>
                              <Typography sx={{ fontSize: "10.5px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                                {inst.instanceId} • {inst.instanceType}
                              </Typography>
                            </Box>
                            <Chip
                              label={inst.state}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "9.5px",
                                fontWeight: 800,
                                bgcolor: inst.state === "RUNNING" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                color: inst.state === "RUNNING" ? "#10B981" : "#EF4444",
                              }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                      {sd2ReceiverInstanceId && !gs2Instances.some((i) => i.instanceId === sd2ReceiverInstanceId) && (
                        <MenuItem value={sd2ReceiverInstanceId}>
                          <Typography sx={{ fontSize: "12px", color: "#FACC15" }}>{sd2ReceiverInstanceId} (Configured)</Typography>
                        </MenuItem>
                      )}
                    </Select>
                  </Box>
                </Box>
              </Box>

            </Box>

            {/* Actions */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 1.5,
                mt: 3,
                pt: 2,
                borderTop: `1px solid ${vars.border}`,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setMode("list")}
                sx={{
                  color: vars.textDim,
                  borderColor: "rgba(255,255,255,0.15)",
                  textTransform: "none",
                  fontSize: 12,
                  "&:hover": { borderColor: vars.text, color: vars.text },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  ...PREMIUM_ACTION_BUTTON_SX,
                  fontSize: 12,
                  height: 36,
                }}
              >
                {submitting ? (
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                ) : mode === "add" ? (
                  "Save Region"
                ) : (
                  "Update Region"
                )}
              </Button>
            </Box>
          </form>
        )}
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <Dialog
      open={Boolean(deletingRegion)}
      onClose={() => !deleteLoading && setDeletingRegion(null)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          ...PREMIUM_DIALOG_PAPER_SX,
          bgcolor: "#0C131A",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          borderRadius: "16px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2.5,
          pb: 1.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            bgcolor: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#EF4444",
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={22} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>
            Delete Ground Station Region?
          </Typography>
          <Typography sx={{ fontSize: 12, color: vars.textDim }}>
            This action permanently removes the region configuration.
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, py: 1.5 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: "10px",
            bgcolor: "rgba(255, 255, 255, 0.03)",
            border: `1px solid ${vars.border}`,
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: 12, color: vars.textDim, mb: 0.5 }}>
            Target Region:
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
            {deletingRegion?.name}{" "}
            <span style={{ fontSize: 12, color: vars.accent, fontWeight: 600 }}>
              ({deletingRegion?.code || deletingRegion?.awsRegion})
            </span>
          </Typography>
          <Typography sx={{ fontSize: 11, color: vars.textDim, mt: 0.5 }}>
            AWS Region: {deletingRegion?.awsRegion}
          </Typography>
        </Box>

        <Alert
          severity="warning"
          sx={{
            bgcolor: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            color: "#FDE68A",
            fontSize: 11.5,
            "& .MuiAlert-icon": { color: "#F59E0B" },
          }}
        >
          Deleting this region removes its GS1/SD1 and GS2/SD2 configuration from the portal. Active AWS EC2 instances will NOT be terminated.
        </Alert>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          pt: 1.5,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          borderTop: `1px solid ${vars.border}`,
        }}
      >
        <Button
          variant="outlined"
          disabled={deleteLoading}
          onClick={() => setDeletingRegion(null)}
          sx={{
            color: vars.textDim,
            borderColor: "rgba(255, 255, 255, 0.15)",
            textTransform: "none",
            fontSize: 12,
            "&:hover": { borderColor: vars.text, color: vars.text },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={deleteLoading}
          onClick={handleConfirmDelete}
          sx={{
            bgcolor: "#DC2626",
            color: "#fff",
            textTransform: "none",
            fontWeight: 700,
            fontSize: 12,
            px: 2.5,
            py: 0.8,
            borderRadius: "8px",
            "&:hover": {
              bgcolor: "#B91C1C",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
            },
            "&.Mui-disabled": {
              bgcolor: "rgba(220, 38, 38, 0.4)",
              color: "rgba(255, 255, 255, 0.6)",
            },
          }}
        >
          {deleteLoading ? (
            <CircularProgress size={16} sx={{ color: "#fff" }} />
          ) : (
            "Delete Region"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  </>
  );
};
