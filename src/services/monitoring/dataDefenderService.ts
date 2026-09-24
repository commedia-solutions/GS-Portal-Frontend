import toast from "react-hot-toast";
import { api } from "../../api/http";
import type { ActivePass } from "../../types/monitoring/dashboard";
import type { GroundStation } from "../../types/topologyTypes";

export interface DataDefenderTarget {
  groundStation: string;
  stationId: string;
  passType: "SD1" | "SD2";
  accountType: "GS1" | "GS2";
  awsRegion: string;
  receiverInstanceId: string | null;
  receiverStatus: string;
  sdrInstanceId?: string | null;
  command: string;
  isValid: boolean;
  errorMessage?: string;
}

export interface DataDefenderSessionData {
  localPort: number;
  remotePort: number;
  receiverInstanceId: string;
  region: string;
  accountType: string;
  groundStation: string;
  stationId: string;
  startedAt: string;
  status: string;
  url: string;
}

export interface DataDefenderStatusResponse {
  success: boolean;
  connected: boolean;
  data?: DataDefenderSessionData | null;
  error?: string;
}

export interface DataDefenderConnectResponse {
  success: boolean;
  status: string;
  message?: string;
  data?: DataDefenderSessionData;
  error?: string;
}

// Standard fallback mapping for default ground stations if offline / unseeded
const STANDARD_STATION_DEFAULTS: Record<
  string,
  { groundStation: string; awsRegion: string; receiver: string; sdr: string }
> = {
  CP1: { groundStation: "Cape Town", awsRegion: "af-south-1", receiver: "i-09e18b7e39b38ba47", sdr: "i-04dca7b61a57c74db" },
  CP2: { groundStation: "Cape Town", awsRegion: "af-south-1", receiver: "i-01355c3be5b62d5d6", sdr: "i-0f76b7aed11916f7b" },
  DU1: { groundStation: "Dublin", awsRegion: "eu-west-1", receiver: "i-0a4878491efbc72f9", sdr: "i-0acbbc36feaa58978" },
  DU2: { groundStation: "Dublin", awsRegion: "eu-west-1", receiver: "i-01c4a7f62f86aee19", sdr: "i-065b7f39185b032f8" },
  PA1: { groundStation: "Punta Arenas", awsRegion: "sa-east-1", receiver: "i-08ea5a3259f8acb0b", sdr: "i-0695e04fdef95e365" },
  PA2: { groundStation: "Punta Arenas", awsRegion: "sa-east-1", receiver: "i-0dbc2d128cadb8252", sdr: "i-069a1b0858fd20122" },
  DB1: { groundStation: "Dubbo", awsRegion: "ap-southeast-2", receiver: "i-0aadacb9a0ce87849", sdr: "i-0bd5179c86257d5ec" },
  DB2: { groundStation: "Dubbo", awsRegion: "ap-southeast-2", receiver: "i-0bc0e9084846e5e5a", sdr: "i-0eaf782bb7e94cd11" },
};

/**
 * Resolves the dynamic DataDefender connection target information for any active pass or ground station.
 */
export const resolveDataDefenderTarget = (
  passOrStation?: ActivePass | GroundStation | any
): DataDefenderTarget => {
  if (!passOrStation) {
    return {
      groundStation: "Unknown",
      stationId: "UNKNOWN",
      passType: "SD1",
      accountType: "GS1",
      awsRegion: "",
      receiverInstanceId: null,
      receiverStatus: "UNKNOWN",
      command: "",
      isValid: false,
      errorMessage: "No active pass or ground station selected.",
    };
  }

  const rawStationId = String(passOrStation.stationId || passOrStation.id || "").trim().toUpperCase();
  const isSD2 =
    rawStationId.includes("2") ||
    passOrStation.stationType === "SD2" ||
    passOrStation.passType === "SD2";

  const passType: "SD1" | "SD2" = isSD2 ? "SD2" : "SD1";
  const accountType: "GS1" | "GS2" = isSD2 ? "GS2" : "GS1";

  const stdDefault = STANDARD_STATION_DEFAULTS[rawStationId] || {};

  // Ground Station Name
  let groundStation =
    passOrStation.groundStation ||
    (passOrStation.stationName || passOrStation.name || "").split("(")[0]?.trim() ||
    stdDefault.groundStation ||
    "Ground Station";

  if (!groundStation || groundStation === "Ground Station") {
    if (rawStationId.startsWith("CP")) groundStation = "Cape Town";
    else if (rawStationId.startsWith("DU")) groundStation = "Dublin";
    else if (rawStationId.startsWith("PA")) groundStation = "Punta Arenas";
    else if (rawStationId.startsWith("DB")) groundStation = "Dubbo";
    else if (rawStationId.startsWith("OR")) groundStation = "Oregon";
  }

  // AWS Region
  let awsRegion =
    passOrStation.awsRegion ||
    passOrStation.region ||
    stdDefault.awsRegion ||
    "";

  if (!awsRegion) {
    if (rawStationId.startsWith("CP")) awsRegion = "af-south-1";
    else if (rawStationId.startsWith("DU")) awsRegion = "eu-west-1";
    else if (rawStationId.startsWith("PA")) awsRegion = "sa-east-1";
    else if (rawStationId.startsWith("DB")) awsRegion = "ap-southeast-2";
    else if (rawStationId.startsWith("OR")) awsRegion = "us-west-2";
  }

  // Receiver EC2 Instance ID (Source of truth: pass/station payload > fallback)
  const receiverInstanceId =
    passOrStation.receiverInstanceId ||
    passOrStation.infrastructure?.receiverInstanceId ||
    passOrStation.ec2ReceiverInstanceId ||
    stdDefault.receiver ||
    null;

  const sdrInstanceId =
    passOrStation.sdrInstanceId ||
    passOrStation.infrastructure?.sdrInstanceId ||
    passOrStation.ec2SdrInstanceId ||
    stdDefault.sdr ||
    null;

  // Receiver Status
  const receiverStatus =
    passOrStation.receiverEc2 ||
    passOrStation.infrastructure?.receiverEc2 ||
    (passOrStation.status === "ONLINE" || passOrStation.status === "ACTIVE" ? "RUNNING" : "UNKNOWN");

  // Build the SSM command
  const command = buildDataDefenderCommand(receiverInstanceId);

  // Validation
  let isValid = true;
  let errorMessage: string | undefined;

  if (!receiverInstanceId) {
    isValid = false;
    errorMessage = "Receiver EC2 is not configured for this ground station.";
  } else if (receiverStatus === "STOPPED" || receiverStatus === "OFFLINE") {
    errorMessage = "Receiver EC2 is stopped. Start the instance in AWS before initiating SSM session.";
  } else if (!awsRegion) {
    isValid = false;
    errorMessage = "AWS Region is not configured for this ground station.";
  }

  return {
    groundStation,
    stationId: rawStationId || (isSD2 ? "SD2" : "SD1"),
    passType,
    accountType,
    awsRegion,
    receiverInstanceId,
    receiverStatus,
    sdrInstanceId,
    command,
    isValid,
    errorMessage,
  };
};

/**
 * Builds the exact AWS SSM port-forwarding start-session command targeting the Receiver EC2 instance.
 */
export const buildDataDefenderCommand = (receiverInstanceId?: string | null): string => {
  if (!receiverInstanceId) return "";
  return `aws ssm start-session --target ${receiverInstanceId} --document-name AWS-StartPortForwardingSession --parameters "localPortNumber=8080,portNumber=80"`;
};

/**
 * Returns the configured DataDefender base URL from environment variables,
 * falling back to local development URL if running in development mode.
 */
export const getDataDefenderUrl = (_pass?: ActivePass | any): string => {
  const envUrl = (import.meta as any).env?.VITE_DATA_DEFENDER_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
    return envUrl.trim();
  }
  return "http://localhost:8080";
};

/**
 * Starts the local AWS SSM port-forwarding session via the backend API.
 */
export const connectDataDefenderBackend = async (
  target: DataDefenderTarget,
  localPort: number = 8080,
  remotePort: number = 80
): Promise<DataDefenderConnectResponse> => {
  try {
    const res = await api.post<DataDefenderConnectResponse>("/api/datadefender/connect", {
      receiverInstanceId: target.receiverInstanceId,
      awsRegion: target.awsRegion,
      accountType: target.accountType,
      stationId: target.stationId,
      groundStation: target.groundStation,
      localPort,
      remotePort,
    });
    return res;
  } catch (err: any) {
    return {
      success: false,
      status: "error",
      error: err.message || "Failed to establish SSM session",
    };
  }
};

/**
 * Terminates the active local AWS SSM port-forwarding session via the backend API.
 */
export const disconnectDataDefenderBackend = async (
  localPort: number = 8080
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const res = await api.post<{ success: boolean; message?: string }>("/api/datadefender/disconnect", {
      port: localPort,
    });
    return res;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to disconnect SSM session",
    };
  }
};

/**
 * Checks the status of the local AWS SSM port-forwarding session.
 */
export const getDataDefenderBackendStatus = async (
  localPort: number = 8080
): Promise<DataDefenderStatusResponse> => {
  try {
    const res = await api.get<DataDefenderStatusResponse>(`/api/datadefender/status?port=${localPort}`);
    return res;
  } catch (err: any) {
    return {
      success: false,
      connected: false,
      error: err.message || "Failed to get SSM status",
    };
  }
};

/**
 * Opens the DataDefender monitoring application in a new browser tab.
 * Validates that the URL is configured and applies secure attributes (noopener, noreferrer).
 */
export const openDataDefender = (urlOrPass?: string | ActivePass | any): void => {
  const url = typeof urlOrPass === "string" ? urlOrPass : getDataDefenderUrl(urlOrPass);

  if (!url) {
    toast.error("DataDefender URL is not configured.");
    return;
  }

  try {
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (err) {
    console.error("Failed to open DataDefender:", err);
    toast.error("Unable to open DataDefender in a new tab.");
  }
};

