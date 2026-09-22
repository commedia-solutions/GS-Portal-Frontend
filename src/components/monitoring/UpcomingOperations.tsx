import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from "@mui/material";
import { vars } from "../../ui/toast/themeBridge";
import type { UpcomingOperation } from "../../types/monitoring/dashboard";

export const UpcomingOperations: React.FC<{ operations: UpcomingOperation[] }> = ({ operations }) => {
  return (
    <TableContainer sx={{ height: "100%", overflowY: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ "& th": { py: 0.75, px: 1, borderBottom: `1px solid ${vars.border}`, color: vars.textDim, fontSize: 10, fontWeight: 900, letterSpacing: "0.05em", textTransform: "uppercase" } }}>
            <TableCell>Station</TableCell>
            <TableCell>Satellite</TableCell>
            <TableCell>AOS (UTC)</TableCell>
            <TableCell align="right">Duration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {operations.map((op) => (
            <TableRow key={op.id} sx={{ "& td": { py: 0.75, px: 1, borderBottom: `1px solid ${vars.borderWeak}`, color: vars.text, fontSize: 11 } }}>
              <TableCell sx={{ color: vars.accent, fontWeight: "bold" }}>{op.station}</TableCell>
              <TableCell>{op.satellite}</TableCell>
              <TableCell sx={{ fontFamily: "monospace", fontSize: 11 }}>{op.aos}</TableCell>
              <TableCell align="right" sx={{ color: vars.textDim }}>{op.duration}</TableCell>
            </TableRow>
          ))}
          {operations.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 3, color: vars.textDim, border: 'none' }}>
                No upcoming operations
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
