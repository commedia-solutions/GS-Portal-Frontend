import type { GroundStation } from "../../types/topologyTypes";
import { getRegions } from "../regions/regionService";

export const getTopologyData = async (): Promise<GroundStation[]> => {
  try {
    const dbRegions = await getRegions(false);
    if (dbRegions && dbRegions.length > 0) {
      const allStations: GroundStation[] = [];
      dbRegions.forEach((r) => {
        const stationsList = r.stations && r.stations.length > 0 
          ? r.stations 
          : [r.sd1 || r.gs1, r.sd2 || r.gs2].filter(Boolean);

        if (stationsList.length > 0) {
          stationsList.forEach((st: any, idx: number) => {
            const stId = st.stationId || `${r.code}${idx + 1}`;
            allStations.push({
              type: "station",
              id: stId,
              name: `${r.name} (${stId})`,
              awsRegion: r.awsRegion,
              status: "UNKNOWN",
              lastUpdate: "No Data",
              latitude: Number(r.latitude),
              longitude: Number(r.longitude),
              infrastructure: {
                receiverEc2: "UNKNOWN",
                sdrEc2: "UNKNOWN",
                receiverInstanceId: st.ec2ReceiverInstanceId || st.receiverInstanceId || undefined,
                sdrInstanceId: st.ec2SdrInstanceId || st.sdrInstanceId || undefined,
                rxStatus: "UNKNOWN",
                txStatus: "UNKNOWN",
              },
              system: {
                connection: "UNKNOWN",
                health: "UNKNOWN",
              },
            });
          });
        } else if (r.code) {
          [`${r.code}1`, `${r.code}2`].forEach((stId) => {
            allStations.push({
              type: "station",
              id: stId,
              name: `${r.name} (${stId})`,
              awsRegion: r.awsRegion,
              status: "UNKNOWN",
              lastUpdate: "No Data",
              latitude: Number(r.latitude),
              longitude: Number(r.longitude),
              infrastructure: {
                receiverEc2: "UNKNOWN",
                sdrEc2: "UNKNOWN",
                rxStatus: "UNKNOWN",
                txStatus: "UNKNOWN",
              },
              system: {
                connection: "UNKNOWN",
                health: "UNKNOWN",
              },
            });
          });
        }
      });
      return allStations;
    }
  } catch (err) {
    console.error("Error loading dynamic stations for topology:", err);
  }

  // Fallback
  return [
    {
      type: "station", id: "CP1", name: "Cape Town (CP1)", awsRegion: "af-south-1", status: "UNKNOWN", lastUpdate: "No Data",
      latitude: -33.9249, longitude: 18.4241,
      infrastructure: { receiverEc2: "UNKNOWN", sdrEc2: "UNKNOWN", rxStatus: "UNKNOWN", txStatus: "UNKNOWN" },
      system: { connection: "UNKNOWN", health: "UNKNOWN" }
    },
    {
      type: "station", id: "CP2", name: "Cape Town (CP2)", awsRegion: "af-south-1", status: "UNKNOWN", lastUpdate: "No Data",
      latitude: -33.9249, longitude: 18.4241,
      infrastructure: { receiverEc2: "UNKNOWN", sdrEc2: "UNKNOWN", rxStatus: "UNKNOWN", txStatus: "UNKNOWN" },
      system: { connection: "UNKNOWN", health: "UNKNOWN" }
    },
    {
      type: "station", id: "DU1", name: "Dublin (DU1)", awsRegion: "eu-west-1", status: "UNKNOWN", lastUpdate: "No Data",
      latitude: 53.3498, longitude: -6.2603,
      infrastructure: { receiverEc2: "UNKNOWN", sdrEc2: "UNKNOWN", rxStatus: "UNKNOWN", txStatus: "UNKNOWN" },
      system: { connection: "UNKNOWN", health: "UNKNOWN" }
    },
    {
      type: "station", id: "DU2", name: "Dublin (DU2)", awsRegion: "eu-west-1", status: "UNKNOWN", lastUpdate: "No Data",
      latitude: 53.3498, longitude: -6.2603,
      infrastructure: { receiverEc2: "UNKNOWN", sdrEc2: "UNKNOWN", rxStatus: "UNKNOWN", txStatus: "UNKNOWN" },
      system: { connection: "UNKNOWN", health: "UNKNOWN" }
    },
    {
      type: "station", id: "PA1", name: "Punta Arenas (PA1)", awsRegion: "sa-east-1", status: "UNKNOWN", lastUpdate: "No Data",
      latitude: -53.15, longitude: -70.9167,
      infrastructure: { receiverEc2: "UNKNOWN", sdrEc2: "UNKNOWN", rxStatus: "UNKNOWN", txStatus: "UNKNOWN" },
      system: { connection: "UNKNOWN", health: "UNKNOWN" }
    },
    {
      type: "station", id: "PA2", name: "Punta Arenas (PA2)", awsRegion: "sa-east-1", status: "UNKNOWN", lastUpdate: "No Data",
      latitude: -53.15, longitude: -70.9167,
      infrastructure: { receiverEc2: "UNKNOWN", sdrEc2: "UNKNOWN", rxStatus: "UNKNOWN", txStatus: "UNKNOWN" },
      system: { connection: "UNKNOWN", health: "UNKNOWN" }
    },
    {
      type: "station", id: "DB1", name: "Dubbo (DB1)", awsRegion: "ap-southeast-2", status: "UNKNOWN", lastUpdate: "No Data",
      latitude: -32.245, longitude: 148.604,
      infrastructure: { receiverEc2: "UNKNOWN", sdrEc2: "UNKNOWN", rxStatus: "UNKNOWN", txStatus: "UNKNOWN" },
      system: { connection: "UNKNOWN", health: "UNKNOWN" }
    },
    {
      type: "station", id: "DB2", name: "Dubbo (DB2)", awsRegion: "ap-southeast-2", status: "UNKNOWN", lastUpdate: "No Data",
      latitude: -32.245, longitude: 148.604,
      infrastructure: { receiverEc2: "UNKNOWN", sdrEc2: "UNKNOWN", rxStatus: "UNKNOWN", txStatus: "UNKNOWN" },
      system: { connection: "UNKNOWN", health: "UNKNOWN" }
    },
    {
      type: "station", id: "OR1", name: "Oregon (OR1)", awsRegion: "us-west-2", status: "UNKNOWN", lastUpdate: "No Data",
      latitude: 44.0, longitude: -120.5,
      infrastructure: { receiverEc2: "UNKNOWN", sdrEc2: "UNKNOWN", rxStatus: "UNKNOWN", txStatus: "UNKNOWN" },
      system: { connection: "UNKNOWN", health: "UNKNOWN" }
    },
    {
      type: "station", id: "OR2", name: "Oregon (OR2)", awsRegion: "us-west-2", status: "UNKNOWN", lastUpdate: "No Data",
      latitude: 44.0, longitude: -120.5,
      infrastructure: { receiverEc2: "UNKNOWN", sdrEc2: "UNKNOWN", rxStatus: "UNKNOWN", txStatus: "UNKNOWN" },
      system: { connection: "UNKNOWN", health: "UNKNOWN" }
    }
  ];
};

