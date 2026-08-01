import axios from "axios";

const GBP_SERVICES = Object.freeze({
  account_management: "https://mybusinessaccountmanagement.googleapis.com/v1",
  business_information: "https://mybusinessbusinessinformation.googleapis.com/v1",
  performance: "https://businessprofileperformance.googleapis.com/v1",
  notifications: "https://mybusinessnotifications.googleapis.com/v1",
  verifications: "https://mybusinessverifications.googleapis.com/v1",
  business_calls: "https://mybusinessbusinesscalls.googleapis.com/v1",
  lodging: "https://mybusinesslodging.googleapis.com/v1",
  place_actions: "https://mybusinessplaceactions.googleapis.com/v1",
  q_and_a: "https://mybusinessqanda.googleapis.com/v1",
  legacy_v4: "https://mybusiness.googleapis.com/v4",
  media_v1: "https://mybusiness.googleapis.com/v1",
});

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const MUTATION_SAFETY_PROPERTIES = {
  dry_run: {
    type: "boolean",
    description: "Preview the request without changing Business Profile. Defaults to true.",
    default: true,
  },
  confirm: {
    type: "boolean",
    description:
      "Must be true with dry_run=false and GBP_ENABLE_MUTATIONS=true before a write executes.",
    default: false,
  },
};

const resource = (description) => ({ type: "string", description });
const jsonBody = (description = "Official Google Business Profile API request body.") => ({
  type: "object",
  description,
  additionalProperties: true,
});
const pageProperties = {
  page_size: { type: "number", description: "Page size.", default: 100 },
  page_token: { type: "string", description: "Optional next-page token." },
};

function tool(name, description, properties = {}, required = [], write = false) {
  return {
    name,
    description,
    inputSchema: {
      type: "object",
      properties: write ? { ...properties, ...MUTATION_SAFETY_PROPERTIES } : properties,
      required,
    },
  };
}

function normalizePath(value, field = "path") {
  const path = `/${String(value || "").replace(/^\/+/, "")}`;
  if (
    path === "/" ||
    path.includes("\\") ||
    path.includes("..") ||
    path.includes("#") ||
    path.includes("://") ||
    /[\r\n]/.test(path)
  ) {
    throw new Error(`${field} must be a safe relative Google API path.`);
  }
  return path;
}

function parseDate(value, field) {
  const parts = String(value || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part))) {
    throw new Error(`${field} must use YYYY-MM-DD format.`);
  }
  return { year: parts[0], month: parts[1], day: parts[2] };
}

function parseMonth(value, field) {
  const parts = String(value || "").split("-").map(Number);
  if (parts.length !== 2 || parts.some((part) => !Number.isInteger(part))) {
    throw new Error(`${field} must use YYYY-MM format.`);
  }
  return { year: parts[0], month: parts[1] };
}

function writeSafety(args, preview) {
  const dryRun = args.dry_run !== false;
  const mutationsEnabled =
    String(
      process.env.GBP_ENABLE_MUTATIONS ||
        process.env.GOOGLE_BUSINESS_PROFILE_ENABLE_MUTATIONS ||
        "false"
    ).toLowerCase() === "true";
  const confirmed = args.confirm === true;
  const blockedReasons = [];
  if (dryRun) blockedReasons.push("dry_run is true");
  if (!mutationsEnabled) blockedReasons.push("GBP_ENABLE_MUTATIONS is not true");
  if (!confirmed) blockedReasons.push("confirm is not true");
  return { dryRun, mutationsEnabled, confirmed, blockedReasons, preview };
}

async function getHeaders(authClient) {
  const token = (await authClient.getAccessToken()).token;
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function gbpRequest(
  authClient,
  args,
  { service, method = "GET", path, params, body, mutation }
) {
  const normalizedMethod = String(method).toUpperCase();
  const base = GBP_SERVICES[service];
  if (!base) throw new Error(`Unsupported Business Profile service: ${service}`);
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod)) {
    throw new Error(`Unsupported HTTP method: ${normalizedMethod}`);
  }
  const safePath = normalizePath(path);
  const preview = {
    service,
    method: normalizedMethod,
    endpoint: `${base}${safePath}`,
    params: params || {},
    body: body ?? null,
  };

  const isMutation = mutation ?? WRITE_METHODS.has(normalizedMethod);
  if (isMutation) {
    const safety = writeSafety(args, preview);
    if (safety.blockedReasons.length > 0) {
      return { executed: false, safety };
    }
  }

  const response = await axios.request({
    url: `${base}${safePath}`,
    method: normalizedMethod,
    headers: await getHeaders(authClient),
    params,
    paramsSerializer: { indexes: null },
    ...(body !== undefined ? { data: body } : {}),
  });
  return {
    executed: true,
    service,
    method: normalizedMethod,
    data: response.data,
    requestId: response.headers["x-request-id"] || null,
  };
}

export function getBusinessProfileTools() {
  return [
    tool("gbp_list_accounts", "List Business Profile accounts accessible to the OAuth user."),
    tool("gbp_get_account", "Get one Business Profile account.", {
      account_name: resource("accounts/{accountId}"),
    }, ["account_name"]),
    tool("gbp_list_locations", "List locations for a Business Profile account.", {
      account_name: resource("accounts/{accountId}"),
      read_mask: { type: "string", description: "Comma-separated location fields." },
      ...pageProperties,
    }, ["account_name"]),
    tool("gbp_get_location", "Get a Business Profile location.", {
      location_name: resource("locations/{locationId}"),
      read_mask: { type: "string", description: "Comma-separated location fields." },
    }, ["location_name"]),
    tool("gbp_create_location", "Create a Business Profile location.", {
      account_name: resource("accounts/{accountId}"),
      location: jsonBody("Business Information API Location body."),
      validate_only: { type: "boolean", default: false },
      request_id: { type: "string", description: "Optional UUID used for duplicate detection." },
    }, ["account_name", "location"], true),
    tool("gbp_update_location", "Update fields on a Business Profile location.", {
      location_name: resource("locations/{locationId}"),
      update_mask: { type: "string", description: "Required comma-separated fields to update." },
      location: jsonBody("Business Information API Location body."),
      validate_only: { type: "boolean", default: false },
    }, ["location_name", "update_mask", "location"], true),
    tool("gbp_delete_location", "Delete a Business Profile location.", {
      location_name: resource("locations/{locationId}"),
    }, ["location_name"], true),
    tool("gbp_list_reviews", "List reviews for a location.", {
      parent: resource("accounts/{accountId}/locations/{locationId}"),
      order_by: { type: "string" },
      ...pageProperties,
    }, ["parent"]),
    tool("gbp_get_review", "Get one review.", {
      review_name: resource("accounts/{accountId}/locations/{locationId}/reviews/{reviewId}"),
    }, ["review_name"]),
    tool("gbp_reply_to_review", "Create or update the merchant reply to a review.", {
      review_name: resource("accounts/{accountId}/locations/{locationId}/reviews/{reviewId}"),
      comment: { type: "string", description: "Public merchant reply." },
    }, ["review_name", "comment"], true),
    tool("gbp_delete_review_reply", "Delete the merchant reply from a review.", {
      review_name: resource("accounts/{accountId}/locations/{locationId}/reviews/{reviewId}"),
    }, ["review_name"], true),
    tool("gbp_list_local_posts", "List local posts for a location.", {
      parent: resource("accounts/{accountId}/locations/{locationId}"),
      ...pageProperties,
    }, ["parent"]),
    tool("gbp_create_local_post", "Create a local post.", {
      parent: resource("accounts/{accountId}/locations/{locationId}"),
      local_post: jsonBody(),
    }, ["parent", "local_post"], true),
    tool("gbp_update_local_post", "Update a local post.", {
      post_name: resource("accounts/{accountId}/locations/{locationId}/localPosts/{postId}"),
      update_mask: { type: "string" },
      local_post: jsonBody(),
    }, ["post_name", "update_mask", "local_post"], true),
    tool("gbp_delete_local_post", "Delete a local post.", {
      post_name: resource("accounts/{accountId}/locations/{locationId}/localPosts/{postId}"),
    }, ["post_name"], true),
    tool("gbp_list_media", "List owner media for a location.", {
      parent: resource("accounts/{accountId}/locations/{locationId}"),
      ...pageProperties,
    }, ["parent"]),
    tool("gbp_create_media", "Create a media item after uploading or by source URL.", {
      parent: resource("accounts/{accountId}/locations/{locationId}"),
      media_item: jsonBody(),
    }, ["parent", "media_item"], true),
    tool("gbp_delete_media", "Delete an owner media item.", {
      media_name: resource("accounts/{accountId}/locations/{locationId}/media/{mediaId}"),
    }, ["media_name"], true),
    tool("gbp_list_questions", "List questions for a location.", {
      parent: resource("locations/{locationId}"),
      order_by: { type: "string" },
      ...pageProperties,
    }, ["parent"]),
    tool("gbp_create_question", "Create a question for a location.", {
      parent: resource("locations/{locationId}"),
      question: jsonBody(),
    }, ["parent", "question"], true),
    tool("gbp_update_question", "Update a question authored by the current user.", {
      question_name: resource("locations/{locationId}/questions/{questionId}"),
      update_mask: { type: "string" },
      question: jsonBody(),
    }, ["question_name", "update_mask", "question"], true),
    tool("gbp_delete_question", "Delete a question authored by the current user.", {
      question_name: resource("locations/{locationId}/questions/{questionId}"),
    }, ["question_name"], true),
    tool("gbp_list_answers", "List answers for a question.", {
      question_name: resource("locations/{locationId}/questions/{questionId}"),
      order_by: { type: "string" },
      ...pageProperties,
    }, ["question_name"]),
    tool("gbp_upsert_answer", "Create or update the current user's answer.", {
      question_name: resource("locations/{locationId}/questions/{questionId}"),
      answer: jsonBody(),
    }, ["question_name", "answer"], true),
    tool("gbp_delete_answer", "Delete the current user's answer.", {
      question_name: resource("locations/{locationId}/questions/{questionId}"),
    }, ["question_name"], true),
    tool("gbp_list_verifications", "List verification attempts for a location.", {
      location_name: resource("locations/{locationId}"),
      ...pageProperties,
    }, ["location_name"]),
    tool("gbp_fetch_verification_options", "Fetch eligible verification methods.", {
      location_name: resource("locations/{locationId}"),
      language_code: { type: "string", description: "BCP 47 language code." },
      context: jsonBody("Optional service-business context."),
    }, ["location_name", "language_code"]),
    tool("gbp_verify_location", "Start location verification.", {
      location_name: resource("locations/{locationId}"),
      verification: jsonBody("VerifyLocation request body."),
    }, ["location_name", "verification"], true),
    tool("gbp_complete_verification", "Complete a pending verification.", {
      verification_name: resource("locations/{locationId}/verifications/{verificationId}"),
      pin: { type: "string", description: "Verification PIN." },
    }, ["verification_name", "pin"], true),
    tool("gbp_get_voice_of_merchant", "Get Voice of Merchant state for a location.", {
      location_name: resource("locations/{locationId}"),
    }, ["location_name"]),
    tool("gbp_list_categories", "List matching Business Profile categories.", {
      region_code: { type: "string" },
      language_code: { type: "string" },
      filter: { type: "string" },
      view: { type: "string", enum: ["BASIC", "FULL"] },
      ...pageProperties,
    }, ["region_code", "language_code"]),
    tool("gbp_list_attributes", "List available attributes for a category and region.", {
      parent: resource("locations/{locationId} or categories/{categoryId}"),
      category_name: { type: "string" },
      region_code: { type: "string" },
      language_code: { type: "string" },
      show_all: { type: "boolean", default: false },
      ...pageProperties,
    }),
    tool("gbp_get_notification_setting", "Get Pub/Sub notification settings for an account.", {
      account_name: resource("accounts/{accountId}"),
    }, ["account_name"]),
    tool("gbp_update_notification_setting", "Update Pub/Sub notification settings.", {
      account_name: resource("accounts/{accountId}"),
      update_mask: { type: "string" },
      notification_setting: jsonBody(),
    }, ["account_name", "update_mask", "notification_setting"], true),
    tool("gbp_list_place_action_links", "List booking/order/action links for a location.", {
      location_name: resource("locations/{locationId}"),
      filter: { type: "string" },
      ...pageProperties,
    }, ["location_name"]),
    tool("gbp_create_place_action_link", "Create a place action link.", {
      location_name: resource("locations/{locationId}"),
      place_action_link: jsonBody(),
    }, ["location_name", "place_action_link"], true),
    tool("gbp_update_place_action_link", "Update a place action link.", {
      link_name: resource("locations/{locationId}/placeActionLinks/{linkId}"),
      update_mask: { type: "string" },
      place_action_link: jsonBody(),
    }, ["link_name", "update_mask", "place_action_link"], true),
    tool("gbp_delete_place_action_link", "Delete a place action link.", {
      link_name: resource("locations/{locationId}/placeActionLinks/{linkId}"),
    }, ["link_name"], true),
    tool("gbp_get_lodging", "Get lodging data for a hotel location.", {
      location_name: resource("locations/{locationId}"),
      read_mask: { type: "string" },
    }, ["location_name"]),
    tool("gbp_update_lodging", "Update lodging data for a hotel location.", {
      location_name: resource("locations/{locationId}"),
      update_mask: { type: "string" },
      lodging: jsonBody(),
    }, ["location_name", "update_mask", "lodging"], true),
    tool("gbp_business_calls_insights", "List Business Calls insights for a location.", {
      location_name: resource("locations/{locationId}"),
      start_date: { type: "string" },
      end_date: { type: "string" },
      metric_type: { type: "string", default: "AGGREGATE_COUNT" },
      ...pageProperties,
    }, ["location_name", "start_date", "end_date"]),
    tool("gbp_performance", "Fetch daily Business Profile performance metrics.", {
      location_name: resource("locations/{locationId}"),
      start_date: { type: "string" },
      end_date: { type: "string" },
      daily_metrics: { type: "array", items: { type: "string" } },
    }, ["location_name", "start_date", "end_date", "daily_metrics"]),
    tool("gbp_search_keyword_impressions", "Fetch monthly search keyword impressions.", {
      location_name: resource("locations/{locationId}"),
      start_month: { type: "string" },
      end_month: { type: "string" },
      ...pageProperties,
    }, ["location_name", "start_month", "end_month"]),
    tool("gbp_api_call", "Call any documented Business Profile REST endpoint using a fixed Google service allowlist.", {
      service: { type: "string", enum: Object.keys(GBP_SERVICES) },
      method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"], default: "GET" },
      path: resource("Relative API path only; full URLs are rejected."),
      query: jsonBody("Optional query parameters."),
      body: jsonBody(),
    }, ["service", "method", "path"] , true),
  ];
}

export async function handleBusinessProfileTool(name, args, authClient) {
  const readMask =
    "name,title,storeCode,languageCode,websiteUri,phoneNumbers,storefrontAddress,regularHours,specialHours,openInfo,profile,metadata,categories,serviceArea,labels";
  const get = (service, path, params) => gbpRequest(authClient, args, { service, path, params });
  const write = (service, method, path, body, params) =>
    gbpRequest(authClient, args, { service, method, path, body, params });
  const postRead = (service, path, body, params) =>
    gbpRequest(authClient, args, {
      service,
      method: "POST",
      path,
      body,
      params,
      mutation: false,
    });

  switch (name) {
    case "gbp_list_accounts":
      return get("account_management", "/accounts");
    case "gbp_get_account":
      return get("account_management", `/${args.account_name}`);
    case "gbp_list_locations":
      return get("business_information", `/${args.account_name}/locations`, {
        readMask: args.read_mask || readMask,
        pageSize: Math.min(Number(args.page_size) || 100, 100),
        pageToken: args.page_token,
      });
    case "gbp_get_location":
      return get("business_information", `/${args.location_name}`, {
        readMask: args.read_mask || readMask,
      });
    case "gbp_create_location":
      return write("business_information", "POST", `/${args.account_name}/locations`, args.location, {
        validateOnly: args.validate_only === true,
        requestId: args.request_id,
      });
    case "gbp_update_location":
      return write("business_information", "PATCH", `/${args.location_name}`, args.location, {
        updateMask: args.update_mask,
        validateOnly: args.validate_only === true,
      });
    case "gbp_delete_location":
      return write("business_information", "DELETE", `/${args.location_name}`);
    case "gbp_list_reviews":
      return get("legacy_v4", `/${args.parent}/reviews`, {
        pageSize: Math.min(Number(args.page_size) || 100, 200),
        pageToken: args.page_token,
        orderBy: args.order_by,
      });
    case "gbp_get_review":
      return get("legacy_v4", `/${args.review_name}`);
    case "gbp_reply_to_review":
      return write("legacy_v4", "PUT", `/${args.review_name}/reply`, { comment: args.comment });
    case "gbp_delete_review_reply":
      return write("legacy_v4", "DELETE", `/${args.review_name}/reply`);
    case "gbp_list_local_posts":
      return get("legacy_v4", `/${args.parent}/localPosts`, {
        pageSize: Math.min(Number(args.page_size) || 100, 100),
        pageToken: args.page_token,
      });
    case "gbp_create_local_post":
      return write("legacy_v4", "POST", `/${args.parent}/localPosts`, args.local_post);
    case "gbp_update_local_post":
      return write("legacy_v4", "PATCH", `/${args.post_name}`, args.local_post, {
        updateMask: args.update_mask,
      });
    case "gbp_delete_local_post":
      return write("legacy_v4", "DELETE", `/${args.post_name}`);
    case "gbp_list_media":
      return get("legacy_v4", `/${args.parent}/media`, {
        pageSize: Math.min(Number(args.page_size) || 100, 100),
        pageToken: args.page_token,
      });
    case "gbp_create_media":
      return write("legacy_v4", "POST", `/${args.parent}/media`, args.media_item);
    case "gbp_delete_media":
      return write("legacy_v4", "DELETE", `/${args.media_name}`);
    case "gbp_list_questions":
      return get("q_and_a", `/${args.parent}/questions`, {
        pageSize: Math.min(Number(args.page_size) || 100, 100),
        pageToken: args.page_token,
        orderBy: args.order_by,
      });
    case "gbp_create_question":
      return write("q_and_a", "POST", `/${args.parent}/questions`, args.question);
    case "gbp_update_question":
      return write("q_and_a", "PATCH", `/${args.question_name}`, args.question, {
        updateMask: args.update_mask,
      });
    case "gbp_delete_question":
      return write("q_and_a", "DELETE", `/${args.question_name}`);
    case "gbp_list_answers":
      return get("q_and_a", `/${args.question_name}/answers`, {
        pageSize: Math.min(Number(args.page_size) || 100, 100),
        pageToken: args.page_token,
        orderBy: args.order_by,
      });
    case "gbp_upsert_answer":
      return write("q_and_a", "POST", `/${args.question_name}/answers:upsert`, args.answer);
    case "gbp_delete_answer":
      return write("q_and_a", "DELETE", `/${args.question_name}/answers:delete`);
    case "gbp_list_verifications":
      return get("verifications", `/${args.location_name}/verifications`, {
        pageSize: Math.min(Number(args.page_size) || 100, 100),
        pageToken: args.page_token,
      });
    case "gbp_fetch_verification_options":
      return postRead(
        "verifications",
        `/${args.location_name}:fetchVerificationOptions`,
        { languageCode: args.language_code, ...(args.context ? { context: args.context } : {}) }
      );
    case "gbp_verify_location":
      return write("verifications", "POST", `/${args.location_name}:verify`, args.verification);
    case "gbp_complete_verification":
      return write("verifications", "POST", `/${args.verification_name}:complete`, {
        pin: args.pin,
      });
    case "gbp_get_voice_of_merchant":
      return get("verifications", `/${args.location_name}/VoiceOfMerchantState`);
    case "gbp_list_categories":
      return get("business_information", "/categories", {
        regionCode: args.region_code,
        languageCode: args.language_code,
        filter: args.filter,
        view: args.view,
        pageSize: Math.min(Number(args.page_size) || 100, 100),
        pageToken: args.page_token,
      });
    case "gbp_list_attributes":
      return get("business_information", "/attributes", {
        parent: args.parent,
        categoryName: args.category_name,
        regionCode: args.region_code,
        languageCode: args.language_code,
        showAll: args.show_all === true,
        pageSize: Math.min(Number(args.page_size) || 100, 100),
        pageToken: args.page_token,
      });
    case "gbp_get_notification_setting":
      return get("notifications", `/${args.account_name}/notificationSetting`);
    case "gbp_update_notification_setting":
      return write(
        "notifications",
        "PATCH",
        `/${args.account_name}/notificationSetting`,
        args.notification_setting,
        { updateMask: args.update_mask }
      );
    case "gbp_list_place_action_links":
      return get("place_actions", `/${args.location_name}/placeActionLinks`, {
        filter: args.filter,
        pageSize: Math.min(Number(args.page_size) || 100, 100),
        pageToken: args.page_token,
      });
    case "gbp_create_place_action_link":
      return write(
        "place_actions",
        "POST",
        `/${args.location_name}/placeActionLinks`,
        args.place_action_link
      );
    case "gbp_update_place_action_link":
      return write("place_actions", "PATCH", `/${args.link_name}`, args.place_action_link, {
        updateMask: args.update_mask,
      });
    case "gbp_delete_place_action_link":
      return write("place_actions", "DELETE", `/${args.link_name}`);
    case "gbp_get_lodging":
      return get("lodging", `/${args.location_name}/lodging`, { readMask: args.read_mask });
    case "gbp_update_lodging":
      return write("lodging", "PATCH", `/${args.location_name}/lodging`, args.lodging, {
        updateMask: args.update_mask,
      });
    case "gbp_business_calls_insights": {
      const start = parseDate(args.start_date, "start_date");
      const end = parseDate(args.end_date, "end_date");
      return get("business_calls", `/${args.location_name}/businesscallsinsights`, {
        "filter.startDate.year": start.year,
        "filter.startDate.month": start.month,
        "filter.startDate.day": start.day,
        "filter.endDate.year": end.year,
        "filter.endDate.month": end.month,
        "filter.endDate.day": end.day,
        "filter.metricTypes": args.metric_type || "AGGREGATE_COUNT",
        pageSize: Math.min(Number(args.page_size) || 20, 100),
        pageToken: args.page_token,
      });
    }
    case "gbp_performance": {
      const start = parseDate(args.start_date, "start_date");
      const end = parseDate(args.end_date, "end_date");
      return get("performance", `/${args.location_name}:fetchMultiDailyMetricsTimeSeries`, {
        dailyMetrics: args.daily_metrics,
        "dailyRange.startDate.year": start.year,
        "dailyRange.startDate.month": start.month,
        "dailyRange.startDate.day": start.day,
        "dailyRange.endDate.year": end.year,
        "dailyRange.endDate.month": end.month,
        "dailyRange.endDate.day": end.day,
      });
    }
    case "gbp_search_keyword_impressions": {
      const start = parseMonth(args.start_month, "start_month");
      const end = parseMonth(args.end_month, "end_month");
      return get("performance", `/${args.location_name}/searchkeywords/impressions/monthly`, {
        "monthlyRange.startMonth.year": start.year,
        "monthlyRange.startMonth.month": start.month,
        "monthlyRange.endMonth.year": end.year,
        "monthlyRange.endMonth.month": end.month,
        pageSize: Math.min(Number(args.page_size) || 100, 100),
        pageToken: args.page_token,
      });
    }
    case "gbp_api_call":
      return gbpRequest(authClient, args, {
        service: args.service,
        method: args.method || "GET",
        path: args.path,
        params: args.query,
        body: args.body,
      });
    default:
      throw new Error(`Unknown Business Profile tool: ${name}`);
  }
}
