// src/types/monitoring/infrastructure.ts

export type InfrastructureStatus = 
  | "AVAILABLE" 
  | "NOT_AVAILABLE" 
  | "DEGRADED" 
  | "NOT_CONFIGURED" 
  | "NOT_MANAGED" 
  | "UNKNOWN";

export type AccountType = "GS1" | "GS2" | "NETWORK" | "EXTERNAL";

export interface VpcDetails {
  vpcId?: string;
  vpcName?: string;
  awsState?: string;
  region?: string;
  cidr?: string;
  subnetCount?: number;
  routeTableCount?: number;
  networkAclCount?: number;
  isDefault?: string;
  dhcpOptionsId?: string;
  ownerId?: string;
  status?: string;
  message?: string;
  lastUpdated?: string;
}

export interface TgwAttachment {
  id: string;
  type: string;
  state: string;
  resourceId: string;
  associationState?: string;
}

export interface TransitGatewayDetails {
  transitGatewayId?: string;
  transitGatewayName?: string;
  state?: string;
  region?: string;
  amazonSideAsn?: string;
  autoAcceptSharedAttachments?: string;
  defaultRouteTableAssociation?: string;
  attachmentsCount?: number;
  attachments?: TgwAttachment[];
  status?: string;
  message?: string;
  lastUpdated?: string;
}

export interface VpnTunnel {
  status: string;
  outsideIp: string;
  insideCidr: string;
  lastStatusChange: string;
  statusMessage?: string;
}

export interface VpnProviderDetails {
  provider: "TATA" | "AIRTEL";
  status: InfrastructureStatus;
  tunnel1: string;
  tunnel2: string;
  vpnConnectionId?: string;
  tunnels: VpnTunnel[];
}

export interface PrivateLinkDetails {
  overallStatus?: string;
  tataVpnId?: string;
  airtelVpnId?: string;
  region?: string;
  status?: string;
  message?: string;
  lastUpdated?: string;
}

export interface DxConnection {
  connectionId: string;
  connectionName: string;
  type: string;
  state: string;
  portSpeed: string;
  region?: string;
  location?: string;
}

export interface BgpPeer {
  bgpPeerId: string;
  asn: string;
  bgpStatus: string;
  bgpPeerState: string;
  customerAddress: string;
  amazonAddress: string;
}

export interface VirtualInterface {
  virtualInterfaceId: string;
  virtualInterfaceName: string;
  virtualInterfaceType: string;
  state: string;
  directConnectGatewayId: string;
  connectionId: string;
  region: string;
  bgpStatus: string;
  bgpPeers: BgpPeer[];
}

export interface DirectConnectDetails {
  overallStatus?: string;
  connectionsCount?: number;
  vifCount?: number;
  region?: string;
  status?: string;
  message?: string;
  lastUpdated?: string;
}

export interface DirectConnectGateway {
  directConnectGatewayId: string;
  directConnectGatewayName: string;
  amazonSideAsn?: string;
  state: string;
  tgwAssociation: string;
  tgwId?: string;
  vifAssociation: string;
}

export interface HostedDxDetails {
  overallStatus?: string;
  gatewaysCount?: number;
  gateways?: DirectConnectGateway[];
  region?: string;
  status?: string;
  message?: string;
  lastUpdated?: string;
}

export interface NotManagedDetails {
  status: "NOT_MANAGED";
  name: string;
  parameter: string;
  description: string;
  lastUpdated?: string;
}

export interface InfrastructureNodePayload {
  id: string;
  name: string;
  status: InfrastructureStatus;
  type: string;
  account: AccountType;
  details?: any;
  tata?: VpnProviderDetails;
  airtel?: VpnProviderDetails;
  connections?: DxConnection[];
  virtualInterfaces?: VirtualInterface[];
  gateways?: DirectConnectGateway[];
}

export interface AggregatedInfrastructureData {
  station: string;
  accountType: "GS1" | "GS2";
  accountConfigured: boolean;
  accountStatusMessage: string;
  region: string;
  vpc: {
    status: InfrastructureStatus;
    accountType: string;
    region: string;
    awsState?: string;
    details: VpcDetails;
  };
  transitGateway: {
    status: InfrastructureStatus;
    accountType: string;
    region: string;
    awsState?: string;
    details: TransitGatewayDetails;
  };
  privateLink: {
    status: InfrastructureStatus;
    accountType: string;
    region: string;
    tata: VpnProviderDetails;
    airtel: VpnProviderDetails;
    details: PrivateLinkDetails;
  };
  directConnect: {
    status: InfrastructureStatus;
    accountType: string;
    region: string;
    connections: DxConnection[];
    virtualInterfaces: VirtualInterface[];
    details: DirectConnectDetails;
  };
  hostedDx: {
    status: InfrastructureStatus;
    accountType: string;
    region: string;
    gateways: DirectConnectGateway[];
    details: HostedDxDetails;
  };
  ispNetwork: {
    status: "NOT_MANAGED";
    parameter: string;
    details: NotManagedDetails;
  };
  missionNetwork: {
    status: "NOT_MANAGED";
    parameter: string;
    details: NotManagedDetails;
  };
  nodes: InfrastructureNodePayload[];
  updatedAt: string;
}
