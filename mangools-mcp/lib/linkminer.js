import { endpointTool } from "./tool-definitions.js";

const url = {
  url: {
    type: "string",
    description: "Target URL or domain.",
  },
};

const linkId = {
  link_id: {
    type: "string",
    description: "LinkMiner link ID.",
  },
};

const listId = {
  list_id: {
    type: "string",
    description: "LinkMiner favorite list ID.",
  },
};

export const linkminerDefinitions = [
  endpointTool({
    name: "linkminer_links",
    description: "Get backlinks from LinkMiner.",
    method: "GET",
    path: "/linkminer/links",
    properties: url,
  }),
  endpointTool({
    name: "linkminer_url_metrics",
    description: "Get URL metrics for a target URL.",
    method: "GET",
    path: "/linkminer/url-metrics",
    properties: url,
  }),
  endpointTool({
    name: "linkminer_set_favorite_link",
    description: "Set a LinkMiner favorite link.",
    method: "PATCH",
    path: "/linkminer/favorite-links/{link_id}",
    pathParams: ["link_id"],
    properties: linkId,
  }),
  endpointTool({
    name: "linkminer_favorites",
    description: "See LinkMiner favorite links.",
    method: "GET",
    path: "/linkminer/favorites",
  }),
  endpointTool({
    name: "linkminer_favorite_detail",
    description: "See one LinkMiner favorite link.",
    method: "GET",
    path: "/linkminer/favorites/{link_id}",
    pathParams: ["link_id"],
    properties: linkId,
  }),
  endpointTool({
    name: "linkminer_delete_favorite",
    description: "Remove a LinkMiner link from a favorite list.",
    method: "DELETE",
    path: "/linkminer/favorites/{list_id}",
    pathParams: ["list_id"],
    properties: listId,
  }),
  endpointTool({
    name: "linkminer_requests",
    description: "Get latest LinkMiner used requests.",
    method: "GET",
    path: "/siteprofiler/requests",
  }),
  endpointTool({
    name: "linkminer_exports",
    description: "Get all LinkMiner exports sorted by creation date.",
    method: "GET",
    path: "/linkminer/exports",
  }),
  endpointTool({
    name: "linkminer_create_export",
    description: "Create a new LinkMiner export task.",
    method: "POST",
    path: "/linkminer/exports",
  }),
  endpointTool({
    name: "linkminer_export_suggestions",
    description: "Get LinkMiner export suggestions for a URL.",
    method: "POST",
    path: "/linkminer/exports/suggest/",
    properties: url,
  }),
];
