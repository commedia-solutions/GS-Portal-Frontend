import type { AwsRegion } from "../../types/topologyTypes";
import { getRegions } from "../regions/regionService";

export const getAwsRegionData = async (): Promise<AwsRegion[]> => {
  try {
    const dbRegions = await getRegions(false);
    if (dbRegions && dbRegions.length > 0) {
      return dbRegions.map((r) => {
        const linkedStations: string[] = [];
        if (r.stations && r.stations.length > 0) {
          r.stations.forEach((s) => {
            if (s.stationId) linkedStations.push(s.stationId);
          });
        }
        if (linkedStations.length === 0) {
          if (r.sd1?.stationId) linkedStations.push(r.sd1.stationId);
          if (r.sd2?.stationId) linkedStations.push(r.sd2.stationId);
          if (r.gs1?.stationId) linkedStations.push(r.gs1.stationId);
          if (r.gs2?.stationId) linkedStations.push(r.gs2.stationId);
        }
        if (linkedStations.length === 0 && r.code) {
          linkedStations.push(`${r.code}1`, `${r.code}2`);
        }

        return {
          type: "region" as const,
          id: r.awsRegion || String(r.id),
          name: r.name,
          regionCode: r.awsRegion,
          city: r.name,
          country: r.name,
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
          availabilityZones: 3,
          status: "HEALTHY" as const,
          linkedStations,
        };
      });
    }
  } catch (err) {
    console.error("Error loading dynamic regions for topology:", err);
  }

  // Fallback if API unavailable
  return [
    { type: "region", id: "af-south-1", name: "Cape Town", regionCode: "af-south-1", city: "Cape Town", country: "South Africa", latitude: -33.9249, longitude: 18.4241, availabilityZones: 3, status: "HEALTHY", linkedStations: ["CP1", "CP2"] },
    { type: "region", id: "eu-west-1", name: "Dublin", regionCode: "eu-west-1", city: "Dublin", country: "Ireland", latitude: 53.3498, longitude: -6.2603, availabilityZones: 3, status: "HEALTHY", linkedStations: ["DU1", "DU2"] },
    { type: "region", id: "sa-east-1", name: "Punta Arenas", regionCode: "sa-east-1", city: "Punta Arenas", country: "Chile", latitude: -53.15, longitude: -70.9167, availabilityZones: 3, status: "HEALTHY", linkedStations: ["PA1", "PA2"] },
    { type: "region", id: "ap-southeast-2", name: "Dubbo", regionCode: "ap-southeast-2", city: "Dubbo", country: "Australia", latitude: -32.245, longitude: 148.604, availabilityZones: 3, status: "HEALTHY", linkedStations: ["DB1", "DB2"] },
    { type: "region", id: "us-west-2", name: "Oregon", regionCode: "us-west-2", city: "Oregon", country: "United States", latitude: 44.0, longitude: -120.5, availabilityZones: 3, status: "HEALTHY", linkedStations: ["OR1", "OR2"] }
  ];
};

