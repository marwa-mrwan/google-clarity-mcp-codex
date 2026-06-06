import { endpointTool } from "./tool-definitions.js";

const locationParam = {
  location: {
    type: "string",
    description: "Mangools location ID.",
  },
};

export const mangoolsDefinitions = [
  endpointTool({
    name: "mangools_locations",
    description: "Get list of all Mangools geo-targeting locations.",
    method: "GET",
    path: "/mangools/locations",
  }),
  endpointTool({
    name: "mangools_location_detail",
    description: "Get detail for one Mangools location.",
    method: "GET",
    path: "/mangools/locations/{location}",
    pathParams: ["location"],
    properties: locationParam,
  }),
];
