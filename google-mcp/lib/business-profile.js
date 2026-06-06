import axios from "axios";

const ACCOUNT_MANAGEMENT_BASE = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_INFO_BASE = "https://mybusinessbusinessinformation.googleapis.com/v1";
const PERFORMANCE_BASE = "https://businessprofileperformance.googleapis.com/v1";

async function getHeaders(authClient) {
  const token = (await authClient.getAccessToken()).token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function toDateParts(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return { year, month, day };
}

function toMonthParts(value) {
  const [year, month] = String(value).split("-").map(Number);
  return { year, month };
}

function pickLocationFields(location) {
  return {
    name: location.name,
    title: location.title,
    storeCode: location.storeCode,
    languageCode: location.languageCode,
    websiteUri: location.websiteUri,
    phoneNumbers: location.phoneNumbers,
    storefrontAddress: location.storefrontAddress,
    regularHours: location.regularHours,
    specialHours: location.specialHours,
    openInfo: location.openInfo,
    profile: location.profile,
    metadata: location.metadata,
    categories: location.categories,
    serviceArea: location.serviceArea,
  };
}

export function getBusinessProfileTools() {
  return [
    {
      name: "gbp_list_accounts",
      description: "List Google Business Profile accounts available to the authenticated user.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    {
      name: "gbp_list_locations",
      description: "List locations for a Google Business Profile account.",
      inputSchema: {
        type: "object",
        properties: {
          account_name: {
            type: "string",
            description: "Business Profile account resource name. Format: accounts/{accountId}.",
          },
          page_size: {
            type: "number",
            description: "Maximum number of locations to return. Defaults to 100.",
            default: 100,
          },
        },
        required: ["account_name"],
      },
    },
    {
      name: "gbp_get_location",
      description: "Get detailed information for a Google Business Profile location.",
      inputSchema: {
        type: "object",
        properties: {
          location_name: {
            type: "string",
            description: "Location resource name. Format: locations/{locationId}.",
          },
        },
        required: ["location_name"],
      },
    },
    {
      name: "gbp_performance",
      description: "Get Google Business Profile daily performance metrics for a location.",
      inputSchema: {
        type: "object",
        properties: {
          location_name: {
            type: "string",
            description: "Location resource name. Format: locations/{locationId}.",
          },
          start_date: {
            type: "string",
            description: "Start date in YYYY-MM-DD format.",
          },
          end_date: {
            type: "string",
            description: "End date in YYYY-MM-DD format.",
          },
          daily_metrics: {
            type: "array",
            items: { type: "string" },
            description:
              "Daily metrics such as WEBSITE_CLICKS, CALL_CLICKS, BUSINESS_DIRECTION_REQUESTS, BUSINESS_IMPRESSIONS_DESKTOP_MAPS.",
          },
        },
        required: ["location_name", "start_date", "end_date", "daily_metrics"],
      },
    },
    {
      name: "gbp_search_keyword_impressions",
      description: "Get monthly Google Business Profile search keyword impressions for a location.",
      inputSchema: {
        type: "object",
        properties: {
          location_name: {
            type: "string",
            description: "Location resource name. Format: locations/{locationId}.",
          },
          start_month: {
            type: "string",
            description: "Start month in YYYY-MM format.",
          },
          end_month: {
            type: "string",
            description: "End month in YYYY-MM format.",
          },
          page_size: {
            type: "number",
            description: "Maximum number of keywords to return. Defaults to 100.",
            default: 100,
          },
        },
        required: ["location_name", "start_month", "end_month"],
      },
    },
  ];
}

export async function handleBusinessProfileTool(name, args, authClient) {
  const headers = await getHeaders(authClient);

  if (name === "gbp_list_accounts") {
    const res = await axios.get(`${ACCOUNT_MANAGEMENT_BASE}/accounts`, { headers });
    return (res.data.accounts || []).map((account) => ({
      name: account.name,
      accountName: account.accountName,
      type: account.type,
      role: account.role,
      verificationState: account.verificationState,
      vettedState: account.vettedState,
      permissionLevel: account.permissionLevel,
    }));
  }

  if (name === "gbp_list_locations") {
    const { account_name, page_size = 100 } = args;
    const res = await axios.get(`${BUSINESS_INFO_BASE}/${account_name}/locations`, {
      headers,
      params: {
        pageSize: Math.min(Number(page_size) || 100, 100),
        readMask: [
          "name",
          "title",
          "storeCode",
          "websiteUri",
          "phoneNumbers",
          "regularHours",
          "metadata",
          "categories",
          "openInfo",
        ].join(","),
      },
    });
    return (res.data.locations || []).map(pickLocationFields);
  }

  if (name === "gbp_get_location") {
    const { location_name } = args;
    const res = await axios.get(`${BUSINESS_INFO_BASE}/${location_name}`, {
      headers,
      params: {
        readMask: [
          "name",
          "title",
          "storeCode",
          "languageCode",
          "websiteUri",
          "phoneNumbers",
          "storefrontAddress",
          "regularHours",
          "specialHours",
          "openInfo",
          "profile",
          "metadata",
          "categories",
          "serviceArea",
        ].join(","),
      },
    });
    return pickLocationFields(res.data);
  }

  if (name === "gbp_performance") {
    const { location_name, start_date, end_date, daily_metrics } = args;
    const res = await axios.get(`${PERFORMANCE_BASE}/${location_name}:fetchMultiDailyMetricsTimeSeries`, {
      headers,
      params: {
        dailyMetrics: daily_metrics,
        "dailyRange.startDate.year": toDateParts(start_date).year,
        "dailyRange.startDate.month": toDateParts(start_date).month,
        "dailyRange.startDate.day": toDateParts(start_date).day,
        "dailyRange.endDate.year": toDateParts(end_date).year,
        "dailyRange.endDate.month": toDateParts(end_date).month,
        "dailyRange.endDate.day": toDateParts(end_date).day,
      },
      paramsSerializer: {
        indexes: null,
      },
    });
    return res.data.multiDailyMetricTimeSeries || [];
  }

  if (name === "gbp_search_keyword_impressions") {
    const { location_name, start_month, end_month, page_size = 100 } = args;
    const res = await axios.get(`${PERFORMANCE_BASE}/${location_name}/searchkeywords/impressions/monthly`, {
      headers,
      params: {
        pageSize: Math.min(Number(page_size) || 100, 100),
        "monthlyRange.startMonth.year": toMonthParts(start_month).year,
        "monthlyRange.startMonth.month": toMonthParts(start_month).month,
        "monthlyRange.endMonth.year": toMonthParts(end_month).year,
        "monthlyRange.endMonth.month": toMonthParts(end_month).month,
      },
    });
    return res.data.searchKeywordsCounts || res.data.searchKeywordCounts || [];
  }

  throw new Error(`Unknown Business Profile tool: ${name}`);
}
