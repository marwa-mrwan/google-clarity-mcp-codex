import { endpointTool } from "./tool-definitions.js";

const keyword = {
  keyword: {
    type: "string",
    description: "Keyword to analyze in SERPChecker.",
  },
};

const url = {
  url: {
    type: "string",
    description: "URL to analyze.",
  },
};

export const serpcheckerDefinitions = [
  endpointTool({
    name: "serpchecker_serps",
    description: "Get SERP results with all metrics and snapshot.",
    method: "GET",
    path: "/serpchecker/serps",
    properties: keyword,
  }),
  endpointTool({
    name: "serpchecker_serps_reset",
    description: "Get freshly reparsed SERP results with all metrics and snapshot.",
    method: "GET",
    path: "/serpchecker/serps/reset",
    properties: keyword,
  }),
  endpointTool({
    name: "serpchecker_url_metrics",
    description: "Get URL metrics for a URL.",
    method: "GET",
    path: "/linkminer/url-metrics",
    properties: url,
  }),
  endpointTool({
    name: "serpchecker_requests",
    description: "Get latest SERPChecker requests.",
    method: "GET",
    path: "/siteprofiler/requests",
  }),
  endpointTool({
    name: "serpchecker_snapshot",
    description: "Get SERP snapshot image URL.",
    method: "GET",
    path: "/serpchecker/serps/{serp_id}/snapshot",
    pathParams: ["serp_id"],
    properties: {
      serp_id: {
        type: "string",
        description: "SERP snapshot ID.",
      },
    },
  }),
];
