import { handleAdsTool } from "./ads.js";
import { handleAnalyticsTool } from "./analytics.js";
import { handleSearchConsoleTool } from "./search-console.js";
import { handleBusinessProfileTool } from "./business-profile.js";
import { handleMerchantCenterTool } from "./merchant-center.js";
import { handlePageSpeedTool } from "./pagespeed.js";

function addMonths(value, delta) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + delta);
  return date.toISOString().slice(0, 7);
}

async function safeSection(sections, key, fn) {
  try {
    sections[key] = { ok: true, data: await fn() };
  } catch (error) {
    sections[key] = { ok: false, error: error.message };
  }
}

export function getReportingTools() {
  return [
    {
      name: "marketing_full_report",
      description: "Build a cross-channel marketing report using the configured Google and marketing connectors.",
      inputSchema: {
        type: "object",
        properties: {
          start_date: {
            type: "string",
            description: "Start date in YYYY-MM-DD format.",
          },
          end_date: {
            type: "string",
            description: "End date in YYYY-MM-DD format.",
          },
          ads_customer_id: {
            type: "string",
            description: "Optional Google Ads customer ID. If omitted, the first accessible account or client account is used.",
          },
          ga4_property_id: {
            type: "string",
            description: "Optional GA4 property ID. If omitted, the first accessible property is used.",
          },
          gsc_site_url: {
            type: "string",
            description: "Optional Search Console site URL. If omitted, the first verified site is used.",
          },
          merchant_account_id: {
            type: "string",
            description: "Optional Merchant Center account ID. If omitted, the first accessible account is used.",
          },
          gbp_location_name: {
            type: "string",
            description: "Optional Business Profile location resource name. If omitted, the first location from the first account is used.",
          },
          page_url: {
            type: "string",
            description: "Optional URL to audit with PageSpeed Insights.",
          },
        },
        required: ["start_date", "end_date"],
      },
    },
  ];
}

export async function handleReportingTool(name, args, authClient) {
  if (name !== "marketing_full_report") {
    throw new Error(`Unknown reporting tool: ${name}`);
  }

  const {
    start_date,
    end_date,
    ads_customer_id,
    ga4_property_id,
    gsc_site_url,
    merchant_account_id,
    gbp_location_name,
    page_url,
  } = args;

  const report = {
    reportRange: { startDate: start_date, endDate: end_date },
    sections: {},
  };

  await safeSection(report.sections, "googleAds", async () => {
    let customerId = ads_customer_id;
    if (!customerId) {
      const accounts = await handleAdsTool("ads_list_accounts", {}, authClient);
      const first = accounts[0];
      customerId = first?.clientAccounts?.[0]?.id || first?.id;
    }
    if (!customerId) {
      throw new Error("No Google Ads customer ID available.");
    }
    return {
      customerId,
      accountPerformance: await handleAdsTool(
        "ads_account_performance",
        { customer_id: customerId, start_date, end_date },
        authClient
      ),
      campaigns: await handleAdsTool(
        "ads_list_campaigns",
        { customer_id: customerId, start_date, end_date },
        authClient
      ),
      adGroups: await handleAdsTool(
        "ads_list_ad_groups",
        { customer_id: customerId, start_date, end_date },
        authClient
      ),
      topAds: await handleAdsTool(
        "ads_list_ads",
        { customer_id: customerId, start_date, end_date, limit: 20 },
        authClient
      ),
      topKeywords: await handleAdsTool(
        "ads_keyword_performance",
        { customer_id: customerId, start_date, end_date },
        authClient
      ),
    };
  });

  await safeSection(report.sections, "ga4", async () => {
    let propertyId = ga4_property_id;
    if (!propertyId) {
      const properties = await handleAnalyticsTool("ga4_list_properties", {}, authClient);
      propertyId = properties[0]?.propertyId;
    }
    if (!propertyId) {
      throw new Error("No GA4 property ID available.");
    }
    return {
      propertyId,
      acquisition: await handleAnalyticsTool(
        "ga4_run_report",
        {
          property_id: propertyId,
          start_date,
          end_date,
          dimensions: ["sessionSource", "sessionMedium"],
          metrics: ["sessions", "activeUsers", "conversions", "totalRevenue"],
          limit: 20,
        },
        authClient
      ),
      landingPages: await handleAnalyticsTool(
        "ga4_run_report",
        {
          property_id: propertyId,
          start_date,
          end_date,
          dimensions: ["landingPage"],
          metrics: ["sessions", "activeUsers", "conversions"],
          limit: 20,
        },
        authClient
      ),
    };
  });

  await safeSection(report.sections, "searchConsole", async () => {
    let siteUrl = gsc_site_url;
    if (!siteUrl) {
      const sites = await handleSearchConsoleTool("gsc_list_sites", {}, authClient);
      siteUrl = sites[0]?.url;
    }
    if (!siteUrl) {
      throw new Error("No Search Console site URL available.");
    }
    return {
      siteUrl,
      topQueries: await handleSearchConsoleTool(
        "gsc_performance",
        { site_url: siteUrl, start_date, end_date, dimensions: ["query"], row_limit: 25 },
        authClient
      ),
      topPages: await handleSearchConsoleTool(
        "gsc_performance",
        { site_url: siteUrl, start_date, end_date, dimensions: ["page"], row_limit: 25 },
        authClient
      ),
    };
  });

  await safeSection(report.sections, "businessProfile", async () => {
    let locationName = gbp_location_name;
    if (!locationName) {
      const accounts = await handleBusinessProfileTool("gbp_list_accounts", {}, authClient);
      const accountName = accounts[0]?.name;
      if (!accountName) {
        throw new Error("No Business Profile account available.");
      }
      const locations = await handleBusinessProfileTool(
        "gbp_list_locations",
        { account_name: accountName, page_size: 10 },
        authClient
      );
      locationName = locations[0]?.name;
    }
    if (!locationName) {
      throw new Error("No Business Profile location available.");
    }
    return {
      locationName,
      location: await handleBusinessProfileTool(
        "gbp_get_location",
        { location_name: locationName },
        authClient
      ),
      performance: await handleBusinessProfileTool(
        "gbp_performance",
        {
          location_name: locationName,
          start_date,
          end_date,
          daily_metrics: [
            "WEBSITE_CLICKS",
            "CALL_CLICKS",
            "BUSINESS_DIRECTION_REQUESTS",
            "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
            "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
            "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
            "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
          ],
        },
        authClient
      ),
      searchKeywords: await handleBusinessProfileTool(
        "gbp_search_keyword_impressions",
        {
          location_name: locationName,
          start_month: start_date.slice(0, 7),
          end_month: end_date.slice(0, 7),
          page_size: 50,
        },
        authClient
      ),
    };
  });

  await safeSection(report.sections, "merchantCenter", async () => {
    let accountId = merchant_account_id;
    if (!accountId) {
      const accounts = await handleMerchantCenterTool("merchant_list_accounts", {}, authClient);
      accountId = accounts[0]?.accountId;
    }
    if (!accountId) {
      throw new Error("No Merchant Center account ID available.");
    }
    return {
      accountId,
      products: await handleMerchantCenterTool(
        "merchant_list_products",
        { account_id: accountId, page_size: 20 },
        authClient
      ),
      issues: await handleMerchantCenterTool(
        "merchant_list_issues",
        { account_id: accountId, page_size: 20 },
        authClient
      ),
      productPerformance: await handleMerchantCenterTool(
        "merchant_search_report",
        {
          account_id: accountId,
          query: `SELECT offer_id, title, clicks, impressions, click_through_rate
                  FROM product_performance_view
                  WHERE date BETWEEN '${start_date}' AND '${end_date}'
                  ORDER BY clicks DESC
                  LIMIT 20`,
          page_size: 100,
        },
        authClient
      ),
    };
  });

  await safeSection(report.sections, "pageSpeed", async () => {
    const url = page_url || report.sections.searchConsole?.data?.topPages?.[0]?.keys?.[0];
    if (!url) {
      throw new Error("No page URL provided for PageSpeed Insights.");
    }
    return {
      url,
      mobile: await handlePageSpeedTool("psi_audit_url", { url, strategy: "mobile" }, authClient),
      desktop: await handlePageSpeedTool("psi_audit_url", { url, strategy: "desktop" }, authClient),
    };
  });

  report.notes = [
    "Google Trends is not included in this report tool because Google's public Trends API is still gated behind limited alpha access as of April 27, 2026.",
    "If new scopes were added after the current refresh token was issued, rerun OAuth auth to grant them.",
  ];

  return report;
}
