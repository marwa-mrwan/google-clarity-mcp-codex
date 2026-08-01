import axios from "axios";
import { enhanceMerchantError } from "./google-api-errors.js";

const MERCHANT_SERVICES = Object.freeze({
  accounts: "https://merchantapi.googleapis.com/accounts/v1",
  products: "https://merchantapi.googleapis.com/products/v1",
  reports: "https://merchantapi.googleapis.com/reports/v1",
  data_sources: "https://merchantapi.googleapis.com/datasources/v1",
  inventories: "https://merchantapi.googleapis.com/inventories/v1",
  promotions: "https://merchantapi.googleapis.com/promotions/v1",
  conversions: "https://merchantapi.googleapis.com/conversions/v1",
  quota: "https://merchantapi.googleapis.com/quota/v1",
  issue_resolution: "https://merchantapi.googleapis.com/issueresolution/v1",
  notifications: "https://merchantapi.googleapis.com/notifications/v1",
  lfp: "https://merchantapi.googleapis.com/lfp/v1",
  order_tracking: "https://merchantapi.googleapis.com/ordertracking/v1",
  reviews_v1beta: "https://merchantapi.googleapis.com/reviews/v1beta",
  reviews_v1alpha: "https://merchantapi.googleapis.com/reviews/v1alpha",
  product_studio_v1alpha: "https://merchantapi.googleapis.com/productstudio/v1alpha",
  loyalty_customers_v1alpha: "https://merchantapi.googleapis.com/loyaltyCustomers/v1alpha",
  youtube_shopping_checkout_v1beta:
    "https://merchantapi.googleapis.com/youtubeshoppingcheckout/v1beta",
  youtube_shopping_checkout_v1alpha:
    "https://merchantapi.googleapis.com/youtubeshoppingcheckout/v1alpha",
  youtube_v1alpha: "https://merchantapi.googleapis.com/youtube/v1alpha",
});

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const MUTATION_SAFETY_PROPERTIES = {
  dry_run: {
    type: "boolean",
    description: "Preview the Merchant API request without changing data. Defaults to true.",
    default: true,
  },
  confirm: {
    type: "boolean",
    description:
      "Must be true with dry_run=false and MERCHANT_ENABLE_MUTATIONS=true before a write executes.",
    default: false,
  },
};
const pageProperties = {
  page_size: { type: "number", description: "Page size.", default: 100 },
  page_token: { type: "string", description: "Optional next-page token." },
};

const jsonBody = (description = "Official Merchant API request body.") => ({
  type: "object",
  description,
  additionalProperties: true,
});
const resource = (description) => ({ type: "string", description });

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

function normalizePath(value) {
  const path = `/${String(value || "").replace(/^\/+/, "")}`;
  if (
    path === "/" ||
    path.includes("\\") ||
    path.includes("..") ||
    path.includes("#") ||
    path.includes("://") ||
    /[\r\n]/.test(path)
  ) {
    throw new Error("path must be a safe relative Merchant API path.");
  }
  return path;
}

function mutationSafety(args, preview) {
  const dryRun = args.dry_run !== false;
  const mutationsEnabled =
    String(process.env.MERCHANT_ENABLE_MUTATIONS || "false").toLowerCase() === "true";
  const confirmed = args.confirm === true;
  const blockedReasons = [];
  if (dryRun) blockedReasons.push("dry_run is true");
  if (!mutationsEnabled) blockedReasons.push("MERCHANT_ENABLE_MUTATIONS is not true");
  if (!confirmed) blockedReasons.push("confirm is not true");
  return { dryRun, mutationsEnabled, confirmed, blockedReasons, preview };
}

async function getHeaders(authClient) {
  const token = (await authClient.getAccessToken()).token;
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function merchantRequest(
  authClient,
  args,
  { service, method = "GET", path, params, body, mutation }
) {
  const normalizedMethod = String(method).toUpperCase();
  const base = MERCHANT_SERVICES[service];
  if (!base) throw new Error(`Unsupported Merchant API service: ${service}`);
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
    const safety = mutationSafety(args, preview);
    if (safety.blockedReasons.length > 0) return { executed: false, safety };
  }

  let response;
  try {
    response = await axios.request({
      url: `${base}${safePath}`,
      method: normalizedMethod,
      headers: await getHeaders(authClient),
      params,
      paramsSerializer: { indexes: null },
      ...(body !== undefined ? { data: body } : {}),
    });
  } catch (error) {
    throw enhanceMerchantError(error);
  }
  return {
    executed: true,
    service,
    method: normalizedMethod,
    data: response.data,
    requestId: response.headers["x-request-id"] || null,
  };
}

export function getMerchantCenterTools() {
  return [
    tool("merchant_list_accounts", "List Merchant Center accounts accessible to the OAuth user.", {
      ...pageProperties,
    }),
    tool("merchant_get_account", "Get one Merchant Center account.", {
      account_name: resource("accounts/{accountId}"),
    }, ["account_name"]),
    tool("merchant_get_developer_registration", "Get the Google Cloud project registration for a Merchant Center account.", {
      account_name: resource("accounts/{accountId}"),
      account_id: resource("Legacy shorthand Merchant Center account ID."),
    }),
    tool("merchant_register_gcp", "Register the current Google Cloud project and developer contact with a Merchant Center account.", {
      account_name: resource("accounts/{accountId}"),
      account_id: resource("Legacy shorthand Merchant Center account ID."),
      developer_email: { type: "string", format: "email", description: "Developer contact that will receive the API_DEVELOPER role or invitation." },
    }, ["developer_email"], true),
    tool("merchant_list_subaccounts", "List subaccounts under an advanced account.", {
      account_name: resource("accounts/{accountId}"),
      account_id: resource("Legacy shorthand Merchant Center account ID."),
      ...pageProperties,
    }),
    tool("merchant_create_and_configure_account", "Create and configure a Merchant Center account.", {
      request: jsonBody("CreateAndConfigureAccount request body."),
    }, ["request"], true),
    tool("merchant_update_account", "Update a Merchant Center account.", {
      account_name: resource("accounts/{accountId}"),
      update_mask: { type: "string" },
      account: jsonBody(),
    }, ["account_name", "update_mask", "account"], true),
    tool("merchant_delete_account", "Delete a Merchant Center account.", {
      account_name: resource("accounts/{accountId}"),
      force: { type: "boolean", default: false },
    }, ["account_name"], true),
    tool("merchant_list_products", "List processed products.", {
      account_name: resource("accounts/{accountId}"),
      account_id: resource("Legacy shorthand Merchant Center account ID."),
      ...pageProperties,
    }),
    tool("merchant_get_product", "Get one processed product.", {
      product_name: resource("accounts/{accountId}/products/{product}"),
    }, ["product_name"]),
    tool("merchant_insert_product_input", "Insert a product input into a data source.", {
      account_name: resource("accounts/{accountId}"),
      data_source: resource("accounts/{accountId}/dataSources/{dataSourceId}"),
      product_input: jsonBody("ProductInput body."),
    }, ["account_name", "data_source", "product_input"], true),
    tool("merchant_update_product_input", "Patch a product input.", {
      product_input_name: resource("accounts/{accountId}/productInputs/{productInput}"),
      data_source: resource("accounts/{accountId}/dataSources/{dataSourceId}"),
      update_mask: { type: "string" },
      product_input: jsonBody("ProductInput body."),
    }, ["product_input_name", "data_source", "update_mask", "product_input"], true),
    tool("merchant_delete_product_input", "Delete a product input.", {
      product_input_name: resource("accounts/{accountId}/productInputs/{productInput}"),
      data_source: resource("accounts/{accountId}/dataSources/{dataSourceId}"),
    }, ["product_input_name", "data_source"], true),
    tool("merchant_list_data_sources", "List data source configurations.", {
      account_name: resource("accounts/{accountId}"),
      ...pageProperties,
    }, ["account_name"]),
    tool("merchant_get_data_source", "Get one data source configuration.", {
      data_source_name: resource("accounts/{accountId}/dataSources/{dataSourceId}"),
    }, ["data_source_name"]),
    tool("merchant_create_data_source", "Create a data source configuration.", {
      account_name: resource("accounts/{accountId}"),
      data_source: jsonBody(),
    }, ["account_name", "data_source"], true),
    tool("merchant_update_data_source", "Update a data source configuration.", {
      data_source_name: resource("accounts/{accountId}/dataSources/{dataSourceId}"),
      update_mask: { type: "string" },
      data_source: jsonBody(),
    }, ["data_source_name", "update_mask", "data_source"], true),
    tool("merchant_delete_data_source", "Delete a data source configuration.", {
      data_source_name: resource("accounts/{accountId}/dataSources/{dataSourceId}"),
    }, ["data_source_name"], true),
    tool("merchant_fetch_data_source", "Trigger an immediate fetch for a file data source.", {
      data_source_name: resource("accounts/{accountId}/dataSources/{dataSourceId}"),
    }, ["data_source_name"], true),
    tool("merchant_list_promotions", "List Merchant Center promotions.", {
      account_name: resource("accounts/{accountId}"),
      ...pageProperties,
    }, ["account_name"]),
    tool("merchant_get_promotion", "Get one promotion.", {
      promotion_name: resource("accounts/{accountId}/promotions/{promotion}"),
    }, ["promotion_name"]),
    tool("merchant_insert_promotion", "Insert a promotion.", {
      account_name: resource("accounts/{accountId}"),
      data_source: resource("accounts/{accountId}/dataSources/{dataSourceId}"),
      promotion: jsonBody(),
    }, ["account_name", "data_source", "promotion"], true),
    tool("merchant_list_local_inventories", "List local inventory for a product.", {
      product_name: resource("accounts/{accountId}/products/{product}"),
      ...pageProperties,
    }, ["product_name"]),
    tool("merchant_insert_local_inventory", "Insert local inventory for a product.", {
      product_name: resource("accounts/{accountId}/products/{product}"),
      local_inventory: jsonBody(),
    }, ["product_name", "local_inventory"], true),
    tool("merchant_delete_local_inventory", "Delete local inventory.", {
      inventory_name: resource("accounts/{accountId}/products/{product}/localInventories/{storeCode}"),
    }, ["inventory_name"], true),
    tool("merchant_list_regional_inventories", "List regional inventory for a product.", {
      product_name: resource("accounts/{accountId}/products/{product}"),
      ...pageProperties,
    }, ["product_name"]),
    tool("merchant_insert_regional_inventory", "Insert regional inventory for a product.", {
      product_name: resource("accounts/{accountId}/products/{product}"),
      regional_inventory: jsonBody(),
    }, ["product_name", "regional_inventory"], true),
    tool("merchant_delete_regional_inventory", "Delete regional inventory.", {
      inventory_name: resource("accounts/{accountId}/products/{product}/regionalInventories/{region}"),
    }, ["inventory_name"], true),
    tool("merchant_list_conversion_sources", "List conversion sources.", {
      account_name: resource("accounts/{accountId}"),
      ...pageProperties,
    }, ["account_name"]),
    tool("merchant_get_conversion_source", "Get one conversion source.", {
      conversion_source_name: resource("accounts/{accountId}/conversionSources/{sourceId}"),
    }, ["conversion_source_name"]),
    tool("merchant_create_conversion_source", "Create a conversion source.", {
      account_name: resource("accounts/{accountId}"),
      conversion_source: jsonBody(),
    }, ["account_name", "conversion_source"], true),
    tool("merchant_update_conversion_source", "Update a conversion source.", {
      conversion_source_name: resource("accounts/{accountId}/conversionSources/{sourceId}"),
      update_mask: { type: "string" },
      conversion_source: jsonBody(),
    }, ["conversion_source_name", "update_mask", "conversion_source"], true),
    tool("merchant_archive_conversion_source", "Archive a conversion source.", {
      conversion_source_name: resource("accounts/{accountId}/conversionSources/{sourceId}"),
    }, ["conversion_source_name"], true),
    tool("merchant_undelete_conversion_source", "Re-enable an archived conversion source.", {
      conversion_source_name: resource("accounts/{accountId}/conversionSources/{sourceId}"),
    }, ["conversion_source_name"], true),
    tool("merchant_search_report", "Run a Merchant Center Query Language report.", {
      account_name: resource("accounts/{accountId}"),
      account_id: resource("Legacy shorthand Merchant Center account ID."),
      query: { type: "string", description: "Merchant Center Query Language query." },
      ...pageProperties,
    }, ["query"]),
    tool("merchant_list_issues", "List account issues with resolution guidance.", {
      account_name: resource("accounts/{accountId}"),
      account_id: resource("Legacy shorthand Merchant Center account ID."),
      language_code: { type: "string", description: "Optional BCP-47 language code." },
      time_zone: { type: "string", description: "Optional IANA time zone." },
      ...pageProperties,
    }),
    tool("merchant_render_account_issues", "Render account issues with resolution actions.", {
      account_name: resource("accounts/{accountId}"),
      request: jsonBody("RenderAccountIssues request body."),
    }, ["account_name"]),
    tool("merchant_render_product_issues", "Render product issues with resolution actions.", {
      product_name: resource("accounts/{accountId}/products/{product}"),
      request: jsonBody("RenderProductIssues request body."),
    }, ["product_name"]),
    tool("merchant_list_quotas", "List Merchant API quota usage for an account.", {
      account_name: resource("accounts/{accountId}"),
      ...pageProperties,
    }, ["account_name"]),
    tool("merchant_api_call", "Call any documented Merchant API endpoint using a fixed Google service allowlist.", {
      service: { type: "string", enum: Object.keys(MERCHANT_SERVICES) },
      method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"], default: "GET" },
      path: resource("Relative API path only; full URLs are rejected."),
      query: jsonBody("Optional query parameters."),
      body: jsonBody(),
    }, ["service", "method", "path"], true),
  ];
}

export async function handleMerchantCenterTool(name, args, authClient) {
  const get = (service, path, params) =>
    merchantRequest(authClient, args, { service, path, params });
  const write = (service, method, path, body, params) =>
    merchantRequest(authClient, args, { service, method, path, body, params });
  const postRead = (service, path, body, params) =>
    merchantRequest(authClient, args, {
      service,
      method: "POST",
      path,
      body,
      params,
      mutation: false,
    });
  const page = (max = 1000) => ({
    pageSize: Math.min(Number(args.page_size) || 100, max),
    pageToken: args.page_token,
  });
  const accountName = () => {
    const value = args.account_name || (args.account_id ? `accounts/${args.account_id}` : "");
    if (!/^accounts\/[^/]+$/.test(String(value))) {
      throw new Error("account_name must use accounts/{accountId}, or provide account_id.");
    }
    return value;
  };

  switch (name) {
    case "merchant_list_accounts":
      return get("accounts", "/accounts", page(500));
    case "merchant_get_account":
      return get("accounts", `/${args.account_name}`);
    case "merchant_get_developer_registration":
      return get("accounts", `/${accountName()}/developerRegistration`);
    case "merchant_register_gcp":
      return write(
        "accounts",
        "POST",
        `/${accountName()}/developerRegistration:registerGcp`,
        { developerEmail: args.developer_email }
      );
    case "merchant_list_subaccounts":
      return get("accounts", `/${accountName()}:listSubaccounts`, page(500));
    case "merchant_create_and_configure_account":
      return write("accounts", "POST", "/accounts:createAndConfigure", args.request);
    case "merchant_update_account":
      return write("accounts", "PATCH", `/${args.account_name}`, args.account, {
        updateMask: args.update_mask,
      });
    case "merchant_delete_account":
      return write("accounts", "DELETE", `/${args.account_name}`, undefined, {
        force: args.force === true,
      });
    case "merchant_list_products":
      return get("products", `/${accountName()}/products`, page(1000));
    case "merchant_get_product":
      return get("products", `/${args.product_name}`);
    case "merchant_insert_product_input":
      return write(
        "products",
        "POST",
        `/${args.account_name}/productInputs:insert`,
        args.product_input,
        { dataSource: args.data_source }
      );
    case "merchant_update_product_input":
      return write("products", "PATCH", `/${args.product_input_name}`, args.product_input, {
        dataSource: args.data_source,
        updateMask: args.update_mask,
      });
    case "merchant_delete_product_input":
      return write("products", "DELETE", `/${args.product_input_name}`, undefined, {
        dataSource: args.data_source,
      });
    case "merchant_list_data_sources":
      return get("data_sources", `/${args.account_name}/dataSources`, page(1000));
    case "merchant_get_data_source":
      return get("data_sources", `/${args.data_source_name}`);
    case "merchant_create_data_source":
      return write("data_sources", "POST", `/${args.account_name}/dataSources`, args.data_source);
    case "merchant_update_data_source":
      return write("data_sources", "PATCH", `/${args.data_source_name}`, args.data_source, {
        updateMask: args.update_mask,
      });
    case "merchant_delete_data_source":
      return write("data_sources", "DELETE", `/${args.data_source_name}`);
    case "merchant_fetch_data_source":
      return write("data_sources", "POST", `/${args.data_source_name}:fetch`, {});
    case "merchant_list_promotions":
      return get("promotions", `/${args.account_name}/promotions`, page(1000));
    case "merchant_get_promotion":
      return get("promotions", `/${args.promotion_name}`);
    case "merchant_insert_promotion":
      return write(
        "promotions",
        "POST",
        `/${args.account_name}/promotions:insert`,
        args.promotion,
        { dataSource: args.data_source }
      );
    case "merchant_list_local_inventories":
      return get("inventories", `/${args.product_name}/localInventories`, page(1000));
    case "merchant_insert_local_inventory":
      return write(
        "inventories",
        "POST",
        `/${args.product_name}/localInventories:insert`,
        args.local_inventory
      );
    case "merchant_delete_local_inventory":
      return write("inventories", "DELETE", `/${args.inventory_name}`);
    case "merchant_list_regional_inventories":
      return get("inventories", `/${args.product_name}/regionalInventories`, page(1000));
    case "merchant_insert_regional_inventory":
      return write(
        "inventories",
        "POST",
        `/${args.product_name}/regionalInventories:insert`,
        args.regional_inventory
      );
    case "merchant_delete_regional_inventory":
      return write("inventories", "DELETE", `/${args.inventory_name}`);
    case "merchant_list_conversion_sources":
      return get("conversions", `/${args.account_name}/conversionSources`, page(1000));
    case "merchant_get_conversion_source":
      return get("conversions", `/${args.conversion_source_name}`);
    case "merchant_create_conversion_source":
      return write(
        "conversions",
        "POST",
        `/${args.account_name}/conversionSources`,
        args.conversion_source
      );
    case "merchant_update_conversion_source":
      return write(
        "conversions",
        "PATCH",
        `/${args.conversion_source_name}`,
        args.conversion_source,
        { updateMask: args.update_mask }
      );
    case "merchant_archive_conversion_source":
      return write("conversions", "DELETE", `/${args.conversion_source_name}`);
    case "merchant_undelete_conversion_source":
      return write("conversions", "POST", `/${args.conversion_source_name}:undelete`, {});
    case "merchant_search_report":
      return postRead(
        "reports",
        `/${accountName()}/reports:search`,
        { query: args.query, pageSize: Math.min(Number(args.page_size) || 100, 1000), pageToken: args.page_token }
      );
    case "merchant_list_issues":
      return get("accounts", `/${accountName()}/issues`, {
        pageSize: Math.min(Number(args.page_size) || 50, 100),
        pageToken: args.page_token,
        languageCode: args.language_code,
        timeZone: args.time_zone,
      });
    case "merchant_render_account_issues":
      return postRead(
        "issue_resolution",
        `/${args.account_name}:renderaccountissues`,
        args.request || {}
      );
    case "merchant_render_product_issues":
      return postRead(
        "issue_resolution",
        `/${args.product_name}:renderproductissues`,
        args.request || {}
      );
    case "merchant_list_quotas":
      return get("quota", `/${args.account_name}/quotas`, page(1000));
    case "merchant_api_call":
      return merchantRequest(authClient, args, {
        service: args.service,
        method: args.method || "GET",
        path: args.path,
        params: args.query,
        body: args.body,
      });
    default:
      throw new Error(`Unknown Merchant Center tool: ${name}`);
  }
}
