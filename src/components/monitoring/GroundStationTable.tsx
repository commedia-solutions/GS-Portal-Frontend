import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Typography } from "@mui/material";
import { vars } from "../../ui/toast/themeBridge";
import type { GroundStation } from "../../types/monitoring/dashboard";

export const GroundStationTable: React.FC<{ stations: GroundStation[] }> = ({ stations }) => {
  return (
    <TableContainer sx={{ height: "100%", overflowY: "auto" }}>
      <Table size="small" sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow sx={{ "& th": { py: 0.75, px: 1, borderBottom: `1px solid ${vars.border}`, color: vars.textDim, fontSize: 10, fontWeight: 900, letterSpacing: "0.05em", textTransform: "uppercase" } }}>
            <TableCell>Station</TableCell>
            <TableCell>Region</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>RX</TableCell>
            <TableCell>TX</TableCell>
            <TableCell>Eb/No</TableCell>
            <TableCell>IF Level</TableCell>
            <TableCell align="right">Last Update</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stations.map((d) => (
            <TableRow key={d.id} sx={{ "& td": { py: 0.75, px: 1, borderBottom: `1px solid ${vars.borderWeak}`, color: vars.text, fontSize: 11 }, "&:hover": { bgcolor: "rgba(255,255,255,0.03)", cursor: "pointer" } }}>
              <TableCell sx={{ fontWeight: "bold", color: vars.accent }}>{d.station} ({d.id})</TableCell>
              <TableCell sx={{ color: vars.textDim }}>{d.region}</TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.05em", color: d.status === 'ACTIVE' || d.status === 'ONLINE' ? '#10B981' : d.status === 'OFFLINE' || d.status === 'ERROR' ? '#EF4444' : '#F59E0B' }}>
                  {d.status}
                </Typography>
              </TableCell>
              <TableCell sx={{ color: d.rx === 'LOCKED' ? '#10B981' : vars.textDim, fontSize: 10, fontWeight: 600 }}>{d.rx}</TableCell>
              <TableCell sx={{ color: d.tx === 'ACTIVE' ? '#0EA5E9' : vars.textDim, fontSize: 10, fontWeight: 600 }}>{d.tx}</TableCell>
              <TableCell sx={{ fontFamily: "monospace", fontSize: 11 }}>{(d.ebNo ?? 0) > 0 ? d.ebNo?.toFixed(2) ?? "--" : '--'}</TableCell>
              <TableCell sx={{ fontFamily: "monospace", fontSize: 11 }}>{(d.ifLevel ?? 0) > 0 ? d.ifLevel?.toFixed(2) ?? "--" : '--'}</TableCell>
              <TableCell align="right" sx={{ color: vars.textDim, fontSize: 10 }}>
                {d.lastUpdate}
              </TableCell>
            </TableRow>
          ))}
          {stations.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 3, color: vars.textDim, border: 'none' }}>
                No ground stations found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
