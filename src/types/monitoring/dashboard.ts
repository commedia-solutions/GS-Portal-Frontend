export interface DashboardSummary {
  totalStations: number;
  onlineStations: number;
  activePasses: number;
  rxLocked: number;
  txActive: number;
  alerts: number;
}

export interface ActivePass {
  id: string;
  stationId: string;
  stationName: string;
  satellite: string;
  date?: string;
  operations?: string;
  status: "ACTIVE" | "COMPLETED" | "SCHEDULED" | "OFFLINE";
  aos: string;
  los: string;
  duration: string;
  ebNo: number | null;
  ifLevel: number | null;
  rxStatus: "LOCKED" | "SEARCHING" | "OFF" | string;
  txStatus: "ACTIVE" | "OFF" | string;
  receiverEc2?: string;
  sdrEc2?: string;
  connection?: string;
  lastUpdate?: string;
}

export interface Alert {
  id: string;
  severity: "success" | "warning" | "critical" | "info" | "offline";
  stationName: string;
  message: string;
  timestamp: string;
}

export interface GroundStation {
  id: string;
  station: string;
  region: string;
  status: string;
  receiverEc2?: string;
  sdrEc2?: string;
  operations?: string;
  rx: string;
  tx: string;
  ebNo?: number | null;
  ifLevel?: number | null;
  lastUpdate: string;
}

export interface InfrastructureNode {
  id: string;
  name: string;
  status: string;
  type: string;
}

export interface UpcomingOperation {
  id: string;
  station: string;
  satellite: string;
  aos: string;
  duration: string;
}

export interface MetricDataPoint {
  [key: string]: any;
  timestamp: string;
}

export interface RegionInfrastructure {
  rx: string;
  tx: string;
  vpc: string;
  directConnect: string;
  mpls: string;
  mission: string;
}

export interface RegionData {
  id: string;
  name: string;
  city: string;
  infrastructure: RegionInfrastructure;
  infrastructureNodes: InfrastructureNode[];
  stations: GroundStation[];
  activePasses: ActivePass[];
  alerts: Alert[];
  upcomingOperations: UpcomingOperation[];
  passMetrics: MetricDataPoint[];
}

export interface DashboardData {
  regions: RegionData[];
}
