import { endpointTool } from "./tool-definitions.js";

const url = {
  url: {
    type: "string",
    description: "Domain or URL to analyze.",
  },
};

export const siteprofilerDefinitions = [
  endpointTool({
    name: "siteprofiler_overview",
    description: "Get SiteProfiler URL metrics overview.",
    method: "GET",
    path: "/siteprofiler/overview",
    properties: url,
  }),
  endpointTool({
    name: "siteprofiler_audience",
    description: "Get SiteProfiler audience data.",
    method: "GET",
    path: "/siteprofiler/audience",
    properties: url,
  }),
  endpointTool({
    name: "siteprofiler_backlink_profile",
    description: "Get SiteProfiler backlink profile.",
    method: "GET",
    path: "/siteprofiler/backlink-profile",
    properties: url,
  }),
  endpointTool({
    name: "siteprofiler_top_content",
    description: "Get SiteProfiler top content.",
    method: "GET",
    path: "/siteprofiler/top-content",
    properties: url,
  }),
  endpointTool({
    name: "siteprofiler_competitors",
    description: "Get SiteProfiler competitors.",
    method: "GET",
    path: "/siteprofiler/competitors",
    properties: url,
  }),
  endpointTool({
    name: "siteprofiler_requests",
    description: "Get latest SiteProfiler used requests from the last 30 days.",
    method: "GET",
    path: "/siteprofiler/requests",
  }),
];
