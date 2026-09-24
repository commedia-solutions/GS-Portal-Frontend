import React, { useState } from "react";
import { Button, type SxProps, type Theme } from "@mui/material";
import { ExternalLink } from "lucide-react";
import { DataDefenderModal } from "./DataDefenderModal";
import type { ActivePass } from "../../types/monitoring/dashboard";
import type { GroundStation } from "../../types/topologyTypes";

interface ConnectDataDefenderButtonProps {
  pass?: ActivePass | GroundStation | any;
  sx?: SxProps<Theme>;
}

export const ConnectDataDefenderButton: React.FC<ConnectDataDefenderButtonProps> = ({
  pass,
  sx,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  return (
    <>
      <Button
        size="small"
        fullWidth
        onClick={handleClick}
        aria-label="Open DataDefender connection modal"
        startIcon={<ExternalLink size={12} />}
        sx={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "none",
          letterSpacing: "0.02em",
          py: 0.35,
          px: 1,
          minHeight: 24,
          color: "#38BDF8",
          bgcolor: "rgba(56, 189, 248, 0.08)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          borderRadius: "4px",
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: "rgba(56, 189, 248, 0.18)",
            borderColor: "rgba(56, 189, 248, 0.5)",
            color: "#7DD3FC",
            boxShadow: "0 0 8px rgba(56, 189, 248, 0.25)",
          },
          "&:focus-visible": {
            outline: "2px solid #38BDF8",
            outlineOffset: "1px",
          },
          ...sx,
        }}
      >
        Connect to DataDefender
      </Button>

      {modalOpen && (
        <DataDefenderModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          pass={pass}
        />
      )}
    </>
  );
};
