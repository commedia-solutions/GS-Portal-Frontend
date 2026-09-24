// src/components/monitoring/InfrastructureDetailsModal.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import { vars } from "../../ui/toast/themeBridge";
import { PREMIUM_CARD_SX, PREMIUM_ACTION_BUTTON_SX } from "../../ui/styles";
import type {
  InfrastructureNodePayload,
  InfrastructureStatus,
  AggregatedInfrastructureData,
} from "../../types/monitoring/infrastructure";
import CloudIcon from "@mui/icons-material/Cloud";
import RouterIcon from "@mui/icons-material/Router";
import PrivateConnectivityIcon from "@mui/icons-material/VpnKey";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DnsIcon from "@mui/icons-material/Dns";
import PublicIcon from "@mui/icons-material/Public";
import SatelliteIcon from "@mui/icons-material/Satellite";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoIcon from "@mui/icons-material/Info";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedNode: InfrastructureNodePayload | null;
  infraData: AggregatedInfrastructureData | null;
}

const getStatusColor = (status: InfrastructureStatus | string) => {
  switch (status) {
    case "AVAILABLE":
    case "UP":
    case "HEALTHY":
      return "#10B981"; // Emerald Green
    case "DEGRADED":
      return "#F59E0B"; // Amber / Orange
    case "NOT_AVAILABLE":
    case "DOWN":
    case "OFFLINE":
    case "CRITICAL":
      return "#EF4444"; // Red
    case "NOT_MANAGED":
      return "#3B82F6"; // Blue
    case "NOT_CONFIGURED":
      return "#9CA3AF"; // Gray
    default:
      return "#9CA3AF";
  }
};

const getStatusIcon = (status: InfrastructureStatus | string) => {
  switch (status) {
    case "AVAILABLE":
    case "UP":
    case "HEALTHY":
      return <CheckCircleIcon sx={{ fontSize: 16, color: "#10B981" }} />;
    case "DEGRADED":
      return <WarningIcon sx={{ fontSize: 16, color: "#F59E0B" }} />;
    case "NOT_AVAILABLE":
    case "DOWN":
    case "OFFLINE":
    case "CRITICAL":
      return <ErrorIcon sx={{ fontSize: 16, color: "#EF4444" }} />;
    case "NOT_MANAGED":
      return <InfoIcon sx={{ fontSize: 16, color: "#3B82F6" }} />;
    default:
      return <HelpOutlineIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />;
  }
};

const getComponentIcon = (type: string) => {
  switch (type) {
    case "cloud": return CloudIcon;
    case "router": return RouterIcon;
    case "link": return PrivateConnectivityIcon;
    case "connect": return CompareArrowsIcon;
    case "dns": return DnsIcon;
    case "network": return PublicIcon;
    case "satellite": return SatelliteIcon;
    default: return CloudIcon;
  }
};

const DetailRow: React.FC<{ label: string; value?: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.7, borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
    <Typography sx={{ fontSize: 12, color: vars.textDim, fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 12, color: vars.text, fontWeight: 600, fontFamily: mono ? "monospace" : "inherit" }}>
      {value ?? "--"}
    </Typography>
  </Box>
);

export const InfrastructureDetailsModal: React.FC<Props> = ({
  open,
  onClose,
  selectedNode,
  infraData,
}) => {
  if (!selectedNode) return null;

  const Icon = getComponentIcon(selectedNode.type);
  const statusColor = getStatusColor(selectedNode.status);
  const details = selectedNode.details || {};
  const lastUpdated = details.lastUpdated || infraData?.updatedAt || "--";

  const renderContent = () => {
    switch (selectedNode.id) {
      case "aws-vpc": {
        const vpc = infraData?.vpc;
        const vpcDetails = vpc?.details || {};
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {vpc?.status === "NOT_CONFIGURED" ? (
              <Box sx={{ p: 2, bgcolor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 1.5 }}>
                <Typography sx={{ fontSize: 13, color: "#EF4444", fontWeight: 700, mb: 0.5 }}>
                  {vpc?.accountType} AWS Credentials Not Configured
                </Typography>
                <Typography sx={{ fontSize: 12, color: vars.textDim }}>
                  {vpcDetails.message || "AWS access credentials for this account are not yet configured in the environment."}
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ bgcolor: "rgba(255, 255, 255, 0.02)", p: 1.5, borderRadius: 1.5, border: `1px solid ${vars.border}` }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                    VPC Identification & Scope
                  </Typography>
                  <DetailRow label="Account Ownership" value={`${vpc?.accountType || selectedNode.account} AWS Account`} />
                  <DetailRow label="VPC ID" value={vpcDetails.vpcId} mono />
                  <DetailRow label="VPC Name" value={vpcDetails.vpcName} />
                  <DetailRow label="AWS State" value={
                    <Chip label={vpcDetails.awsState || "UNKNOWN"} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }} />
                  } />
                  <DetailRow label="AWS Region" value={vpcDetails.region} />
                  <DetailRow label="Primary IPv4 CIDR" value={vpcDetails.cidr} mono />
                  <DetailRow label="Default VPC" value={vpcDetails.isDefault} />
                  <DetailRow label="Owner Account ID" value={vpcDetails.ownerId} mono />
                </Box>

                <Box sx={{ bgcolor: "rgba(255, 255, 255, 0.02)", p: 1.5, borderRadius: 1.5, border: `1px solid ${vars.border}` }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                    Network Topology Counts
                  </Typography>
                  <DetailRow label="Associated Subnets" value={vpcDetails.subnetCount ?? "--"} />
                  <DetailRow label="Route Tables" value={vpcDetails.routeTableCount ?? "--"} />
                  <DetailRow label="Network ACLs" value={vpcDetails.networkAclCount ?? "--"} />
                  <DetailRow label="DHCP Options ID" value={vpcDetails.dhcpOptionsId} mono />
                </Box>
              </>
            )}
          </Box>
        );
      }

      case "tgw": {
        const tgw = infraData?.transitGateway;
        const tgwDetails = tgw?.details || {};
        const attachments = tgwDetails.attachments || [];

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {tgw?.status === "NOT_CONFIGURED" ? (
              <Box sx={{ p: 2, bgcolor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 1.5 }}>
                <Typography sx={{ fontSize: 13, color: "#EF4444", fontWeight: 700, mb: 0.5 }}>
                  NETWORK AWS Credentials Not Configured
                </Typography>
                <Typography sx={{ fontSize: 12, color: vars.textDim }}>
                  {tgwDetails.message || "Transit Gateway monitoring requires NETWORK account AWS credentials."}
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ bgcolor: "rgba(255, 255, 255, 0.02)", p: 1.5, borderRadius: 1.5, border: `1px solid ${vars.border}` }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                    Transit Gateway Attributes
                  </Typography>
                  <DetailRow label="Account Ownership" value="NETWORK AWS Account" />
                  <DetailRow label="Transit Gateway ID" value={tgwDetails.transitGatewayId} mono />
                  <DetailRow label="Transit Gateway Name" value={tgwDetails.transitGatewayName} />
                  <DetailRow label="State" value={
                    <Chip label={tgwDetails.state || "UNKNOWN"} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }} />
                  } />
                  <DetailRow label="AWS Region" value={tgwDetails.region} />
                  <DetailRow label="Amazon Side ASN" value={tgwDetails.amazonSideAsn} mono />
                  <DetailRow label="Auto Accept Shared Attachments" value={tgwDetails.autoAcceptSharedAttachments} />
                  <DetailRow label="Default Route Table Association" value={tgwDetails.defaultRouteTableAssociation} />
                </Box>

                <Box sx={{ bgcolor: "rgba(255, 255, 255, 0.02)", p: 1.5, borderRadius: 1.5, border: `1px solid ${vars.border}` }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                    Transit Gateway Attachments ({attachments.length})
                  </Typography>
                  {attachments.length === 0 ? (
                    <Typography sx={{ fontSize: 12, color: vars.textDim, py: 1, textAlign: "center" }}>
                      No attachments discovered
                    </Typography>
                  ) : (
                    <TableContainer component={Paper} sx={{ bgcolor: "transparent", boxShadow: "none", backgroundImage: "none" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: vars.textDim, fontSize: 11, fontWeight: 700, borderColor: vars.border }}>Attachment ID</TableCell>
                            <TableCell sx={{ color: vars.textDim, fontSize: 11, fontWeight: 700, borderColor: vars.border }}>Type</TableCell>
                            <TableCell sx={{ color: vars.textDim, fontSize: 11, fontWeight: 700, borderColor: vars.border }}>State</TableCell>
                            <TableCell sx={{ color: vars.textDim, fontSize: 11, fontWeight: 700, borderColor: vars.border }}>Resource ID</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {attachments.map((att, idx) => (
                            <TableRow key={att.id || idx}>
                              <TableCell sx={{ color: vars.text, fontSize: 11, fontFamily: "monospace", borderColor: vars.border }}>{att.id}</TableCell>
                              <TableCell sx={{ color: vars.text, fontSize: 11, borderColor: vars.border }}>{att.type}</TableCell>
                              <TableCell sx={{ color: getStatusColor(att.state), fontSize: 11, fontWeight: 700, borderColor: vars.border }}>{att.state}</TableCell>
                              <TableCell sx={{ color: vars.textDim, fontSize: 11, fontFamily: "monospace", borderColor: vars.border }}>{att.resourceId}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              </>
            )}
          </Box>
        );
      }

      case "privatelink": {
        const pl = infraData?.privateLink;
        const tata = pl?.tata;
        const airtel = pl?.airtel;
        const plDetails = pl?.details || {};

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {pl?.status === "NOT_CONFIGURED" ? (
              <Box sx={{ p: 2, bgcolor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 1.5 }}>
                <Typography sx={{ fontSize: 13, color: "#EF4444", fontWeight: 700, mb: 0.5 }}>
                  NETWORK AWS Credentials Not Configured
                </Typography>
                <Typography sx={{ fontSize: 12, color: vars.textDim }}>
                  {plDetails.message || "VPN monitoring requires NETWORK account AWS credentials."}
                </Typography>
              </Box>
            ) : (
              <>
                {/* TATA VPN Provider */}
                <Box sx={{ bgcolor: "rgba(255, 255, 255, 0.02)", p: 1.5, borderRadius: 1.5, border: `1px solid ${vars.border}` }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      1. TATA VPN Connection
                    </Typography>
                    <Chip
                      label={tata?.status || "UNKNOWN"}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        bgcolor: `${getStatusColor(tata?.status || "UNKNOWN")}20`,
                        color: getStatusColor(tata?.status || "UNKNOWN"),
                        border: `1px solid ${getStatusColor(tata?.status || "UNKNOWN")}40`,
                      }}
                    />
                  </Box>
                  <DetailRow label="VPN Connection ID" value={tata?.vpnConnectionId} mono />
                  <DetailRow
                    label="Tunnel 1 Status"
                    value={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {getStatusIcon(tata?.tunnel1 || "DOWN")}
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: getStatusColor(tata?.tunnel1 || "DOWN") }}>
                          {tata?.tunnel1 || "--"}
                        </Typography>
                      </Box>
                    }
                  />
                  <DetailRow
                    label="Tunnel 2 Status"
                    value={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {getStatusIcon(tata?.tunnel2 || "DOWN")}
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: getStatusColor(tata?.tunnel2 || "DOWN") }}>
                          {tata?.tunnel2 || "--"}
                        </Typography>
                      </Box>
                    }
                  />
                  {tata?.tunnels && tata.tunnels.length > 0 && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <DetailRow label="Outside IP (T1)" value={tata.tunnels[0]?.outsideIp} mono />
                      <DetailRow label="Inside CIDR (T1)" value={tata.tunnels[0]?.insideCidr} mono />
                      <DetailRow label="Outside IP (T2)" value={tata.tunnels[1]?.outsideIp} mono />
                      <DetailRow label="Inside CIDR (T2)" value={tata.tunnels[1]?.insideCidr} mono />
                    </Box>
                  )}
                </Box>

                {/* AIRTEL VPN Provider */}
                <Box sx={{ bgcolor: "rgba(255, 255, 255, 0.02)", p: 1.5, borderRadius: 1.5, border: `1px solid ${vars.border}` }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      2. AIRTEL VPN Connection
                    </Typography>
                    <Chip
                      label={airtel?.status || "UNKNOWN"}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        bgcolor: `${getStatusColor(airtel?.status || "UNKNOWN")}20`,
                        color: getStatusColor(airtel?.status || "UNKNOWN"),
                        border: `1px solid ${getStatusColor(airtel?.status || "UNKNOWN")}40`,
                      }}
                    />
                  </Box>
                  <DetailRow label="VPN Connection ID" value={airtel?.vpnConnectionId} mono />
                  <DetailRow
                    label="Tunnel 1 Status"
                    value={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {getStatusIcon(airtel?.tunnel1 || "DOWN")}
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: getStatusColor(airtel?.tunnel1 || "DOWN") }}>
                          {airtel?.tunnel1 || "--"}
                        </Typography>
                      </Box>
                    }
                  />
                  <DetailRow
                    label="Tunnel 2 Status"
                    value={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {getStatusIcon(airtel?.tunnel2 || "DOWN")}
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: getStatusColor(airtel?.tunnel2 || "DOWN") }}>
                          {airtel?.tunnel2 || "--"}
                        </Typography>
                      </Box>
                    }
                  />
                  {airtel?.tunnels && airtel.tunnels.length > 0 && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <DetailRow label="Outside IP (T1)" value={airtel.tunnels[0]?.outsideIp} mono />
                      <DetailRow label="Inside CIDR (T1)" value={airtel.tunnels[0]?.insideCidr} mono />
                      <DetailRow label="Outside IP (T2)" value={airtel.tunnels[1]?.outsideIp} mono />
                      <DetailRow label="Inside CIDR (T2)" value={airtel.tunnels[1]?.insideCidr} mono />
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>
        );
      }

      case "direct-connect": {
        const dx = infraData?.directConnect;
        const connections = dx?.connections || [];
        const vifs = dx?.virtualInterfaces || [];
        const dxDetails = dx?.details || {};

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {dx?.status === "NOT_CONFIGURED" ? (
              <Box sx={{ p: 2, bgcolor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 1.5 }}>
                <Typography sx={{ fontSize: 13, color: "#EF4444", fontWeight: 700, mb: 0.5 }}>
                  NETWORK AWS Credentials Not Configured
                </Typography>
                <Typography sx={{ fontSize: 12, color: vars.textDim }}>
                  {dxDetails.message || "Direct Connect monitoring requires NETWORK account AWS credentials."}
                </Typography>
              </Box>
            ) : (
              <>
                {/* Physical / Hosted Connections */}
                <Box sx={{ bgcolor: "rgba(255, 255, 255, 0.02)", p: 1.5, borderRadius: 1.5, border: `1px solid ${vars.border}` }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                    Direct Connect Connection (Sheet 2)
                  </Typography>
                  {connections.length === 0 ? (
                    <Typography sx={{ fontSize: 12, color: vars.textDim, py: 1, textAlign: "center" }}>
                      No physical Direct Connect connections found
                    </Typography>
                  ) : (
                    connections.map((c, idx) => (
                      <Box key={c.connectionId || idx} sx={{ mb: idx < connections.length - 1 ? 1.5 : 0 }}>
                        <DetailRow label="Connection ID" value={c.connectionId} mono />
                        <DetailRow label="Connection Name" value={c.connectionName} />
                        <DetailRow label="Type" value={c.type} />
                        <DetailRow label="State" value={
                          <Chip label={c.state || "UNKNOWN"} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: `${getStatusColor(c.state)}20`, color: getStatusColor(c.state), border: `1px solid ${getStatusColor(c.state)}40` }} />
                        } />
                        <DetailRow label="Port Speed / Bandwidth" value={c.portSpeed} />
                        <DetailRow label="Location" value={c.location} />
                      </Box>
                    ))
                  )}
                </Box>

                {/* Virtual Interfaces (VIFs) */}
                <Box sx={{ bgcolor: "rgba(255, 255, 255, 0.02)", p: 1.5, borderRadius: 1.5, border: `1px solid ${vars.border}` }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                    Virtual Interfaces (VIF) & BGP Status (Sheet 1 & 2)
                  </Typography>
                  {vifs.length === 0 ? (
                    <Typography sx={{ fontSize: 12, color: vars.textDim, py: 1, textAlign: "center" }}>
                      No virtual interfaces discovered
                    </Typography>
                  ) : (
                    vifs.map((v, idx) => (
                      <Box key={v.virtualInterfaceId || idx} sx={{ mb: idx < vifs.length - 1 ? 1.5 : 0, pb: idx < vifs.length - 1 ? 1 : 0, borderBottom: idx < vifs.length - 1 ? "1px dashed rgba(255,255,255,0.1)" : "none" }}>
                        <DetailRow label="Virtual Interface Name" value={v.virtualInterfaceName} />
                        <DetailRow label="Virtual Interface ID" value={v.virtualInterfaceId} mono />
                        <DetailRow label="Type" value={v.virtualInterfaceType} />
                        <DetailRow label="State" value={v.state} />
                        <DetailRow
                          label="BGP Status"
                          value={
                            <Chip
                              label={`BGP ${v.bgpStatus || "DOWN"}`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: 10,
                                fontWeight: 700,
                                bgcolor: `${getStatusColor(v.bgpStatus)}20`,
                                color: getStatusColor(v.bgpStatus),
                                border: `1px solid ${getStatusColor(v.bgpStatus)}40`,
                              }}
                            />
                          }
                        />
                        <DetailRow label="Direct Connect Gateway" value={v.directConnectGatewayId} mono />
                        <DetailRow label="Connection ID" value={v.connectionId} mono />
                        <DetailRow label="Region" value={v.region} />
                      </Box>
                    ))
                  )}
                </Box>
              </>
            )}
          </Box>
        );
      }

      case "hosted-dx": {
        const hdx = infraData?.hostedDx;
        const gateways = hdx?.gateways || [];
        const hdxDetails = hdx?.details || {};

        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {hdx?.status === "NOT_CONFIGURED" ? (
              <Box sx={{ p: 2, bgcolor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 1.5 }}>
                <Typography sx={{ fontSize: 13, color: "#EF4444", fontWeight: 700, mb: 0.5 }}>
                  NETWORK AWS Credentials Not Configured
                </Typography>
                <Typography sx={{ fontSize: 12, color: vars.textDim }}>
                  {hdxDetails.message || "Hosted DX monitoring requires NETWORK account AWS credentials."}
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ bgcolor: "rgba(255, 255, 255, 0.02)", p: 1.5, borderRadius: 1.5, border: `1px solid ${vars.border}` }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                    Direct Connect Gateways (Sheet 1 & 2)
                  </Typography>
                  {gateways.length === 0 ? (
                    <Typography sx={{ fontSize: 12, color: vars.textDim, py: 1, textAlign: "center" }}>
                      No Direct Connect Gateways configured
                    </Typography>
                  ) : (
                    gateways.map((gw, idx) => (
                      <Box key={gw.directConnectGatewayId || idx} sx={{ mb: idx < gateways.length - 1 ? 1.5 : 0, pb: idx < gateways.length - 1 ? 1 : 0, borderBottom: idx < gateways.length - 1 ? "1px dashed rgba(255,255,255,0.1)" : "none" }}>
                        <DetailRow label="Gateway Name" value={gw.directConnectGatewayName} />
                        <DetailRow label="Gateway ID" value={gw.directConnectGatewayId} mono />
                        <DetailRow label="State" value={
                          <Chip label={gw.state || "UNKNOWN"} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: `${getStatusColor(gw.state)}20`, color: getStatusColor(gw.state), border: `1px solid ${getStatusColor(gw.state)}40` }} />
                        } />
                        <DetailRow label="TGW Association" value={gw.tgwAssociation} />
                        <DetailRow label="VIF Association" value={gw.vifAssociation} />
                        <DetailRow label="Amazon Side ASN" value={gw.amazonSideAsn} mono />
                      </Box>
                    ))
                  )}
                </Box>
              </>
            )}
          </Box>
        );
      }

      case "isp":
      case "mission-network": {
        const isMission = selectedNode.id === "mission-network";
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ bgcolor: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.25)", p: 2, borderRadius: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <InfoIcon sx={{ color: "#3B82F6", fontSize: 20 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#3B82F6", textTransform: "uppercase" }}>
                  {isMission ? "Mission Network Scope" : "ISP / Network Scope"}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: vars.text, lineHeight: 1.6, mb: 1.5 }}>
                {isMission
                  ? "This component represents external Mission Network ground telemetry / tracking systems and is not directly managed or monitored by GS Portal AWS infrastructure."
                  : "This component represents external Internet Service Provider (ISP) and telecom leased-line infrastructure and is not directly managed or monitored by GS Portal."}
              </Typography>
              <DetailRow label="Monitoring Parameter" value="Not Managed by us" />
              <DetailRow label="Component Status" value={
                <Chip label="NOT MANAGED" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: "rgba(59, 130, 246, 0.2)", color: "#3B82F6", border: "1px solid rgba(59, 130, 246, 0.4)" }} />
              } />
              <DetailRow label="Responsibility" value="External Provider" />
            </Box>
          </Box>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: vars.bgCard,
          border: `1px solid ${vars.border}`,
          borderRadius: "10px",
          color: vars.text,
          backgroundImage: "none",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2,
          borderBottom: `1px solid ${vars.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box sx={{ p: 0.8, borderRadius: "8px", bgcolor: `${statusColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon sx={{ fontSize: 20, color: statusColor }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 900, color: vars.text, letterSpacing: "0.02em" }}>
              {selectedNode.name}
            </Typography>
            <Typography sx={{ fontSize: 10, color: vars.textDim, fontWeight: 600, textTransform: "uppercase" }}>
              {selectedNode.account === "EXTERNAL" ? "External Entity" : `${selectedNode.account} AWS Account`}
            </Typography>
          </Box>
        </Box>
        <Chip
          icon={getStatusIcon(selectedNode.status)}
          label={selectedNode.status.replace("_", " ")}
          size="small"
          sx={{
            height: 24,
            fontSize: 10.5,
            fontWeight: 800,
            bgcolor: `${statusColor}20`,
            color: statusColor,
            border: `1px solid ${statusColor}40`,
            px: 0.5,
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        {renderContent()}

        {/* UTC Timestamp */}
        <Box sx={{ pt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontSize: 10.5, color: vars.textDim }}>
            Last Updated
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: vars.accent, fontWeight: 700, fontFamily: "monospace" }}>
            {lastUpdated}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: `1px solid ${vars.border}`, bgcolor: "rgba(255, 255, 255, 0.02)" }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            ...PREMIUM_ACTION_BUTTON_SX,
            height: 32,
            px: 2.5,
            fontSize: 12,
            borderRadius: "6px",
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
