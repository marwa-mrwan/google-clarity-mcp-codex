import { google } from "googleapis";

export function getSearchConsoleTools() {
  return [
    {
      name: "gsc_list_sites",
      description: "List all verified sites available in Google Search Console.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "gsc_performance",
      description:
        "Get Google Search Console performance data, including clicks, impressions, CTR, and position.",
      inputSchema: {
        type: "object",
        properties: {
          site_url: {
            type: "string",
            description: "Site URL, for example https://example.com/ or sc-domain:example.com.",
          },
          start_date: {
            type: "string",
            description: "Start date in YYYY-MM-DD format.",
          },
          end_date: {
            type: "string",
            description: "End date in YYYY-MM-DD format.",
          },
          dimensions: {
            type: "array",
            items: { type: "string", enum: ["query", "page", "country", "device", "date"] },
            description: "Report dimensions. Optional, defaults to query.",
          },
          row_limit: {
            type: "number",
            description: "Number of rows. Defaults to 25, max 1000.",
          },
        },
        required: ["site_url", "start_date", "end_date"],
      },
    },
    {
      name: "gsc_inspect_url",
      description: "Inspect a specific URL in Google Search Console.",
      inputSchema: {
        type: "object",
        properties: {
          site_url: {
            type: "string",
            description: "Verified Search Console site URL.",
          },
          inspect_url: {
            type: "string",
            description: "The URL to inspect.",
          },
        },
        required: ["site_url", "inspect_url"],
      },
    },
    {
      name: "gsc_sitemaps",
      description: "List submitted sitemaps for a Search Console site.",
      inputSchema: {
        type: "object",
        properties: {
          site_url: {
            type: "string",
            description: "Site URL.",
          },
        },
        required: ["site_url"],
      },
    },
  ];
}

export async function handleSearchConsoleTool(name, args, authClient) {
  const sc = google.searchconsole({ version: "v1", auth: authClient });
  const webmasters = google.webmasters({ version: "v3", auth: authClient });

  if (name === "gsc_list_sites") {
    const res = await webmasters.sites.list();
    const sites = res.data.siteEntry || [];
    return sites.map((s) => ({
      url: s.siteUrl,
      permissionLevel: s.permissionLevel,
    }));
  }

  if (name === "gsc_performance") {
    const { site_url, start_date, end_date, dimensions = ["query"], row_limit = 25 } = args;
    const res = await webmasters.searchanalytics.query({
      siteUrl: site_url,
      requestBody: {
        startDate: start_date,
        endDate: end_date,
        dimensions,
        rowLimit: Math.min(row_limit, 1000),
      },
    });
    return res.data.rows || [];
  }

  if (name === "gsc_inspect_url") {
    const res = await sc.urlInspection.index.inspect({
      requestBody: {
        siteUrl: args.site_url,
        inspectionUrl: args.inspect_url,
      },
    });
    return res.data.inspectionResult;
  }

  if (name === "gsc_sitemaps") {
    const res = await webmasters.sitemaps.list({ siteUrl: args.site_url });
    return res.data.sitemap || [];
  }

  throw new Error(`Unknown Search Console tool: ${name}`);
}
