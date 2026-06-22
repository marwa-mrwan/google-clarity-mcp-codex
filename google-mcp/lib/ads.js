/**
 * Google Ads tools.
 * Requires GOOGLE_ADS_DEVELOPER_TOKEN and, when needed, GOOGLE_ADS_LOGIN_CUSTOMER_ID.
 */

import axios from "axios";

const DEFAULT_ADS_VERSIONS = ["v24", "v23", "v22", "v21"];
let ADS_API_BASE = null;

function getAdsVersions() {
  const configuredVersion = process.env.GOOGLE_ADS_API_VERSION?.trim();
  if (!configuredVersion) {
    return DEFAULT_ADS_VERSIONS;
  }

  const normalizedVersion = configuredVersion.startsWith("v")
    ? configuredVersion
    : `v${configuredVersion}`;

  return [
    normalizedVersion,
    ...DEFAULT_ADS_VERSIONS.filter((version) => version !== normalizedVersion),
  ];
}

function findGoogleAdsErrors(value) {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(findGoogleAdsErrors);
  }

  const currentErrors = Array.isArray(value.errors) ? value.errors : [];
  const nestedErrors = Object.values(value).flatMap(findGoogleAdsErrors);
  return [...currentErrors, ...nestedErrors];
}

function isUnsupportedGoogleAdsVersion(error) {
  const apiErrors = findGoogleAdsErrors(error.response?.data?.error);
  return apiErrors.some(
    (apiError) => apiError.errorCode?.requestError === "UNSUPPORTED_VERSION"
  );
}

async function getWorkingBase(token, developerToken) {
  if (ADS_API_BASE) return ADS_API_BASE;
  for (const version of getAdsVersions()) {
    try {
      await axios.get(
        `https://googleads.googleapis.com/${version}/customers:listAccessibleCustomers`,
        { headers: { Authorization: `Bearer ${token}`, "developer-token": developerToken } }
      );
      ADS_API_BASE = `https://googleads.googleapis.com/${version}`;
      return ADS_API_BASE;
    } catch (err) {
      if (err.response?.status !== 404 && !isUnsupportedGoogleAdsVersion(err)) {
        throw err;
      }
    }
  }
  throw new Error(
    `Could not find a working Google Ads API version. Tried: ${getAdsVersions().join(", ")}.`
  );
}

async function adsRequest(endpoint, body, authClient, developerToken, loginCustomerId) {
  const token = (await authClient.getAccessToken()).token;
  const base = await getWorkingBase(token, developerToken);
  const headers = {
    Authorization: `Bearer ${token}`,
    "developer-token": developerToken,
    "Content-Type": "application/json",
  };
  if (loginCustomerId) {
    headers["login-customer-id"] = loginCustomerId;
  }
  const res = await axios.post(`${base}${endpoint}`, body, { headers });
  return res.data;
}

export function getAdsTools() {
  return [
    {
      name: "ads_list_accounts",
      description: "List Google Ads accounts available to the authenticated user, including client accounts under accessible manager accounts when available.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "ads_list_client_accounts",
      description: "List client accounts under a Google Ads manager account.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: {
            type: "string",
            description: "Manager customer ID without dashes.",
          },
        },
        required: ["customer_id"],
      },
    },
    {
      name: "ads_list_campaigns",
      description: "List campaigns in a Google Ads account with performance metrics.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: {
            type: "string",
            description: "Customer ID without dashes. Example: 1234567890.",
          },
          start_date: {
            type: "string",
            description: "Optional start date in YYYY-MM-DD format.",
          },
          end_date: {
            type: "string",
            description: "Optional end date in YYYY-MM-DD format.",
          },
        },
        required: ["customer_id"],
      },
    },
    {
      name: "ads_keyword_performance",
      description: "Get keyword performance for a Google Ads account.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: {
            type: "string",
            description: "Customer ID without dashes.",
          },
          start_date: { type: "string", description: "Optional start date in YYYY-MM-DD format." },
          end_date: { type: "string", description: "Optional end date in YYYY-MM-DD format." },
          campaign_id: {
            type: "string",
            description: "Optional campaign ID filter.",
          },
        },
        required: ["customer_id"],
      },
    },
    {
      name: "ads_search_terms",
      description: "Get Google Ads Search terms report data from search_term_view, aggregated at ad group level. Does not include Performance Max.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: {
            type: "string",
            description: "Customer ID without dashes.",
          },
          start_date: { type: "string", description: "Optional start date in YYYY-MM-DD format." },
          end_date: { type: "string", description: "Optional end date in YYYY-MM-DD format." },
          campaign_id: {
            type: "string",
            description: "Optional campaign ID filter.",
          },
          ad_group_id: {
            type: "string",
            description: "Optional ad group ID filter.",
          },
          search_term_contains: {
            type: "string",
            description: "Optional case-sensitive substring filter for search terms.",
          },
          limit: {
            type: "number",
            description: "Maximum number of rows to return. Defaults to 100.",
            default: 100,
          },
        },
        required: ["customer_id"],
      },
    },
    {
      name: "ads_campaign_search_terms",
      description: "Get Google Ads campaign-level search terms report data from campaign_search_term_view, useful for campaign/PMax search term reporting where available.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: {
            type: "string",
            description: "Customer ID without dashes.",
          },
          start_date: { type: "string", description: "Optional start date in YYYY-MM-DD format." },
          end_date: { type: "string", description: "Optional end date in YYYY-MM-DD format." },
          campaign_id: {
            type: "string",
            description: "Optional campaign ID filter.",
          },
          search_term_contains: {
            type: "string",
            description: "Optional case-sensitive substring filter for search terms.",
          },
          limit: {
            type: "number",
            description: "Maximum number of rows to return. Defaults to 100.",
            default: 100,
          },
        },
        required: ["customer_id"],
      },
    },
    {
      name: "ads_list_ad_groups",
      description: "List ad groups in a Google Ads account with optional campaign filtering and performance metrics.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: {
            type: "string",
            description: "Customer ID without dashes.",
          },
          campaign_id: {
            type: "string",
            description: "Optional campaign ID filter.",
          },
          start_date: { type: "string", description: "Optional start date in YYYY-MM-DD format." },
          end_date: { type: "string", description: "Optional end date in YYYY-MM-DD format." },
        },
        required: ["customer_id"],
      },
    },
    {
      name: "ads_list_ads",
      description: "List ads with their ad group, campaign, creative text, final URLs, statuses, and performance metrics.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: {
            type: "string",
            description: "Customer ID without dashes.",
          },
          campaign_id: {
            type: "string",
            description: "Optional campaign ID filter.",
          },
          ad_group_id: {
            type: "string",
            description: "Optional ad group ID filter.",
          },
          start_date: { type: "string", description: "Optional start date in YYYY-MM-DD format." },
          end_date: { type: "string", description: "Optional end date in YYYY-MM-DD format." },
          limit: {
            type: "number",
            description: "Maximum number of ads to return. Defaults to 50.",
            default: 50,
          },
        },
        required: ["customer_id"],
      },
    },
    {
      name: "ads_keyword_ideas",
      description: "Get keyword ideas from Google Keyword Planner.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: {
            type: "string",
            description: "Customer ID without dashes.",
          },
          keywords: {
            type: "array",
            items: { type: "string" },
            description: "Seed keywords.",
          },
          language_id: {
            type: "string",
            description: "Google Ads language constant ID. 1000 is English, 1019 is Arabic.",
            default: "1000",
          },
          geo_target_ids: {
            type: "array",
            items: { type: "string" },
            description: "Google Ads geo target IDs. 2818 is Egypt, 2682 is Saudi Arabia.",
          },
        },
        required: ["customer_id", "keywords"],
      },
    },
    {
      name: "ads_keyword_historical_metrics",
      description: "Get historical keyword metrics from Google Ads Keyword Planner.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: {
            type: "string",
            description: "Customer ID without dashes.",
          },
          keywords: {
            type: "array",
            items: { type: "string" },
            description: "Keywords to evaluate.",
          },
          language_id: {
            type: "string",
            description: "Google Ads language constant ID. 1000 is English, 1019 is Arabic.",
            default: "1000",
          },
          geo_target_ids: {
            type: "array",
            items: { type: "string" },
            description: "Google Ads geo target IDs.",
          },
          include_average_cpc: {
            type: "boolean",
            description: "Whether to include average CPC in historical metrics.",
            default: true,
          },
        },
        required: ["customer_id", "keywords"],
      },
    },
    {
      name: "ads_account_performance",
      description: "Get an account-level performance summary with clicks, impressions, cost, and conversions.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: { type: "string", description: "Customer ID without dashes." },
          start_date: { type: "string", description: "Start date in YYYY-MM-DD format." },
          end_date: { type: "string", description: "End date in YYYY-MM-DD format." },
        },
        required: ["customer_id", "start_date", "end_date"],
      },
    },
    {
      name: "ads_gaql_query",
      description: "Run a custom read-only Google Ads GAQL SELECT query. Use for advanced analysis when a predefined tool is not enough.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: { type: "string", description: "Customer ID without dashes." },
          query: {
            type: "string",
            description: "Read-only GAQL query. Must start with SELECT.",
          },
        },
        required: ["customer_id", "query"],
      },
    },
    {
      name: "ads_deep_report",
      description: "Run predefined deep-analysis Google Ads reports for devices, locations, landing pages, demographics, assets, recommendations, budgets, conversion actions, negative keywords, and change history.",
      inputSchema: {
        type: "object",
        properties: {
          customer_id: { type: "string", description: "Customer ID without dashes." },
          report_type: {
            type: "string",
            enum: [
              "device_performance",
              "geo_performance",
              "user_location_performance",
              "landing_pages",
              "expanded_landing_pages",
              "age_range_performance",
              "gender_performance",
              "campaign_budgets",
              "conversion_actions",
              "recommendations",
              "change_events",
              "campaign_negative_keywords",
              "ad_group_negative_keywords",
              "shared_negative_keyword_sets",
              "negative_keyword_list_members",
              "negative_keyword_candidates",
              "auction_insights_campaign",
              "auction_insights_keyword",
              "asset_performance",
              "pmax_asset_groups",
              "pmax_asset_group_assets",
              "shopping_products",
              "user_lists",
              "custom_audiences",
              "campaign_audience_targets",
              "ad_group_audience_targets",
              "campaign_audience_performance",
              "ad_group_audience_performance",
              "webpage_targets",
              "targeted_location_performance",
              "location_targets",
              "excluded_locations",
              "proximity_targets",
              "ad_schedules",
              "day_of_week_performance",
              "hour_of_day_performance",
              "dynamic_search_ads",
              "dynamic_search_targets",
              "experiments",
              "experiment_arms",
              "experiment_campaigns",
            ],
            description: "Type of deep-analysis report to run.",
          },
          start_date: { type: "string", description: "Optional start date in YYYY-MM-DD format." },
          end_date: { type: "string", description: "Optional end date in YYYY-MM-DD format." },
          campaign_id: { type: "string", description: "Optional campaign ID filter." },
          ad_group_id: { type: "string", description: "Optional ad group ID filter." },
          limit: {
            type: "number",
            description: "Maximum rows to return. Defaults to 100.",
            default: 100,
          },
        },
        required: ["customer_id", "report_type"],
      },
    },
  ];
}

export async function handleAdsTool(name, args, authClient) {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  if (!developerToken) {
    throw new Error("GOOGLE_ADS_DEVELOPER_TOKEN is missing from your local MCP env file.");
  }

  const query = async (customerId, gaqlQuery) => {
    const data = await adsRequest(
      `/customers/${customerId}/googleAds:search`,
      { query: gaqlQuery },
      authClient,
      developerToken,
      loginCustomerId
    );
    return data.results || [];
  };

  const idFilter = (field, value) => {
    if (!value) return "";
    if (!/^\d+$/.test(String(value))) {
      throw new Error(`${field} must be a numeric Google Ads ID without dashes.`);
    }
    return `AND ${field} = ${value}`;
  };

  const stringContainsFilter = (field, value) => {
    if (!value) return "";
    return `AND ${field} LIKE '%${String(value).replaceAll("'", "\\'")}%'`;
  };

  const dateFilter = (startDate, endDate) =>
    startDate && endDate ? `AND segments.date BETWEEN '${startDate}' AND '${endDate}'` : "";

  const whereDateFilter = (startDate, endDate) =>
    startDate && endDate ? `WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'` : "";

  const limitValue = (value, fallback = 100, max = 1000) =>
    Math.min(Math.max(Number(value) || fallback, 1), max);

  const assertReadOnlyGaql = (gaqlQuery) => {
    const trimmed = String(gaqlQuery || "").trim();
    if (!/^SELECT\s/i.test(trimmed)) {
      throw new Error("Only read-only GAQL SELECT queries are allowed.");
    }
    if (/;\s*\S/.test(trimmed)) {
      throw new Error("Only one GAQL query is allowed.");
    }
    return trimmed.replace(/;\s*$/, "");
  };

  const money = (micros) => (micros ? (micros / 1_000_000).toFixed(2) : "0");
  const cpc = (micros) => (micros ? (micros / 1_000_000).toFixed(4) : "0");

  const textAssets = (assets) =>
    (assets || []).map((asset) => ({
      text: asset.text,
      pinnedField: asset.pinnedField,
      performanceLabel: asset.assetPerformanceLabel,
    }));

  const adCreative = (ad = {}) => ({
    type: ad.type,
    finalUrls: ad.finalUrls || [],
    responsiveSearchAd: ad.responsiveSearchAd
      ? {
          headlines: textAssets(ad.responsiveSearchAd.headlines),
          descriptions: textAssets(ad.responsiveSearchAd.descriptions),
          path1: ad.responsiveSearchAd.path1,
          path2: ad.responsiveSearchAd.path2,
        }
      : undefined,
    expandedTextAd: ad.expandedTextAd
      ? {
          headlinePart1: ad.expandedTextAd.headlinePart1,
          headlinePart2: ad.expandedTextAd.headlinePart2,
          headlinePart3: ad.expandedTextAd.headlinePart3,
          description: ad.expandedTextAd.description,
          description2: ad.expandedTextAd.description2,
          path1: ad.expandedTextAd.path1,
          path2: ad.expandedTextAd.path2,
        }
      : undefined,
    responsiveDisplayAd: ad.responsiveDisplayAd
      ? {
          headlines: textAssets(ad.responsiveDisplayAd.headlines),
          longHeadline: ad.responsiveDisplayAd.longHeadline?.text,
          descriptions: textAssets(ad.responsiveDisplayAd.descriptions),
          businessName: ad.responsiveDisplayAd.businessName,
          callToActionText: ad.responsiveDisplayAd.callToActionText,
        }
      : undefined,
    localAd: ad.localAd
      ? {
          headlines: textAssets(ad.localAd.headlines),
          descriptions: textAssets(ad.localAd.descriptions),
          callToActions: textAssets(ad.localAd.callToActions),
        }
      : undefined,
    videoResponsiveAd: ad.videoResponsiveAd
      ? {
          headlines: textAssets(ad.videoResponsiveAd.headlines),
          longHeadlines: textAssets(ad.videoResponsiveAd.longHeadlines),
          descriptions: textAssets(ad.videoResponsiveAd.descriptions),
        }
      : undefined,
    expandedDynamicSearchAd: ad.expandedDynamicSearchAd
      ? {
          description: ad.expandedDynamicSearchAd.description,
          description2: ad.expandedDynamicSearchAd.description2,
        }
      : undefined,
  });

  const performanceMetrics = (metrics = {}) => ({
    clicks: metrics.clicks,
    impressions: metrics.impressions,
    ctr: metrics.ctr,
    avgCpc: cpc(metrics.averageCpc),
    conversions: metrics.conversions,
    conversionRate: metrics.conversionsFromInteractionsRate,
    cost: money(metrics.costMicros),
    costPerConversion: money(metrics.costPerConversion),
  });

  const resolveGeoTargetConstants = async (customerId, rows) => {
    const resources = [
      ...new Set(
        rows
          .map((row) => row.campaignCriterion?.location?.geoTargetConstant)
          .filter(Boolean)
      ),
    ];

    if (resources.length === 0) return new Map();

    const geoMap = new Map();
    for (let i = 0; i < resources.length; i += 100) {
      const chunk = resources.slice(i, i + 100);
      const resourceList = chunk.map((resource) => `'${resource}'`).join(",");
      const geoRows = await query(
        customerId,
        `SELECT geo_target_constant.resource_name, geo_target_constant.id,
          geo_target_constant.name, geo_target_constant.canonical_name,
          geo_target_constant.country_code, geo_target_constant.target_type,
          geo_target_constant.status
        FROM geo_target_constant
        WHERE geo_target_constant.resource_name IN (${resourceList})`
      );

      for (const geoRow of geoRows) {
        if (geoRow.geoTargetConstant?.resourceName) {
          geoMap.set(geoRow.geoTargetConstant.resourceName, geoRow.geoTargetConstant);
        }
      }
    }

    return geoMap;
  };

  const withResolvedGeoTargets = async (customerId, rows) => {
    const geoMap = await resolveGeoTargetConstants(customerId, rows);
    return rows.map((row) => {
      const resource = row.campaignCriterion?.location?.geoTargetConstant;
      const geoTarget = resource ? geoMap.get(resource) : undefined;
      return {
        campaign: row.campaign,
        locationView: row.locationView,
        criterion: row.campaignCriterion,
        targetedLocation: geoTarget
          ? {
              resourceName: geoTarget.resourceName,
              id: geoTarget.id,
              name: geoTarget.name,
              canonicalName: geoTarget.canonicalName,
              countryCode: geoTarget.countryCode,
              targetType: geoTarget.targetType,
              status: geoTarget.status,
            }
          : { resourceName: resource },
        metrics: row.metrics ? performanceMetrics(row.metrics) : undefined,
      };
    });
  };

  const deepReportQuery = (args) => {
    const { report_type, start_date, end_date, campaign_id, ad_group_id, limit } = args;
    const campaignFilter = idFilter("campaign.id", campaign_id);
    const adGroupFilter = idFilter("ad_group.id", ad_group_id);
    const dateClause = dateFilter(start_date, end_date);
    const whereDateClause = whereDateFilter(start_date, end_date);
    const rowLimit = limitValue(limit, 100, 1000);

    const campaignWhere = `WHERE campaign.status != 'REMOVED' ${campaignFilter} ${dateClause}`;
    const adGroupWhere = `WHERE campaign.status != 'REMOVED' AND ad_group.status != 'REMOVED' ${campaignFilter} ${adGroupFilter} ${dateClause}`;

    const queries = {
      device_performance: `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
          segments.device, metrics.clicks, metrics.impressions, metrics.ctr,
          metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM campaign
        ${campaignWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      geo_performance: `SELECT campaign.id, campaign.name, campaign.status, geographic_view.country_criterion_id,
          geographic_view.location_type, metrics.clicks, metrics.impressions, metrics.ctr,
          metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM geographic_view
        ${campaignWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      user_location_performance: `SELECT campaign.id, campaign.name, campaign.status,
          user_location_view.country_criterion_id, user_location_view.targeting_location,
          metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
          metrics.conversions, metrics.cost_micros
        FROM user_location_view
        ${campaignWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      landing_pages: `SELECT campaign.id, campaign.name, campaign.status, landing_page_view.unexpanded_final_url,
          metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
          metrics.conversions, metrics.cost_micros
        FROM landing_page_view
        ${campaignWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      expanded_landing_pages: `SELECT campaign.id, campaign.name, campaign.status,
          expanded_landing_page_view.expanded_final_url,
          metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
          metrics.conversions, metrics.cost_micros
        FROM expanded_landing_page_view
        ${campaignWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      age_range_performance: `SELECT campaign.id, campaign.name, campaign.status, ad_group.id, ad_group.name, ad_group.status,
          ad_group_criterion.age_range.type, metrics.clicks, metrics.impressions,
          metrics.ctr, metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM age_range_view
        ${adGroupWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      gender_performance: `SELECT campaign.id, campaign.name, campaign.status, ad_group.id, ad_group.name, ad_group.status,
          ad_group_criterion.gender.type, metrics.clicks, metrics.impressions,
          metrics.ctr, metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM gender_view
        ${adGroupWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      campaign_budgets: `SELECT campaign_budget.id, campaign_budget.name,
          campaign_budget.amount_micros, campaign_budget.delivery_method,
          campaign_budget.status, campaign_budget.type, campaign_budget.period,
          campaign_budget.recommended_budget_amount_micros
        FROM campaign_budget
        WHERE campaign_budget.status != 'REMOVED'
        ORDER BY campaign_budget.amount_micros DESC LIMIT ${rowLimit}`,

      conversion_actions: `SELECT conversion_action.id, conversion_action.name,
          conversion_action.status, conversion_action.type, conversion_action.category,
          conversion_action.include_in_conversions_metric,
          conversion_action.counting_type, conversion_action.value_settings.default_value,
          conversion_action.value_settings.always_use_default_value
        FROM conversion_action
        WHERE conversion_action.status != 'REMOVED'
        ORDER BY conversion_action.name ASC LIMIT ${rowLimit}`,

      recommendations: `SELECT recommendation.type, recommendation.resource_name,
          recommendation.campaign, recommendation.impact.base_metrics.conversions,
          recommendation.impact.base_metrics.cost_micros,
          recommendation.impact.potential_metrics.conversions,
          recommendation.impact.potential_metrics.cost_micros
        FROM recommendation
        LIMIT ${rowLimit}`,

      change_events: `SELECT change_event.change_date_time, change_event.user_email,
          change_event.client_type, change_event.change_resource_type,
          change_event.resource_name, change_event.changed_fields,
          change_event.campaign, change_event.ad_group
        FROM change_event
        ${start_date && end_date ? `WHERE change_event.change_date_time BETWEEN '${start_date}' AND '${end_date}'` : "WHERE change_event.change_date_time DURING LAST_30_DAYS"}
        ORDER BY change_event.change_date_time DESC LIMIT ${rowLimit}`,

      campaign_negative_keywords: `SELECT campaign.id, campaign.name,
          campaign_criterion.criterion_id, campaign_criterion.keyword.text,
          campaign_criterion.keyword.match_type, campaign_criterion.status,
          campaign_criterion.negative
        FROM campaign_criterion
        WHERE campaign_criterion.type = KEYWORD
          AND campaign_criterion.negative = true
          ${campaignFilter}
        ORDER BY campaign.name ASC LIMIT ${rowLimit}`,

      ad_group_negative_keywords: `SELECT campaign.id, campaign.name, ad_group.id, ad_group.name,
          ad_group_criterion.criterion_id, ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type, ad_group_criterion.status,
          ad_group_criterion.negative
        FROM ad_group_criterion
        WHERE ad_group_criterion.type = KEYWORD
          AND ad_group_criterion.negative = true
          ${campaignFilter} ${adGroupFilter}
        ORDER BY campaign.name ASC, ad_group.name ASC LIMIT ${rowLimit}`,

      shared_negative_keyword_sets: `SELECT shared_set.id, shared_set.name,
          shared_set.status, shared_set.type, shared_set.member_count,
          campaign_shared_set.campaign
        FROM campaign_shared_set
        WHERE shared_set.type = NEGATIVE_KEYWORDS
          AND shared_set.status != 'REMOVED'
          ${campaignFilter}
        ORDER BY shared_set.name ASC LIMIT ${rowLimit}`,

      negative_keyword_list_members: `SELECT shared_set.id, shared_set.name,
          shared_set.status, shared_set.type, shared_criterion.criterion_id,
          shared_criterion.keyword.text, shared_criterion.keyword.match_type,
          shared_criterion.status
        FROM shared_criterion
        WHERE shared_set.type = NEGATIVE_KEYWORDS
          AND shared_set.status != 'REMOVED'
          AND shared_criterion.type = KEYWORD
          AND shared_criterion.status != 'REMOVED'
        ORDER BY shared_set.name ASC LIMIT ${rowLimit}`,

      negative_keyword_candidates: `SELECT campaign.id, campaign.name, campaign.status,
          ad_group.id, ad_group.name, ad_group.status,
          search_term_view.search_term, search_term_view.status,
          segments.search_term_match_type,
          metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
          metrics.conversions, metrics.cost_micros
        FROM search_term_view
        WHERE campaign.status != 'REMOVED'
          AND ad_group.status != 'REMOVED'
          AND metrics.clicks > 0
          AND metrics.conversions = 0
          ${campaignFilter} ${adGroupFilter} ${dateClause}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      auction_insights_campaign: `SELECT campaign.id, campaign.name, campaign.status,
          segments.auction_insight_domain,
          metrics.auction_insight_search_impression_share,
          metrics.auction_insight_search_overlap_rate,
          metrics.auction_insight_search_position_above_rate,
          metrics.auction_insight_search_top_impression_percentage,
          metrics.auction_insight_search_absolute_top_impression_percentage,
          metrics.auction_insight_search_outranking_share
        FROM campaign
        ${campaignWhere}
        ORDER BY metrics.auction_insight_search_impression_share DESC LIMIT ${rowLimit}`,

      auction_insights_keyword: `SELECT campaign.id, campaign.name, campaign.status,
          ad_group.id, ad_group.name, ad_group.status,
          ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
          segments.auction_insight_domain,
          metrics.auction_insight_search_impression_share,
          metrics.auction_insight_search_overlap_rate,
          metrics.auction_insight_search_position_above_rate,
          metrics.auction_insight_search_top_impression_percentage,
          metrics.auction_insight_search_absolute_top_impression_percentage,
          metrics.auction_insight_search_outranking_share
        FROM keyword_view
        ${adGroupWhere}
        ORDER BY metrics.auction_insight_search_impression_share DESC LIMIT ${rowLimit}`,

      asset_performance: `SELECT campaign.id, campaign.name, campaign.status, ad_group.id, ad_group.name, ad_group.status,
          ad_group_ad_asset_view.field_type, ad_group_ad_asset_view.performance_label,
          ad_group_ad_asset_view.enabled, asset.id, asset.name, asset.type,
          asset.text_asset.text, metrics.clicks, metrics.impressions,
          metrics.ctr, metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM ad_group_ad_asset_view
        ${adGroupWhere}
        ORDER BY metrics.impressions DESC LIMIT ${rowLimit}`,

      pmax_asset_groups: `SELECT campaign.id, campaign.name, campaign.status, asset_group.id,
          asset_group.name, asset_group.status, asset_group.final_urls,
          asset_group.final_mobile_urls
        FROM asset_group
        WHERE campaign.status != 'REMOVED'
          ${campaignFilter}
        ORDER BY campaign.name ASC LIMIT ${rowLimit}`,

      pmax_asset_group_assets: `SELECT campaign.id, campaign.name, campaign.status, asset_group.id,
          asset_group.name, asset_group_asset.field_type,
          asset_group_asset.performance_label, asset_group_asset.status,
          asset.id, asset.name, asset.type, asset.text_asset.text
        FROM asset_group_asset
        WHERE campaign.status != 'REMOVED'
          ${campaignFilter}
        ORDER BY campaign.name ASC, asset_group.name ASC LIMIT ${rowLimit}`,

      shopping_products: `SELECT campaign.id, campaign.name, campaign.status, segments.product_item_id,
          segments.product_title, segments.product_type_l1, segments.product_type_l2,
          segments.product_brand, segments.product_channel, metrics.clicks,
          metrics.impressions, metrics.ctr, metrics.average_cpc,
          metrics.conversions, metrics.cost_micros
        FROM shopping_performance_view
        ${campaignWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      user_lists: `SELECT user_list.id, user_list.name, user_list.description,
          user_list.membership_status, user_list.membership_life_span,
          user_list.size_for_display, user_list.size_for_search,
          user_list.size_range_for_display, user_list.size_range_for_search,
          user_list.type, user_list.crm_based_user_list.upload_key_type,
          user_list.rule_based_user_list.prepopulation_status,
          user_list.similar_user_list.seed_user_list
        FROM user_list
        WHERE user_list.membership_status != 'CLOSED'
        ORDER BY user_list.name ASC LIMIT ${rowLimit}`,

      custom_audiences: `SELECT custom_audience.id, custom_audience.name,
          custom_audience.description, custom_audience.status,
          custom_audience.type, custom_audience.members
        FROM custom_audience
        WHERE custom_audience.status != 'REMOVED'
        ORDER BY custom_audience.name ASC LIMIT ${rowLimit}`,

      campaign_audience_targets: `SELECT campaign.id, campaign.name, campaign.status,
          campaign_criterion.criterion_id, campaign_criterion.type,
          campaign_criterion.status, campaign_criterion.negative,
          campaign_criterion.bid_modifier, campaign_criterion.user_list.user_list,
          campaign_criterion.user_interest.user_interest_category,
          campaign_criterion.combined_audience.combined_audience
        FROM campaign_criterion
        WHERE campaign.status != 'REMOVED'
          AND campaign_criterion.status != 'REMOVED'
          AND campaign_criterion.type IN (USER_LIST, USER_INTEREST, COMBINED_AUDIENCE, CUSTOM_AUDIENCE)
          ${campaignFilter}
        ORDER BY campaign.name ASC LIMIT ${rowLimit}`,

      ad_group_audience_targets: `SELECT campaign.id, campaign.name, campaign.status,
          ad_group.id, ad_group.name, ad_group.status,
          ad_group_criterion.criterion_id, ad_group_criterion.type,
          ad_group_criterion.status, ad_group_criterion.negative,
          ad_group_criterion.bid_modifier, ad_group_criterion.user_list.user_list,
          ad_group_criterion.user_interest.user_interest_category,
          ad_group_criterion.combined_audience.combined_audience
        FROM ad_group_criterion
        WHERE campaign.status != 'REMOVED'
          AND ad_group.status != 'REMOVED'
          AND ad_group_criterion.status != 'REMOVED'
          AND ad_group_criterion.type IN (USER_LIST, USER_INTEREST, COMBINED_AUDIENCE, CUSTOM_AUDIENCE)
          ${campaignFilter} ${adGroupFilter}
        ORDER BY campaign.name ASC, ad_group.name ASC LIMIT ${rowLimit}`,

      campaign_audience_performance: `SELECT campaign.id, campaign.name, campaign.status,
          campaign_criterion.criterion_id, campaign_criterion.type,
          campaign_criterion.user_list.user_list,
          campaign_criterion.user_interest.user_interest_category,
          campaign_criterion.combined_audience.combined_audience,
          metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
          metrics.conversions, metrics.cost_micros
        FROM campaign_audience_view
        ${campaignWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      ad_group_audience_performance: `SELECT campaign.id, campaign.name, campaign.status,
          ad_group.id, ad_group.name, ad_group.status,
          ad_group_criterion.criterion_id, ad_group_criterion.type,
          ad_group_criterion.user_list.user_list,
          ad_group_criterion.user_interest.user_interest_category,
          ad_group_criterion.combined_audience.combined_audience,
          metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
          metrics.conversions, metrics.cost_micros
        FROM ad_group_audience_view
        ${adGroupWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      webpage_targets: `SELECT campaign.id, campaign.name, campaign.status,
          ad_group.id, ad_group.name, ad_group.status,
          ad_group_criterion.criterion_id, ad_group_criterion.status,
          ad_group_criterion.negative, ad_group_criterion.webpage.conditions,
          ad_group_criterion.webpage.coverage_percentage,
          metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
          metrics.conversions, metrics.cost_micros
        FROM webpage_view
        ${adGroupWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      targeted_location_performance: `SELECT campaign.id, campaign.name, campaign.status,
          campaign_criterion.criterion_id, campaign_criterion.status,
          campaign_criterion.negative, campaign_criterion.bid_modifier,
          campaign_criterion.location.geo_target_constant,
          metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
          metrics.conversions, metrics.cost_micros,
          metrics.conversions_from_interactions_rate, metrics.cost_per_conversion
        FROM location_view
        WHERE campaign.status != 'REMOVED'
          ${campaignFilter} ${dateClause}
        ORDER BY metrics.clicks DESC LIMIT ${rowLimit}`,

      location_targets: `SELECT campaign.id, campaign.name, campaign.status,
          campaign_criterion.criterion_id, campaign_criterion.status,
          campaign_criterion.negative, campaign_criterion.bid_modifier,
          campaign_criterion.location.geo_target_constant
        FROM campaign_criterion
        WHERE campaign.status != 'REMOVED'
          AND campaign_criterion.status != 'REMOVED'
          AND campaign_criterion.type = LOCATION
          AND campaign_criterion.negative = false
          ${campaignFilter}
        ORDER BY campaign.name ASC LIMIT ${rowLimit}`,

      excluded_locations: `SELECT campaign.id, campaign.name, campaign.status,
          campaign_criterion.criterion_id, campaign_criterion.status,
          campaign_criterion.negative, campaign_criterion.location.geo_target_constant
        FROM campaign_criterion
        WHERE campaign.status != 'REMOVED'
          AND campaign_criterion.status != 'REMOVED'
          AND campaign_criterion.type = LOCATION
          AND campaign_criterion.negative = true
          ${campaignFilter}
        ORDER BY campaign.name ASC LIMIT ${rowLimit}`,

      proximity_targets: `SELECT campaign.id, campaign.name, campaign.status,
          campaign_criterion.criterion_id, campaign_criterion.status,
          campaign_criterion.negative, campaign_criterion.bid_modifier,
          campaign_criterion.proximity.address.street_address,
          campaign_criterion.proximity.address.city_name,
          campaign_criterion.proximity.address.province_code,
          campaign_criterion.proximity.address.country_code,
          campaign_criterion.proximity.geo_point.latitude_in_micro_degrees,
          campaign_criterion.proximity.geo_point.longitude_in_micro_degrees,
          campaign_criterion.proximity.radius,
          campaign_criterion.proximity.radius_units
        FROM campaign_criterion
        WHERE campaign.status != 'REMOVED'
          AND campaign_criterion.status != 'REMOVED'
          AND campaign_criterion.type = PROXIMITY
          ${campaignFilter}
        ORDER BY campaign.name ASC LIMIT ${rowLimit}`,

      ad_schedules: `SELECT campaign.id, campaign.name, campaign.status,
          campaign_criterion.criterion_id, campaign_criterion.status,
          campaign_criterion.bid_modifier,
          campaign_criterion.ad_schedule.day_of_week,
          campaign_criterion.ad_schedule.start_hour,
          campaign_criterion.ad_schedule.start_minute,
          campaign_criterion.ad_schedule.end_hour,
          campaign_criterion.ad_schedule.end_minute
        FROM campaign_criterion
        WHERE campaign.status != 'REMOVED'
          AND campaign_criterion.status != 'REMOVED'
          AND campaign_criterion.type = AD_SCHEDULE
          ${campaignFilter}
        ORDER BY campaign.name ASC, campaign_criterion.ad_schedule.day_of_week ASC,
          campaign_criterion.ad_schedule.start_hour ASC LIMIT ${rowLimit}`,

      day_of_week_performance: `SELECT campaign.id, campaign.name, campaign.status,
          segments.day_of_week, metrics.clicks, metrics.impressions,
          metrics.ctr, metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM campaign
        ${campaignWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      hour_of_day_performance: `SELECT campaign.id, campaign.name, campaign.status,
          segments.hour, metrics.clicks, metrics.impressions,
          metrics.ctr, metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM campaign
        ${campaignWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      dynamic_search_ads: `SELECT campaign.id, campaign.name, campaign.status,
          ad_group.id, ad_group.name, ad_group.status,
          ad_group_ad.ad.id, ad_group_ad.status,
          ad_group_ad.policy_summary.approval_status,
          ad_group_ad.ad.type, ad_group_ad.ad.final_urls,
          ad_group_ad.ad.expanded_dynamic_search_ad.description,
          ad_group_ad.ad.expanded_dynamic_search_ad.description2,
          metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
          metrics.conversions, metrics.cost_micros
        FROM ad_group_ad
        WHERE campaign.status != 'REMOVED'
          AND ad_group.status != 'REMOVED'
          AND ad_group_ad.status != 'REMOVED'
          AND ad_group_ad.ad.type = EXPANDED_DYNAMIC_SEARCH_AD
          ${campaignFilter} ${adGroupFilter} ${dateClause}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      dynamic_search_targets: `SELECT campaign.id, campaign.name, campaign.status,
          ad_group.id, ad_group.name, ad_group.status,
          ad_group_criterion.criterion_id, ad_group_criterion.status,
          ad_group_criterion.negative, ad_group_criterion.webpage.conditions,
          ad_group_criterion.webpage.coverage_percentage,
          ad_group_criterion.webpage.criterion_name,
          ad_group_criterion.webpage.sample.sample_urls,
          metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
          metrics.conversions, metrics.cost_micros
        FROM webpage_view
        WHERE campaign.status != 'REMOVED'
          AND ad_group.status != 'REMOVED'
          AND ad_group_criterion.status != 'REMOVED'
          ${campaignFilter} ${adGroupFilter} ${dateClause}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      experiments: `SELECT experiment.resource_name, experiment.name, experiment.description,
          experiment.status, experiment.type, experiment.start_date,
          experiment.end_date, experiment.promote_status, experiment.sync_enabled,
          experiment.suffix
        FROM experiment
        WHERE experiment.status != 'REMOVED'
        ORDER BY experiment.start_date DESC LIMIT ${rowLimit}`,

      experiment_arms: `SELECT experiment.resource_name, experiment.name, experiment.status,
          experiment.type, experiment.start_date, experiment.end_date,
          experiment_arm.name, experiment_arm.control,
          experiment_arm.traffic_split, experiment_arm.campaigns,
          experiment_arm.in_design_campaigns, experiment_arm.resource_name
        FROM experiment_arm
        ORDER BY experiment.name ASC LIMIT ${rowLimit}`,

      experiment_campaigns: `SELECT campaign.id, campaign.name, campaign.status,
          campaign.experiment_type, campaign.base_campaign,
          campaign.advertising_channel_type, campaign.primary_status,
          campaign.primary_status_reasons, metrics.clicks, metrics.impressions,
          metrics.ctr, metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM campaign
        WHERE campaign.status != 'REMOVED'
          AND campaign.experiment_type != BASE
          ${campaignFilter} ${dateClause}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,
    };

    if (!queries[report_type]) {
      throw new Error(`Unsupported deep report type: ${report_type}`);
    }

    return queries[report_type];
  };

  const listClientAccounts = async (managerCustomerId) => {
    const results = await query(
      managerCustomerId,
      `SELECT customer_client.client_customer, customer_client.id,
        customer_client.descriptive_name, customer_client.currency_code,
        customer_client.time_zone, customer_client.manager, customer_client.level,
        customer_client.status, customer_client.hidden
       FROM customer_client
       WHERE customer_client.hidden = false
       ORDER BY customer_client.level ASC, customer_client.id ASC LIMIT 1000`
    );
    return results
      .map((r) => r.customerClient)
      .filter((client) => client && String(client.id) !== String(managerCustomerId))
      .map((client) => ({
        ...client,
        parentCustomerId: managerCustomerId,
      }));
  };

  if (name === "ads_list_accounts") {
    const token = (await authClient.getAccessToken()).token;
    const base = await getWorkingBase(token, developerToken);
    const accessibleRes = await axios.get(`${base}/customers:listAccessibleCustomers`, {
      headers: { Authorization: `Bearer ${token}`, "developer-token": developerToken },
    });
    const customerIds = (accessibleRes.data.resourceNames || []).map((r) =>
      r.replace("customers/", "")
    );

    const details = [];
    for (const cid of customerIds.slice(0, 20)) {
      try {
        const results = await query(
          cid,
          "SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.manager FROM customer LIMIT 1"
        );
        if (results[0]?.customer) {
          const account = results[0].customer;
          if (account.manager) {
            try {
              account.clientAccounts = await listClientAccounts(cid);
            } catch {
              account.clientAccounts = [];
            }
          }
          details.push(account);
        }
      } catch {}
    }
    return details.length > 0 ? details : customerIds;
  }

  if (name === "ads_list_client_accounts") {
    const { customer_id } = args;
    return listClientAccounts(customer_id);
  }

  if (name === "ads_list_campaigns") {
    const { customer_id, start_date, end_date } = args;
    const dateClause =
      start_date && end_date
        ? `AND segments.date BETWEEN '${start_date}' AND '${end_date}'`
        : "";
    const results = await query(
      customer_id,
      `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
        metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.conversions, metrics.ctr
       FROM campaign
       WHERE campaign.status != 'REMOVED' ${dateClause}`
    );
    return results.map((r) => ({
      ...r.campaign,
      metrics: {
        ...r.metrics,
        cost: r.metrics?.costMicros ? (r.metrics.costMicros / 1_000_000).toFixed(2) : "0",
      },
    }));
  }

  if (name === "ads_keyword_performance") {
    const { customer_id, start_date, end_date, campaign_id } = args;
    const campaignFilter = campaign_id ? `AND campaign.id = ${campaign_id}` : "";
    const dateClause =
      start_date && end_date
        ? `AND segments.date BETWEEN '${start_date}' AND '${end_date}'`
        : "";
    const results = await query(
      customer_id,
      `SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
        metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc, metrics.conversions,
        metrics.cost_micros, ad_group_criterion.quality_info.quality_score
       FROM keyword_view
       WHERE ad_group_criterion.status != 'REMOVED' ${campaignFilter} ${dateClause}
       ORDER BY metrics.clicks DESC LIMIT 50`
    );
    return results.map((r) => ({
      keyword: r.adGroupCriterion?.keyword?.text,
      matchType: r.adGroupCriterion?.keyword?.matchType,
      qualityScore: r.adGroupCriterion?.qualityInfo?.qualityScore,
      metrics: {
        clicks: r.metrics?.clicks,
        impressions: r.metrics?.impressions,
        ctr: r.metrics?.ctr,
        avgCpc: r.metrics?.averageCpc ? (r.metrics.averageCpc / 1_000_000).toFixed(4) : "0",
        conversions: r.metrics?.conversions,
        cost: r.metrics?.costMicros ? (r.metrics.costMicros / 1_000_000).toFixed(2) : "0",
      },
    }));
  }

  if (name === "ads_search_terms") {
    const {
      customer_id,
      start_date,
      end_date,
      campaign_id,
      ad_group_id,
      search_term_contains,
      limit = 100,
    } = args;
    const campaignFilter = idFilter("campaign.id", campaign_id);
    const adGroupFilter = idFilter("ad_group.id", ad_group_id);
    const searchTermFilter = stringContainsFilter("search_term_view.search_term", search_term_contains);
    const dateClause = dateFilter(start_date, end_date);
    const rowLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
    const results = await query(
      customer_id,
      `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
        ad_group.id, ad_group.name, ad_group.status,
        search_term_view.search_term, search_term_view.status,
        segments.search_term_match_type,
        metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
        metrics.conversions, metrics.cost_micros
       FROM search_term_view
       WHERE campaign.status != 'REMOVED'
        AND ad_group.status != 'REMOVED'
        ${campaignFilter} ${adGroupFilter} ${searchTermFilter} ${dateClause}
       ORDER BY metrics.clicks DESC LIMIT ${rowLimit}`
    );
    return results.map((r) => ({
      campaign: r.campaign,
      adGroup: r.adGroup,
      searchTerm: r.searchTermView?.searchTerm,
      status: r.searchTermView?.status,
      matchType: r.segments?.searchTermMatchType,
      metrics: performanceMetrics(r.metrics),
      note: "search_term_view does not include Performance Max search term data.",
    }));
  }

  if (name === "ads_campaign_search_terms") {
    const {
      customer_id,
      start_date,
      end_date,
      campaign_id,
      search_term_contains,
      limit = 100,
    } = args;
    const campaignFilter = idFilter("campaign.id", campaign_id);
    const searchTermFilter = stringContainsFilter(
      "campaign_search_term_view.search_term",
      search_term_contains
    );
    const dateClause = dateFilter(start_date, end_date);
    const rowLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
    const results = await query(
      customer_id,
      `SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
        campaign_search_term_view.search_term,
        metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
        metrics.conversions, metrics.cost_micros
       FROM campaign_search_term_view
       WHERE campaign.status != 'REMOVED'
        ${campaignFilter} ${searchTermFilter} ${dateClause}
       ORDER BY metrics.clicks DESC LIMIT ${rowLimit}`
    );
    return results.map((r) => ({
      campaign: r.campaign,
      searchTerm: r.campaignSearchTermView?.searchTerm,
      metrics: performanceMetrics(r.metrics),
    }));
  }

  if (name === "ads_list_ad_groups") {
    const { customer_id, start_date, end_date, campaign_id } = args;
    const campaignFilter = idFilter("campaign.id", campaign_id);
    const dateClause = dateFilter(start_date, end_date);
    const results = await query(
      customer_id,
      `SELECT campaign.id, campaign.name,
        ad_group.id, ad_group.name, ad_group.status, ad_group.type,
        metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
        metrics.conversions, metrics.cost_micros
       FROM ad_group
       WHERE ad_group.status != 'REMOVED' ${campaignFilter} ${dateClause}
       ORDER BY metrics.clicks DESC LIMIT 100`
    );
    return results.map((r) => ({
      campaign: r.campaign,
      adGroup: r.adGroup,
      metrics: performanceMetrics(r.metrics),
    }));
  }

  if (name === "ads_list_ads") {
    const { customer_id, start_date, end_date, campaign_id, ad_group_id, limit = 50 } = args;
    const campaignFilter = idFilter("campaign.id", campaign_id);
    const adGroupFilter = idFilter("ad_group.id", ad_group_id);
    const dateClause = dateFilter(start_date, end_date);
    const rowLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const results = await query(
      customer_id,
      `SELECT campaign.id, campaign.name,
        ad_group.id, ad_group.name,
        ad_group_ad.ad.id, ad_group_ad.status, ad_group_ad.policy_summary.approval_status,
        ad_group_ad.ad.type, ad_group_ad.ad.final_urls,
        ad_group_ad.ad.responsive_search_ad.headlines,
        ad_group_ad.ad.responsive_search_ad.descriptions,
        ad_group_ad.ad.responsive_search_ad.path1,
        ad_group_ad.ad.responsive_search_ad.path2,
        ad_group_ad.ad.expanded_text_ad.headline_part1,
        ad_group_ad.ad.expanded_text_ad.headline_part2,
        ad_group_ad.ad.expanded_text_ad.headline_part3,
        ad_group_ad.ad.expanded_text_ad.description,
        ad_group_ad.ad.expanded_text_ad.description2,
        ad_group_ad.ad.expanded_text_ad.path1,
        ad_group_ad.ad.expanded_text_ad.path2,
        ad_group_ad.ad.responsive_display_ad.headlines,
        ad_group_ad.ad.responsive_display_ad.long_headline,
        ad_group_ad.ad.responsive_display_ad.descriptions,
        ad_group_ad.ad.responsive_display_ad.business_name,
        ad_group_ad.ad.responsive_display_ad.call_to_action_text,
        ad_group_ad.ad.local_ad.headlines,
        ad_group_ad.ad.local_ad.descriptions,
        ad_group_ad.ad.local_ad.call_to_actions,
        ad_group_ad.ad.video_responsive_ad.headlines,
        ad_group_ad.ad.video_responsive_ad.long_headlines,
        ad_group_ad.ad.video_responsive_ad.descriptions,
        ad_group_ad.ad.expanded_dynamic_search_ad.description,
        ad_group_ad.ad.expanded_dynamic_search_ad.description2,
        metrics.clicks, metrics.impressions, metrics.ctr, metrics.average_cpc,
        metrics.conversions, metrics.cost_micros
       FROM ad_group_ad
       WHERE ad_group_ad.status != 'REMOVED' ${campaignFilter} ${adGroupFilter} ${dateClause}
       ORDER BY metrics.clicks DESC LIMIT ${rowLimit}`
    );
    return results.map((r) => ({
      campaign: r.campaign,
      adGroup: r.adGroup,
      ad: {
        id: r.adGroupAd?.ad?.id,
        status: r.adGroupAd?.status,
        approvalStatus: r.adGroupAd?.policySummary?.approvalStatus,
        creative: adCreative(r.adGroupAd?.ad),
      },
      metrics: performanceMetrics(r.metrics),
    }));
  }

  if (name === "ads_keyword_ideas") {
    const { customer_id, keywords, language_id = "1000", geo_target_ids = [] } = args;
    const token = (await authClient.getAccessToken()).token;
    const base = await getWorkingBase(token, developerToken);

    const body = {
      language: `languageConstants/${language_id}`,
      keywordSeed: { keywords },
      ...(geo_target_ids.length > 0 && {
        geoTargetConstants: geo_target_ids.map((id) => `geoTargetConstants/${id}`),
      }),
    };

    const res = await axios.post(`${base}/customers/${customer_id}:generateKeywordIdeas`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "developer-token": developerToken,
        ...(loginCustomerId && { "login-customer-id": loginCustomerId }),
      },
    });

    return (res.data.results || []).slice(0, 30).map((idea) => ({
      keyword: idea.text,
      avgMonthlySearches: idea.keywordIdeaMetrics?.avgMonthlySearches,
      competition: idea.keywordIdeaMetrics?.competition,
      lowTopOfPageBidMicros: idea.keywordIdeaMetrics?.lowTopOfPageBidMicros
        ? (idea.keywordIdeaMetrics.lowTopOfPageBidMicros / 1_000_000).toFixed(4)
        : null,
      highTopOfPageBidMicros: idea.keywordIdeaMetrics?.highTopOfPageBidMicros
        ? (idea.keywordIdeaMetrics.highTopOfPageBidMicros / 1_000_000).toFixed(4)
        : null,
    }));
  }

  if (name === "ads_keyword_historical_metrics") {
    const {
      customer_id,
      keywords,
      language_id = "1000",
      geo_target_ids = [],
      include_average_cpc = true,
    } = args;
    const token = (await authClient.getAccessToken()).token;
    const base = await getWorkingBase(token, developerToken);

    const body = {
      keywords,
      language: `languageConstants/${language_id}`,
      keywordPlanNetwork: "GOOGLE_SEARCH",
      geoTargetConstants: geo_target_ids.map((id) => `geoTargetConstants/${id}`),
      historicalMetricsOptions: {
        includeAverageCpc: include_average_cpc,
      },
    };

    const res = await axios.post(
      `${base}/customers/${customer_id}:generateKeywordHistoricalMetrics`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "developer-token": developerToken,
          ...(loginCustomerId && { "login-customer-id": loginCustomerId }),
        },
      }
    );

    return (res.data.results || []).map((result) => ({
      keyword: result.text,
      closeVariants: result.closeVariants || [],
      metrics: {
        avgMonthlySearches: result.keywordMetrics?.avgMonthlySearches,
        competition: result.keywordMetrics?.competition,
        competitionIndex: result.keywordMetrics?.competitionIndex,
        lowTopOfPageBid: result.keywordMetrics?.lowTopOfPageBidMicros
          ? (result.keywordMetrics.lowTopOfPageBidMicros / 1_000_000).toFixed(4)
          : null,
        highTopOfPageBid: result.keywordMetrics?.highTopOfPageBidMicros
          ? (result.keywordMetrics.highTopOfPageBidMicros / 1_000_000).toFixed(4)
          : null,
        averageCpc: result.keywordMetrics?.averageCpcMicros
          ? (result.keywordMetrics.averageCpcMicros / 1_000_000).toFixed(4)
          : null,
        monthlySearchVolumes: result.keywordMetrics?.monthlySearchVolumes || [],
      },
    }));
  }

  if (name === "ads_gaql_query") {
    const { customer_id, query: gaqlQuery } = args;
    return query(customer_id, assertReadOnlyGaql(gaqlQuery));
  }

  if (name === "ads_deep_report") {
    const { customer_id } = args;
    const gaqlQuery = deepReportQuery(args);
    const results = await query(customer_id, gaqlQuery);
    const rows = [
      "targeted_location_performance",
      "location_targets",
      "excluded_locations",
    ].includes(args.report_type)
      ? await withResolvedGeoTargets(customer_id, results)
      : results;

    return {
      reportType: args.report_type,
      query: gaqlQuery,
      rows,
    };
  }

  if (name === "ads_account_performance") {
    const { customer_id, start_date, end_date } = args;
    const results = await query(
      customer_id,
      `SELECT metrics.clicks, metrics.impressions, metrics.cost_micros,
        metrics.conversions, metrics.ctr, metrics.average_cpc
       FROM customer
       WHERE segments.date BETWEEN '${start_date}' AND '${end_date}'`
    );
    const m = results[0]?.metrics || {};
    return {
      clicks: m.clicks,
      impressions: m.impressions,
      cost: m.costMicros ? (m.costMicros / 1_000_000).toFixed(2) : "0",
      conversions: m.conversions,
      ctr: m.ctr,
      avgCpc: m.averageCpc ? (m.averageCpc / 1_000_000).toFixed(4) : "0",
    };
  }

  throw new Error(`Unknown Google Ads tool: ${name}`);
}
