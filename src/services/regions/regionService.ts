// src/services/regions/regionService.ts
import { api } from "../../api/http";

export interface AwsRegionOption {
  id: string;
  name: string;
}

export interface AwsInstanceOption {
  instanceId: string;
  instanceName: string;
  name: string;
  state: string;
  instanceType: string;
  privateIp?: string | null;
  publicIp?: string | null;
  availabilityZone?: string | null;
  label: string;
}

export interface StationConfigPayload {
  id?: number;
  stationType?: "SD1" | "SD2";
  stationName?: string;
  stationId?: string;
  cloudwatchNamespace?: string;
  groundStation?: string;
  receiver?: string;
  ec2SdrInstanceId?: string;
  ec2ReceiverInstanceId?: string;
  sdrInstanceId?: string;
  receiverInstanceId?: string;
}

export interface RegionPayload {
  id?: number;
  name: string;
  code: string;
  awsRegion: string;
  latitude: number;
  longitude: number;
  accessKey?: string;
  secretKey?: string;
  hasCredentials?: boolean;
  isActive?: boolean;
  sd1?: StationConfigPayload | null;
  sd2?: StationConfigPayload | null;
  gs1?: StationConfigPayload | null;
  gs2?: StationConfigPayload | null;
  stations?: StationConfigPayload[];
  createdAt?: string;
  updatedAt?: string;
}

export const getRegions = async (includeInactive = false): Promise<RegionPayload[]> => {
  try {
    const res = await api.get<{ success: boolean; data: RegionPayload[] }>("/api/regions", {
      params: { includeInactive: includeInactive ? "true" : "false" },
    });
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch regions:", err);
    return [];
  }
};

export const getRegionById = async (id: number): Promise<RegionPayload | null> => {
  try {
    const res = await api.get<{ success: boolean; data: RegionPayload }>(`/api/regions/${id}`);
    return res.data || null;
  } catch (err) {
    console.error(`Failed to fetch region ${id}:`, err);
    return null;
  }
};

export const createRegion = async (payload: RegionPayload): Promise<RegionPayload> => {
  const res = await api.post<{ success: boolean; data: RegionPayload }>("/api/regions", payload);
  return res.data;
};

export const updateRegion = async (id: number, payload: Partial<RegionPayload>): Promise<RegionPayload> => {
  const res = await api.put<{ success: boolean; data: RegionPayload }>(`/api/regions/${id}`, payload);
  return res.data;
};

export const deleteRegion = async (id: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await api.del<{ success: boolean; message?: string }>(`/api/regions/${id}`);
    return res;
  } catch (err: any) {
    const msg = err?.response?.data?.error || err.message || "Failed to delete region.";
    throw new Error(msg);
  }
};

export const getAwsRegions = async (stationType: "GS1" | "GS2" = "GS1"): Promise<AwsRegionOption[]> => {
  try {
    const res = await api.get<{ success: boolean; data: AwsRegionOption[] }>("/api/regions/aws/regions", {
      params: { stationType },
    });
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch AWS regions:", err);
    return [];
  }
};

export const getAwsInstances = async (
  stationType: "GS1" | "GS2",
  awsRegion: string
): Promise<AwsInstanceOption[]> => {
  try {
    const res = await api.get<{ success: boolean; data: AwsInstanceOption[]; error?: string }>("/api/regions/aws/instances", {
      params: { stationType, awsRegion },
    });
    if (res && res.success === false) {
      throw new Error(res.error || `Unable to discover ${stationType} instances for this AWS region.`);
    }
    return res.data || [];
  } catch (err: any) {
    const msg = err?.response?.data?.error || err.message || `Unable to discover ${stationType} instances for this AWS region.`;
    console.error(`Failed to fetch AWS instances for ${stationType} in ${awsRegion}:`, msg);
    throw new Error(msg);
  }
};

export const testAwsConnection = async (payload: {
  awsRegion?: string;
  stationType?: string;
  accessKey?: string;
  secretKey?: string;
  regionId?: number;
}): Promise<{ success: boolean; message: string; account?: string; arn?: string }> => {
  const res = await api.post<{ success: boolean; message: string; account?: string; arn?: string }>(
    "/api/regions/test-connection",
    payload
  );
  return res;
};
