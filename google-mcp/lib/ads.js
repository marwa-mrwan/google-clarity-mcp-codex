/**
 * Google Ads tools.
 * Requires GOOGLE_ADS_DEVELOPER_TOKEN and, when needed, GOOGLE_ADS_LOGIN_CUSTOMER_ID.
 */

import axios from "axios";

const DEFAULT_ADS_VERSIONS = ["v24", "v23", "v22", "v21"];
let ADS_API_BASE = null;

const CUSTOMER_ID_PROPERTY = {
  type: "string",
  description: "Google Ads customer ID without dashes.",
};

const OPTIONAL_DATE_RANGE_PROPERTIES = {
  start_date: { type: "string", description: "Optional start date in YYYY-MM-DD format." },
  end_date: { type: "string", description: "Optional end date in YYYY-MM-DD format." },
};

const MUTATION_SAFETY_PROPERTIES = {
  dry_run: {
    type: "boolean",
    description: "Preview the mutation without calling Google Ads mutate endpoints. Defaults to true.",
    default: true,
  },
  confirm: {
    type: "boolean",
    description: "Must be true together with dry_run=false and env guardrails before any write executes.",
    default: false,
  },
  validate_only: {
    type: "boolean",
    description: "When guardrails allow an API call, ask Google Ads to validate the mutation without applying it.",
    default: false,
  },
  partial_failure: {
    type: "boolean",
    description: "Enable Google Ads partial failure handling for supported mutate endpoints.",
    default: false,
  },
};

const ADS_DEEP_REPORT_TYPES = [
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
  "customer_labels",
  "customer_user_access",
  "customer_user_access_invitations",
  "campaign_settings",
  "bidding_strategies",
  "campaign_conversion_goals",
  "customer_conversion_goals",
  "campaign_labels",
  "ad_group_labels",
  "keyword_quality",
  "device_bid_modifiers",
  "placements",
  "topics",
  "campaign_asset_links",
  "ad_group_asset_links",
  "customer_asset_links",
  "asset_details",
  "pmax_listing_groups",
  "pmax_search_terms",
  "shopping_listing_groups",
  "demand_gen_campaigns",
  "video_campaigns",
];

const readTool = (name, description, properties = {}, required = []) => ({
  name,
  description,
  inputSchema: {
    type: "object",
    properties,
    required,
  },
});

const mutationTool = (name, description, properties = {}, required = []) =>
  readTool(
    name,
    description,
    {
      customer_id: CUSTOMER_ID_PROPERTY,
      ...properties,
      ...MUTATION_SAFETY_PROPERTIES,
    },
    ["customer_id", ...required]
  );

const ADVANCED_READ_TOOLS = [
  readTool(
    "ads_account_hierarchy",
    "Read the full Google Ads MCC hierarchy recursively from a manager account.",
    {
      customer_id: {
        ...CUSTOMER_ID_PROPERTY,
        description: "Manager customer ID without dashes.",
      },
      max_depth: {
        type: "number",
        description: "Maximum recursion depth. Defaults to 5.",
        default: 5,
      },
    },
    ["customer_id"]
  ),
  readTool(
    "ads_customer_details",
    "Read customer metadata, status, currency, timezone, optimization score, tracking URL fields, labels, and access summaries where available.",
    {
      customer_id: CUSTOMER_ID_PROPERTY,
    },
    ["customer_id"]
  ),
  readTool(
    "ads_campaign_full_audit",
    "Run a multi-section read-only campaign audit covering settings, budget, bidding, targeting, assets, conversion goals, recommendations, and performance.",
    {
      customer_id: CUSTOMER_ID_PROPERTY,
      campaign_id: { type: "string", description: "Campaign ID without dashes." },
      ...OPTIONAL_DATE_RANGE_PROPERTIES,
      limit: { type: "number", description: "Maximum rows per section. Defaults to 100.", default: 100 },
    },
    ["customer_id", "campaign_id"]
  ),
  readTool(
    "ads_ad_group_full_audit",
    "Run a multi-section read-only ad group audit covering settings, keywords, negative keywords, audiences, placements, topics, ads, assets, and performance.",
    {
      customer_id: CUSTOMER_ID_PROPERTY,
      ad_group_id: { type: "string", description: "Ad group ID without dashes." },
      campaign_id: { type: "string", description: "Optional campaign ID filter." },
      ...OPTIONAL_DATE_RANGE_PROPERTIES,
      limit: { type: "number", description: "Maximum rows per section. Defaults to 100.", default: 100 },
    },
    ["customer_id", "ad_group_id"]
  ),
];

const WRITE_TOOLS = [
  mutationTool("ads_pause_campaign", "Safely pause a campaign.", {
    campaign_id: { type: "string", description: "Campaign ID without dashes." },
  }, ["campaign_id"]),
  mutationTool("ads_enable_campaign", "Safely enable a campaign.", {
    campaign_id: { type: "string", description: "Campaign ID without dashes." },
  }, ["campaign_id"]),
  mutationTool("ads_update_campaign_budget", "Safely update a campaign budget amount.", {
    budget_id: { type: "string", description: "Campaign budget ID without dashes." },
    amount: { type: "number", description: "Budget amount in the account currency, not micros." },
  }, ["budget_id", "amount"]),
  mutationTool("ads_update_campaign_dates", "Safely update campaign start and/or end dates.", {
    campaign_id: { type: "string", description: "Campaign ID without dashes." },
    start_date: { type: "string", description: "Optional start date in YYYY-MM-DD format." },
    end_date: { type: "string", description: "Optional end date in YYYY-MM-DD format." },
  }, ["campaign_id"]),
  mutationTool("ads_update_campaign_bidding", "Safely update a campaign bidding strategy field set.", {
    campaign_id: { type: "string", description: "Campaign ID without dashes." },
    bidding_strategy_type: {
      type: "string",
      enum: ["MANUAL_CPC", "MAXIMIZE_CONVERSIONS", "MAXIMIZE_CONVERSION_VALUE", "TARGET_CPA", "TARGET_ROAS"],
    },
    target_cpa: { type: "number", description: "Optional target CPA in account currency." },
    target_roas: { type: "number", description: "Optional target ROAS as a decimal, e.g. 3.5." },
  }, ["campaign_id", "bidding_strategy_type"]),
  mutationTool("ads_update_target_cpa", "Safely update campaign target CPA.", {
    campaign_id: { type: "string", description: "Campaign ID without dashes." },
    target_cpa: { type: "number", description: "Target CPA in account currency." },
  }, ["campaign_id", "target_cpa"]),
  mutationTool("ads_update_target_roas", "Safely update campaign target ROAS.", {
    campaign_id: { type: "string", description: "Campaign ID without dashes." },
    target_roas: { type: "number", description: "Target ROAS as a decimal, e.g. 3.5." },
  }, ["campaign_id", "target_roas"]),
  mutationTool("ads_add_campaign_negative_keywords", "Safely add campaign negative keywords.", {
    campaign_id: { type: "string", description: "Campaign ID without dashes." },
    keywords: { type: "array", items: { type: "string" }, description: "Negative keyword texts." },
    match_type: { type: "string", enum: ["BROAD", "PHRASE", "EXACT"], default: "PHRASE" },
  }, ["campaign_id", "keywords"]),
  mutationTool("ads_add_ad_group_negative_keywords", "Safely add ad group negative keywords.", {
    ad_group_id: { type: "string", description: "Ad group ID without dashes." },
    keywords: { type: "array", items: { type: "string" }, description: "Negative keyword texts." },
    match_type: { type: "string", enum: ["BROAD", "PHRASE", "EXACT"], default: "PHRASE" },
  }, ["ad_group_id", "keywords"]),
  mutationTool("ads_add_keywords", "Safely add biddable keywords to an ad group.", {
    ad_group_id: { type: "string", description: "Ad group ID without dashes." },
    keywords: { type: "array", items: { type: "string" }, description: "Keyword texts." },
    match_type: { type: "string", enum: ["BROAD", "PHRASE", "EXACT"], default: "PHRASE" },
    cpc_bid: { type: "number", description: "Optional CPC bid in account currency." },
  }, ["ad_group_id", "keywords"]),
  mutationTool("ads_pause_keywords", "Safely pause ad group keywords by criterion IDs.", {
    ad_group_id: { type: "string", description: "Ad group ID without dashes." },
    criterion_ids: { type: "array", items: { type: "string" }, description: "Keyword criterion IDs." },
  }, ["ad_group_id", "criterion_ids"]),
  mutationTool("ads_enable_keywords", "Safely enable ad group keywords by criterion IDs.", {
    ad_group_id: { type: "string", description: "Ad group ID without dashes." },
    criterion_ids: { type: "array", items: { type: "string" }, description: "Keyword criterion IDs." },
  }, ["ad_group_id", "criterion_ids"]),
  mutationTool("ads_update_keyword_bid", "Safely update a keyword CPC bid.", {
    ad_group_id: { type: "string", description: "Ad group ID without dashes." },
    criterion_id: { type: "string", description: "Keyword criterion ID without dashes." },
    cpc_bid: { type: "number", description: "CPC bid in account currency." },
  }, ["ad_group_id", "criterion_id", "cpc_bid"]),
  mutationTool("ads_pause_ad", "Safely pause an ad.", {
    ad_group_id: { type: "string", description: "Ad group ID without dashes." },
    ad_id: { type: "string", description: "Ad ID without dashes." },
  }, ["ad_group_id", "ad_id"]),
  mutationTool("ads_enable_ad", "Safely enable an ad.", {
    ad_group_id: { type: "string", description: "Ad group ID without dashes." },
    ad_id: { type: "string", description: "Ad ID without dashes." },
  }, ["ad_group_id", "ad_id"]),
  mutationTool("ads_create_responsive_search_ad", "Safely create a responsive search ad.", {
    ad_group_id: { type: "string", description: "Ad group ID without dashes." },
    final_urls: { type: "array", items: { type: "string" }, description: "Final URLs." },
    headlines: { type: "array", items: { type: "string" }, description: "RSA headlines." },
    descriptions: { type: "array", items: { type: "string" }, description: "RSA descriptions." },
    path1: { type: "string", description: "Optional path 1." },
    path2: { type: "string", description: "Optional path 2." },
    status: { type: "string", enum: ["ENABLED", "PAUSED"], default: "PAUSED" },
  }, ["ad_group_id", "final_urls", "headlines", "descriptions"]),
  mutationTool("ads_update_responsive_search_ad", "Safely update a responsive search ad.", {
    ad_group_id: { type: "string", description: "Ad group ID without dashes." },
    ad_id: { type: "string", description: "Ad ID without dashes." },
    final_urls: { type: "array", items: { type: "string" }, description: "Optional replacement final URLs." },
    headlines: { type: "array", items: { type: "string" }, description: "Optional replacement headlines." },
    descriptions: { type: "array", items: { type: "string" }, description: "Optional replacement descriptions." },
    path1: { type: "string", description: "Optional path 1." },
    path2: { type: "string", description: "Optional path 2." },
  }, ["ad_group_id", "ad_id"]),
  mutationTool("ads_create_ad_group", "Safely create a search ad group.", {
    campaign_id: { type: "string", description: "Campaign ID without dashes." },
    name: { type: "string", description: "Ad group name." },
    status: { type: "string", enum: ["ENABLED", "PAUSED"], default: "PAUSED" },
    type: { type: "string", enum: ["SEARCH_STANDARD"], default: "SEARCH_STANDARD" },
    cpc_bid: { type: "number", description: "Optional CPC bid in account currency." },
  }, ["campaign_id", "name"]),
  mutationTool("ads_create_search_campaign", "Safely create a search campaign using an existing explicit budget.", {
    name: { type: "string", description: "Campaign name." },
    budget_id: { type: "string", description: "Existing campaign budget ID without dashes." },
    status: { type: "string", enum: ["ENABLED", "PAUSED"], default: "PAUSED" },
    start_date: { type: "string", description: "Optional start date in YYYY-MM-DD format." },
    end_date: { type: "string", description: "Optional end date in YYYY-MM-DD format." },
    bidding_strategy_type: { type: "string", enum: ["MANUAL_CPC", "MAXIMIZE_CONVERSIONS"], default: "MANUAL_CPC" },
  }, ["name", "budget_id"]),
  mutationTool("ads_apply_recommendation", "Safely apply a Google Ads recommendation.", {
    recommendation_resource_name: { type: "string", description: "Full recommendation resource name." },
  }, ["recommendation_resource_name"]),
  mutationTool("ads_dismiss_recommendation", "Safely dismiss a Google Ads recommendation.", {
    recommendation_resource_name: { type: "string", description: "Full recommendation resource name." },
  }, ["recommendation_resource_name"]),
  mutationTool("ads_add_sitelink_asset", "Safely create a sitelink asset.", {
    link_text: { type: "string", description: "Sitelink text." },
    final_urls: { type: "array", items: { type: "string" }, description: "Final URLs." },
    description1: { type: "string", description: "Optional description line 1." },
    description2: { type: "string", description: "Optional description line 2." },
  }, ["link_text", "final_urls"]),
  mutationTool("ads_link_asset_to_campaign", "Safely link an existing asset to a campaign.", {
    campaign_id: { type: "string", description: "Campaign ID without dashes." },
    asset_id: { type: "string", description: "Asset ID without dashes." },
    field_type: { type: "string", description: "Asset field type, for example SITELINK.", default: "SITELINK" },
  }, ["campaign_id", "asset_id"]),
  mutationTool("ads_upload_offline_conversion", "Safely upload offline click conversions. Dry-run is strongly recommended first.", {
    conversions: {
      type: "array",
      description: "Click conversions with gclid, conversion_action, conversion_date_time, and optional value/currency.",
      items: { type: "object" },
    },
  }, ["conversions"]),
];

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
            enum: ADS_DEEP_REPORT_TYPES,
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
    ...ADVANCED_READ_TOOLS,
    ...WRITE_TOOLS,
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

  const normalizeCustomerId = (value, field = "customer_id") => {
    const normalized = String(value || "").replaceAll("-", "").trim();
    if (!/^\d+$/.test(normalized)) {
      throw new Error(`${field} must be a numeric Google Ads ID without dashes.`);
    }
    return normalized;
  };

  const assertNumericId = (value, field) => normalizeCustomerId(value, field);

  const assertDate = (value, field) => {
    if (!value) return undefined;
    const text = String(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      throw new Error(`${field} must use YYYY-MM-DD format.`);
    }
    return text;
  };

  const assertFiniteNumber = (value, field, min = 0) => {
    const number = Number(value);
    if (!Number.isFinite(number) || number < min) {
      throw new Error(`${field} must be a number greater than or equal to ${min}.`);
    }
    return number;
  };

  const amountToMicros = (value, field = "amount") =>
    Math.round(assertFiniteNumber(value, field, 0) * 1_000_000);

  const assertNonEmptyString = (value, field, maxLength = 2048) => {
    const text = String(value || "").trim();
    if (!text) {
      throw new Error(`${field} is required.`);
    }
    if (text.length > maxLength) {
      throw new Error(`${field} is too long. Maximum length is ${maxLength}.`);
    }
    return text;
  };

  const assertStringArray = (value, field, { min = 1, max = 50, itemMax = 2048 } = {}) => {
    if (!Array.isArray(value) || value.length < min || value.length > max) {
      throw new Error(`${field} must be an array with ${min}-${max} items.`);
    }
    return value.map((item, index) => assertNonEmptyString(item, `${field}[${index}]`, itemMax));
  };

  const assertEnum = (value, field, allowed, fallback) => {
    const text = String(value || fallback || "").toUpperCase();
    if (!allowed.includes(text)) {
      throw new Error(`${field} must be one of: ${allowed.join(", ")}.`);
    }
    return text;
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
    if (/\b(MUTATE|CREATE|DELETE|UPDATE|INSERT|DROP|ALTER|TRUNCATE|CALL)\b/i.test(trimmed)) {
      throw new Error("GAQL query contains a forbidden mutating or DDL keyword.");
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

  const campaignResource = (customerId, campaignId) =>
    `customers/${customerId}/campaigns/${assertNumericId(campaignId, "campaign_id")}`;

  const budgetResource = (customerId, budgetId) =>
    `customers/${customerId}/campaignBudgets/${assertNumericId(budgetId, "budget_id")}`;

  const adGroupResource = (customerId, adGroupId) =>
    `customers/${customerId}/adGroups/${assertNumericId(adGroupId, "ad_group_id")}`;

  const adGroupCriterionResource = (customerId, adGroupId, criterionId) =>
    `customers/${customerId}/adGroupCriteria/${assertNumericId(adGroupId, "ad_group_id")}~${assertNumericId(criterionId, "criterion_id")}`;

  const adGroupAdResource = (customerId, adGroupId, adId) =>
    `customers/${customerId}/adGroupAds/${assertNumericId(adGroupId, "ad_group_id")}~${assertNumericId(adId, "ad_id")}`;

  const assetResource = (customerId, assetId) =>
    `customers/${customerId}/assets/${assertNumericId(assetId, "asset_id")}`;

  const allowedMutationCustomerIds = () =>
    new Set(
      String(process.env.GOOGLE_ADS_MUTATION_CUSTOMER_IDS || "")
        .split(",")
        .map((id) => id.replaceAll("-", "").trim())
        .filter(Boolean)
    );

  const mutationSafety = (args, customerId, preview) => {
    const dryRun = args.dry_run !== false;
    const mutationsEnabled = process.env.GOOGLE_ADS_ENABLE_MUTATIONS === "true";
    const allowlist = allowedMutationCustomerIds();
    const customerAllowed = allowlist.has(customerId);
    const confirmed = args.confirm === true;
    const blockedReasons = [];

    if (dryRun) blockedReasons.push("dry_run is true");
    if (!mutationsEnabled) blockedReasons.push("GOOGLE_ADS_ENABLE_MUTATIONS is not true");
    if (!customerAllowed) blockedReasons.push("customer_id is not in GOOGLE_ADS_MUTATION_CUSTOMER_IDS");
    if (!confirmed) blockedReasons.push("confirm is not true");

    return {
      dryRun,
      mutationsEnabled,
      customerAllowed,
      confirmed,
      blockedReasons,
      preview,
    };
  };

  const adsMutationRequest = async (endpoint, body) => {
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
    return {
      data: res.data,
      requestId: res.headers["request-id"] || res.headers["request_id"] || null,
    };
  };

  const executeMutation = async ({ tool, customerId, endpoint, body, args }) => {
    const normalizedCustomerId = normalizeCustomerId(customerId);
    const requestBody = {
      partialFailure: args.partial_failure === true,
      validateOnly: args.validate_only === true,
      ...body,
    };
    const preview = {
      tool,
      customerId: normalizedCustomerId,
      endpoint,
      requestBody,
      note: "Dry-run previews do not call Google Ads mutate endpoints.",
    };
    const safety = mutationSafety(args, normalizedCustomerId, preview);

    if (safety.blockedReasons.length > 0) {
      return {
        executed: false,
        dryRun: safety.dryRun,
        safety,
      };
    }

    const response = await adsMutationRequest(endpoint, requestBody);
    return {
      executed: requestBody.validateOnly !== true,
      validateOnly: requestBody.validateOnly,
      dryRun: false,
      requestId: response.requestId,
      response: response.data,
    };
  };

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

      customer_labels: `SELECT customer.id, customer.descriptive_name,
          customer_label.resource_name, customer_label.label,
          label.id, label.name, label.status, label.text_label.background_color,
          label.text_label.description
        FROM customer_label
        ORDER BY label.name ASC LIMIT ${rowLimit}`,

      customer_user_access: `SELECT customer_user_access.resource_name,
          customer_user_access.user_id, customer_user_access.email_address,
          customer_user_access.access_role,
          customer_user_access.access_creation_date_time,
          customer_user_access.inviter_user_email_address
        FROM customer_user_access
        LIMIT ${rowLimit}`,

      customer_user_access_invitations: `SELECT customer_user_access_invitation.resource_name,
          customer_user_access_invitation.invitation_id,
          customer_user_access_invitation.email_address,
          customer_user_access_invitation.access_role,
          customer_user_access_invitation.invitation_status,
          customer_user_access_invitation.creation_date_time
        FROM customer_user_access_invitation
        LIMIT ${rowLimit}`,

      campaign_settings: `SELECT campaign.id, campaign.name, campaign.status,
          campaign.serving_status, campaign.primary_status,
          campaign.primary_status_reasons, campaign.advertising_channel_type,
          campaign.advertising_channel_sub_type, campaign.bidding_strategy_type,
          campaign.bidding_strategy, campaign.campaign_budget,
          campaign.start_date, campaign.end_date, campaign.optimization_score,
          campaign.tracking_url_template, campaign.final_url_suffix,
          campaign.url_custom_parameters,
          campaign.network_settings.target_google_search,
          campaign.network_settings.target_search_network,
          campaign.network_settings.target_content_network,
          campaign.network_settings.target_partner_search_network,
          campaign.maximize_conversions.target_cpa_micros,
          campaign.maximize_conversion_value.target_roas,
          campaign.target_cpa.target_cpa_micros,
          campaign.target_roas.target_roas
        FROM campaign
        WHERE campaign.status != 'REMOVED' ${campaignFilter}
        ORDER BY campaign.name ASC LIMIT ${rowLimit}`,

      bidding_strategies: `SELECT bidding_strategy.id, bidding_strategy.name,
          bidding_strategy.status, bidding_strategy.type,
          bidding_strategy.currency_code,
          bidding_strategy.effective_currency_code,
          bidding_strategy.target_cpa.target_cpa_micros,
          bidding_strategy.target_roas.target_roas,
          bidding_strategy.maximize_conversions.target_cpa_micros,
          bidding_strategy.maximize_conversion_value.target_roas
        FROM bidding_strategy
        WHERE bidding_strategy.status != 'REMOVED'
        ORDER BY bidding_strategy.name ASC LIMIT ${rowLimit}`,

      campaign_conversion_goals: `SELECT campaign.id, campaign.name,
          campaign_conversion_goal.category, campaign_conversion_goal.origin,
          campaign_conversion_goal.biddable
        FROM campaign_conversion_goal
        WHERE campaign.status != 'REMOVED' ${campaignFilter}
        ORDER BY campaign.name ASC LIMIT ${rowLimit}`,

      customer_conversion_goals: `SELECT customer_conversion_goal.category,
          customer_conversion_goal.origin, customer_conversion_goal.biddable
        FROM customer_conversion_goal
        LIMIT ${rowLimit}`,

      campaign_labels: `SELECT campaign.id, campaign.name, campaign.status,
          campaign_label.resource_name, campaign_label.label,
          label.id, label.name, label.status
        FROM campaign_label
        WHERE campaign.status != 'REMOVED' ${campaignFilter}
        ORDER BY campaign.name ASC LIMIT ${rowLimit}`,

      ad_group_labels: `SELECT campaign.id, campaign.name,
          ad_group.id, ad_group.name, ad_group.status,
          ad_group_label.resource_name, ad_group_label.label,
          label.id, label.name, label.status
        FROM ad_group_label
        WHERE ad_group.status != 'REMOVED' ${campaignFilter} ${adGroupFilter}
        ORDER BY campaign.name ASC, ad_group.name ASC LIMIT ${rowLimit}`,

      keyword_quality: `SELECT campaign.id, campaign.name,
          ad_group.id, ad_group.name,
          ad_group_criterion.criterion_id,
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.status,
          ad_group_criterion.quality_info.quality_score,
          ad_group_criterion.quality_info.creative_quality_score,
          ad_group_criterion.quality_info.post_click_quality_score,
          ad_group_criterion.quality_info.search_predicted_ctr,
          metrics.clicks, metrics.impressions, metrics.ctr,
          metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM keyword_view
        ${adGroupWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      device_bid_modifiers: `SELECT campaign.id, campaign.name,
          ad_group.id, ad_group.name,
          ad_group_bid_modifier.criterion_id,
          ad_group_bid_modifier.bid_modifier,
          ad_group_bid_modifier.device.type
        FROM ad_group_bid_modifier
        WHERE campaign.status != 'REMOVED'
          AND ad_group.status != 'REMOVED'
          ${campaignFilter} ${adGroupFilter}
        ORDER BY campaign.name ASC, ad_group.name ASC LIMIT ${rowLimit}`,

      placements: `SELECT campaign.id, campaign.name,
          ad_group.id, ad_group.name,
          ad_group_criterion.criterion_id, ad_group_criterion.status,
          ad_group_criterion.negative, ad_group_criterion.placement.url,
          metrics.clicks, metrics.impressions, metrics.ctr,
          metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM detail_placement_view
        ${adGroupWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      topics: `SELECT campaign.id, campaign.name,
          ad_group.id, ad_group.name,
          ad_group_criterion.criterion_id, ad_group_criterion.status,
          ad_group_criterion.negative, ad_group_criterion.topic.path,
          metrics.clicks, metrics.impressions, metrics.ctr,
          metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM topic_view
        ${adGroupWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      campaign_asset_links: `SELECT campaign.id, campaign.name, campaign.status,
          campaign_asset.asset, campaign_asset.field_type,
          campaign_asset.status, asset.id, asset.name, asset.type,
          asset.text_asset.text, asset.sitelink_asset.link_text,
          asset.callout_asset.callout_text,
          asset.structured_snippet_asset.header,
          asset.call_asset.phone_number,
          asset.lead_form_asset.business_name
        FROM campaign_asset
        WHERE campaign.status != 'REMOVED'
          AND campaign_asset.status != 'REMOVED'
          ${campaignFilter}
        ORDER BY campaign.name ASC LIMIT ${rowLimit}`,

      ad_group_asset_links: `SELECT campaign.id, campaign.name,
          ad_group.id, ad_group.name,
          ad_group_asset.asset, ad_group_asset.field_type,
          ad_group_asset.status, asset.id, asset.name, asset.type,
          asset.text_asset.text, asset.sitelink_asset.link_text,
          asset.callout_asset.callout_text
        FROM ad_group_asset
        WHERE campaign.status != 'REMOVED'
          AND ad_group.status != 'REMOVED'
          AND ad_group_asset.status != 'REMOVED'
          ${campaignFilter} ${adGroupFilter}
        ORDER BY campaign.name ASC, ad_group.name ASC LIMIT ${rowLimit}`,

      customer_asset_links: `SELECT customer_asset.asset,
          customer_asset.field_type, customer_asset.status,
          asset.id, asset.name, asset.type, asset.text_asset.text,
          asset.sitelink_asset.link_text, asset.callout_asset.callout_text,
          asset.structured_snippet_asset.header,
          asset.call_asset.phone_number,
          asset.image_asset.full_size.url
        FROM customer_asset
        WHERE customer_asset.status != 'REMOVED'
        ORDER BY asset.id ASC LIMIT ${rowLimit}`,

      asset_details: `SELECT asset.id, asset.name, asset.type,
          asset.text_asset.text, asset.sitelink_asset.link_text,
          asset.sitelink_asset.description1,
          asset.sitelink_asset.description2,
          asset.callout_asset.callout_text,
          asset.structured_snippet_asset.header,
          asset.structured_snippet_asset.values,
          asset.call_asset.phone_number,
          asset.price_asset.type,
          asset.promotion_asset.promotion_target,
          asset.image_asset.full_size.url,
          asset.youtube_video_asset.youtube_video_id,
          asset.lead_form_asset.business_name
        FROM asset
        ORDER BY asset.id DESC LIMIT ${rowLimit}`,

      pmax_listing_groups: `SELECT campaign.id, campaign.name, asset_group.id,
          asset_group.name, asset_group_listing_group_filter.id,
          asset_group_listing_group_filter.type,
          asset_group_listing_group_filter.listing_source,
          asset_group_listing_group_filter.case_value.product_item_id.value,
          asset_group_listing_group_filter.case_value.product_brand.value,
          asset_group_listing_group_filter.case_value.product_category.category_id,
          asset_group_listing_group_filter.parent_listing_group_filter,
          asset_group_listing_group_filter.path,
          metrics.clicks, metrics.impressions, metrics.ctr,
          metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM asset_group_product_group_view
        WHERE campaign.status != 'REMOVED' ${campaignFilter} ${dateClause}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      pmax_search_terms: `SELECT campaign.id, campaign.name, campaign.status,
          campaign_search_term_view.search_term,
          metrics.clicks, metrics.impressions, metrics.ctr,
          metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM campaign_search_term_view
        WHERE campaign.status != 'REMOVED' ${campaignFilter} ${dateClause}
        ORDER BY metrics.clicks DESC LIMIT ${rowLimit}`,

      shopping_listing_groups: `SELECT campaign.id, campaign.name,
          ad_group.id, ad_group.name,
          ad_group_criterion.criterion_id,
          ad_group_criterion.listing_group.type,
          ad_group_criterion.listing_group.parent_ad_group_criterion,
          ad_group_criterion.listing_group.case_value.product_item_id.value,
          ad_group_criterion.listing_group.case_value.product_brand.value,
          ad_group_criterion.listing_group.case_value.product_category.category_id,
          metrics.clicks, metrics.impressions, metrics.ctr,
          metrics.average_cpc, metrics.conversions, metrics.cost_micros
        FROM product_group_view
        ${adGroupWhere}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      demand_gen_campaigns: `SELECT campaign.id, campaign.name, campaign.status,
          campaign.advertising_channel_type,
          campaign.advertising_channel_sub_type,
          campaign.bidding_strategy_type, metrics.clicks,
          metrics.impressions, metrics.ctr, metrics.average_cpc,
          metrics.conversions, metrics.cost_micros
        FROM campaign
        WHERE campaign.status != 'REMOVED'
          AND campaign.advertising_channel_type = DEMAND_GEN
          ${campaignFilter} ${dateClause}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,

      video_campaigns: `SELECT campaign.id, campaign.name, campaign.status,
          campaign.advertising_channel_type,
          campaign.advertising_channel_sub_type,
          campaign.bidding_strategy_type, metrics.video_views,
          metrics.video_view_rate, metrics.average_cpv,
          metrics.clicks, metrics.impressions, metrics.cost_micros,
          metrics.conversions
        FROM campaign
        WHERE campaign.status != 'REMOVED'
          AND campaign.advertising_channel_type = VIDEO
          ${campaignFilter} ${dateClause}
        ORDER BY metrics.cost_micros DESC LIMIT ${rowLimit}`,
    };

    if (!queries[report_type]) {
      throw new Error(`Unsupported deep report type: ${report_type}`);
    }

    return queries[report_type];
  };

  const listClientAccounts = async (managerCustomerId) => {
    const normalizedManagerId = normalizeCustomerId(managerCustomerId, "customer_id");
    const results = await query(
      normalizedManagerId,
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
      .filter((client) => client && String(client.id) !== String(normalizedManagerId))
      .map((client) => ({
        ...client,
        parentCustomerId: normalizedManagerId,
      }));
  };

  const safeReportSection = async (customerId, label, reportArgs) => {
    try {
      const gaqlQuery = deepReportQuery({ customer_id: customerId, ...reportArgs });
      const rows = await query(customerId, gaqlQuery);
      return { label, reportType: reportArgs.report_type, query: gaqlQuery, rows };
    } catch (error) {
      return { label, reportType: reportArgs.report_type, error: error.message };
    }
  };

  const buildAccountHierarchy = async (managerCustomerId, maxDepth = 5, depth = 0, seen = new Set()) => {
    const normalizedManagerId = normalizeCustomerId(managerCustomerId, "customer_id");
    if (depth >= maxDepth || seen.has(normalizedManagerId)) {
      return [];
    }
    seen.add(normalizedManagerId);

    const clients = await listClientAccounts(normalizedManagerId);
    return Promise.all(
      clients.map(async (client) => ({
        ...client,
        children: client.manager
          ? await buildAccountHierarchy(client.id, maxDepth, depth + 1, seen)
          : [],
      }))
    );
  };

  const makeTextAssets = (texts, field, maxItems) =>
    assertStringArray(texts, field, { min: 1, max: maxItems, itemMax: 90 }).map((text) => ({
      text,
    }));

  const buildKeywordOperations = ({ customerId, adGroupId, keywords, matchType, negative, cpcBid }) =>
    assertStringArray(keywords, "keywords", { min: 1, max: 100, itemMax: 80 }).map((keyword) => ({
      create: {
        adGroup: adGroupResource(customerId, adGroupId),
        status: "ENABLED",
        negative,
        keyword: {
          text: keyword,
          matchType: assertEnum(matchType, "match_type", ["BROAD", "PHRASE", "EXACT"], "PHRASE"),
        },
        ...(cpcBid !== undefined && { cpcBidMicros: amountToMicros(cpcBid, "cpc_bid") }),
      },
    }));

  const buildMutation = (toolName, args, customerId) => {
    switch (toolName) {
      case "ads_pause_campaign":
      case "ads_enable_campaign": {
        const status = toolName === "ads_pause_campaign" ? "PAUSED" : "ENABLED";
        return {
          endpoint: `/customers/${customerId}/campaigns:mutate`,
          body: {
            operations: [
              {
                update: { resourceName: campaignResource(customerId, args.campaign_id), status },
                updateMask: "status",
              },
            ],
          },
        };
      }
      case "ads_update_campaign_budget":
        return {
          endpoint: `/customers/${customerId}/campaignBudgets:mutate`,
          body: {
            operations: [
              {
                update: {
                  resourceName: budgetResource(customerId, args.budget_id),
                  amountMicros: amountToMicros(args.amount),
                },
                updateMask: "amount_micros",
              },
            ],
          },
        };
      case "ads_update_campaign_dates": {
        const update = { resourceName: campaignResource(customerId, args.campaign_id) };
        const masks = [];
        const startDate = assertDate(args.start_date, "start_date");
        const endDate = assertDate(args.end_date, "end_date");
        if (startDate) {
          update.startDate = startDate;
          masks.push("start_date");
        }
        if (endDate) {
          update.endDate = endDate;
          masks.push("end_date");
        }
        if (masks.length === 0) {
          throw new Error("ads_update_campaign_dates requires start_date and/or end_date.");
        }
        return {
          endpoint: `/customers/${customerId}/campaigns:mutate`,
          body: { operations: [{ update, updateMask: masks.join(",") }] },
        };
      }
      case "ads_update_campaign_bidding":
      case "ads_update_target_cpa":
      case "ads_update_target_roas": {
        const update = { resourceName: campaignResource(customerId, args.campaign_id) };
        let updateMask;
        const biddingType =
          toolName === "ads_update_target_cpa"
            ? "MAXIMIZE_CONVERSIONS"
            : toolName === "ads_update_target_roas"
              ? "MAXIMIZE_CONVERSION_VALUE"
              : assertEnum(args.bidding_strategy_type, "bidding_strategy_type", [
                  "MANUAL_CPC",
                  "MAXIMIZE_CONVERSIONS",
                  "MAXIMIZE_CONVERSION_VALUE",
                  "TARGET_CPA",
                  "TARGET_ROAS",
                ]);

        if (biddingType === "MANUAL_CPC") {
          update.manualCpc = {};
          updateMask = "manual_cpc";
        } else if (biddingType === "MAXIMIZE_CONVERSIONS") {
          update.maximizeConversions = {};
          if (args.target_cpa !== undefined) {
            update.maximizeConversions.targetCpaMicros = amountToMicros(args.target_cpa, "target_cpa");
            updateMask = "maximize_conversions.target_cpa_micros";
          } else {
            updateMask = "maximize_conversions";
          }
        } else if (biddingType === "MAXIMIZE_CONVERSION_VALUE") {
          update.maximizeConversionValue = {};
          if (args.target_roas !== undefined) {
            update.maximizeConversionValue.targetRoas = assertFiniteNumber(args.target_roas, "target_roas", 0);
            updateMask = "maximize_conversion_value.target_roas";
          } else {
            updateMask = "maximize_conversion_value";
          }
        } else if (biddingType === "TARGET_CPA") {
          update.targetCpa = { targetCpaMicros: amountToMicros(args.target_cpa, "target_cpa") };
          updateMask = "target_cpa.target_cpa_micros";
        } else if (biddingType === "TARGET_ROAS") {
          update.targetRoas = { targetRoas: assertFiniteNumber(args.target_roas, "target_roas", 0) };
          updateMask = "target_roas.target_roas";
        }
        return {
          endpoint: `/customers/${customerId}/campaigns:mutate`,
          body: { operations: [{ update, updateMask }] },
        };
      }
      case "ads_add_campaign_negative_keywords":
        return {
          endpoint: `/customers/${customerId}/campaignCriteria:mutate`,
          body: {
            operations: assertStringArray(args.keywords, "keywords", { min: 1, max: 100, itemMax: 80 }).map((keyword) => ({
              create: {
                campaign: campaignResource(customerId, args.campaign_id),
                negative: true,
                keyword: {
                  text: keyword,
                  matchType: assertEnum(args.match_type, "match_type", ["BROAD", "PHRASE", "EXACT"], "PHRASE"),
                },
              },
            })),
          },
        };
      case "ads_add_ad_group_negative_keywords":
        return {
          endpoint: `/customers/${customerId}/adGroupCriteria:mutate`,
          body: {
            operations: buildKeywordOperations({
              customerId,
              adGroupId: args.ad_group_id,
              keywords: args.keywords,
              matchType: args.match_type,
              negative: true,
            }),
          },
        };
      case "ads_add_keywords":
        return {
          endpoint: `/customers/${customerId}/adGroupCriteria:mutate`,
          body: {
            operations: buildKeywordOperations({
              customerId,
              adGroupId: args.ad_group_id,
              keywords: args.keywords,
              matchType: args.match_type,
              negative: false,
              cpcBid: args.cpc_bid,
            }),
          },
        };
      case "ads_pause_keywords":
      case "ads_enable_keywords": {
        const status = toolName === "ads_pause_keywords" ? "PAUSED" : "ENABLED";
        return {
          endpoint: `/customers/${customerId}/adGroupCriteria:mutate`,
          body: {
            operations: assertStringArray(args.criterion_ids, "criterion_ids", { min: 1, max: 100, itemMax: 32 }).map((criterionId) => ({
              update: {
                resourceName: adGroupCriterionResource(customerId, args.ad_group_id, criterionId),
                status,
              },
              updateMask: "status",
            })),
          },
        };
      }
      case "ads_update_keyword_bid":
        return {
          endpoint: `/customers/${customerId}/adGroupCriteria:mutate`,
          body: {
            operations: [
              {
                update: {
                  resourceName: adGroupCriterionResource(customerId, args.ad_group_id, args.criterion_id),
                  cpcBidMicros: amountToMicros(args.cpc_bid, "cpc_bid"),
                },
                updateMask: "cpc_bid_micros",
              },
            ],
          },
        };
      case "ads_pause_ad":
      case "ads_enable_ad": {
        const status = toolName === "ads_pause_ad" ? "PAUSED" : "ENABLED";
        return {
          endpoint: `/customers/${customerId}/adGroupAds:mutate`,
          body: {
            operations: [
              {
                update: { resourceName: adGroupAdResource(customerId, args.ad_group_id, args.ad_id), status },
                updateMask: "status",
              },
            ],
          },
        };
      }
      case "ads_create_responsive_search_ad":
        return {
          endpoint: `/customers/${customerId}/adGroupAds:mutate`,
          body: {
            operations: [
              {
                create: {
                  adGroup: adGroupResource(customerId, args.ad_group_id),
                  status: assertEnum(args.status, "status", ["ENABLED", "PAUSED"], "PAUSED"),
                  ad: {
                    finalUrls: assertStringArray(args.final_urls, "final_urls", { min: 1, max: 10 }),
                    responsiveSearchAd: {
                      headlines: makeTextAssets(args.headlines, "headlines", 15),
                      descriptions: makeTextAssets(args.descriptions, "descriptions", 4),
                      ...(args.path1 && { path1: assertNonEmptyString(args.path1, "path1", 15) }),
                      ...(args.path2 && { path2: assertNonEmptyString(args.path2, "path2", 15) }),
                    },
                  },
                },
              },
            ],
          },
        };
      case "ads_update_responsive_search_ad": {
        const ad = {};
        const masks = [];
        if (args.final_urls) {
          ad.finalUrls = assertStringArray(args.final_urls, "final_urls", { min: 1, max: 10 });
          masks.push("ad.final_urls");
        }
        const rsa = {};
        if (args.headlines) {
          rsa.headlines = makeTextAssets(args.headlines, "headlines", 15);
          masks.push("ad.responsive_search_ad.headlines");
        }
        if (args.descriptions) {
          rsa.descriptions = makeTextAssets(args.descriptions, "descriptions", 4);
          masks.push("ad.responsive_search_ad.descriptions");
        }
        if (args.path1) {
          rsa.path1 = assertNonEmptyString(args.path1, "path1", 15);
          masks.push("ad.responsive_search_ad.path1");
        }
        if (args.path2) {
          rsa.path2 = assertNonEmptyString(args.path2, "path2", 15);
          masks.push("ad.responsive_search_ad.path2");
        }
        if (Object.keys(rsa).length > 0) {
          ad.responsiveSearchAd = rsa;
        }
        if (masks.length === 0) {
          throw new Error("ads_update_responsive_search_ad requires at least one editable field.");
        }
        return {
          endpoint: `/customers/${customerId}/adGroupAds:mutate`,
          body: {
            operations: [
              {
                update: {
                  resourceName: adGroupAdResource(customerId, args.ad_group_id, args.ad_id),
                  ad,
                },
                updateMask: masks.join(","),
              },
            ],
          },
        };
      }
      case "ads_create_ad_group":
        return {
          endpoint: `/customers/${customerId}/adGroups:mutate`,
          body: {
            operations: [
              {
                create: {
                  campaign: campaignResource(customerId, args.campaign_id),
                  name: assertNonEmptyString(args.name, "name", 255),
                  status: assertEnum(args.status, "status", ["ENABLED", "PAUSED"], "PAUSED"),
                  type: assertEnum(args.type, "type", ["SEARCH_STANDARD"], "SEARCH_STANDARD"),
                  ...(args.cpc_bid !== undefined && { cpcBidMicros: amountToMicros(args.cpc_bid, "cpc_bid") }),
                },
              },
            ],
          },
        };
      case "ads_create_search_campaign": {
        const campaign = {
          name: assertNonEmptyString(args.name, "name", 255),
          status: assertEnum(args.status, "status", ["ENABLED", "PAUSED"], "PAUSED"),
          advertisingChannelType: "SEARCH",
          campaignBudget: budgetResource(customerId, args.budget_id),
          networkSettings: {
            targetGoogleSearch: true,
            targetSearchNetwork: true,
            targetContentNetwork: false,
            targetPartnerSearchNetwork: false,
          },
        };
        const startDate = assertDate(args.start_date, "start_date");
        const endDate = assertDate(args.end_date, "end_date");
        if (startDate) campaign.startDate = startDate;
        if (endDate) campaign.endDate = endDate;
        const biddingType = assertEnum(
          args.bidding_strategy_type,
          "bidding_strategy_type",
          ["MANUAL_CPC", "MAXIMIZE_CONVERSIONS"],
          "MANUAL_CPC"
        );
        if (biddingType === "MANUAL_CPC") campaign.manualCpc = {};
        if (biddingType === "MAXIMIZE_CONVERSIONS") campaign.maximizeConversions = {};
        return {
          endpoint: `/customers/${customerId}/campaigns:mutate`,
          body: { operations: [{ create: campaign }] },
        };
      }
      case "ads_apply_recommendation":
        return {
          endpoint: `/customers/${customerId}/recommendations:apply`,
          body: {
            operations: [
              { resourceName: assertNonEmptyString(args.recommendation_resource_name, "recommendation_resource_name") },
            ],
          },
        };
      case "ads_dismiss_recommendation":
        return {
          endpoint: `/customers/${customerId}/recommendations:dismiss`,
          body: {
            operations: [
              { resourceName: assertNonEmptyString(args.recommendation_resource_name, "recommendation_resource_name") },
            ],
          },
        };
      case "ads_add_sitelink_asset":
        return {
          endpoint: `/customers/${customerId}/assets:mutate`,
          body: {
            operations: [
              {
                create: {
                  finalUrls: assertStringArray(args.final_urls, "final_urls", { min: 1, max: 10 }),
                  sitelinkAsset: {
                    linkText: assertNonEmptyString(args.link_text, "link_text", 25),
                    ...(args.description1 && {
                      description1: assertNonEmptyString(args.description1, "description1", 35),
                    }),
                    ...(args.description2 && {
                      description2: assertNonEmptyString(args.description2, "description2", 35),
                    }),
                  },
                },
              },
            ],
          },
        };
      case "ads_link_asset_to_campaign":
        return {
          endpoint: `/customers/${customerId}/campaignAssets:mutate`,
          body: {
            operations: [
              {
                create: {
                  campaign: campaignResource(customerId, args.campaign_id),
                  asset: assetResource(customerId, args.asset_id),
                  fieldType: assertNonEmptyString(args.field_type || "SITELINK", "field_type", 80),
                  status: "ENABLED",
                },
              },
            ],
          },
        };
      case "ads_upload_offline_conversion": {
        const conversions = Array.isArray(args.conversions) ? args.conversions : [];
        if (conversions.length === 0 || conversions.length > 100) {
          throw new Error("conversions must contain 1-100 conversion objects.");
        }
        return {
          endpoint: `/customers/${customerId}:uploadClickConversions`,
          body: {
            conversions: conversions.map((conversion, index) => ({
              gclid: assertNonEmptyString(conversion.gclid, `conversions[${index}].gclid`, 512),
              conversionAction: assertNonEmptyString(
                conversion.conversion_action,
                `conversions[${index}].conversion_action`
              ),
              conversionDateTime: assertNonEmptyString(
                conversion.conversion_date_time,
                `conversions[${index}].conversion_date_time`
              ),
              ...(conversion.conversion_value !== undefined && {
                conversionValue: assertFiniteNumber(
                  conversion.conversion_value,
                  `conversions[${index}].conversion_value`,
                  0
                ),
              }),
              ...(conversion.currency_code && {
                currencyCode: assertNonEmptyString(conversion.currency_code, `conversions[${index}].currency_code`, 3),
              }),
              ...(conversion.order_id && {
                orderId: assertNonEmptyString(conversion.order_id, `conversions[${index}].order_id`, 64),
              }),
            })),
          },
        };
      }
      default:
        throw new Error(`Unsupported Google Ads mutation tool: ${toolName}`);
    }
  };

  const mutationToolNames = new Set(WRITE_TOOLS.map((tool) => tool.name));

  if (name === "ads_account_hierarchy") {
    const customerId = normalizeCustomerId(args.customer_id);
    const maxDepth = Math.min(Math.max(Number(args.max_depth) || 5, 1), 10);
    return {
      rootCustomerId: customerId,
      maxDepth,
      children: await buildAccountHierarchy(customerId, maxDepth),
    };
  }

  if (name === "ads_customer_details") {
    const customerId = normalizeCustomerId(args.customer_id);
    const sections = await Promise.all([
      safeReportSection(customerId, "customer", {
        report_type: "campaign_settings",
        limit: 1,
      }),
      safeReportSection(customerId, "labels", {
        report_type: "customer_labels",
        limit: 100,
      }),
      safeReportSection(customerId, "user_access", {
        report_type: "customer_user_access",
        limit: 100,
      }),
      safeReportSection(customerId, "user_access_invitations", {
        report_type: "customer_user_access_invitations",
        limit: 100,
      }),
      safeReportSection(customerId, "customer_conversion_goals", {
        report_type: "customer_conversion_goals",
        limit: 100,
      }),
    ]);
    const customerRows = await query(
      customerId,
      `SELECT customer.id, customer.descriptive_name,
        customer.currency_code, customer.time_zone, customer.manager,
        customer.test_account, customer.status, customer.optimization_score,
        customer.tracking_url_template, customer.final_url_suffix,
        customer.auto_tagging_enabled
      FROM customer LIMIT 1`
    );
    return {
      customer: customerRows[0]?.customer,
      sections,
    };
  }

  if (name === "ads_campaign_full_audit") {
    const customerId = normalizeCustomerId(args.customer_id);
    const campaignId = assertNumericId(args.campaign_id, "campaign_id");
    const baseArgs = {
      campaign_id: campaignId,
      start_date: args.start_date,
      end_date: args.end_date,
      limit: limitValue(args.limit, 100, 500),
    };
    const sections = await Promise.all(
      [
        "campaign_settings",
        "campaign_budgets",
        "bidding_strategies",
        "campaign_conversion_goals",
        "campaign_labels",
        "location_targets",
        "excluded_locations",
        "proximity_targets",
        "ad_schedules",
        "device_performance",
        "targeted_location_performance",
        "day_of_week_performance",
        "hour_of_day_performance",
        "campaign_audience_targets",
        "campaign_asset_links",
        "asset_performance",
        "recommendations",
        "change_events",
        "pmax_asset_groups",
        "pmax_asset_group_assets",
        "pmax_listing_groups",
        "pmax_search_terms",
        "shopping_products",
        "shopping_listing_groups",
        "video_campaigns",
        "demand_gen_campaigns",
      ].map((reportType) =>
        safeReportSection(customerId, reportType, { ...baseArgs, report_type: reportType })
      )
    );
    return { customerId, campaignId, sections };
  }

  if (name === "ads_ad_group_full_audit") {
    const customerId = normalizeCustomerId(args.customer_id);
    const adGroupId = assertNumericId(args.ad_group_id, "ad_group_id");
    const baseArgs = {
      campaign_id: args.campaign_id,
      ad_group_id: adGroupId,
      start_date: args.start_date,
      end_date: args.end_date,
      limit: limitValue(args.limit, 100, 500),
    };
    const sections = await Promise.all(
      [
        "keyword_quality",
        "ad_group_negative_keywords",
        "ad_group_labels",
        "ad_group_audience_targets",
        "ad_group_audience_performance",
        "device_bid_modifiers",
        "placements",
        "topics",
        "ad_group_asset_links",
        "dynamic_search_ads",
        "dynamic_search_targets",
      ].map((reportType) =>
        safeReportSection(customerId, reportType, { ...baseArgs, report_type: reportType })
      )
    );
    return { customerId, adGroupId, sections };
  }

  if (mutationToolNames.has(name)) {
    const customerId = normalizeCustomerId(args.customer_id);
    const mutation = buildMutation(name, args, customerId);
    return executeMutation({
      tool: name,
      customerId,
      endpoint: mutation.endpoint,
      body: mutation.body,
      args,
    });
  }

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
