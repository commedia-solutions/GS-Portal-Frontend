export interface InfrastructureNode {
  receiverEc2: string;
  sdrEc2: string;
  rxStatus: string;
  txStatus: string;
}

export interface CurrentPass {
  satellite: string;
  date?: string;
  operations?: string;
  aos: string;
  los: string;
  duration: string;
  status: string;
}

export interface Metrics {
  ebNo: number | null;
  ifLevel: number | null;
  rxLock: string;
  txState: string;
}

export interface SystemStatus {
  connection: string;
  health: string;
}

export interface GroundStation {
  type: "station";
  id: string;
  name: string;
  awsRegion: string; // The region code it links to, e.g. "me-south-1"
  latitude: number;
  longitude: number;
  status: "ONLINE" | "ACTIVE" | "OFFLINE" | "WARNING" | "SCHEDULED" | "NO PASS" | "UNKNOWN";
  lastUpdate: string;
  infrastructure: InfrastructureNode;
  currentPass?: CurrentPass;
  metrics?: Metrics;
  system: SystemStatus;
}

export interface AwsRegion {
  type: "region";
  id: string;
  name: string; // e.g. "Africa (Cape Town)"
  regionCode: string; // e.g. "me-south-1"
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  availabilityZones: number;
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  linkedStations: string[]; // Array of GS IDs
}

export interface AwsHub {
  type: "AWS_HUB";
  id: string;
  name: string; // e.g. "AWS CENTRAL HUB"
  locationName: string; // e.g. "Mumbai, India"
  city: string;
  country: string;
  regionCode: string; // e.g. "ap-south-1"
  latitude: number;
  longitude: number;
  status: "ONLINE" | "HEALTHY";
  connectedStations?: string[];
  connectedRegions?: string[];
}

export type TopologyEntity = GroundStation | AwsRegion | AwsHub;
