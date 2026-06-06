import { endpointTool } from "./tool-definitions.js";

const trackingId = {
  tracking_id: {
    type: "string",
    description: "SERPWatcher tracking ID.",
  },
};

const trackedKeywordId = {
  tracked_keyword_id: {
    type: "string",
    description: "SERPWatcher tracked keyword ID.",
  },
};

const reportId = {
  report_id: {
    type: "string",
    description: "SERPWatcher report ID.",
  },
};

const annotationId = {
  annotation_id: {
    type: "string",
    description: "SERPWatcher annotation ID.",
  },
};

const tagId = {
  tag_id: {
    type: "string",
    description: "SERPWatcher tag ID.",
  },
};

export const serpwatcherDefinitions = [
  endpointTool({
    name: "serpwatcher_trackings",
    description: "Get all SERPWatcher trackings.",
    method: "GET",
    path: "/serpwatcher/trackings",
  }),
  endpointTool({
    name: "serpwatcher_create_tracking",
    description: "Create a SERPWatcher tracking.",
    method: "POST",
    path: "/serpwatcher/trackings",
  }),
  endpointTool({
    name: "serpwatcher_tracking_detail_legacy",
    description: "Get SERPWatcher tracking detail using the legacy endpoint.",
    method: "GET",
    path: "/serpwatcher/trackings/{tracking_id}",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_delete_tracking",
    description: "Delete a SERPWatcher tracking.",
    method: "DELETE",
    path: "/serpwatcher/trackings/{tracking_id}",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_update_tracking",
    description: "Update a SERPWatcher tracking domain or location.",
    method: "PUT",
    path: "/serpwatcher/trackings/{tracking_id}",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_tracking_detail",
    description: "Get SERPWatcher tracking detail and keywords.",
    method: "GET",
    path: "/serpwatcher/trackings/{tracking_id}/detail",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_tracking_stats",
    description: "Get SERPWatcher tracking stats.",
    method: "POST",
    path: "/serpwatcher/trackings/{tracking_id}/stats",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_create_multiple_trackings",
    description: "Create multiple SERPWatcher trackings.",
    method: "POST",
    path: "/serpwatcher/multiple-trackings",
  }),
  endpointTool({
    name: "serpwatcher_tracked_keywords",
    description: "Get all tracked keywords for a tracking.",
    method: "GET",
    path: "/serpwatcher/trackings/{tracking_id}/tracked-keywords",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_add_tracked_keyword",
    description: "Track another keyword in a SERPWatcher tracking.",
    method: "POST",
    path: "/serpwatcher/trackings/{tracking_id}/tracked-keywords",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_delete_tracked_keyword",
    description: "Remove a keyword from a SERPWatcher tracking.",
    method: "DELETE",
    path: "/serpwatcher/trackings/{tracking_id}/tracked-keywords",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_tracked_keyword_detail",
    description: "Get one tracked keyword in a SERPWatcher tracking.",
    method: "GET",
    path: "/serpwatcher/trackings/{tracking_id}/tracked-keywords/{tracked_keyword_id}",
    pathParams: ["tracking_id", "tracked_keyword_id"],
    properties: { ...trackingId, ...trackedKeywordId },
  }),
  endpointTool({
    name: "serpwatcher_reports",
    description: "Get all SERPWatcher reports for a tracking.",
    method: "GET",
    path: "/serpwatcher/trackings/{tracking_id}/reports",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_create_report",
    description: "Create a new SERPWatcher report.",
    method: "POST",
    path: "/serpwatcher/trackings/{tracking_id}/reports",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_delete_report",
    description: "Delete a SERPWatcher report.",
    method: "DELETE",
    path: "/serpwatcher/trackings/{tracking_id}/reports/{report_id}",
    pathParams: ["tracking_id", "report_id"],
    properties: { ...trackingId, ...reportId },
  }),
  endpointTool({
    name: "serpwatcher_update_report",
    description: "Update a SERPWatcher report.",
    method: "PUT",
    path: "/serpwatcher/trackings/{tracking_id}/reports/{report_id}",
    pathParams: ["tracking_id", "report_id"],
    properties: { ...trackingId, ...reportId },
  }),
  endpointTool({
    name: "serpwatcher_create_annotation",
    description: "Create a SERPWatcher annotation.",
    method: "POST",
    path: "/serpwatcher/trackings/{tracking_id}/annotations",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_delete_annotation",
    description: "Delete a SERPWatcher annotation.",
    method: "DELETE",
    path: "/serpwatcher/trackings/{tracking_id}/annotations/{annotation_id}",
    pathParams: ["tracking_id", "annotation_id"],
    properties: { ...trackingId, ...annotationId },
  }),
  endpointTool({
    name: "serpwatcher_update_annotation",
    description: "Update SERPWatcher annotation text.",
    method: "PUT",
    path: "/serpwatcher/trackings/{tracking_id}/annotations/{annotation_id}",
    pathParams: ["tracking_id", "annotation_id"],
    properties: { ...trackingId, ...annotationId },
  }),
  endpointTool({
    name: "serpwatcher_tags",
    description: "Get all SERPWatcher tags.",
    method: "GET",
    path: "/serpwatcher/tags",
  }),
  endpointTool({
    name: "serpwatcher_tracking_tags",
    description: "Get all tags for a SERPWatcher tracking.",
    method: "GET",
    path: "/serpwatcher/trackings/{tracking_id}/tags",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_create_tracking_tag",
    description: "Create a new tag for a SERPWatcher tracking.",
    method: "POST",
    path: "/serpwatcher/trackings/{tracking_id}/tags",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_delete_tracking_tag",
    description: "Delete a tag from a SERPWatcher tracking.",
    method: "DELETE",
    path: "/serpwatcher/trackings/{tracking_id}/tags",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_update_tag",
    description: "Update a SERPWatcher tag.",
    method: "PUT",
    path: "/serpwatcher/trackings/{tracking_id}/tags/{tag_id}",
    pathParams: ["tracking_id", "tag_id"],
    properties: { ...trackingId, ...tagId },
  }),
  endpointTool({
    name: "serpwatcher_assign_tag",
    description: "Assign a tag to a SERPWatcher tracking.",
    method: "POST",
    path: "/serpwatcher/trackings/{tracking_id}/tags/assign",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
  endpointTool({
    name: "serpwatcher_unassign_tag",
    description: "Unassign a tag from a SERPWatcher tracking.",
    method: "POST",
    path: "/serpwatcher/trackings/{tracking_id}/tags/unassign",
    pathParams: ["tracking_id"],
    properties: trackingId,
  }),
];
