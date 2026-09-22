import type { DashboardData, RegionData, GroundStation, MetricDataPoint, InfrastructureNode, ActivePass, Alert, UpcomingOperation } from "../../types/monitoring/dashboard";

import { apiFetch } from "../../api/http";

export const getMonitoringDashboard = async (timeRange: string = "15m", stat: string = "Average"): Promise<DashboardData> => {
  try {
    const json = await apiFetch<any>(`/api/monitoring/ground-stations/dashboard?timeRange=${timeRange}&stat=${stat}&_t=${Date.now()}`);
    if (json && json.success) {
      return json.dashboard;
    }
    // Return empty state rather than mock data if the API fails or isn't ready
    return { regions: [] };
  } catch (err) {
    console.error("Failed to fetch real-time monitoring data:", err);
    return { regions: [] };
  }
};

