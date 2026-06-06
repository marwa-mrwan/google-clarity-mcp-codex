import { endpointTool } from "./tool-definitions.js";

const keyword = {
  keyword: {
    type: "string",
    description: "Seed keyword or exact keyword.",
  },
};

const url = {
  url: {
    type: "string",
    description: "Domain or URL to analyze.",
  },
};

const listId = {
  list_id: {
    type: "string",
    description: "KWFinder list ID.",
  },
};

export const kwfinderDefinitions = [
  endpointTool({
    name: "kwfinder_related_keywords",
    description: "Get related keywords list from KWFinder.",
    method: "GET",
    path: "/kwfinder/related-keywords",
    properties: keyword,
  }),
  endpointTool({
    name: "kwfinder_competitor_keywords",
    description: "Get competitor keywords for a domain or URL using the GET endpoint.",
    method: "GET",
    path: "/kwfinder/competitor-keywords",
    properties: url,
  }),
  endpointTool({
    name: "kwfinder_competitor_keywords_post",
    description: "Get competitor keywords for a domain or URL using the POST endpoint.",
    method: "POST",
    path: "/kwfinder/competitor-keywords",
    properties: url,
  }),
  endpointTool({
    name: "kwfinder_keyword_imports",
    description: "Get metrics for a set of imported keywords.",
    method: "POST",
    path: "/kwfinder/keyword-imports",
    properties: {
      keywords: {
        type: "array",
        description: "Keywords to import and score.",
        items: { type: "string" },
      },
      location_id: {
        type: "integer",
        description: "Mangools location ID.",
      },
      language_id: {
        type: "integer",
        description: "Mangools language ID.",
      },
    },
  }),
  endpointTool({
    name: "kwfinder_keyword_details",
    description: "Get keyword details, including SERP data.",
    method: "GET",
    path: "/serpchecker/serps",
    properties: keyword,
  }),
  endpointTool({
    name: "kwfinder_competitor_domains",
    description: "Get competitor domains from KWFinder.",
    method: "GET",
    path: "/kwfinder/competitor-domain",
    properties: url,
  }),
  endpointTool({
    name: "kwfinder_suggested_keywords",
    description: "Get suggested keywords for a URL.",
    method: "GET",
    path: "/kwfinder/suggested-keywords",
    properties: url,
  }),
  endpointTool({
    name: "kwfinder_export_keywords",
    description: "Export keywords into a CSV file.",
    method: "POST",
    path: "/kwfinder/keywords",
  }),
  endpointTool({
    name: "kwfinder_requests",
    description: "Get KWFinder lookup history.",
    method: "GET",
    path: "/siteprofiler/requests",
  }),
  endpointTool({
    name: "kwfinder_trends",
    description: "Get KWFinder trends.",
    method: "GET",
    path: "/kwfinder/trends",
  }),
  endpointTool({
    name: "kwfinder_url_metrics",
    description: "Get KWFinder KD URL metrics.",
    method: "GET",
    path: "/kwfinder/kd/url-metrics",
    properties: url,
  }),
  endpointTool({
    name: "kwfinder_kd_requests",
    description: "Get KWFinder KD lookup history.",
    method: "GET",
    path: "/kwfinder/kd/requests",
  }),
  endpointTool({
    name: "kwfinder_gap_analysis",
    description: "Run KWFinder keyword gap analysis.",
    method: "POST",
    path: "/kwfinder/gap-analysis",
  }),
  endpointTool({
    name: "kwfinder_limits",
    description: "Get current and free KWFinder limits.",
    method: "GET",
    path: "/kwfinder/limits",
  }),
  endpointTool({
    name: "kwfinder_lists",
    description: "Get all KWFinder keyword lists.",
    method: "GET",
    path: "/kwfinder/lists",
  }),
  endpointTool({
    name: "kwfinder_create_list",
    description: "Create a new KWFinder list.",
    method: "POST",
    path: "/kwfinder/lists",
    properties: {
      name: {
        type: "string",
        description: "List name.",
      },
    },
  }),
  endpointTool({
    name: "kwfinder_list_items",
    description: "Get items in a KWFinder list.",
    method: "GET",
    path: "/kwfinder/lists/{list_id}",
    pathParams: ["list_id"],
    properties: listId,
  }),
  endpointTool({
    name: "kwfinder_update_list",
    description: "Update a KWFinder list name.",
    method: "PATCH",
    path: "/kwfinder/lists/{list_id}",
    pathParams: ["list_id"],
    properties: {
      ...listId,
      name: {
        type: "string",
        description: "New list name.",
      },
    },
  }),
  endpointTool({
    name: "kwfinder_delete_list",
    description: "Delete a KWFinder custom list.",
    method: "DELETE",
    path: "/kwfinder/lists/{list_id}",
    pathParams: ["list_id"],
    properties: listId,
  }),
  endpointTool({
    name: "kwfinder_add_list_keywords",
    description: "Add keywords to a KWFinder list.",
    method: "POST",
    path: "/kwfinder/lists/{list_id}/keyword",
    pathParams: ["list_id"],
    properties: {
      ...listId,
      keywords: {
        type: "array",
        items: { type: "string" },
      },
    },
  }),
  endpointTool({
    name: "kwfinder_delete_list_keywords",
    description: "Remove keywords from a KWFinder list.",
    method: "DELETE",
    path: "/kwfinder/lists/{list_id}/keyword",
    pathParams: ["list_id"],
    properties: {
      ...listId,
      keywords: {
        type: "array",
        items: { type: "string" },
      },
    },
  }),
];
