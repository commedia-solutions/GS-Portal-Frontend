import type { AwsHub } from "../../types/topologyTypes";

export const getAwsHubData = async (): Promise<AwsHub[]> => {
  return [
    {
      type: "AWS_HUB",
      id: "hub-mumbai",
      name: "AWS CENTRAL HUB",
      locationName: "Mumbai, India",
      city: "Mumbai",
      country: "India",
      regionCode: "ap-south-1",
      latitude: 19.0760,
      longitude: 72.8777,
      status: "ONLINE",
      connectedRegions: ["af-south-1", "eu-west-1", "sa-east-1", "ap-southeast-2"],
      connectedStations: ["CP1", "CP2", "DU1", "DU2", "PA1", "PA2", "DB1", "DB2"]
    }
  ];
};
