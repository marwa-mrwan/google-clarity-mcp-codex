import { google } from "googleapis";
import {
  listSafeAnalyticsProperties,
  resolveAnalyticsProperty,
} from "./analytics-properties.js";

const GA4_DATA_BASE = "https://analyticsdata.googleapis.com";
const GA4_ADMIN_BASE = "https://analyticsadmin.googleapis.com/v1beta";

const propertySelectors = {
  property_id: {
    type: "string",
    description: "GA4 property ID, numbers only. Example: 123456789.",
  },
  project_name: {
    type: "string",
    description: "Configured project name from ga4_list_configured_properties. Used when property_id is omitted.",
  },
  website: {
    type: "string",
    description: "Configured website URL from ga4_list_configured_properties. Used when property_id is omitted.",
  },
};

const confirmProperty = {
  confirm: {
    type: "boolean",
    description: "Must be true before write, archive, or delete requests execute.",
    default: false,
  },
};

const tool = (name, description, properties = {}, required = []) => ({
  name,
  description,
  inputSchema: {
    type: "object",
    properties,
    required,
  },
});

const listAdminTool = (name, description, collectionPathDescription) =>
  tool(
    name,
    description,
    {
      ...propertySelectors,
      parent: {
        type: "string",
        description: collectionPathDescription || "Optional parent resource path. Defaults to properties/{property_id}.",
      },
      page_size: { type: "number", description: "Optional page size." },
    },
    []
  );

function rowsFromRunReport(data) {
  return (data.rows || []).map((row) => {
    const result = {};
    (data.dimensionHeaders || []).forEach((h, i) => {
      result[h.name] = row.dimensionValues?.[i]?.value;
    });
    (data.metricHeaders || []).forEach((h, i) => {
      result[h.name] = row.metricValues?.[i]?.value;
    });
    return result;
  });
}

function cleanPath(path) {
  return String(path || "").replace(/^\/+/, "");
}

function withQuery(url, query = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query || {})) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

function requireConfirm(args, action) {
  if (args.confirm !== true) {
    throw new Error(`${action} requires confirm=true.`);
  }
}

async function authHeaders(authClient) {
  const token = (await authClient.getAccessToken()).token;
  return { Authorization: `Bearer ${token}` };
}

async function dataRequest(authClient, method, path, body) {
  const { default: axios } = await import("axios");
  const res = await axios({
    method,
    url: `${GA4_DATA_BASE}/${cleanPath(path)}`,
    data: body,
    headers: await authHeaders(authClient),
  });
  return res.data;
}

async function adminRequest(authClient, method, path, { query, body } = {}) {
  const { default: axios } = await import("axios");
  const res = await axios({
    method,
    url: withQuery(`${GA4_ADMIN_BASE}/${cleanPath(path)}`, query),
    data: body,
    headers: await authHeaders(authClient),
  });
  return res.data || {};
}

function propertyName(args) {
  return `properties/${resolveAnalyticsProperty(args)}`;
}

async function listAdminCollection(authClient, args, suffix, responseKey) {
  const parent = args.parent || propertyName(args);
  return adminRequest(authClient, "GET", `${parent}/${suffix}`, {
    query: { pageSize: args.page_size },
  }).then((data) => data[responseKey] || []);
}

export function getAnalyticsTools() {
  return [
    tool("ga4_list_properties", "List all Google Analytics 4 properties available to the authenticated user."),
    tool(
      "ga4_list_configured_properties",
      "List locally configured GA4 project mappings from the MCP secrets file, including project name, website, and property ID."
    ),
    tool(
      "ga4_run_report",
      "Run a custom GA4 report with selected metrics and dimensions.",
      {
        ...propertySelectors,
        start_date: { type: "string", description: "Start date, for example 2024-01-01 or 30daysAgo." },
        end_date: { type: "string", description: "End date, for example 2024-12-31 or today." },
        metrics: { type: "array", items: { type: "string" }, description: "GA4 metric names." },
        dimensions: { type: "array", items: { type: "string" }, description: "GA4 dimension names." },
        limit: { type: "number", description: "Maximum number of rows. Defaults to 20." },
        dimension_filter: { type: "object", description: "Optional raw GA4 dimensionFilter." },
        metric_filter: { type: "object", description: "Optional raw GA4 metricFilter." },
        order_bys: { type: "array", items: { type: "object" }, description: "Optional raw GA4 orderBys." },
      },
      ["start_date", "end_date", "metrics"]
    ),
    tool(
      "ga4_batch_run_reports",
      "Run multiple GA4 reports in one Data API request.",
      {
        ...propertySelectors,
        requests: { type: "array", items: { type: "object" }, description: "Raw Data API RunReportRequest objects." },
      },
      ["requests"]
    ),
    tool(
      "ga4_pivot_report",
      "Run a GA4 pivot report using a raw RunPivotReportRequest body.",
      {
        ...propertySelectors,
        request_body: { type: "object", description: "Raw Data API RunPivotReportRequest body." },
      },
      ["request_body"]
    ),
    tool(
      "ga4_metadata",
      "Get GA4 dimensions, metrics, and compatibility metadata for a property.",
      propertySelectors
    ),
    tool(
      "ga4_check_compatibility",
      "Check whether selected GA4 metrics and dimensions are compatible.",
      {
        ...propertySelectors,
        metrics: { type: "array", items: { type: "string" }, description: "Metric names to check." },
        dimensions: { type: "array", items: { type: "string" }, description: "Dimension names to check." },
        compatibility_filter: { type: "string", description: "Optional compatibility filter enum." },
      },
      []
    ),
    tool(
      "ga4_realtime",
      "Get current realtime GA4 data.",
      {
        ...propertySelectors,
        dimensions: {
          type: "array",
          items: { type: "string" },
          description: "Realtime dimensions such as country, city, unifiedScreenName, or deviceCategory.",
        },
      }
    ),
    listAdminTool("ga4_list_data_streams", "List GA4 data streams for a property."),
    listAdminTool("ga4_list_key_events", "List GA4 key events for a property."),
    listAdminTool("ga4_list_conversion_events", "List GA4 conversion events for a property."),
    listAdminTool("ga4_list_custom_dimensions", "List GA4 custom dimensions for a property."),
    listAdminTool("ga4_list_custom_metrics", "List GA4 custom metrics for a property."),
    listAdminTool("ga4_list_google_ads_links", "List Google Ads links for a GA4 property."),
    listAdminTool("ga4_list_audiences", "List GA4 audiences for a property."),
    tool("ga4_get_property", "Get GA4 property admin details.", propertySelectors),
    tool("ga4_get_data_retention_settings", "Get GA4 data retention settings.", propertySelectors),
    tool(
      "ga4_search_change_history",
      "Search GA4 Admin change history events.",
      {
        ...propertySelectors,
        request_body: { type: "object", description: "Raw SearchChangeHistoryEventsRequest body." },
      },
      ["request_body"]
    ),
    tool(
      "ga4_run_access_report",
      "Run a GA4 Admin access report for a property.",
      {
        ...propertySelectors,
        request_body: { type: "object", description: "Raw RunAccessReportRequest body." },
      },
      ["request_body"]
    ),
    tool(
      "ga4_property_audit",
      "Collect key GA4 admin configuration for tracking audits: streams, key events, conversions, custom definitions, Google Ads links, audiences, and retention.",
      propertySelectors
    ),
    tool(
      "ga4_admin_api_call",
      "Advanced GA4 Admin API call for create/update/delete/archive operations not covered by named tools. Non-GET requests require confirm=true.",
      {
        method: { type: "string", enum: ["GET", "POST", "PATCH", "PUT", "DELETE"], description: "HTTP method." },
        path: { type: "string", description: "Path relative to https://analyticsadmin.googleapis.com/v1beta/." },
        query: { type: "object", description: "Optional query parameters." },
        body: { type: "object", description: "Optional request body." },
        ...confirmProperty,
      },
      ["method", "path"]
    ),
  ];
}

export async function handleAnalyticsTool(name, args, authClient) {
  if (name === "ga4_list_configured_properties") {
    return listSafeAnalyticsProperties();
  }

  if (name === "ga4_list_properties") {
    const analyticsAdmin = google.analyticsadmin({ version: "v1beta", auth: authClient });
    const accountsRes = await analyticsAdmin.accounts.list();
    const accounts = accountsRes.data.accounts || [];

    const allProperties = [];
    for (const account of accounts) {
      try {
        const propsRes = await analyticsAdmin.properties.list({
          filter: `parent:${account.name}`,
        });
        const props = propsRes.data.properties || [];
        props.forEach((p) => {
          allProperties.push({
            propertyId: p.name.replace("properties/", ""),
            displayName: p.displayName,
            accountName: account.displayName,
            timeZone: p.timeZone,
            currencyCode: p.currencyCode,
            industryCategory: p.industryCategory,
          });
        });
      } catch {}
    }
    return allProperties;
  }

  if (name === "ga4_run_report") {
    const { start_date, end_date, metrics, dimensions = [], limit = 20 } = args;
    const property_id = resolveAnalyticsProperty(args);
    const data = await dataRequest(authClient, "POST", `v1beta/properties/${property_id}:runReport`, {
      dateRanges: [{ startDate: start_date, endDate: end_date }],
      metrics: metrics.map((m) => ({ name: m })),
      dimensions: dimensions.map((d) => ({ name: d })),
      limit,
      dimensionFilter: args.dimension_filter,
      metricFilter: args.metric_filter,
      orderBys: args.order_bys,
    });
    return { rowCount: data.rowCount, rows: rowsFromRunReport(data), metadata: data.metadata };
  }

  if (name === "ga4_batch_run_reports") {
    const property_id = resolveAnalyticsProperty(args);
    return dataRequest(authClient, "POST", `v1beta/properties/${property_id}:batchRunReports`, {
      requests: args.requests,
    });
  }

  if (name === "ga4_pivot_report") {
    const property_id = resolveAnalyticsProperty(args);
    return dataRequest(authClient, "POST", `v1beta/properties/${property_id}:runPivotReport`, args.request_body);
  }

  if (name === "ga4_metadata") {
    const property_id = resolveAnalyticsProperty(args);
    return dataRequest(authClient, "GET", `v1beta/properties/${property_id}/metadata`);
  }

  if (name === "ga4_check_compatibility") {
    const property_id = resolveAnalyticsProperty(args);
    return dataRequest(authClient, "POST", `v1beta/properties/${property_id}:checkCompatibility`, {
      metrics: (args.metrics || []).map((m) => ({ name: m })),
      dimensions: (args.dimensions || []).map((d) => ({ name: d })),
      compatibilityFilter: args.compatibility_filter,
    });
  }

  if (name === "ga4_realtime") {
    const { dimensions = ["country"] } = args;
    const property_id = resolveAnalyticsProperty(args);
    const data = await dataRequest(authClient, "POST", `v1beta/properties/${property_id}:runRealtimeReport`, {
      metrics: [{ name: "activeUsers" }],
      dimensions: dimensions.map((d) => ({ name: d })),
    });
    const rows = rowsFromRunReport(data);
    return {
      totalActiveUsers: rows.reduce((s, r) => s + Number(r.activeUsers || 0), 0),
      breakdown: rows,
    };
  }

  if (name === "ga4_get_property") {
    return adminRequest(authClient, "GET", propertyName(args));
  }

  if (name === "ga4_get_data_retention_settings") {
    return adminRequest(authClient, "GET", `${propertyName(args)}/dataRetentionSettings`);
  }

  if (name === "ga4_list_data_streams") {
    return listAdminCollection(authClient, args, "dataStreams", "dataStreams");
  }
  if (name === "ga4_list_key_events") {
    return listAdminCollection(authClient, args, "keyEvents", "keyEvents");
  }
  if (name === "ga4_list_conversion_events") {
    return listAdminCollection(authClient, args, "conversionEvents", "conversionEvents");
  }
  if (name === "ga4_list_custom_dimensions") {
    return listAdminCollection(authClient, args, "customDimensions", "customDimensions");
  }
  if (name === "ga4_list_custom_metrics") {
    return listAdminCollection(authClient, args, "customMetrics", "customMetrics");
  }
  if (name === "ga4_list_google_ads_links") {
    return listAdminCollection(authClient, args, "googleAdsLinks", "googleAdsLinks");
  }
  if (name === "ga4_list_audiences") {
    return listAdminCollection(authClient, args, "audiences", "audiences");
  }

  if (name === "ga4_search_change_history") {
    return adminRequest(authClient, "POST", `${propertyName(args)}:searchChangeHistoryEvents`, {
      body: args.request_body,
    });
  }

  if (name === "ga4_run_access_report") {
    return adminRequest(authClient, "POST", `${propertyName(args)}:runAccessReport`, {
      body: args.request_body,
    });
  }

  if (name === "ga4_property_audit") {
    const [property, streams, keyEvents, conversions, customDimensions, customMetrics, adsLinks, audiences, retention] =
      await Promise.allSettled([
        adminRequest(authClient, "GET", propertyName(args)),
        listAdminCollection(authClient, args, "dataStreams", "dataStreams"),
        listAdminCollection(authClient, args, "keyEvents", "keyEvents"),
        listAdminCollection(authClient, args, "conversionEvents", "conversionEvents"),
        listAdminCollection(authClient, args, "customDimensions", "customDimensions"),
        listAdminCollection(authClient, args, "customMetrics", "customMetrics"),
        listAdminCollection(authClient, args, "googleAdsLinks", "googleAdsLinks"),
        listAdminCollection(authClient, args, "audiences", "audiences"),
        adminRequest(authClient, "GET", `${propertyName(args)}/dataRetentionSettings`),
      ]);
    const unwrap = (result) => (result.status === "fulfilled" ? result.value : { error: result.reason.message });
    return {
      property: unwrap(property),
      dataStreams: unwrap(streams),
      keyEvents: unwrap(keyEvents),
      conversionEvents: unwrap(conversions),
      customDimensions: unwrap(customDimensions),
      customMetrics: unwrap(customMetrics),
      googleAdsLinks: unwrap(adsLinks),
      audiences: unwrap(audiences),
      dataRetentionSettings: unwrap(retention),
    };
  }

  if (name === "ga4_admin_api_call") {
    const method = String(args.method || "GET").toUpperCase();
    if (method !== "GET") requireConfirm(args, `ga4_admin_api_call ${method}`);
    return adminRequest(authClient, method, args.path, {
      query: args.query,
      body: args.body,
    });
  }

  throw new Error(`Unknown GA4 tool: ${name}`);
}
