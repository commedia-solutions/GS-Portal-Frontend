import React from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { vars } from "../../ui/toast/themeBridge";
import type { RegionData } from "../../types/monitoring/dashboard";

interface RegionInfrastructureHealthProps {
  regions: RegionData[];
  selectedRegionId: string | null;
}

export const RegionInfrastructureHealth: React.FC<RegionInfrastructureHealthProps> = ({ regions, selectedRegionId }) => {
  const getStatusCircle = (status: string) => {
    let color = "#64748b"; // GRAY
    if (status === "HEALTHY") color = "#10B981"; // GREEN
    else if (status === "WARNING") color = "#F59E0B"; // YELLOW
    else if (status === "CRITICAL") color = "#EF4444"; // RED

    return (
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: color,
          boxShadow: `0 0 6px ${color}88`,
          display: "inline-block",
        }}
      />
    );
  };

  const getOverallStatus = (region: RegionData) => {
    const statuses = region.infrastructureNodes.map(n => n.status);
    if (statuses.includes("CRITICAL")) return { text: "Critical", color: "#EF4444" };
    if (statuses.includes("WARNING")) return { text: "Warning", color: "#F59E0B" };
    return { text: "Healthy", color: "#10B981" };
  };

  const getNodeStatus = (region: RegionData, id: string) => {
    const node = region.infrastructureNodes.find(n => n.id === id);
    return node ? node.status : "GRAY";
  };

  return (
    <Box sx={{ p: 0, overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ "& th": { py: 1, px: 1, borderBottom: `1px solid ${vars.border}`, color: vars.textDim, fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.02em" } }}>
            <TableCell>REGION</TableCell>
            <TableCell align="center">AWS VPC</TableCell>
            <TableCell align="center">TRANSIT GATEWAY</TableCell>
            <TableCell align="center">PRIVATELINK</TableCell>
            <TableCell align="center">AWS DIRECT CONNECT</TableCell>
            <TableCell align="center">HOSTED DX</TableCell>
            <TableCell align="center">ISP / NETWORK</TableCell>
            <TableCell align="center">MISSION NETWORK</TableCell>
            <TableCell align="right">STATUS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {regions.map((region) => {
            const overall = getOverallStatus(region);
            const isSelected = selectedRegionId === region.id;
            
            return (
              <TableRow 
                key={region.id}
                sx={{
                  bgcolor: isSelected ? "rgba(14, 165, 233, 0.1)" : "transparent",
                  transition: "background-color 0.2s ease",
                  "& td": { py: 0.75, px: 1 }
                }}
              >
                <TableCell sx={{ 
                  color: isSelected ? vars.accent : vars.text, 
                  borderBottom: `1px solid ${isSelected ? "rgba(14, 165, 233, 0.3)" : vars.borderWeak}`, 
                  fontSize: 11, 
                  fontWeight: isSelected ? 800 : 600,
                  whiteSpace: "nowrap"
                }}>
                  {region.name}
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: `1px solid ${isSelected ? "rgba(14, 165, 233, 0.3)" : vars.borderWeak}` }}>
                  {getStatusCircle(getNodeStatus(region, "aws-vpc"))}
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: `1px solid ${isSelected ? "rgba(14, 165, 233, 0.3)" : vars.borderWeak}` }}>
                  {getStatusCircle(getNodeStatus(region, "tgw"))}
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: `1px solid ${isSelected ? "rgba(14, 165, 233, 0.3)" : vars.borderWeak}` }}>
                  {getStatusCircle(getNodeStatus(region, "privatelink"))}
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: `1px solid ${isSelected ? "rgba(14, 165, 233, 0.3)" : vars.borderWeak}` }}>
                  {getStatusCircle(getNodeStatus(region, "direct-connect"))}
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: `1px solid ${isSelected ? "rgba(14, 165, 233, 0.3)" : vars.borderWeak}` }}>
                  {getStatusCircle(getNodeStatus(region, "hosted-dx"))}
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: `1px solid ${isSelected ? "rgba(14, 165, 233, 0.3)" : vars.borderWeak}` }}>
                  {getStatusCircle(getNodeStatus(region, "isp"))}
                </TableCell>
                <TableCell align="center" sx={{ borderBottom: `1px solid ${isSelected ? "rgba(14, 165, 233, 0.3)" : vars.borderWeak}` }}>
                  {getStatusCircle(getNodeStatus(region, "mission-network"))}
                </TableCell>
                <TableCell align="right" sx={{ color: overall.color, borderBottom: `1px solid ${isSelected ? "rgba(14, 165, 233, 0.3)" : vars.borderWeak}`, fontSize: 11, fontWeight: "bold" }}>
                  {overall.text}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};
