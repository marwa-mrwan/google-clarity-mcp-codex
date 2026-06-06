import { google } from "googleapis";
import {
  listSafeAnalyticsProperties,
  resolveAnalyticsProperty,
} from "./analytics-properties.js";

export function getAnalyticsTools() {
  return [
    {
      name: "ga4_list_properties",
      description: "List all Google Analytics 4 properties available to the authenticated user.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "ga4_list_configured_properties",
      description:
        "List locally configured GA4 project mappings from the MCP secrets file, including project name, website, and property ID.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "ga4_run_report",
      description: "Run a custom GA4 report with selected metrics and dimensions.",
      inputSchema: {
        type: "object",
        properties: {
          property_id: {
            type: "string",
            description: "GA4 property ID, numbers only. Example: 123456789.",
          },
          project_name: {
            type: "string",
            description:
              "Configured project name from ga4_list_configured_properties. Used when property_id is omitted.",
          },
          website: {
            type: "string",
            description:
              "Configured website URL from ga4_list_configured_properties. Used when property_id is omitted.",
          },
          start_date: {
            type: "string",
            description: "Start date, for example 2024-01-01 or 30daysAgo.",
          },
          end_date: {
            type: "string",
            description: "End date, for example 2024-12-31 or today.",
          },
          metrics: {
            type: "array",
            items: { type: "string" },
            description:
              "Metrics such as sessions, activeUsers, newUsers, bounceRate, conversions, or totalRevenue.",
          },
          dimensions: {
            type: "array",
            items: { type: "string" },
            description:
              "Dimensions such as country, city, deviceCategory, sessionSource, pagePath, or date.",
          },
          limit: {
            type: "number",
            description: "Maximum number of rows. Defaults to 20.",
          },
        },
        required: ["start_date", "end_date", "metrics"],
      },
    },
    {
      name: "ga4_realtime",
      description: "Get current realtime GA4 data.",
      inputSchema: {
        type: "object",
        properties: {
          property_id: {
            type: "string",
            description: "GA4 property ID.",
          },
          project_name: {
            type: "string",
            description:
              "Configured project name from ga4_list_configured_properties. Used when property_id is omitted.",
          },
          website: {
            type: "string",
            description:
              "Configured website URL from ga4_list_configured_properties. Used when property_id is omitted.",
          },
          dimensions: {
            type: "array",
            items: { type: "string" },
            description: "Realtime dimensions such as country, city, unifiedScreenName, or deviceCategory.",
          },
        },
        required: [],
      },
    },
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
    const token = (await authClient.getAccessToken()).token;
    const { default: axios } = await import("axios");

    const res = await axios.post(
      `https://analyticsdata.googleapis.com/v1beta/properties/${property_id}:runReport`,
      {
        dateRanges: [{ startDate: start_date, endDate: end_date }],
        metrics: metrics.map((m) => ({ name: m })),
        dimensions: dimensions.map((d) => ({ name: d })),
        limit,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = res.data;
    const rows = (data.rows || []).map((row) => {
      const result = {};
      (data.dimensionHeaders || []).forEach((h, i) => {
        result[h.name] = row.dimensionValues?.[i]?.value;
      });
      (data.metricHeaders || []).forEach((h, i) => {
        result[h.name] = row.metricValues?.[i]?.value;
      });
      return result;
    });

    return {
      rowCount: data.rowCount,
      rows,
    };
  }

  if (name === "ga4_realtime") {
    const { dimensions = ["country"] } = args;
    const property_id = resolveAnalyticsProperty(args);
    const token = (await authClient.getAccessToken()).token;
    const { default: axios } = await import("axios");

    const res = await axios.post(
      `https://analyticsdata.googleapis.com/v1beta/properties/${property_id}:runRealtimeReport`,
      {
        metrics: [{ name: "activeUsers" }],
        dimensions: dimensions.map((d) => ({ name: d })),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = res.data;
    const rows = (data.rows || []).map((row) => {
      const result = {};
      (data.dimensionHeaders || []).forEach((h, i) => {
        result[h.name] = row.dimensionValues?.[i]?.value;
      });
      (data.metricHeaders || []).forEach((h, i) => {
        result[h.name] = row.metricValues?.[i]?.value;
      });
      return result;
    });

    return {
      totalActiveUsers: rows.reduce((s, r) => s + Number(r.activeUsers || 0), 0),
      breakdown: rows,
    };
  }

  throw new Error(`Unknown GA4 tool: ${name}`);
}
