import { endpointTool } from "./tool-definitions.js";

const monitorId = {
  id: {
    type: "string",
    description: "AI Search Watcher monitor ID.",
  },
};

const promptId = {
  id: {
    type: "string",
    description: "AI Search Watcher prompt ID.",
  },
};

export const aiwatcherDefinitions = [
  endpointTool({
    name: "aiwatcher_models",
    description: "Get available AI Search Watcher models.",
    method: "GET",
    path: "/v3/aiwatcher/models",
  }),
  endpointTool({
    name: "aiwatcher_monitors",
    description: "Get all AI Search Watcher monitors for the user.",
    method: "GET",
    path: "/v3/aiwatcher/monitors",
  }),
  endpointTool({
    name: "aiwatcher_create_monitor",
    description: "Create AI monitoring for a brand.",
    method: "POST",
    path: "/v3/aiwatcher/monitor",
  }),
  endpointTool({
    name: "aiwatcher_monitor_detail",
    description: "Get AI monitoring detail for a brand.",
    method: "GET",
    path: "/v3/aiwatcher/monitor/{id}",
    pathParams: ["id"],
    properties: monitorId,
  }),
  endpointTool({
    name: "aiwatcher_delete_monitor",
    description: "Delete AI monitoring for a brand.",
    method: "DELETE",
    path: "/v3/aiwatcher/monitor/{id}",
    pathParams: ["id"],
    properties: monitorId,
  }),
  endpointTool({
    name: "aiwatcher_generate_prompts",
    description: "Generate AI prompts for brand monitoring.",
    method: "POST",
    path: "/v3/aiwatcher/prompts/generate",
  }),
  endpointTool({
    name: "aiwatcher_prompt_detail",
    description: "Get AI Search Watcher prompt detail.",
    method: "GET",
    path: "/v3/aiwatcher/prompt/{id}",
    pathParams: ["id"],
    properties: promptId,
  }),
  endpointTool({
    name: "aiwatcher_delete_prompts",
    description: "Delete AI Search Watcher prompts.",
    method: "DELETE",
    path: "/v3/aiwatcher/prompts",
  }),
  endpointTool({
    name: "aiwatcher_monitor_prompts",
    description: "Get AI Search Watcher prompt details for a monitor.",
    method: "GET",
    path: "/v3/aiwatcher/monitor/{id}/prompts",
    pathParams: ["id"],
    properties: monitorId,
  }),
  endpointTool({
    name: "aiwatcher_add_monitor_prompts",
    description: "Add prompts to an AI Search Watcher monitor.",
    method: "POST",
    path: "/v3/aiwatcher/monitor/{id}/prompts",
    pathParams: ["id"],
    properties: monitorId,
  }),
  endpointTool({
    name: "aiwatcher_monitor_settings",
    description: "Get AI Search Watcher monitor settings.",
    method: "GET",
    path: "/v3/aiwatcher/monitor/{id}/settings",
    pathParams: ["id"],
    properties: monitorId,
  }),
  endpointTool({
    name: "aiwatcher_update_monitor_settings",
    description: "Update AI Search Watcher monitor settings.",
    method: "PUT",
    path: "/v3/aiwatcher/monitor/{id}/settings",
    pathParams: ["id"],
    properties: monitorId,
  }),
];
