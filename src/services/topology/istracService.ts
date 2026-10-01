import type { IstracNode } from "../../types/topologyTypes";

export const getIstracData = async (): Promise<IstracNode> => {
  return {
    type: "ISTRAC",
    id: "node-istrac-bangalore",
    name: "ISTRAC BANGALORE",
    locationName: "Bangalore, India",
    city: "Bangalore",
    country: "India",
    latitude: 12.9716,
    longitude: 77.5946,
    status: "ONLINE",
    connectedHub: "AWS Central Hub (Mumbai)",
    hubRegionCode: "ap-south-1",
    role: "Mission Operations Complex (MOX) / Ground Station Network Operations",
  };
};
