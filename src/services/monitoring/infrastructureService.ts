// src/services/monitoring/infrastructureService.ts
import { apiFetch } from "../../api/http";
import type { AggregatedInfrastructureData } from "../../types/monitoring/infrastructure";

export const getInfrastructureStatus = async (
  station: string = "CP1",
  region?: string,
  signal?: AbortSignal
): Promise<AggregatedInfrastructureData | null> => {
  try {
    const regionParam = region ? `&region=${encodeURIComponent(region)}` : "";
    const endpoint = `/api/infrastructure/status?station=${encodeURIComponent(station)}${regionParam}&_t=${Date.now()}`;
    
    const response = await apiFetch<{ success: boolean; data: AggregatedInfrastructureData }>(endpoint, {
      signal,
    });
    if (response && response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error: any) {
    if (error?.name === "AbortError" || error?.message?.includes("aborted")) {
      return null;
    }
    console.error(`[InfrastructureService] Error fetching status for station [${station}]:`, error);
    return null;
  }
};
